import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import './FamilyTreeChart.css';

const FamilyTreeChart = ({ data }) => {
  const svgRef = useRef();
  const containerRef = useRef();
  const zoomRef = useRef(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  const branchColors = [
    '#4a90e2', '#50c878', '#ff6b6b', '#ffa500', '#9b59b6'
  ];

  useEffect(() => {
    if (!containerRef.current || !svgRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;
    const centerX = width / 2;
    const centerY = height / 2;

    const svg = d3.select(svgRef.current).attr('width', width).attr('height', height);
    svg.selectAll('*').remove();

    const g = svg.append('g');
    
    // BASE TRANSFORM: Just center it. No rotate(180).
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

    if (!data || data.id == null) return;

    const tree = JSON.parse(JSON.stringify(data));
    const RING_WIDTH = 80;
    const CENTER_RADIUS = 40;

    function layout(node, depth, parentStart, parentEnd, branchIdx) {
      node.depth = depth;
      node.branchIndex = branchIdx ?? 0;
      node.innerRadius = depth === 0 ? 0 : CENTER_RADIUS + (depth - 1) * RING_WIDTH;
      node.outerRadius = depth === 0 ? CENTER_RADIUS : node.innerRadius + RING_WIDTH;

      // COLOR FIX: Use the specific hex color from your data if provided
      if (node.color && node.color.startsWith('#')) {
        node.finalColor = node.color;
      } else {
        node.finalColor = depth === 0 ? '#2c3e50' : branchColors[node.branchIndex % branchColors.length];
      }

      if (depth === 0) {
        node.startAngle = 0;
        node.endAngle = 2 * Math.PI;
        node.midAngle = 0;
      } else {
        const children = node.parentNode.children || [];
        const idx = children.indexOf(node);
        const step = (parentEnd - parentStart) / children.length;
        node.startAngle = parentStart + idx * step;
        node.endAngle = parentStart + (idx + 1) * step;
        node.midAngle = node.startAngle + (step / 2);
      }

      if (node.children) {
        node.children.forEach((child, i) => {
          child.parentNode = node;
          layout(child, depth + 1, node.startAngle, node.endAngle, depth === 0 ? i : branchIdx);
        });
      }
    }

    layout(tree, 0, 0, 2 * Math.PI);

    // DRAW SEGMENTS
    function drawSegments(node) {
      if (node.depth === 0) {
        g.append('circle')
          .attr('r', node.outerRadius)
          .attr('fill', node.finalColor) // Uses your #FF5F1F etc.
          .attr('stroke', 'rgba(255,255,255,0.3)');
      } else {
        const arc = d3.arc()
          .innerRadius(node.innerRadius)
          .outerRadius(node.outerRadius)
          .startAngle(node.startAngle)
          .endAngle(node.endAngle);

        g.append('path')
          .attr('d', arc)
          .attr('fill', node.finalColor) // Uses your #9BB0FF etc.
          .attr('stroke', 'rgba(255,255,255,0.2)');
      }
      if (node.children) node.children.forEach(drawSegments);
    }

    // DRAW LABELS
    function drawLabels(node) {
      const r = (node.innerRadius + node.outerRadius) / 2;
      const name = node.first_name || '';
      const year = node.birth_date ? new Date(node.birth_date).getFullYear() : '';

      // Trig Math: D3 0 is Top. Standard Math 0 is Right. 
      // We subtract PI/2 to sync them.
      const angle = node.midAngle - Math.PI / 2;
      const tx = r * Math.cos(angle);
      const ty = r * Math.sin(angle);

      // Rotation math
      let rotation = (node.midAngle * 180 / Math.PI);
      if (rotation > 90 && rotation < 270) rotation -= 180; // Flip for readability

      const grp = g.append('g').attr('transform', `translate(${tx},${ty}) rotate(${rotation})`);
      const fontSize = node.font_size ? `${node.font_size}px` : (node.depth === 0 ? '12px' : '12px');
      const yearSize = node.font_size ? `${Math.max(8, parseInt(node.font_size, 10) - 2)}px` : '10px';
      const fontFamily = node.font_family || 'Arial';
      const textColor = (node.font_color && node.font_color.startsWith('#')) ? node.font_color : '#fff';

      grp.append('text')
        .attr('text-anchor', 'middle')
        .attr('fill', textColor)
        .attr('font-size', fontSize)
        .attr('font-family', fontFamily)
        .attr('dy', node.depth === 0 ? '0' : '-2')
        .text(name);

      if (year) {
        grp.append('text')
          .attr('text-anchor', 'middle')
          .attr('fill', textColor)
          .attr('opacity', 0.8)
          .attr('font-size', yearSize)
          .attr('font-family', fontFamily)
          .attr('dy', '12')
          .text(year);
      }

      if (node.children) node.children.forEach(drawLabels);
    }

    drawSegments(tree);
    drawLabels(tree);

  }, [data]);

  return (
    <div ref={containerRef} className="chart-container" style={{ width: '100%', height: '100vh', background: '#000' }}>
      <svg ref={svgRef} />
    </div>
  );
};

export default FamilyTreeChart;