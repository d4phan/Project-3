// js/utils.js

// Color scale for temperature anomalies
function getColorScale() {
  return d3.scaleSequential(d3.interpolateRdYlBu)
    .domain([4, -2]); // Reversed: red = warming, blue = cooling
}

// Filter coastal regions (temperate zones: 30-45° latitude)
function filterCoastalRegions(data) {
  return data.filter(d => {
    const lat = Math.abs(+d.lat);
    return lat >= 30 && lat <= 45;
  });
}

// Calculate temperature anomaly
function calculateAnomaly(currentTemp, baselineTemp) {
  return currentTemp - baselineTemp;
}

// Format precipitation change as percentage
function formatPrecipChange(change) {
  return change > 0 ? `+${change}%` : `${change}%`;
}

// Check if region is coastal (simplified check)
function isCoastalRegion(lat, lon) {
  // In a real implementation, you would check proximity to coastlines
  // For now, we use a simplified latitude-based check
  const absLat = Math.abs(lat);
  return absLat >= 30 && absLat <= 45;
}

// Parse CMIP6 variable names to readable format
function parseVariableName(variable_id) {
  const variableNames = {
    'tas': 'Near-Surface Air Temperature',
    'pr': 'Precipitation',
    'psl': 'Sea Level Pressure',
    'hurs': 'Near-Surface Relative Humidity',
    'ps': 'Surface Air Pressure',
    'rsds': 'Surface Downwelling Shortwave Radiation',
    'rlus': 'Surface Upwelling Longwave Radiation',
    'rlds': 'Surface Downwelling Longwave Radiation',
    'prw': 'Water Vapor Path',
    'huss': 'Near-Surface Specific Humidity',
    'hus': 'Specific Humidity',
    'hfss': 'Surface Upward Sensible Heat Flux'
  };
  
  return variableNames[variable_id] || variable_id;
}

// Generate time range for projections
function generateTimeRange(startYear, endYear, step = 1) {
  const years = [];
  for (let year = startYear; year <= endYear; year += step) {
    years.push(year);
  }
  return years;
}

// Calculate linear trend
function calculateTrend(data, xKey, yKey) {
  const n = data.length;
  const sumX = d3.sum(data, d => d[xKey]);
  const sumY = d3.sum(data, d => d[yKey]);
  const sumXY = d3.sum(data, d => d[xKey] * d[yKey]);
  const sumX2 = d3.sum(data, d => d[xKey] * d[xKey]);
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  
  return { slope, intercept };
}

// Format numbers with appropriate precision
function formatNumber(num, decimals = 2) {
  return Number(num).toFixed(decimals);
}

// Debounce function for performance optimization
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}