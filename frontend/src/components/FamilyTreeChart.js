import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import './FamilyTreeChart.css';

const TO_D3 = Math.PI / 2;
const branchColors = [
  '#4a90e2', '#50c878', '#ff6b6b', '#ffa500', '#9b59b6',
  '#1abc9c', '#e74c3c', '#f39c12', '#3498db', '#2ecc71'
];

function getYear(node) {
  if (!node || node.birth_date == null) return '?';
  const y = new Date(node.birth_date).getFullYear();
  return Number.isNaN(y) ? '?' : y;
}

function ensureChildren(node) {
  if (!node) return;
  if (!Array.isArray(node.children)) node.children = [];
  node.children.forEach(ensureChildren);
}

function getMaxDepth(node) {
  if (!node || !node.children?.length) return node?.depth ?? 0;
  return Math.max(node.depth, ...node.children.map(getMaxDepth));
}

const FamilyTreeChart = ({ data }) => {
  const svgRef = useRef();
  const containerRef = useRef();
  const zoomRef = useRef(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  useEffect(() => {
    if (!containerRef.current || !svgRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;
    if (width <= 0 || height <= 0) return;

    const centerX = width / 2;
    const centerY = height / 2;
    const svg = d3.select(svgRef.current).attr('width', width).attr('height', height);
    svg.selectAll('*').remove();

    const g = svg.append('g');
    
    // FIX 1: Removed rotate(180). Simple translate to center.
    const baseTransformStr = `translate(${centerX},${centerY})`;
    g.attr('transform', baseTransformStr);

    const zoom = d3.zoom()
      .scaleExtent([0.1, 5])
      .on('zoom', (event) => {
        g.attr('transform', `${event.transform} ${baseTransformStr}`);
        setZoomLevel(event.transform.k);
      });
    zoomRef.current = zoom;
    svg.call(zoom);

    if (!data || data.id == null) {
      g.append('text').attr('text-anchor', 'middle').attr('fill', '#888').text('No family tree data.');
      return;
    }

    const tree = JSON.parse(JSON.stringify(data));
    ensureChildren(tree);

    const RING_WIDTH = 80;
    const CENTER_RADIUS = 40;
    const FULL = 2 * Math.PI;

    // FIX 2: Standardized Layout Math
    function layout(node, depth, parentStart, parentEnd, branchIdx) {
      node.depth = depth;
      node.branchIndex = branchIdx ?? 0;
      node.innerRadius = depth === 0 ? 0 : CENTER_RADIUS + (depth - 1) * RING_WIDTH;
      node.outerRadius = depth === 0 ? CENTER_RADIUS : node.innerRadius + RING_WIDTH;

      if (depth === 0) {
        node.startAngle = 0;
        node.endAngle = FULL;
        node.midAngle = 0;
      } else {
        const numSibs = node.parentNode?.children?.length ?? 1;
        const sibIdx = node.siblingIndex ?? 0;
        const step = (parentEnd - parentStart) / numSibs;
        
        node.startAngle = parentStart + sibIdx * step;
        node.endAngle = parentStart + (sibIdx + 1) * step;
        // PERFECT CENTERING: exactly halfway between start and end
        node.midAngle = node.startAngle + (step / 2);
        node.angleSpan = step;
      }

      const children = node.children || [];
      const sorted = [...children].sort((a, b) => (a.id || 0) - (b.id || 0));
      sorted.forEach((child, idx) => {
        child.parentNode = node;
        child.siblingIndex = idx;
        layout(child, depth + 1, node.startAngle, node.endAngle, depth === 0 ? idx : node.branchIndex);
      });
    }

    layout(tree, 0, 0, FULL);

    // Draw Segments
    function drawSegments(node) {
      if (node.depth === 0) {
        g.append('circle').attr('r', node.outerRadius).attr('fill', '#2c3e50').attr('stroke', 'rgba(255,255,255,0.4)').attr('stroke-width', 2);
      } else {
        const arc = d3.arc()
          .innerRadius(node.innerRadius)
          .outerRadius(node.outerRadius)
          .startAngle(node.startAngle)
          .endAngle(node.endAngle);
        
        g.append('path')
          .attr('d', arc)
          .attr('fill', branchColors[node.branchIndex % branchColors.length])
          .attr('stroke', 'rgba(255,255,255,0.3)')
          .attr('stroke-width', 1.5);
      }
      (node.children || []).forEach(drawSegments);
    }

    // FIX 3: Fully Rewritten Label Logic
    function drawLabels(node) {
      const r = (node.innerRadius + node.outerRadius) / 2;
      const name = node.first_name || '';
      const year = getYear(node);

      if (node.depth === 0) {
        g.append('text').attr('dy', '-5').attr('text-anchor', 'middle').attr('fill', '#fff').attr('font-size', '13px').attr('font-weight', 'bold').text(name);
        g.append('text').attr('dy', '12').attr('text-anchor', 'middle').attr('fill', '#fff').attr('font-size', '11px').text(year);
      } else {
        // Position relative to D3's 12-o'clock 0. We subtract PI/2 to use standard Math.cos/sin
        const angle = node.midAngle - TO_D3;
        const tx = r * Math.cos(angle);
        const ty = r * Math.sin(angle);

        // Calculate rotation. We want the text to be perpendicular to the radius.
        let rotation = (node.midAngle * 180 / Math.PI);

        // READABILITY FLIP: If the label is in the bottom half of the circle, flip it 180 degrees
        if (rotation > 90 && rotation < 270) {
          rotation -= 180;
        }

        const grp = g.append('g').attr('transform', `translate(${tx},${ty}) rotate(${rotation})`);
        
        grp.append('text')
          .attr('text-anchor', 'middle')
          .attr('dy', '-2')
          .attr('fill', '#fff')
          .attr('font-size', node.depth === 1 ? '10px' : '12px')
          .text(name);

        grp.append('text')
          .attr('text-anchor', 'middle')
          .attr('dy', '10')
          .attr('fill', 'rgba(255,255,255,0.8)')
          .attr('font-size', '9px')
          .text(year);
      }
      (node.children || []).forEach(drawLabels);
    }

    drawSegments(tree);
    drawLabels(tree);

  }, [data]);

  return (
    <div ref={containerRef} className="chart-container" style={{ width: '100%', height: '600px', background: '#111' }}>
      <svg ref={svgRef} />
    </div>
  );
};

export default FamilyTreeChart;
