
import { WeatherData, LocationSearchResult, WeatherCondition, AirQuality } from './types';

// API key for WeatherAPI.com
const API_KEY = '995b07fb34e84840914160220251903';
const BASE_URL = 'https://api.weatherapi.com/v1';

// API key for Air Ninjas
const AIR_NINJAS_API_KEY = 'SMI5PxUWBSfc2sKaEG5ttg==XYct9CGH2LSTtRCT';
const AIR_NINJAS_BASE_URL = 'https://api.api-ninjas.com/v1';

// Helper function to map API weather conditions to our app's condition types
const mapWeatherCondition = (code: number): WeatherCondition => {
  // Weather condition codes based on WeatherAPI documentation
  if (code === 1000) return 'clear'; // Sunny/Clear
  if (code >= 1003 && code <= 1009) return 'partly-cloudy'; // Partly cloudy
  if (code >= 1030 && code <= 1039) return 'fog'; // Fog, mist, etc
  if (code >= 1063 && code <= 1069) return 'showers'; // Patchy rain
  if (code >= 1072 && code <= 1087) return 'rain'; // Rain, freezing rain
  if (code >= 1114 && code <= 1117) return 'snow'; // Snow
  if (code >= 1135 && code <= 1147) return 'fog'; // Fog, freezing fog
  if (code >= 1150 && code <= 1201) return 'rain'; // Light/medium/heavy rain
  if (code >= 1204 && code <= 1237) return 'sleet'; // Sleet
  if (code >= 1240 && code <= 1246) return 'showers'; // Showers
  if (code >= 1249 && code <= 1264) return 'sleet'; // Sleet showers
  if (code >= 1273 && code <= 1282) return 'thunderstorm'; // Thunderstorms
  
  return 'partly-cloudy'; // Default fallback
};

// Map AQI index to descriptive text and color
const getAirQualityInfo = (aqi: number) => {
  if (aqi <= 50) return { level: 'Good', color: '#4ade80' }; // Green
  if (aqi <= 100) return { level: 'Moderate', color: '#facc15' }; // Yellow
  if (aqi <= 150) return { level: 'Unhealthy for Sensitive Groups', color: '#fb923c' }; // Orange
  if (aqi <= 200) return { level: 'Unhealthy', color: '#f87171' }; // Red
  if (aqi <= 300) return { level: 'Very Unhealthy', color: '#c084fc' }; // Purple
  return { level: 'Hazardous', color: '#7f1d1d' }; // Dark Red/Maroon
};

// Helper function to fetch air quality data from Air Ninjas API
const fetchAirQuality = async (cityName: string): Promise<AirQuality | null> => {
  try {
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

// API service with real implementations
export const weatherApi = {
  // Get current weather and forecast for a location
  getWeather: async (locationId?: string): Promise<WeatherData> => {
    try {
      const query = locationId || 'New Delhi'; // Changed default from Delhi to New Delhi
      const response = await fetch(
        `${BASE_URL}/forecast.json?key=${API_KEY}&q=${query}&days=7&aqi=yes&alerts=no`
      );
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Get location name for air quality API
      const locationName = data.location.name;
      
      // Fetch air quality data from Air Ninjas API
      const airQualityData = await fetchAirQuality(locationName);
      
      // Fallback to WeatherAPI's air quality if Air Ninjas fails
      let airQuality;
      if (airQualityData) {
        airQuality = airQualityData;
      } else {
        // Extract air quality data from WeatherAPI as fallback
        const apiAirQuality = data.current.air_quality || {};
        const aqiUS = Math.round(apiAirQuality['us-epa-index'] || 1);
        const aqiInfo = getAirQualityInfo(aqiUS);
        
        airQuality = {
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
      }
      
      // Transform API response to match our app's data structure
      return {
        location: {
          name: data.location.name,
          region: data.location.region,
          country: data.location.country,
          latitude: data.location.lat,
          longitude: data.location.lon,
          timezone: data.location.tz_id,
          localTime: new Date(data.location.localtime).toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true
          }),
        },
        current: {
          temperature: Math.round(data.current.temp_c),
          feelsLike: Math.round(data.current.feelslike_c),
          condition: mapWeatherCondition(data.current.condition.code),
          conditionText: data.current.condition.text,
          windSpeed: Math.round(data.current.wind_kph * 0.621371), // Convert km/h to mph
          windDirection: data.current.wind_dir,
          humidity: data.current.humidity,
          uvIndex: data.current.uv,
          visibility: Math.round(data.current.vis_miles),
          pressure: Math.round(data.current.pressure_mb),
          precipitationProbability: data.forecast.forecastday[0].day.daily_chance_of_rain,
          lastUpdated: "Just now",
          airQuality: airQuality
        },
        forecast: {
          daily: data.forecast.forecastday.map((day: any) => {
            const date = new Date(day.date);
            return {
              date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
              day: {
                condition: mapWeatherCondition(day.day.condition.code),
                conditionText: day.day.condition.text,
                maxTemp: Math.round(day.day.maxtemp_c),
                minTemp: Math.round(day.day.mintemp_c),
                precipitationProbability: day.day.daily_chance_of_rain,
                sunrise: day.astro.sunrise,
                sunset: day.astro.sunset,
              },
              night: {
                condition: mapWeatherCondition(day.day.condition.code),
                conditionText: day.day.condition.text,
                precipitationProbability: day.day.daily_chance_of_rain,
              }
            };
          }),
          hourly: data.forecast.forecastday[0].hour.map((hour: any) => {
            const time = new Date(hour.time);
            return {
              time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
              temperature: Math.round(hour.temp_c),
              condition: mapWeatherCondition(hour.condition.code),
              conditionText: hour.condition.text,
              precipitationProbability: hour.chance_of_rain,
              windSpeed: Math.round(hour.wind_kph * 0.621371), // Convert km/h to mph
            };
          })
        }
      };
    } catch (error) {
      console.error('Error fetching weather data:', error);
      throw error;
    }
  },
  
  // Search for locations
  searchLocations: async (query: string): Promise<LocationSearchResult[]> => {
    if (!query) return [];
    
    try {
      const response = await fetch(
        `${BASE_URL}/search.json?key=${API_KEY}&q=${query}`
      );
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Transform API response to match our app's data structure
      return data.map((location: any) => ({
        id: `${location.lat},${location.lon}`, // Use coordinates as ID
        name: location.name,
        region: location.region,
        country: location.country
      }));
    } catch (error) {
      console.error('Error searching locations:', error);
      throw error;
    }
  }
};
