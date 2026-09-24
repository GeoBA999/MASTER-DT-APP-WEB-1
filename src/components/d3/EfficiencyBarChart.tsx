import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { PlayerHistoricalData } from '../../types';

interface EfficiencyBarChartProps {
  playersData: PlayerHistoricalData[];
  sortBy: 'pointsPerMillion' | 'totalPointsLast5' | 'consistencyScore';
  onSelectPlayer?: (player: PlayerHistoricalData) => void;
}

const POSITION_COLORS: Record<string, string> = {
  POR: '#60A5FA',
  DEF: '#54C3BB',
  MED: '#E6BE55',
  DEL: '#C9F04D',
};

export const EfficiencyBarChart: React.FC<EfficiencyBarChartProps> = ({
  playersData,
  sortBy,
  onSelectPlayer,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Sort players
    const sorted = [...playersData].sort((a, b) => b[sortBy] - a[sortBy]);

    const containerWidth = containerRef.current.clientWidth || 600;
    const width = Math.max(320, containerWidth);
    const barHeight = 28;
    const gap = 8;
    const margin = { top: 16, right: 65, bottom: 25, left: 120 };
    const height = sorted.length * (barHeight + gap) + margin.top + margin.bottom;

    svg.attr('viewBox', `0 0 ${width} ${height}`);

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // X Scale
    const maxVal = d3.max(sorted, (d) => d[sortBy]) || 10;
    const xScale = d3
      .scaleLinear()
      .domain([0, maxVal * 1.1])
      .range([0, innerWidth]);

    // Y Scale
    const yScale = d3
      .scaleBand()
      .domain(sorted.map((d) => d.player.id))
      .range([0, innerHeight])
      .padding(0.2);

    // Grid lines (vertical)
    const xTicks = xScale.ticks(5);
    g.append('g')
      .selectAll('line')
      .data(xTicks)
      .enter()
      .append('line')
      .attr('x1', (d) => xScale(d))
      .attr('x2', (d) => xScale(d))
      .attr('y1', 0)
      .attr('y2', innerHeight)
      .attr('stroke', '#143426')
      .attr('stroke-dasharray', '2,2');

    // Bottom Axis
    const xAxis = d3.axisBottom(xScale).ticks(5).tickSize(0).tickPadding(8);
    const xAxisGroup = g
      .append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis);

    xAxisGroup.select('.domain').attr('stroke', '#1E4333');
    xAxisGroup
      .selectAll('text')
      .attr('fill', '#9CA3AF')
      .attr('font-size', '10px')
      .attr('font-family', 'ui-monospace, monospace');

    // Bars
    sorted.forEach((pData) => {
      const y = yScale(pData.player.id) || 0;
      const val = pData[sortBy];
      const barW = xScale(val);
      const color = POSITION_COLORS[pData.player.position] || '#C9F04D';

      const barGroup = g
        .append('g')
        .attr('class', 'bar-group')
        .attr('cursor', 'pointer')
        .on('click', () => {
          if (onSelectPlayer) onSelectPlayer(pData);
        });

      // Player Name Label on Left
      barGroup
        .append('text')
        .attr('x', -8)
        .attr('y', y + barHeight / 2 - 2)
        .attr('text-anchor', 'end')
        .attr('dominant-baseline', 'middle')
        .attr('fill', '#E5EAE8')
        .attr('font-size', '11px')
        .attr('font-family', 'ui-monospace, monospace')
        .attr('font-weight', '700')
        .text(pData.player.shortName);

      // Position Tag
      barGroup
        .append('text')
        .attr('x', -105)
        .attr('y', y + barHeight / 2 - 2)
        .attr('text-anchor', 'start')
        .attr('dominant-baseline', 'middle')
        .attr('fill', color)
        .attr('font-size', '9px')
        .attr('font-family', 'ui-monospace, monospace')
        .attr('font-weight', '800')
        .text(pData.player.position);

      // Background Track
      barGroup
        .append('rect')
        .attr('x', 0)
        .attr('y', y)
        .attr('width', innerWidth)
        .attr('height', barHeight)
        .attr('rx', 6)
        .attr('fill', '#091A13')
        .attr('stroke', '#143426');

      // Value Bar with gradient / animated width
      const bar = barGroup
        .append('rect')
        .attr('x', 0)
        .attr('y', y)
        .attr('width', 0)
        .attr('height', barHeight)
        .attr('rx', 6)
        .attr('fill', color)
        .attr('opacity', 0.85);

      bar
        .transition()
        .duration(600)
        .ease(d3.easeCubicOut)
        .attr('width', Math.max(4, barW));

      // Value text after bar
      let labelText = '';
      if (sortBy === 'pointsPerMillion') labelText = `${val} pts/$M`;
      else if (sortBy === 'totalPointsLast5') labelText = `${val} pts`;
      else labelText = `${val}%`;

      barGroup
        .append('text')
        .attr('x', barW + 8)
        .attr('y', y + barHeight / 2)
        .attr('dominant-baseline', 'middle')
        .attr('fill', color)
        .attr('font-size', '11px')
        .attr('font-family', 'ui-monospace, monospace')
        .attr('font-weight', '800')
        .text(labelText);
    });
  }, [playersData, sortBy, onSelectPlayer]);

  return (
    <div className="w-full overflow-x-auto" ref={containerRef}>
      <svg ref={svgRef} className="w-full h-auto select-none" />
    </div>
  );
};
