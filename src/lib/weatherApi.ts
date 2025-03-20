
import { WeatherData, LocationSearchResult, WeatherCondition } from './types';

// API key for WeatherAPI.com
const API_KEY = '995b07fb34e84840914160220251903';
const BASE_URL = 'https://api.weatherapi.com/v1';

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

// API service with real implementations
export const weatherApi = {
  // Get current weather and forecast for a location
  getWeather: async (locationId?: string): Promise<WeatherData> => {
    try {
      const query = locationId || 'Delhi'; // Default to Delhi if no location provided
      const response = await fetch(
        `${BASE_URL}/forecast.json?key=${API_KEY}&q=${query}&days=7&aqi=no&alerts=no`
      );
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      
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
          pressure: data.current.pressure_mb,
          precipitationProbability: data.forecast.forecastday[0].day.daily_chance_of_rain,
          lastUpdated: "Just now",
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
