import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { PlayerHistoricalData } from '../../types';

interface PlayerRadarChartProps {
  primaryPlayer: PlayerHistoricalData;
  secondaryPlayer?: PlayerHistoricalData | null;
}

const AXES = [
  { key: 'attacking', label: 'Ataque (G+A/xG)' },
  { key: 'defending', label: 'Defensa (Rec/CS)' },
  { key: 'consistency', label: 'Regularidad' },
  { key: 'form', label: 'Forma Reciente' },
  { key: 'efficiency', label: 'Eficiencia ($M)' },
  { key: 'influence', label: 'Influencia (Rating)' },
] as const;

export const PlayerRadarChart: React.FC<PlayerRadarChartProps> = ({
  primaryPlayer,
  secondaryPlayer,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const size = Math.min(360, containerRef.current.clientWidth || 360);
    const radius = size / 2 - 38;
    const center = size / 2;

    svg.attr('viewBox', `0 0 ${size} ${size}`);

    const g = svg
      .append('g')
      .attr('transform', `translate(${center},${center})`);

    const angleSlice = (Math.PI * 2) / AXES.length;
    const levels = [25, 50, 75, 100];

    // Radial Scale: 0 to 100 -> 0 to radius
    const rScale = d3.scaleLinear().domain([0, 100]).range([0, radius]);

    // Concentric web polygons
    levels.forEach((level) => {
      const levelRadius = rScale(level);
      const points: [number, number][] = AXES.map((_, i) => {
        const angle = i * angleSlice - Math.PI / 2;
        return [levelRadius * Math.cos(angle), levelRadius * Math.sin(angle)];
      });

      const linePath = d3.line<[number, number]>().curve(d3.curveLinearClosed);

      g.append('path')
        .datum(points)
        .attr('d', linePath)
        .attr('fill', level === 100 ? '#0B1F16' : 'none')
        .attr('stroke', '#1E4333')
        .attr('stroke-width', level === 100 ? 1.5 : 1)
        .attr('stroke-dasharray', level === 100 ? 'none' : '3,3')
        .attr('opacity', 0.85);

      // Level text label (e.g. 50%, 100%)
      g.append('text')
        .attr('x', 4)
        .attr('y', -levelRadius)
        .attr('fill', '#4B5563')
        .attr('font-size', '9px')
        .attr('font-family', 'ui-monospace, monospace')
        .text(`${level}%`);
    });

    // Axis Lines & Text Labels
    AXES.forEach((axis, i) => {
      const angle = i * angleSlice - Math.PI / 2;
      const x = radius * Math.cos(angle);
      const y = radius * Math.sin(angle);

      // Axis Line
      g.append('line')
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', x)
        .attr('y2', y)
        .attr('stroke', '#1E4333')
        .attr('stroke-width', 1);

      // Axis Label
      const labelDistance = radius + 20;
      const labelX = labelDistance * Math.cos(angle);
      const labelY = labelDistance * Math.sin(angle);

      g.append('text')
        .attr('x', labelX)
        .attr('y', labelY)
        .attr('text-anchor', Math.abs(labelX) < 10 ? 'middle' : labelX > 0 ? 'start' : 'end')
        .attr('dominant-baseline', Math.abs(labelY) < 10 ? 'middle' : labelY > 0 ? 'hanging' : 'auto')
        .attr('fill', '#9CA3AF')
        .attr('font-size', '10px')
        .attr('font-family', 'ui-monospace, monospace')
        .attr('font-weight', '600')
        .text(axis.label);
    });

    // Function to build polygon data
    const getCoordinates = (p: PlayerHistoricalData): [number, number][] => {
      return AXES.map((axis, i) => {
        const val = p.radarMetrics[axis.key] || 20;
        const angle = i * angleSlice - Math.PI / 2;
        const r = rScale(val);
        return [r * Math.cos(angle), r * Math.sin(angle)];
      });
    };

    const radarLine = d3.line<[number, number]>().curve(d3.curveLinearClosed);

    // Render Secondary Player first (if exists)
    if (secondaryPlayer) {
      const coords = getCoordinates(secondaryPlayer);

      // Polygon area
      g.append('path')
        .datum(coords)
        .attr('d', radarLine)
        .attr('fill', '#54C3BB')
        .attr('fill-opacity', 0.2)
        .attr('stroke', '#54C3BB')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '4,2');

      // Vertex dots
      coords.forEach(([x, y]) => {
        g.append('circle')
          .attr('cx', x)
          .attr('cy', y)
          .attr('r', 3.5)
          .attr('fill', '#54C3BB')
          .attr('stroke', '#071410')
          .attr('stroke-width', 1.5);
      });
    }

    // Render Primary Player
    const primaryCoords = getCoordinates(primaryPlayer);

    const primaryPath = g
      .append('path')
      .datum(primaryCoords)
      .attr('d', radarLine)
      .attr('fill', '#C9F04D')
      .attr('fill-opacity', 0.3)
      .attr('stroke', '#C9F04D')
      .attr('stroke-width', 2.5)
      .attr('filter', 'drop-shadow(0 0 8px rgba(201, 240, 77, 0.35))');

    // Smooth entry transition
    primaryPath
      .attr('transform', 'scale(0.1)')
      .transition()
      .duration(500)
      .ease(d3.easeCubicOut)
      .attr('transform', 'scale(1)');

    // Vertex dots for primary player
    primaryCoords.forEach(([x, y], idx) => {
      const axis = AXES[idx];
      const val = primaryPlayer.radarMetrics[axis.key];

      const dot = g
        .append('circle')
        .attr('cx', x)
        .attr('cy', y)
        .attr('r', 4.5)
        .attr('fill', '#C9F04D')
        .attr('stroke', '#071410')
        .attr('stroke-width', 2)
        .attr('cursor', 'pointer');

      dot
        .append('title')
        .text(`${axis.label}: ${val}/100`);
    });
  }, [primaryPlayer, secondaryPlayer]);

  return (
    <div className="flex flex-col items-center w-full" ref={containerRef}>
      <svg ref={svgRef} className="w-full max-w-[360px] h-auto overflow-visible select-none" />

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-2 text-xs font-mono">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#C9F04D] border border-black shadow" />
          <span className="text-white font-bold">{primaryPlayer.player.shortName}</span>
        </div>
        {secondaryPlayer && (
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#54C3BB] border border-black shadow" />
            <span className="text-gray-300 font-bold">{secondaryPlayer.player.shortName}</span>
          </div>
        )}
      </div>
    </div>
  );
};
