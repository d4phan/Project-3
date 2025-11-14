// js/map.js
function initMap(coastalData, dispatcher) {
  const width = 1000;
  const height = 450;

  const svg = d3.select("#map-container")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .style("background", "#e8f4f8");

  const projection = d3.geoNaturalEarth1()
    .scale(140)
    .translate([width / 2, height / 2]);

  const path = d3.geoPath().projection(projection);

  // Color scale for temperature change
  const colorScale = d3.scaleSequential(d3.interpolateRdYlBu)
    .domain([3, 0]); // Reversed: red = more warming

  // Load world map
  d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json")
    .then(world => {
      const countries = topojson.feature(world, world.objects.countries);

      // Draw countries
      svg.selectAll(".country")
        .data(countries.features)
        .join("path")
        .attr("class", "country")
        .attr("d", path)
        .attr("fill", "#ddd")
        .attr("stroke", "#999")
        .attr("stroke-width", 0.5);

      // Add coastal regions as circles
      const regions = svg.selectAll(".coastal-region")
        .data(coastalData)
        .join("g")
        .attr("class", "coastal-region")
        .attr("transform", d => {
          const [x, y] = projection([d.lon, d.lat]);
          return `translate(${x},${y})`;
        })
        .style("cursor", "pointer")
        .on("click", function(event, d) {
          // Highlight selected
          svg.selectAll(".coastal-region circle")
            .attr("stroke", "#333")
            .attr("stroke-width", 2);
          
          d3.select(this).select("circle")
            .attr("stroke", "#000")
            .attr("stroke-width", 4);

          dispatcher.call("regionSelected", this, d.name);
        })
        .on("mouseover", function(event, d) {
          d3.select(this).select("circle")
            .attr("r", 12);
          
          tooltip.style("display", "block")
            .html(`
              <strong>${d.name}</strong><br>
              Temp Change: +${d.temp_change}°C<br>
              Precip Change: ${d.precip_change}%
            `)
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function() {
          d3.select(this).select("circle")
            .attr("r", 8);
          tooltip.style("display", "none");
        });

      regions.append("circle")
        .attr("r", 8)
        .attr("fill", d => colorScale(d.temp_change))
        .attr("stroke", "#333")
        .attr("stroke-width", 2)
        .attr("opacity", 0.9);

      // Add legend
      const legendWidth = 200;
      const legendHeight = 15;
      
      const legend = svg.append("g")
        .attr("transform", `translate(${width - legendWidth - 15}, ${height - 45})`);

      const legendScale = d3.scaleLinear()
        .domain([0, 3])
        .range([0, legendWidth]);

      const legendAxis = d3.axisBottom(legendScale)
        .ticks(4)
        .tickFormat(d => `+${d}°C`);

      // Legend gradient
      const defs = svg.append("defs");
      const gradient = defs.append("linearGradient")
        .attr("id", "temp-gradient");

      gradient.selectAll("stop")
        .data(d3.range(0, 1.1, 0.1))
        .join("stop")
        .attr("offset", d => `${d * 100}%`)
        .attr("stop-color", d => colorScale(3 - d * 3));

      legend.append("rect")
        .attr("width", legendWidth)
        .attr("height", legendHeight)
        .style("fill", "url(#temp-gradient)");

      legend.append("g")
        .attr("transform", `translate(0, ${legendHeight})`)
        .call(legendAxis);

      legend.append("text")
        .attr("x", legendWidth / 2)
        .attr("y", -5)
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .style("font-weight", "bold")
        .text("Temperature Change (2000-2100)");

      // Add title
      svg.append("text")
        .attr("x", width / 2)
        .attr("y", 25)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("font-weight", "bold")
        .style("fill", "#333")
        .text("Coastal Temperature & Precipitation Changes");

      svg.append("text")
        .attr("x", width / 2)
        .attr("y", 45)
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .style("fill", "#666")
        .text("Click a coastal region to view detailed trends");
    })
    .catch(err => console.error("Map load error:", err));

  // Tooltip
  const tooltip = d3.select("body").append("div")
    .style("position", "absolute")
    .style("display", "none")
    .style("background", "rgba(0,0,0,0.8)")
    .style("color", "white")
    .style("padding", "8px")
    .style("border-radius", "4px")
    .style("font-size", "12px")
    .style("pointer-events", "none")
    .style("z-index", "1000");
}