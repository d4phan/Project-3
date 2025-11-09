// js/chart.js
let chartSvg, xScale, yScaleTemp, yScalePrecip, chartWidth, chartHeight, allTimeSeriesData;

function initChart(timeSeriesData, dispatcher) {
  allTimeSeriesData = timeSeriesData;

  const margin = { top: 60, right: 80, bottom: 60, left: 70 };
  chartWidth = 900 - margin.left - margin.right;
  chartHeight = 400 - margin.top - margin.bottom;

  chartSvg = d3.select("#chart-container")
    .append("svg")
    .attr("width", chartWidth + margin.left + margin.right)
    .attr("height", chartHeight + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Scales
  xScale = d3.scaleLinear()
    .domain([2000, 2100])
    .range([0, chartWidth]);

  yScaleTemp = d3.scaleLinear()
    .domain([13, 20])
    .range([chartHeight, 0]);

  yScalePrecip = d3.scaleLinear()
    .domain([0, 150])
    .range([chartHeight, 0]);

  // Axes
  const xAxis = d3.axisBottom(xScale).tickFormat(d3.format("d"));
  const yAxisTemp = d3.axisLeft(yScaleTemp).ticks(6);
  const yAxisPrecip = d3.axisRight(yScalePrecip).ticks(6);

  chartSvg.append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0,${chartHeight})`)
    .call(xAxis);

  chartSvg.append("g")
    .attr("class", "y-axis-temp")
    .call(yAxisTemp);

  chartSvg.append("g")
    .attr("class", "y-axis-precip")
    .attr("transform", `translate(${chartWidth},0)`)
    .call(yAxisPrecip);

  // Axis labels
  chartSvg.append("text")
    .attr("class", "x-label")
    .attr("x", chartWidth / 2)
    .attr("y", chartHeight + 45)
    .attr("text-anchor", "middle")
    .style("font-size", "12px")
    .text("Year");

  chartSvg.append("text")
    .attr("class", "y-label-temp")
    .attr("transform", "rotate(-90)")
    .attr("x", -chartHeight / 2)
    .attr("y", -50)
    .attr("text-anchor", "middle")
    .style("font-size", "12px")
    .style("fill", "#d62728")
    .text("Average Temperature (°C)");

  chartSvg.append("text")
    .attr("class", "y-label-precip")
    .attr("transform", "rotate(-90)")
    .attr("x", -chartHeight / 2)
    .attr("y", chartWidth + 65)
    .attr("text-anchor", "middle")
    .style("font-size", "12px")
    .style("fill", "#1f77b4")
    .text("Rainy Days per Year");

  // Title
  chartSvg.append("text")
    .attr("class", "chart-title")
    .attr("x", chartWidth / 2)
    .attr("y", -30)
    .attr("text-anchor", "middle")
    .style("font-size", "16px")
    .style("font-weight", "bold")
    .text("Climate Trends: Click a coastal region on the map");

  chartSvg.append("text")
    .attr("class", "chart-subtitle")
    .attr("x", chartWidth / 2)
    .attr("y", -10)
    .attr("text-anchor", "middle")
    .style("font-size", "12px")
    .style("fill", "#666")
    .text("Projected changes from 2000 to 2100");

  // Line generators
  const lineTemp = d3.line()
    .x(d => xScale(d.year))
    .y(d => yScaleTemp(d.temperature))
    .curve(d3.curveMonotoneX);

  const lineRainy = d3.line()
    .x(d => xScale(d.year))
    .y(d => yScalePrecip(d.rainyDays))
    .curve(d3.curveMonotoneX);

  // Create line paths (initially hidden)
  chartSvg.append("path")
    .attr("class", "line-temp")
    .attr("fill", "none")
    .attr("stroke", "#d62728")
    .attr("stroke-width", 3)
    .style("opacity", 0);

  chartSvg.append("path")
    .attr("class", "line-rainy")
    .attr("fill", "none")
    .attr("stroke", "#1f77b4")
    .attr("stroke-width", 3)
    .style("opacity", 0);

  // Add legend
  const legend = chartSvg.append("g")
    .attr("class", "legend")
    .attr("transform", `translate(${chartWidth - 200}, 10)`);

  legend.append("line")
    .attr("x1", 0).attr("x2", 30)
    .attr("y1", 0).attr("y2", 0)
    .attr("stroke", "#d62728")
    .attr("stroke-width", 3);

  legend.append("text")
    .attr("x", 35).attr("y", 5)
    .style("font-size", "11px")
    .text("Temperature");

  legend.append("line")
    .attr("x1", 0).attr("x2", 30)
    .attr("y1", 20).attr("y2", 20)
    .attr("stroke", "#1f77b4")
    .attr("stroke-width", 3);

  legend.append("text")
    .attr("x", 35).attr("y", 25)
    .style("font-size", "11px")
    .text("Rainy Days");

  // Listen for region selection
  dispatcher.on("regionSelected", region => updateChart(region));
}

function updateChart(regionName) {
  const regionData = allTimeSeriesData.find(d => d.region === regionName);
  
  if (!regionData) {
    console.warn("No data for region:", regionName);
    return;
  }

  console.log("Updating chart for:", regionName);

  // Update title
  chartSvg.select(".chart-title")
    .text(`Climate Trends: ${regionName}`);

  const data = regionData.data;

  // Line generators
  const lineTemp = d3.line()
    .x(d => xScale(d.year))
    .y(d => yScaleTemp(d.temperature))
    .curve(d3.curveMonotoneX);

  const lineRainy = d3.line()
    .x(d => xScale(d.year))
    .y(d => yScalePrecip(d.rainyDays))
    .curve(d3.curveMonotoneX);

  // Update temperature line
  chartSvg.select(".line-temp")
    .datum(data)
    .transition()
    .duration(750)
    .style("opacity", 1)
    .attr("d", lineTemp);

  // Update rainy days line
  chartSvg.select(".line-rainy")
    .datum(data)
    .transition()
    .duration(750)
    .style("opacity", 1)
    .attr("d", lineRainy);

  // Calculate trends
  const tempChange = (data[data.length - 1].temperature - data[0].temperature).toFixed(2);
  const rainyChange = (data[data.length - 1].rainyDays - data[0].rainyDays).toFixed(1);

  chartSvg.select(".chart-subtitle")
    .text(`Temp: +${tempChange}°C | Rainy Days: ${rainyChange} days (2000-2100)`);
}