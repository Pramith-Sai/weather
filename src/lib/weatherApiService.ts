
import { WeatherData, LocationSearchResult } from './types';
import { mapWeatherCondition } from './weatherConditionMapping';
import { fetchAirQuality } from './airQualityService';

// API key for API Ninjas
const API_KEY = 'SMI5PxUWBSfc2sKaEG5ttg==XYct9CGH2LSTtRCT';
const BASE_URL = 'https://api.api-ninjas.com/v1';

// Get current weather and forecast for a location
export const getWeather = async (locationId?: string): Promise<WeatherData> => {
  try {
    // Use location as the query parameter or default to "London"
    const query = locationId || 'New Delhi'; // Default location
    
    // Fetch the current weather data from API Ninjas
    const response = await fetch(
      `${BASE_URL}/weather?city=${encodeURIComponent(query)}`,
      {
        headers: {
          'X-Api-Key': API_KEY
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("API Ninjas Weather response:", data);
    
    // Fetch air quality data for the location
    const airQualityData = await fetchAirQuality(query);
    
    // Create a mock forecast since API Ninjas doesn't provide forecast data
    const mockForecastData = generateMockForecast(data);
    
    // Transform API response to match our app's data structure
    return {
      location: {
        name: query,
        region: '', // API Ninjas doesn't provide region info
        country: '', // API Ninjas doesn't provide country info
        latitude: 0, // No coordinates from API Ninjas
        longitude: 0,
        timezone: 'UTC', // No timezone from API Ninjas
        localTime: new Date().toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: true
        }),
      },
      current: {
        temperature: Math.round(data.temp),
        feelsLike: Math.round(data.feels_like || data.temp),
        condition: getWeatherCondition(data.cloud_pct, data.wind_speed),
        conditionText: getWeatherDescription(data.cloud_pct, data.wind_speed),
        windSpeed: Math.round(data.wind_speed || 0),
        windDirection: getWindDirection(data.wind_degrees || 0),
        humidity: data.humidity || 0,
        uvIndex: 0, // API Ninjas doesn't provide UV index
        visibility: 0, // No visibility from API Ninjas
        pressure: Math.round(data.pressure || 0),
        precipitationProbability: 0, // No precipitation probability from API Ninjas
        lastUpdated: "Just now",
        airQuality: airQualityData || undefined
      },
      forecast: mockForecastData
    };
  } catch (error) {
    console.error('Error fetching weather data:', error);
    throw error;
  }
};

// Search for locations
export const searchLocations = async (query: string): Promise<LocationSearchResult[]> => {
  if (!query) return [];
  
  try {
    // Since API Ninjas doesn't have a city search endpoint, we'll return a single result
    // In a real app, you might want to use a geocoding service for better location search
    return [{
      id: query,
      name: query,
      region: '',
      country: ''
    }];
  } catch (error) {
    console.error('Error searching locations:', error);
    throw error;
  }
};

// Helper function to generate mock forecast data based on current weather
function generateMockForecast(currentWeather: any) {
  const today = new Date();
  const dailyForecast = [];
  const hourlyForecast = [];
  
  // Generate 7 days of mock forecast
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    
    // Create some variation in the temperatures
    const baseTemp = currentWeather.temp;
    const variation = Math.floor(Math.random() * 8) - 4;
    const maxTemp = Math.round(baseTemp + variation + 5);
    const minTemp = Math.round(baseTemp + variation - 5);
    
    dailyForecast.push({
      date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      day: {
        condition: getWeatherCondition(currentWeather.cloud_pct, currentWeather.wind_speed),
        conditionText: getWeatherDescription(currentWeather.cloud_pct, currentWeather.wind_speed),
        maxTemp: maxTemp,
        minTemp: minTemp,
        precipitationProbability: Math.round(Math.random() * 30),
        sunrise: "06:30 AM",
        sunset: "07:00 PM",
      },
      night: {
        condition: getWeatherCondition(currentWeather.cloud_pct + 10, currentWeather.wind_speed),
        conditionText: getWeatherDescription(currentWeather.cloud_pct + 10, currentWeather.wind_speed),
        precipitationProbability: Math.round(Math.random() * 20),
      }
    });
  }
  
  // Generate hourly forecast for the next 24 hours
  for (let i = 0; i < 24; i++) {
    const date = new Date(today);
    date.setHours(today.getHours() + i);
    
    // Create some variation in the hourly temperatures
    const baseTemp = currentWeather.temp;
    const hourVariation = Math.floor(Math.random() * 6) - 3;
    const hourTemp = Math.round(baseTemp + hourVariation);
    
    hourlyForecast.push({
      time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
      temperature: hourTemp,
      condition: getWeatherCondition(currentWeather.cloud_pct, currentWeather.wind_speed),
      conditionText: getWeatherDescription(currentWeather.cloud_pct, currentWeather.wind_speed),
      precipitationProbability: Math.round(Math.random() * 30),
      windSpeed: Math.round((currentWeather.wind_speed || 5) * (0.8 + Math.random() * 0.4)),
    });
  }
  
  return {
    daily: dailyForecast,
    hourly: hourlyForecast
  };
}

// Helper function to determine weather condition from API data
function getWeatherCondition(cloudPct: number, windSpeed: number) {
  if (cloudPct < 20) return 'clear';
  if (cloudPct < 50) return 'partly-cloudy';
  if (cloudPct < 80) return 'cloudy';
  if (windSpeed > 15) return 'windy';
  return 'cloudy';
}

// Helper function to get weather description
function getWeatherDescription(cloudPct: number, windSpeed: number) {
  if (cloudPct < 20) return 'Clear Sky';
  if (cloudPct < 50) return 'Partly Cloudy';
  if (cloudPct < 80) return 'Mostly Cloudy';
  if (windSpeed > 15) return 'Windy';
  return 'Overcast';
}

// Helper function to convert wind degrees to direction
function getWindDirection(degrees: number) {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index];
}
