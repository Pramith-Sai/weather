
import { AirQuality } from './types';

// API key for Air Ninjas
const AIR_NINJAS_API_KEY = 'SMI5PxUWBSfc2sKaEG5ttg==XYct9CGH2LSTtRCT';
const AIR_NINJAS_BASE_URL = 'https://api.api-ninjas.com/v1';

// Map AQI index to descriptive text and color
export const getAirQualityInfo = (aqi: number) => {
  if (aqi <= 50) return { level: 'Good', color: '#4ade80' }; // Green
  if (aqi <= 100) return { level: 'Moderate', color: '#facc15' }; // Yellow
  if (aqi <= 150) return { level: 'Unhealthy for Sensitive Groups', color: '#fb923c' }; // Orange
  if (aqi <= 200) return { level: 'Unhealthy', color: '#f87171' }; // Red
  if (aqi <= 300) return { level: 'Very Unhealthy', color: '#c084fc' }; // Purple
  return { level: 'Hazardous', color: '#7f1d1d' }; // Dark Red/Maroon
};

// Function to fetch air quality data from Air Ninjas API
export const fetchAirQuality = async (cityName: string): Promise<AirQuality | null> => {
  try {
    console.log(`Fetching air quality for: ${cityName}`);
    const response = await fetch(
      `${AIR_NINJAS_BASE_URL}/airquality?city=${encodeURIComponent(cityName)}`,
      {
        headers: {
          'X-Api-Key': AIR_NINJAS_API_KEY
        }
      }
    );
    
    if (!response.ok) {
      console.error(`Air quality API error: ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    console.log("Air Ninjas API response:", data);
    
    // Calculate overall AQI based on the highest individual index
    // Using US EPA index calculation method
    const pollutants = {
      pm2_5: data.PM2_5 ? parseFloat(data.PM2_5.concentration.toFixed(2)) : null,
      pm10: data.PM10 ? parseFloat(data.PM10.concentration.toFixed(2)) : null,
      no2: data.NO2 ? parseFloat(data.NO2.concentration.toFixed(2)) : null,
      o3: data.O3 ? parseFloat(data.O3.concentration.toFixed(2)) : null,
      co: data.CO ? parseFloat(data.CO.concentration.toFixed(2)) : null,
      so2: data.SO2 ? parseFloat(data.SO2.concentration.toFixed(2)) : null
    };
    
    // Get the highest AQI from all pollutants
    const aqiValues = [
      data.PM2_5?.aqi || 0,
      data.PM10?.aqi || 0,
      data.NO2?.aqi || 0,
      data.O3?.aqi || 0,
      data.CO?.aqi || 0,
      data.SO2?.aqi || 0
    ];
    
    const aqiUS = Math.max(...aqiValues);
    const aqiInfo = getAirQualityInfo(aqiUS);
    
    return {
      index: aqiUS,
      level: aqiInfo.level,
      color: aqiInfo.color,
      pm2_5: pollutants.pm2_5,
      pm10: pollutants.pm10,
      no2: pollutants.no2,
      o3: pollutants.o3,
      co: pollutants.co,
      so2: pollutants.so2
    };
  } catch (error) {
    console.error('Error fetching air quality data:', error);
    return null;
  }
};

// We no longer need this function as we're not using WeatherAPI anymore
export const extractWeatherApiAirQuality = (apiAirQuality: any): AirQuality => {
  const aqiUS = Math.round(1); // Default to 1
  const aqiInfo = getAirQualityInfo(aqiUS);
  
  return {
    index: aqiUS,
    level: aqiInfo.level,
    color: aqiInfo.color,
    co: null,
    no2: null,
    o3: null,
    pm2_5: null,
    pm10: null,
    so2: null,
  };
};
