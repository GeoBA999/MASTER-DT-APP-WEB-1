import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { PlayerHistoricalData } from '../../types';

interface HistoricalTrendChartProps {
  playersData: PlayerHistoricalData[];
  selectedPlayerIds: string[];
  metric: 'points' | 'rating' | 'minutes' | 'xgXa';
  showSquadAverage?: boolean;
}

const POSITION_COLORS: Record<string, string> = {
  POR: '#60A5FA', // Sky Blue
  DEF: '#54C3BB', // Teal / Cyan
  MED: '#E6BE55', // Gold
  DEL: '#C9F04D', // Lime Neón
};

export const HistoricalTrendChart: React.FC<HistoricalTrendChartProps> = ({
  playersData,
  selectedPlayerIds,
  metric,
  showSquadAverage = true,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [hoveredData, setHoveredData] = useState<{
    player: PlayerHistoricalData;
    item: any;
    x: number;
    y: number;
  } | null>(null);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    // Clear previous SVG contents
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const containerWidth = containerRef.current.clientWidth || 700;
    const width = Math.max(340, containerWidth);
    const height = 340;
    const margin = { top: 28, right: 32, bottom: 42, left: 48 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    svg.attr('viewBox', `0 0 ${width} ${height}`);

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const matchdays = ['J1', 'J2', 'J3', 'J4', 'J5'];

    // X Scale
    const xScale = d3
      .scalePoint<string>()
      .domain(matchdays)
      .range([0, innerWidth])
      .padding(0.25);

    // Get value function based on active metric
    const getMetricValue = (item: any): number => {
      switch (metric) {
        case 'rating':
          return item.rating;
        case 'minutes':
          return item.minutesPlayed;
        case 'xgXa':
          return +(item.xG + item.xA).toFixed(2);
        case 'points':
        default:
          return item.points;
      }
    };

    const getMetricUnit = (): string => {
      switch (metric) {
        case 'rating':
          return '★';
        case 'minutes':
          return 'min';
        case 'xgXa':
          return 'xG+A';
        case 'points':
        default:
          return 'pts';
      }
    };

    // Determine Y domain
    const activePlayers = playersData.filter((p) =>
      selectedPlayerIds.includes(p.player.id)
    );

    let allValues: number[] = [];
    activePlayers.forEach((p) => {
      p.history.forEach((h) => allValues.push(getMetricValue(h)));
    });

    if (allValues.length === 0) {
      allValues = [0, 10];
    }

    const minY = metric === 'rating' ? Math.max(5.0, Math.floor(d3.min(allValues) || 5.0)) : 0;
    const maxY = Math.ceil(d3.max(allValues) || 10) + (metric === 'points' ? 2 : metric === 'rating' ? 0.5 : 10);

    const yScale = d3
      .scaleLinear()
      .domain([minY, maxY])
      .range([innerHeight, 0])
      .nice();

    // Grid lines (horizontal)
    const yAxisTicks = yScale.ticks(5);
    g.append('g')
      .attr('class', 'grid')
      .selectAll('line')
      .data(yAxisTicks)
      .enter()
      .append('line')
      .attr('x1', 0)
      .attr('x2', innerWidth)
      .attr('y1', (d) => yScale(d))
      .attr('y2', (d) => yScale(d))
      .attr('stroke', '#1E4333')
      .attr('stroke-dasharray', '3,3')
      .attr('stroke-opacity', 0.5);

    // Vertical guides for each matchday
    matchdays.forEach((md) => {
      const x = xScale(md);
      if (x !== undefined) {
        g.append('line')
          .attr('x1', x)
          .attr('x2', x)
          .attr('y1', 0)
          .attr('y2', innerHeight)
          .attr('stroke', '#143426')
          .attr('stroke-opacity', 0.6);
      }
    });

    // Custom Axes
    const xAxis = d3.axisBottom(xScale).tickSize(0).tickPadding(12);
    const yAxis = d3.axisLeft(yScale).ticks(5).tickSize(0).tickPadding(10);

    const xAxisGroup = g
      .append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis);

    xAxisGroup.select('.domain').attr('stroke', '#1E4333');
    xAxisGroup
      .selectAll('text')
      .attr('fill', '#9CA3AF')
      .attr('font-size', '12px')
      .attr('font-family', 'ui-monospace, monospace')
      .attr('font-weight', '700');

    const yAxisGroup = g.append('g').call(yAxis);
    yAxisGroup.select('.domain').remove();
    yAxisGroup
      .selectAll('text')
      .attr('fill', '#9CA3AF')
      .attr('font-size', '11px')
      .attr('font-family', 'ui-monospace, monospace')
      .text((d) => `${d} ${getMetricUnit()}`);

    // Line and Area generators
    const lineGenerator = d3
      .line<any>()
      .x((d) => xScale(d.label) || 0)
      .y((d) => yScale(getMetricValue(d)))
      .curve(d3.curveMonotoneX);

    const areaGenerator = d3
      .area<any>()
      .x((d) => xScale(d.label) || 0)
      .y0(innerHeight)
      .y1((d) => yScale(getMetricValue(d)))
      .curve(d3.curveMonotoneX);

    // Render Squad Average line if active
    if (showSquadAverage && playersData.length > 0) {
      const averageHistory = matchdays.map((md, idx) => {
        const total = playersData.reduce((sum, p) => {
          return sum + getMetricValue(p.history[idx]);
        }, 0);
        return {
          label: md,
          value: +(total / playersData.length).toFixed(1),
        };
      });

      const avgLineGen = d3
        .line<any>()
        .x((d) => xScale(d.label) || 0)
        .y((d) => yScale(d.value))
        .curve(d3.curveMonotoneX);

      g.append('path')
        .datum(averageHistory)
        .attr('fill', 'none')
        .attr('stroke', '#A78BFA')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '5,4')
        .attr('stroke-opacity', 0.85)
        .attr('d', avgLineGen);

      // Average dots
      g.selectAll('.avg-dot')
        .data(averageHistory)
        .enter()
        .append('circle')
        .attr('cx', (d) => xScale(d.label) || 0)
        .attr('cy', (d) => yScale(d.value))
        .attr('r', 3)
        .attr('fill', '#A78BFA')
        .attr('stroke', '#071410')
        .attr('stroke-width', 1.5);
    }

    // Render individual player lines and gradients
    activePlayers.forEach((pData, idx) => {
      const color = POSITION_COLORS[pData.player.position] || '#C9F04D';
      const gradientId = `area-grad-${pData.player.id}-${idx}`;

      // Area gradient defs
      const defs = svg.append('defs');
      const gradient = defs
        .append('linearGradient')
        .attr('id', gradientId)
        .attr('x1', '0%')
        .attr('y1', '0%')
        .attr('x2', '0%')
        .attr('y2', '100%');

      gradient
        .append('stop')
        .attr('offset', '0%')
        .attr('stop-color', color)
        .attr('stop-opacity', activePlayers.length === 1 ? 0.35 : 0.12);

      gradient
        .append('stop')
        .attr('offset', '100%')
        .attr('stop-color', color)
        .attr('stop-opacity', 0.0);

      // Render Area
      g.append('path')
        .datum(pData.history)
        .attr('fill', `url(#${gradientId})`)
        .attr('d', areaGenerator)
        .attr('pointer-events', 'none');

      // Render Line
      const path = g
        .append('path')
        .datum(pData.history)
        .attr('fill', 'none')
        .attr('stroke', color)
        .attr('stroke-width', activePlayers.length === 1 ? 3 : 2.2)
        .attr('stroke-linecap', 'round')
        .attr('stroke-linejoin', 'round')
        .attr('d', lineGenerator)
        .attr('filter', 'drop-shadow(0px 2px 6px rgba(0,0,0,0.5))');

      // Animate line draw on mount/change
      const totalLength = (path.node() as SVGPathElement)?.getTotalLength() || 0;
      path
        .attr('stroke-dasharray', `${totalLength} ${totalLength}`)
        .attr('stroke-dashoffset', totalLength)
        .transition()
        .duration(650)
        .ease(d3.easeCubicOut)
        .attr('stroke-dashoffset', 0);

      // Circles for each point
      pData.history.forEach((h) => {
        const cx = xScale(h.label) || 0;
        const cy = yScale(getMetricValue(h));

        // Outer glow on hover
        const pointGroup = g.append('g').attr('class', 'datapoint-group');

        pointGroup
          .append('circle')
          .attr('cx', cx)
          .attr('cy', cy)
          .attr('r', 4.5)
          .attr('fill', '#071410')
          .attr('stroke', color)
          .attr('stroke-width', 2.5)
          .attr('cursor', 'pointer')
          .on('mouseenter', function (event) {
            d3.select(this)
              .transition()
              .duration(150)
              .attr('r', 7)
              .attr('fill', color);

            const [mouseX, mouseY] = d3.pointer(event, svgRef.current);
            setHoveredData({
              player: pData,
              item: h,
              x: mouseX,
              y: mouseY,
            });
          })
          .on('mouseleave', function () {
            d3.select(this)
              .transition()
              .duration(150)
              .attr('r', 4.5)
              .attr('fill', '#071410');
            setHoveredData(null);
          });
      });
    });
  }, [playersData, selectedPlayerIds, metric, showSquadAverage]);

  return (
    <div className="relative w-full" ref={containerRef}>
      <svg
        ref={svgRef}
        className="w-full h-auto overflow-visible select-none"
        style={{ minHeight: '280px' }}
      />

      {/* Interactive Tooltip Card */}
      {hoveredData && (
        <div
          className="absolute z-30 pointer-events-none transform -translate-x-1/2 -translate-y-full mb-3 px-3 py-2.5 rounded-xl bg-[#0C1D16]/95 border border-[#1E4333] shadow-2xl backdrop-blur-md text-left font-sans text-xs w-48 transition-all duration-150"
          style={{
            left: `${hoveredData.x}px`,
            top: `${hoveredData.y}px`,
          }}
        >
          <div className="flex items-center gap-2 mb-1.5 pb-1 border-b border-[#1E4333]">
            <img
              src={hoveredData.player.player.photoUrl}
              alt=""
              className="w-5 h-5 rounded-full object-cover border border-[#C9F04D]"
            />
            <div className="truncate">
              <span className="font-bold text-white block truncate leading-tight">
                {hoveredData.player.player.name}
              </span>
              <span className="text-[10px] text-gray-400 font-mono">
                {hoveredData.item.label} vs {hoveredData.item.opponent} ({hoveredData.item.isHome ? 'L' : 'V'})
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-1 font-mono text-[11px]">
            <div>
              <span className="text-gray-400 block text-[9px] uppercase">Puntos DT:</span>
              <span className="text-[#C9F04D] font-black text-sm">
                {hoveredData.item.points} pts
              </span>
            </div>
            <div>
              <span className="text-gray-400 block text-[9px] uppercase">Rating:</span>
              <span className="text-[#E6BE55] font-bold text-sm">
                ★ {hoveredData.item.rating}
              </span>
            </div>
            <div>
              <span className="text-gray-400 block text-[9px] uppercase">Minutos:</span>
              <span className="text-gray-200">{hoveredData.item.minutesPlayed}'</span>
            </div>
            <div>
              <span className="text-gray-400 block text-[9px] uppercase">Goles / Asist:</span>
              <span className="text-gray-200">
                {hoveredData.item.goals}G / {hoveredData.item.assists}A
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
