// js/main.js
(async function() {
  // Simulate CMIP6 climate data for coastal regions
  // In production, this would load from actual CMIP6 zarr stores
  const coastalRegions = [
    { name: "California Coast", lat: 37, lon: -122, temp_change: 2.1, precip_change: -15 },
    { name: "Mediterranean", lat: 40, lon: 15, temp_change: 2.8, precip_change: -22 },
    { name: "Australian Coast", lat: -34, lon: 151, temp_change: 1.9, precip_change: -12 },
    { name: "Chilean Coast", lat: -33, lon: -71, temp_change: 1.7, precip_change: -18 },
    { name: "South African Coast", lat: -34, lon: 18, temp_change: 2.3, precip_change: -20 },
    { name: "Japanese Coast", lat: 35, lon: 139, temp_change: 1.8, precip_change: -8 },
    { name: "New Zealand Coast", lat: -41, lon: 174, temp_change: 1.6, precip_change: -10 }
  ];

  // Generate time series data (2000-2100)
  const timeSeriesData = coastalRegions.map(region => {
    const series = [];
    for (let year = 2000; year <= 2100; year++) {
      const progress = (year - 2000) / 100;
      series.push({
        year: year,
        temperature: 15 + (region.temp_change * progress) + (Math.random() - 0.5) * 0.3,
        precipitation: 800 - (Math.abs(region.precip_change) * progress * 8) + (Math.random() - 0.5) * 20,
        rainyDays: 120 - (Math.abs(region.precip_change) * progress * 1.5) + (Math.random() - 0.5) * 5
      });
    }
    return {
      region: region.name,
      lat: region.lat,
      lon: region.lon,
      data: series
    };
  });

  console.log("Generated CMIP6 coastal climate data:", timeSeriesData);

  // Create event dispatcher for interactive visualizations
  const dispatcher = d3.dispatch("regionSelected");

  // Initialize all visualizations
  initMap(coastalRegions, dispatcher);
  initChart(timeSeriesData, dispatcher);

  // Load actual CSV metadata (for reference)
  try {
    const metadata = await d3.csv("data/cmip6-zarr-consolidated-stores.csv");
    console.log("CMIP6 metadata loaded:", metadata.slice(0, 5));
  } catch (err) {
    console.log("Note: CSV metadata not found, using simulated data");
  }
})();