
import { AirQuality } from './types';

// API key for OpenWeatherMap
const OPENWEATHER_API_KEY = '2e11d9409c65f5ef0fd829a6e2245262';
const OPENWEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5';

// Map AQI index to descriptive text and color
export const getAirQualityInfo = (aqi: number) => {
  if (aqi <= 50) return { level: 'Good', color: '#4ade80' }; // Green
  if (aqi <= 100) return { level: 'Moderate', color: '#facc15' }; // Yellow
  if (aqi <= 150) return { level: 'Unhealthy for Sensitive Groups', color: '#fb923c' }; // Orange
  if (aqi <= 200) return { level: 'Unhealthy', color: '#f87171' }; // Red
  if (aqi <= 300) return { level: 'Very Unhealthy', color: '#c084fc' }; // Purple
  return { level: 'Hazardous', color: '#7f1d1d' }; // Dark Red/Maroon
};

// Function to fetch air quality data from OpenWeatherMap API
export const fetchAirQuality = async (lat: number, lon: number): Promise<AirQuality | null> => {
  try {
    console.log(`Fetching air quality for coordinates: lat=${lat}, lon=${lon}`);
    const response = await fetch(
      `${OPENWEATHER_BASE_URL}/air_pollution?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}`
    );
    
    if (!response.ok) {
      console.error(`Air quality API error: ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    console.log("OpenWeatherMap Air Pollution API response:", data);
    
    // OpenWeatherMap AQI is on a scale of 1-5
    // 1: Good, 2: Fair, 3: Moderate, 4: Poor, 5: Very Poor
    const owmAqi = data.list[0].main.aqi;
    
    // Map OpenWeatherMap AQI (1-5) to US EPA AQI scale (0-500)
    let mappedAqi;
    switch (owmAqi) {
      case 1: mappedAqi = 25; break;  // Good - middle of 0-50 range
      case 2: mappedAqi = 75; break;  // Fair - middle of 51-100 range
      case 3: mappedAqi = 125; break; // Moderate - middle of 101-150 range
      case 4: mappedAqi = 175; break; // Poor - middle of 151-200 range
      case 5: mappedAqi = 250; break; // Very Poor - middle of 201-300 range
      default: mappedAqi = 25; break; // Default to Good if unknown
    }
    
    const aqiInfo = getAirQualityInfo(mappedAqi);
    
    const components = data.list[0].components;
    
    return {
      index: mappedAqi,
      level: aqiInfo.level,
      color: aqiInfo.color,
      pm2_5: components.pm2_5 ? parseFloat(components.pm2_5.toFixed(2)) : null,
      pm10: components.pm10 ? parseFloat(components.pm10.toFixed(2)) : null,
      no2: components.no2 ? parseFloat(components.no2.toFixed(2)) : null,
      o3: components.o3 ? parseFloat(components.o3.toFixed(2)) : null,
      co: components.co ? parseFloat((components.co / 1000).toFixed(2)) : null, // Convert from μg/m³ to mg/m³
      so2: components.so2 ? parseFloat(components.so2.toFixed(2)) : null
    };
  } catch (error) {
    console.error('Error fetching air quality data:', error);
    return null;
  }
};

// The below function is kept for compatibility with the existing codebase
// It can be removed once the migration to OpenWeatherMap is complete
export const extractWeatherApiAirQuality = (apiAirQuality: any): AirQuality => {
  const aqiUS = Math.round(apiAirQuality['us-epa-index'] || 1);
  const aqiInfo = getAirQualityInfo(aqiUS);
  
  return {
    index: aqiUS,
    level: aqiInfo.level,
    color: aqiInfo.color,
    co: apiAirQuality.co ? parseFloat(apiAirQuality.co.toFixed(2)) : null,
    no2: apiAirQuality.no2 ? parseFloat(apiAirQuality.no2.toFixed(2)) : null,
    o3: apiAirQuality.o3 ? parseFloat(apiAirQuality.o3.toFixed(2)) : null,
    pm2_5: apiAirQuality.pm2_5 ? parseFloat(apiAirQuality.pm2_5.toFixed(2)) : null,
    pm10: apiAirQuality.pm10 ? parseFloat(apiAirQuality.pm10.toFixed(2)) : null,
    so2: apiAirQuality.so2 ? parseFloat(apiAirQuality.so2.toFixed(2)) : null,
  };
};
