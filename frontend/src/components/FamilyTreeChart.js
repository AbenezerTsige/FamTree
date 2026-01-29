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

    // Draw system grid (behind chart) - vertical and horizontal lines
    const GRID_SPACING = 50;
    const gridGroup = g.append("g").attr("class", "chart-grid");

    // Vertical lines
    for (let x = 0; x <= width; x += GRID_SPACING) {
      gridGroup.append("line")
        .attr("x1", x)
        .attr("y1", 0)
        .attr("x2", x)
        .attr("y2", height)
        .attr("stroke", "rgba(255, 255, 255, 0.08)")
        .attr("stroke-width", x === centerX ? 0.5 : 0.25);
    }
    // Horizontal lines
    for (let y = 0; y <= height; y += GRID_SPACING) {
      gridGroup.append("line")
        .attr("x1", 0)
        .attr("y1", y)
        .attr("x2", width)
        .attr("y2", y)
        .attr("stroke", "rgba(255, 255, 255, 0.08)")
        .attr("stroke-width", y === centerY ? 0.5 : 0.25);
    }
    // Center cross (axes) - slightly more visible
    gridGroup.append("line")
      .attr("x1", centerX)
      .attr("y1", 0)
      .attr("x2", centerX)
      .attr("y2", height)
      .attr("stroke", "rgba(255, 255, 255, 0.15)")
      .attr("stroke-width", 0.5);
    gridGroup.append("line")
      .attr("x1", 0)
      .attr("y1", centerY)
      .attr("x2", width)
      .attr("y2", centerY)
      .attr("stroke", "rgba(255, 255, 255, 0.15)")
      .attr("stroke-width", 0.5);

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

    // Label at center of each slice: LabelAngle(i) = (ArcAngle * (i - 0.5)) % 360; ArcAngle = 360/N; i = 1-based.
    const getChildLabelAngleRad = (numChildren, childIndex1Based) => {
      if (numChildren <= 0) return 0;
      const arcAngleDeg = 360 / numChildren;
      const labelAngleDeg = (arcAngleDeg * (childIndex1Based - 0.5)) % 360;
      const normalized = ((labelAngleDeg % 360) + 360) % 360;
      return (normalized * Math.PI) / 180;
    };

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
        // First generation: Child 1 arc always starts at 0; equal slices; remainder in last child
        const numSiblings = node.parentNode ? node.parentNode.children.length : 1;
        const siblingIndex = node.siblingIndex || 0;
        const childIndex1Based = siblingIndex + 1;
        const fullCircle = 2 * Math.PI;
        const anglePerChild = fullCircle / numSiblings;

        if (siblingIndex === 0) {
          // Child 1: always [0, anglePerChild]; never move start away from 0
          node.startAngle = 0;
          node.endAngle = anglePerChild;
        } else {
          // Other children: start after previous slice; last child gets remainder so 0 stays fixed
          node.startAngle = siblingIndex * anglePerChild;
          node.endAngle = siblingIndex === numSiblings - 1 ? fullCircle : (siblingIndex + 1) * anglePerChild;
        }

        node.midAngle = getChildLabelAngleRad(numSiblings, childIndex1Based);
        node.angleSpan = node.endAngle - node.startAngle;
      } else {
        // 3️⃣ SIBLING SPACING - Divide parent's angular span evenly
        // Child 1 (siblingIndex 0) always gets the first slice starting at parentStartAngle
        const numSiblings = node.parentNode ? node.parentNode.children.length : 1;
        const siblingIndex = node.siblingIndex || 0;
        
        // Handle wrap-around for parent span
        let parentSpan;
        if (parentEndAngle >= parentStartAngle) {
          parentSpan = parentEndAngle - parentStartAngle;
        } else {
          parentSpan = (2 * Math.PI - parentStartAngle) + parentEndAngle;
        }
        
        const step = parentSpan / numSiblings;
        node.startAngle = (parentStartAngle + step * siblingIndex) % (2 * Math.PI);
        node.endAngle = (node.startAngle + step) % (2 * Math.PI);
        
        // Handle wrap-around for endAngle
        if (node.endAngle < node.startAngle && node.endAngle < 0.1) {
          // End wraps around - keep it > 2π temporarily for calculation
          node.endAngle = node.startAngle + step;
        }
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

      // Process children - sort by ID to ensure consistent order
      if (node.children && node.children.length > 0) {
        // Sort children by ID to ensure consistent ordering (child 1, child 2, child 3...)
        const sortedChildren = [...node.children].sort((a, b) => (a.id || 0) - (b.id || 0));
        
        sortedChildren.forEach((child, index) => {
          child.parentNode = node;
          child.siblingIndex = index; // 0-based: 0, 1, 2, 3...
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

    // Angle reference: axes, degree labels, quadrants (SVG: 0°=right=X+, 90°=bottom=Y+)
    const angleRefRadius = CENTER_RADIUS + RING_WIDTH * (maxDepth + 1) + 35;
    const tickInner = CENTER_RADIUS + RING_WIDTH * (maxDepth + 1);
    const axisGroup = g.append("g").attr("class", "angle-reference");

    // Radial tick lines at 0°, 90°, 180°, 270°
    [0, 90, 180, 270].forEach((deg) => {
      const rad = (deg * Math.PI) / 180;
      axisGroup.append("line")
        .attr("x1", centerX + tickInner * Math.cos(rad))
        .attr("y1", centerY + tickInner * Math.sin(rad))
        .attr("x2", centerX + angleRefRadius * Math.cos(rad))
        .attr("y2", centerY + angleRefRadius * Math.sin(rad))
        .attr("stroke", "rgba(255, 200, 100, 0.5)")
        .attr("stroke-width", 1);
    });

    // X axis and Y axis labels (along the axes, outside the circle)
    const axisLabelRadius = angleRefRadius + 22;
    axisGroup.append("text")
      .attr("x", centerX + axisLabelRadius)
      .attr("y", centerY)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .attr("fill", "rgba(255, 220, 120, 0.95)")
      .attr("font-size", "12px")
      .attr("font-weight", "700")
      .text("X axis (0°)");
    axisGroup.append("text")
      .attr("x", centerX - axisLabelRadius)
      .attr("y", centerY)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .attr("fill", "rgba(255, 220, 120, 0.95)")
      .attr("font-size", "12px")
      .attr("font-weight", "700")
      .text("X axis (180°)");
    axisGroup.append("text")
      .attr("x", centerX)
      .attr("y", centerY + axisLabelRadius)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .attr("fill", "rgba(120, 220, 255, 0.95)")
      .attr("font-size", "12px")
      .attr("font-weight", "700")
      .text("Y axis (90°)");
    axisGroup.append("text")
      .attr("x", centerX)
      .attr("y", centerY - axisLabelRadius)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .attr("fill", "rgba(120, 220, 255, 0.95)")
      .attr("font-size", "12px")
      .attr("font-weight", "700")
      .text("Y axis (270°)");

    // Degree labels at axis ends
    const angleRefs = [
      { deg: 0, label: "0°" },
      { deg: 90, label: "90°" },
      { deg: 180, label: "180°" },
      { deg: 270, label: "270°" }
    ];
    angleRefs.forEach(({ deg, label }) => {
      const rad = (deg * Math.PI) / 180;
      const x = centerX + angleRefRadius * Math.cos(rad);
      const y = centerY + angleRefRadius * Math.sin(rad);
      axisGroup.append("text")
        .attr("x", x)
        .attr("y", y)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("fill", "rgba(255, 200, 100, 0.9)")
        .attr("font-size", "11px")
        .attr("font-weight", "700")
        .text(label);
    });

    // Quadrant labels: Q1, Q2, Q3, Q4 with angle ranges
    const quadRadius = angleRefRadius - 18;
    [
      { deg: 45, label: "Quadrant 1 (Q1)", sub: "0° – 90°" },
      { deg: 135, label: "Quadrant 2 (Q2)", sub: "90° – 180°" },
      { deg: 225, label: "Quadrant 3 (Q3)", sub: "180° – 270°" },
      { deg: 315, label: "Quadrant 4 (Q4)", sub: "270° – 360°" }
    ].forEach(({ deg, label, sub }) => {
      const rad = (deg * Math.PI) / 180;
      const x = centerX + quadRadius * Math.cos(rad);
      const y = centerY + quadRadius * Math.sin(rad);
      axisGroup.append("text")
        .attr("x", x)
        .attr("y", y - 6)
        .attr("text-anchor", "middle")
        .attr("fill", "rgba(200, 200, 255, 0.95)")
        .attr("font-size", "10px")
        .attr("font-weight", "700")
        .text(label);
      axisGroup.append("text")
        .attr("x", x)
        .attr("y", y + 6)
        .attr("text-anchor", "middle")
        .attr("fill", "rgba(180, 180, 220, 0.85)")
        .attr("font-size", "9px")
        .text(sub);
    });

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
          // First generation: node.midAngle is set to label angle in buildTreeWithLayout
          textRadius = (node.innerRadius + node.outerRadius) / 2;
          textX = centerX + textRadius * Math.cos(node.midAngle);
          textY = centerY + textRadius * Math.sin(node.midAngle);
          rotationAngle = 0;
          textAnchor = "middle";
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

        // Debug: show actual angle and quadrant used for this label
        const angleDeg = (node.midAngle * 180 / Math.PI + 360) % 360;
        const angleDegRounded = Math.round(angleDeg);
        const q = angleDeg < 90 ? "Q1" : angleDeg < 180 ? "Q2" : angleDeg < 270 ? "Q3" : "Q4";
        const angleDy = (parseFloat(yearDy) + 12).toString();
        textGroup.append("text")
          .attr("text-anchor", textAnchor)
          .attr("dy", angleDy)
          .attr("fill", "#ffd24d")
          .attr("font-size", "9px")
          .attr("font-weight", "600")
          .attr("stroke", "rgba(0,0,0,0.35)")
          .attr("stroke-width", "0.6px")
          .text(`${angleDegRounded}° ${q}`);
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
        
        startAngle = Math.min(node.startAngle, node.endAngle);
        endAngle = Math.max(node.startAngle, node.endAngle);
        
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
