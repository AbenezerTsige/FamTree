import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import './FamilyTreeChart.css';

const FamilyTreeChart = ({ data }) => {
  const svgRef = useRef();
  const containerRef = useRef();
  const [zoomLevel, setZoomLevel] = useState(1);

  // Color palette for branches
  const branchColors = [
    '#4a90e2', '#50c878', '#ff6b6b', '#ffa500', '#9b59b6',
    '#1abc9c', '#e74c3c', '#f39c12', '#3498db', '#2ecc71'
  ];

  useEffect(() => {
    if (!data || !svgRef.current) return;

    // Clear previous render
    d3.select(svgRef.current).selectAll("*").remove();

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;
      const centerX = width / 2;
    const centerY = height / 2; // Center vertically

    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height);

    // Create a group for zoomable content
    const g = svg.append("g");

    // Set up zoom behavior
    const zoom = d3.zoom()
      .scaleExtent([0.1, 5])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
        setZoomLevel(event.transform.k);
      });

    svg.call(zoom);

    // 1️⃣ FAN COVERAGE - Full 360 degree circle
    const FAN_START = 0; // Start at right (0 degrees)
    const FAN_END = 2 * Math.PI; // Full circle (360 degrees)

    // 2️⃣ GENERATION → RADIUS MAPPING
    const RING_WIDTH = 80;
    const CENTER_RADIUS = 40; // Center circle radius for root

    // Build tree structure with depth and layout
    const buildTreeWithLayout = (node, depth = 0, parentStartAngle = null, parentEndAngle = null, branchIndex = 0, parentBranchColor = null) => {
      node.depth = depth;
      node.branchIndex = branchIndex;
      
      // Preserve original color from database if it exists
      const originalColor = node.color;

      // Calculate radii
      if (depth === 0) {
        // Root node at center
        node.innerRadius = 0;
        node.outerRadius = CENTER_RADIUS;
      } else {
        node.innerRadius = CENTER_RADIUS + (depth - 1) * RING_WIDTH;
        node.outerRadius = node.innerRadius + RING_WIDTH;
      }

      // Calculate angular span
      if (depth === 0) {
        // Root occupies entire fan
        node.startAngle = FAN_START;
        node.endAngle = FAN_END;
      } else if (depth === 1) {
        // First generation: position in middle of left and right half circles
        const numSiblings = node.parentNode ? node.parentNode.children.length : 1;
        const siblingIndex = node.siblingIndex || 0;
        
        if (numSiblings === 1) {
          // Single child - use full circle, no division needed
          // SVG coordinates: 0° = right, 90° = bottom, 180° = left, 270° = top
          node.startAngle = 0;
          node.endAngle = 2 * Math.PI; // Full 360 degrees (complete circle)
          node.midAngle = 3 * Math.PI / 2; // 270 degrees (top in SVG) for name position
          node.angleSpan = 2 * Math.PI;
        } else {
          // Multiple children - specific arc boundaries
          // SVG coordinates: 0° = right, 90° = bottom, 180° = left, 270° = top
          const fullCircle = 2 * Math.PI; // 360 degrees
          
          if (numSiblings === 2) {
            // Two children: specific arcs
            if (siblingIndex === 0) {
              // Child 1: arc from 0° (right) through 270° (top) to 180° (left)
              // Going counter-clockwise: 0° → 270° → 180°
              node.startAngle = 0; // 0 degrees (right)
              node.endAngle = Math.PI; // 180 degrees (left)
              node.midAngle = 3 * Math.PI / 2; // 270 degrees (top) for name position
              node.angleSpan = Math.PI; // 180 degrees
            } else {
              // Child 2: arc from 180° (left) through 90° (bottom) to 0° (right, wrapping)
              // Going counter-clockwise: 180° → 90° → 0° (360°)
              node.startAngle = Math.PI; // 180 degrees (left)
              node.endAngle = 2 * Math.PI; // 360 degrees (0°, right)
              node.midAngle = Math.PI / 2; // 90 degrees (bottom) for name position
              node.angleSpan = Math.PI; // 180 degrees
            }
          } else {
            // Three or more children - divide evenly starting from 0° (right)
            const anglePerChild = fullCircle / numSiblings; // 360° / number of relatives
            node.startAngle = siblingIndex * anglePerChild;
            node.endAngle = (siblingIndex + 1) * anglePerChild;
            node.midAngle = node.startAngle + (anglePerChild / 2); // Name at midpoint
            node.angleSpan = anglePerChild;
          }
        }
      } else {
        // 3️⃣ SIBLING SPACING - Divide parent's angular span evenly
        const parentSpan = parentEndAngle - parentStartAngle;
        const numSiblings = node.parentNode ? node.parentNode.children.length : 1;
        const step = parentSpan / numSiblings;
        const siblingIndex = node.siblingIndex || 0;
        
        node.startAngle = parentStartAngle + step * siblingIndex;
        node.endAngle = node.startAngle + step;
      }

      // Calculate midAngle and angleSpan (only if not already set)
      // For first generation with 1 or 2 siblings, midAngle is already set explicitly above
      // Check if midAngle was already set - if so, don't recalculate
      if (node.midAngle === undefined || node.midAngle === null) {
        // midAngle not set yet - calculate it
        node.midAngle = (node.startAngle + node.endAngle) / 2;
        node.angleSpan = node.endAngle - node.startAngle;
      } else {
        // midAngle already set explicitly - just ensure angleSpan is set
        if (!node.angleSpan) {
          node.angleSpan = node.endAngle - node.startAngle;
        }
      }

      // 4️⃣ COLOR ASSIGNMENT
      // Use custom color from database if provided, otherwise use default colors
      const customColor = originalColor && typeof originalColor === 'string' && originalColor.trim() !== '' 
        ? originalColor.trim() 
        : null;
      
      // Ensure branchIndex is defined (default to 0 if not)
      const safeBranchIndex = branchIndex !== undefined && branchIndex !== null ? branchIndex : 0;
      
      // Store branchIndex on node for later use
      node.branchIndex = safeBranchIndex;
      
      if (customColor) {
        // Custom color from database - use it directly
        node.color = customColor;
      } else if (depth === 0) {
        // Root node - dark color
        node.color = '#2c3e50';
      } else {
        // All children (depth > 0) - assign default branch colors
        // For first generation, branchIndex is set by the parent (root's children get index 0, 1, 2, etc.)
        // For deeper generations, they inherit the parent's branchIndex
        node.color = branchColors[safeBranchIndex % branchColors.length];
      }
      
      // Debug: ensure color is always set
      if (!node.color) {
        console.warn(`Warning: node.color is undefined for depth ${depth}, branchIndex ${safeBranchIndex}, name: ${node.first_name}`);
        node.color = branchColors[safeBranchIndex % branchColors.length];
      }
      
      // Debug log for color assignment (remove after debugging)
      if (depth > 1) {
        console.log(`Color assigned: depth=${depth}, name=${node.first_name}, originalColor=${originalColor}, branchIndex=${safeBranchIndex}, finalColor=${node.color}`);
      }

      // Process children
      if (node.children && node.children.length > 0) {
        node.children.forEach((child, index) => {
          child.parentNode = node;
          child.siblingIndex = index;
          // Siblings share the same branch index and base color
          // Only root's children get different branch indices (different colors)
          const childBranchIndex = depth === 0 ? index : branchIndex;
          const childBranchBaseColor = depth === 0 ? branchColors[index % branchColors.length] : node.branchBaseColor;
          buildTreeWithLayout(child, depth + 1, node.startAngle, node.endAngle, childBranchIndex, childBranchBaseColor);
        });
      }
    };

    // Build tree structure
    const treeWithLayout = JSON.parse(JSON.stringify(data));
    buildTreeWithLayout(treeWithLayout, 0);

    // Get max depth for generation labels
    const getMaxDepth = (node) => {
      if (!node.children || node.children.length === 0) {
        return node.depth;
      }
      return Math.max(node.depth, ...node.children.map(getMaxDepth));
    };
    const maxDepth = getMaxDepth(treeWithLayout);

    // Generation labels
    // depth 0 = Root/Founder (innermost circle)
    // depth 1 = First Generation (first ring of children)
    // depth 2 = Second Generation (grandchildren)
    // etc.
    const generationLabels = [
      null, // Root/Founder - no label needed (or could be "Founder")
      'First Generation',
      'Second Generation',
      'Third Generation',
      'Fourth Generation',
      'Fifth Generation',
      'Sixth Generation',
      'Seventh Generation'
    ];

    // Draw generation rings and labels
    for (let depth = 0; depth <= maxDepth; depth++) {
      const innerRadius = depth === 0 ? 0 : CENTER_RADIUS + (depth - 1) * RING_WIDTH;
      const outerRadius = depth === 0 ? CENTER_RADIUS : CENTER_RADIUS + depth * RING_WIDTH;
      
      // Draw generation ring
      const arc = d3.arc()
        .innerRadius(innerRadius - 1)
        .outerRadius(outerRadius + 1)
        .startAngle(FAN_START)
        .endAngle(FAN_END);

      g.append("path")
        .attr("d", arc)
        .attr("transform", `translate(${centerX}, ${centerY})`)
        .attr("fill", "none")
        .attr("stroke", "rgba(255, 255, 255, 0.1)")
        .attr("stroke-width", 1)
        .attr("opacity", 0.3);

      // Generation label - place using SVG coordinates
      // SVG coordinates: 0° = right, 90° = bottom, 180° = left, 270° = top
      if (generationLabels[depth]) {
        const labelRadius = outerRadius + 15;
        const labelAngle = 3 * Math.PI / 2; // 270 degrees (top in SVG)
        const labelX = centerX + labelRadius * Math.cos(labelAngle);
        const labelY = centerY + labelRadius * Math.sin(labelAngle);

        g.append("text")
          .attr("x", labelX)
          .attr("y", labelY)
          .attr("text-anchor", "middle")
          .attr("fill", "#aaa")
          .attr("font-size", "10px")
          .attr("font-weight", "500")
          .text(generationLabels[depth]);
      }
    }

    // Draw connections (radial lines from parent to children)
    const drawConnections = (node) => {
      if (node.children && node.children.length > 0) {
        node.children.forEach(child => {
          const parentOuterRadius = node.outerRadius;
          const childInnerRadius = child.innerRadius;
          const childMidAngle = child.midAngle;

          // Draw line from parent's outer edge to child's inner edge
          const x1 = centerX + parentOuterRadius * Math.cos(childMidAngle);
          const y1 = centerY + parentOuterRadius * Math.sin(childMidAngle);
          const x2 = centerX + childInnerRadius * Math.cos(childMidAngle);
          const y2 = centerY + childInnerRadius * Math.sin(childMidAngle);

          g.append("line")
            .attr("x1", x1)
            .attr("y1", y1)
            .attr("x2", x2)
            .attr("y2", y2)
            .attr("stroke", "rgba(255, 255, 255, 0.3)")
            .attr("stroke-width", 1.5)
            .attr("opacity", 0.5);
        });
      }
    };

    // 5️⃣ TEXT OVERFLOW FIX - Text inside arcs with proper rotation and centering
    const drawText = (node) => {
      // Calculate the exact center of the segment
      const midRadius = (node.innerRadius + node.outerRadius) / 2;
      
      // For root (circle), center is at origin
      if (node.depth === 0) {
        // Root node - text at center of circle, same size as others
        g.append("text")
          .attr("x", centerX)
          .attr("y", centerY - 8)
          .attr("text-anchor", "middle")
          .attr("fill", "#fff")
          .attr("font-size", "13px")
          .attr("font-weight", "bold")
          .attr("stroke", "rgba(0,0,0,0.5)")
          .attr("stroke-width", "1px")
          .text(node.last_name ? `${node.first_name} ${node.last_name}` : node.first_name);

        const birthYear = new Date(node.birth_date).getFullYear();
        g.append("text")
          .attr("x", centerX)
          .attr("y", centerY + 12)
          .attr("text-anchor", "middle")
          .attr("fill", "#fff")
          .attr("font-size", "11px")
          .attr("font-weight", "600")
          .attr("stroke", "rgba(0,0,0,0.4)")
          .attr("stroke-width", "0.8px")
          .text(birthYear);
      } else {
        // Arc segments
        let textRadius, textX, textY, rotationAngle, textAnchor;
        
        if (node.depth === 1) {
          // First generation: style exactly like "First Generation" label
          // Position centered inside the arc segment (at mid-radius)
          textRadius = (node.innerRadius + node.outerRadius) / 2;
          textX = centerX + textRadius * Math.cos(node.midAngle);
          textY = centerY + textRadius * Math.sin(node.midAngle);
          
          // No rotation - text is horizontal like "First Generation" label
          rotationAngle = 0;
          textAnchor = "middle"; // Same as generation label
        } else {
          // Other generations: center text in the middle of the arc segment
          textRadius = midRadius;
          textX = centerX + textRadius * Math.cos(node.midAngle);
          textY = centerY + textRadius * Math.sin(node.midAngle);
          textAnchor = "middle";
          
          // Other generations: text follows arc direction
          const angleDegrees = node.midAngle * 180 / Math.PI;
          rotationAngle = angleDegrees + 90;
          
          // If text would be upside down, flip it
          if (rotationAngle > 90 && rotationAngle < 270) {
            rotationAngle = angleDegrees - 90;
          }
        }

        // Calculate maximum text width based on arc length
        const arcLength = Math.abs(node.angleSpan) * textRadius;
        const maxTextWidth = Math.max(arcLength * 0.85, 30);

        // Create text group - translate to position, then rotate
        const textGroup = g.append("g")
          .attr("transform", `translate(${textX}, ${textY}) rotate(${rotationAngle})`);

        // Name text - first generation styled like "First Generation" label
        let fontSize, fontWeight, strokeWidth, textFill;
        if (node.depth === 1) {
          // First generation: match "First Generation" label style exactly
          fontSize = "10px";
          fontWeight = "500";
          strokeWidth = "0px"; // No stroke like generation label
          textFill = "#aaa"; // Same color as generation label
        } else if (node.depth === 2) {
          // Second generation
          fontSize = "13px";
          fontWeight = "bold";
          strokeWidth = "1px";
          textFill = "#fff";
        } else {
          // Deeper generations
          fontSize = "11px";
          fontWeight = "600";
          strokeWidth = "0.8px";
          textFill = "#fff";
        }
        
        // Vertical offset for text positioning
        let textDy;
        if (node.depth === 1) {
          // First generation: no offset, centered like generation label
          textDy = "0";
        } else {
          textDy = "-5"; // Other generations
        }
        
        const nameText = textGroup.append("text")
          .attr("text-anchor", textAnchor)
          .attr("dy", textDy)
          .attr("fill", textFill)
          .attr("font-size", fontSize)
          .attr("font-weight", fontWeight)
          .attr("stroke", node.depth === 1 ? "none" : "rgba(0,0,0,0.5)")
          .attr("stroke-width", strokeWidth)
          .text(node.last_name ? `${node.first_name} ${node.last_name}` : node.first_name);

        // Adjust font size if text is too wide, but ensure minimum readability
        try {
          const nameBBox = nameText.node().getBBox();
          if (nameBBox.width > maxTextWidth) {
            const scale = maxTextWidth / nameBBox.width;
            const currentSize = parseFloat(nameText.attr("font-size"));
            const minSize = (node.depth === 1 || node.depth === 2) ? 10 : 8;
            const newSize = Math.max(minSize, currentSize * scale);
            nameText.attr("font-size", `${newSize}px`);
          }
        } catch (e) {
          // Continue with default if measurement fails
        }

        // Birth year text - positioned below name
        const birthYear = new Date(node.birth_date).getFullYear();
        let yearFontSize, yearFontWeight, yearStrokeWidth, yearFill;
        if (node.depth === 1) {
          // First generation: match "First Generation" label style exactly
          yearFontSize = "10px";
          yearFontWeight = "500";
          yearStrokeWidth = "0px"; // No stroke like generation label
          yearFill = "#aaa"; // Same color as generation label
        } else if (node.depth === 2) {
          // Second generation
          yearFontSize = "11px";
          yearFontWeight = "600";
          yearStrokeWidth = "0.8px";
          yearFill = "#fff";
        } else {
          yearFontSize = "10px";
          yearFontWeight = "500";
          yearStrokeWidth = "0.6px";
          yearFill = "#fff";
        }
        
        let yearDy;
        if (node.depth === 1) {
          // First generation: year below name, small offset
          yearDy = "12"; // Year below name
        } else {
          yearDy = "10"; // Other generations
        }
        
        textGroup.append("text")
          .attr("text-anchor", textAnchor)
          .attr("dy", yearDy)
          .attr("fill", yearFill)
          .attr("font-size", yearFontSize)
          .attr("font-weight", yearFontWeight)
          .attr("stroke", node.depth === 1 ? "none" : "rgba(0,0,0,0.4)")
          .attr("stroke-width", yearStrokeWidth)
          .text(birthYear);
      }
    };

    // Draw connections first (behind), then segments, then text (on top)
    // This ensures text appears above colored segments
    const drawAllConnections = (node) => {
      drawConnections(node);
      if (node.children && node.children.length > 0) {
        node.children.forEach(child => {
          drawAllConnections(child);
        });
      }
    };

    // Draw segments (without text)
    const drawSegmentsOnly = (node) => {
      const numSiblings = node.parentNode ? node.parentNode.children.length : 1;
      
      // Debug: log color for deeper generations (remove after debugging)
      if (node.depth > 1) {
        console.log(`Drawing segment: depth=${node.depth}, name=${node.first_name}, node.color=${node.color}, node.branchIndex=${node.branchIndex}`);
      }
      
      if (node.depth === 0) {
        // Root node is a circle
        g.append("circle")
          .attr("cx", centerX)
          .attr("cy", centerY)
          .attr("r", node.outerRadius)
          .attr("fill", node.color)
          .attr("stroke", "rgba(255, 255, 255, 0.4)")
          .attr("stroke-width", 2)
          .attr("opacity", 0.95)
          .on("mouseover", function() {
            d3.select(this).attr("opacity", 1).attr("stroke-width", 3);
          })
          .on("mouseout", function() {
            d3.select(this).attr("opacity", 0.95).attr("stroke-width", 2);
          });
      } else {
        // Create arc path for segment - handle wrap-around and full circle
        let startAngle = node.startAngle;
        let endAngle = node.endAngle;
        
        // Handle full circle (360°) - single child case (no division, just full circle)
        if (node.depth === 1 && numSiblings === 1) {
          // Single child - draw as complete circle, no division
          const fullCircleArc = d3.arc()
            .innerRadius(node.innerRadius)
            .outerRadius(node.outerRadius)
            .startAngle(0)
            .endAngle(2 * Math.PI);
          
          // Ensure color is set - use fallback if not
          const defaultColors = ['#4a90e2', '#50c878', '#ff6b6b', '#ffa500', '#9b59b6'];
          const fillColor1 = node.color || defaultColors[(node.branchIndex || 0) % defaultColors.length] || '#4a90e2';
          
          g.append("path")
            .attr("d", fullCircleArc)
            .attr("transform", `translate(${centerX}, ${centerY})`)
            .attr("fill", fillColor1)
            .attr("stroke", "rgba(255, 255, 255, 0.3)")
            .attr("stroke-width", 1.5)
            .attr("opacity", 0.9)
            .on("mouseover", function() {
              d3.select(this).attr("opacity", 1).attr("stroke-width", 2.5);
            })
            .on("mouseout", function() {
              d3.select(this).attr("opacity", 0.9).attr("stroke-width", 1.5);
            });
          return; // Skip the normal arc drawing
        }
        
        // Handle arc drawing - D3 draws arcs counter-clockwise
        // For Child 1: we want arc from 0° to 180° going counter-clockwise (0° → 270° → 180°)
        // For Child 2: we want arc from 180° to 360° going counter-clockwise (180° → 90° → 0°)
        if (node.depth === 1 && numSiblings === 2) {
          // Two children - use angles as specified (D3 will draw counter-clockwise)
          if (node.siblingIndex === 0) {
            // Child 1: 0° to 180° (counter-clockwise: 0° → 270° → 180°)
            startAngle = node.startAngle; // 0°
            endAngle = node.endAngle; // 180°
          } else {
            // Child 2: 180° to 360° (counter-clockwise: 180° → 90° → 0°/360°)
            startAngle = node.startAngle; // 180°
            endAngle = node.endAngle; // 360°
          }
        } else {
          // For other arcs, ensure proper ordering
          startAngle = Math.min(node.startAngle, node.endAngle);
          endAngle = Math.max(node.startAngle, node.endAngle);
        }
        
        // Only draw if segment has valid size
        const angleDiff = endAngle > Math.PI ? (2 * Math.PI - endAngle + startAngle) : (endAngle - startAngle);
        if (angleDiff > 0.001) {
          const arc = d3.arc()
            .innerRadius(node.innerRadius)
            .outerRadius(node.outerRadius)
            .startAngle(startAngle)
            .endAngle(endAngle);

          // Draw segment
          // Ensure color is set - use fallback if not
          const defaultColors = ['#4a90e2', '#50c878', '#ff6b6b', '#ffa500', '#9b59b6'];
          const fillColor = node.color || defaultColors[(node.branchIndex || 0) % defaultColors.length] || '#4a90e2';
          
          g.append("path")
            .attr("d", arc)
            .attr("transform", `translate(${centerX}, ${centerY})`)
            .attr("fill", fillColor)
            .attr("stroke", "rgba(255, 255, 255, 0.3)")
            .attr("stroke-width", 1.5)
            .attr("opacity", 0.9)
            .on("mouseover", function() {
              d3.select(this).attr("opacity", 1).attr("stroke-width", 2.5);
            })
            .on("mouseout", function() {
              d3.select(this).attr("opacity", 0.9).attr("stroke-width", 1.5);
            });
        }
      }

      // Recursively draw children segments
      if (node.children && node.children.length > 0) {
        node.children.forEach(child => {
          drawSegmentsOnly(child);
        });
      }
    };

    // Draw text on top (after segments)
    const drawTextOnly = (node) => {
      drawText(node);
      if (node.children && node.children.length > 0) {
        node.children.forEach(child => {
          drawTextOnly(child);
        });
      }
    };

    // Start rendering in correct order: connections -> segments -> text
    drawAllConnections(treeWithLayout);
    drawSegmentsOnly(treeWithLayout);
    drawTextOnly(treeWithLayout);

    // Auto-fit view
    const bounds = g.node().getBBox();
    const scaleX = width / (bounds.width * 1.1);
    const scaleY = height / (bounds.height * 1.1);
    const scale = Math.min(scaleX, scaleY, 1);

    const transform = d3.zoomIdentity
      .translate(width / 2 - (bounds.x + bounds.width / 2) * scale, 
                 height / 2 - (bounds.y + bounds.height / 2) * scale)
      .scale(scale);

    svg.transition().duration(750).call(zoom.transform, transform);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const handleZoomIn = () => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.transition().call(d3.zoom().scaleBy, 1.5);
  };

  const handleZoomOut = () => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.transition().call(d3.zoom().scaleBy, 1 / 1.5);
  };

  const handleResetZoom = () => {
    if (!svgRef.current || !containerRef.current) return;
    const svg = d3.select(svgRef.current);
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;
    
    const resetTransform = d3.zoomIdentity
      .translate(width / 2, height / 2)
      .scale(1);
    
    svg.transition().duration(750).call(d3.zoom().transform, resetTransform);
  };

  return (
    <div ref={containerRef} className="chart-container">
      <div className="zoom-controls">
        <button onClick={handleZoomIn} className="zoom-btn" title="Zoom In">
          <span>+</span>
        </button>
        <button onClick={handleZoomOut} className="zoom-btn" title="Zoom Out">
          <span>−</span>
        </button>
        <button onClick={handleResetZoom} className="zoom-btn" title="Reset Zoom">
          <span>⌂</span>
        </button>
        <div className="zoom-level">{(zoomLevel * 100).toFixed(0)}%</div>
      </div>
      <div className="zoom-hint">Scroll to zoom • Drag to pan</div>
      <svg ref={svgRef} className="family-tree-svg"></svg>
    </div>
  );
};

export default FamilyTreeChart;
