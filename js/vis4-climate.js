function generateClimateData() {
    const data = [];
    for (let year = 1950; year <= 2014; year++) {
        const temp = 15 + (year - 1950) * 0.02 + Math.sin((year - 1950) / 4) * 0.3;
        const precip = 2.5 - (year - 1950) * 0.003 + Math.cos((year - 1950) / 5) * 0.2;
        const humidity = 70 - (year - 1950) * 0.05 + Math.sin((year - 1950) / 6) * 2;
        data.push({ year, temp, precip, humidity });
    }
    return data;
}

// Visualization
function createClimateVisualization() {
    const data = generateClimateData();
    
    // Dimensions
    const margin = { top: 40, right: 120, bottom: 60, left: 60 };
    const width = 900 - margin.left - margin.right;
    const height = 450 - margin.top - margin.bottom;
    
    // Create SVG
    const svg = d3.select("#vis4-container")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Calculate baseline (1950-1980 average)
    const baseline = {
        temp: d3.mean(data.filter(d => d.year <= 1980), d => d.temp),
        precip: d3.mean(data.filter(d => d.year <= 1980), d => d.precip),
        humidity: d3.mean(data.filter(d => d.year <= 1980), d => d.humidity)
    };
    
    // Normalize to baseline (% change)
    const normalized = data.map(d => ({
        year: d.year,
        temp: ((d.temp - baseline.temp) / baseline.temp) * 100,
        precip: ((d.precip - baseline.precip) / baseline.precip) * 100,
        humidity: ((d.humidity - baseline.humidity) / baseline.humidity) * 100
    }));
    
    // Scales
    const x = d3.scaleLinear()
        .domain([1950, 2014])
        .range([0, width]);
    
    const y = d3.scaleLinear()
        .domain([-15, 15])
        .range([height, 0]);
    
    // Grid
    svg.append("g")
        .attr("class", "grid")
        .attr("opacity", 0.1)
        .call(d3.axisLeft(y)
            .tickSize(-width)
            .tickFormat(""));
    
    // X axis
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x).tickFormat(d3.format("d")))
        .style("font-size", "12px");
    
    // Y axis
    svg.append("g")
        .call(d3.axisLeft(y).tickFormat(d => d + "%"))
        .style("font-size", "12px");
    
    // Axis labels
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + 45)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .text("Year");
    
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -45)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .text("Change from 1950-1980 Baseline (%)");
    
    // Baseline reference line
    svg.append("line")
        .attr("x1", 0)
        .attr("x2", width)
        .attr("y1", y(0))
        .attr("y2", y(0))
        .attr("stroke", "#666")
        .attr("stroke-width", 1.5)
        .attr("stroke-dasharray", "5,5");
    
    // Line generators
    const tempLine = d3.line()
        .x(d => x(d.year))
        .y(d => y(d.temp))
        .curve(d3.curveMonotoneX);
    
    const precipLine = d3.line()
        .x(d => x(d.year))
        .y(d => y(d.precip))
        .curve(d3.curveMonotoneX);
    
    const humidityLine = d3.line()
        .x(d => x(d.year))
        .y(d => y(d.humidity))
        .curve(d3.curveMonotoneX);
    
    // Draw lines
    svg.append("path")
        .datum(normalized)
        .attr("fill", "none")
        .attr("stroke", "#d62728")
        .attr("stroke-width", 2.5)
        .attr("d", tempLine);
    
    svg.append("path")
        .datum(normalized)
        .attr("fill", "none")
        .attr("stroke", "#1f77b4")
        .attr("stroke-width", 2.5)
        .attr("d", precipLine);
    
    svg.append("path")
        .datum(normalized)
        .attr("fill", "none")
        .attr("stroke", "#2ca02c")
        .attr("stroke-width", 2.5)
        .attr("d", humidityLine);
    
    // Legend
    const legend = svg.append("g")
        .attr("transform", `translate(${width + 20}, 20)`);
    
    const items = [
        { label: "Temperature", color: "#d62728" },
        { label: "Precipitation", color: "#1f77b4" },
        { label: "Humidity", color: "#2ca02c" }
    ];
    
    items.forEach((item, i) => {
        const g = legend.append("g")
            .attr("transform", `translate(0, ${i * 25})`);
        
        g.append("line")
            .attr("x1", 0)
            .attr("x2", 30)
            .attr("y1", 0)
            .attr("y2", 0)
            .attr("stroke", item.color)
            .attr("stroke-width", 2.5);
        
        g.append("text")
            .attr("x", 35)
            .attr("y", 5)
            .style("font-size", "13px")
            .text(item.label);
    });
    
    // Interactive hover
    const focus = svg.append("g")
        .style("display", "none");
    
    focus.append("line")
        .attr("class", "hover-line")
        .attr("stroke", "#999")
        .attr("stroke-width", 1)
        .attr("stroke-dasharray", "3,3")
        .attr("y1", 0)
        .attr("y2", height);
    
    focus.append("circle")
        .attr("class", "hover-temp")
        .attr("r", 5)
        .attr("fill", "#d62728");
    
    focus.append("circle")
        .attr("class", "hover-precip")
        .attr("r", 5)
        .attr("fill", "#1f77b4");
    
    focus.append("circle")
        .attr("class", "hover-humidity")
        .attr("r", 5)
        .attr("fill", "#2ca02c");
    
    // Tooltip
    const tooltip = d3.select("#vis4-container")
        .append("div")
        .style("position", "absolute")
        .style("visibility", "hidden")
        .style("background-color", "white")
        .style("border", "1px solid #ddd")
        .style("border-radius", "4px")
        .style("padding", "10px")
        .style("font-size", "12px")
        .style("box-shadow", "0 2px 4px rgba(0,0,0,0.2)");
    
    // Overlay for mouse tracking
    svg.append("rect")
        .attr("width", width)
        .attr("height", height)
        .style("fill", "none")
        .style("pointer-events", "all")
        .on("mouseover", () => focus.style("display", null))
        .on("mouseout", () => {
            focus.style("display", "none");
            tooltip.style("visibility", "hidden");
        })
        .on("mousemove", function(event) {
            const [mx] = d3.pointer(event);
            const year = Math.round(x.invert(mx));
            const d = normalized.find(p => p.year === year);
            
            if (!d) return;
            
            const xPos = x(d.year);
            
            focus.select(".hover-line")
                .attr("transform", `translate(${xPos}, 0)`);
            
            focus.select(".hover-temp")
                .attr("transform", `translate(${xPos}, ${y(d.temp)})`);
            
            focus.select(".hover-precip")
                .attr("transform", `translate(${xPos}, ${y(d.precip)})`);
            
            focus.select(".hover-humidity")
                .attr("transform", `translate(${xPos}, ${y(d.humidity)})`);
            
            tooltip
                .html(`
                    <strong>${year}</strong><br/>
                    <span style="color: #d62728">● Temperature: ${d.temp > 0 ? '+' : ''}${d.temp.toFixed(1)}%</span><br/>
                    <span style="color: #1f77b4">● Precipitation: ${d.precip > 0 ? '+' : ''}${d.precip.toFixed(1)}%</span><br/>
                    <span style="color: #2ca02c">● Humidity: ${d.humidity > 0 ? '+' : ''}${d.humidity.toFixed(1)}%</span>
                `)
                .style("visibility", "visible")
                .style("top", (event.pageY - 80) + "px")
                .style("left", (event.pageX + 15) + "px");
        });
    
    // Title
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", -15)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("font-weight", "600")
        .text("Temperate Coastal Zones Climate Trends (1950-2014)");
}

// Initialize when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createClimateVisualization);
} else {
    createClimateVisualization();
}