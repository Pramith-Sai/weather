
import { WeatherData, LocationSearchResult, AirQuality } from './types';
import { mapWeatherCondition } from './weatherConditionMapping';
import { fetchAirQuality } from './airQualityService';

// API key for API Ninjas
const API_NINJAS_KEY = 'SMI5PxUWBSfc2sKaEG5ttg==XYct9CGH2LSTtRCT';
const API_NINJAS_BASE_URL = 'https://api.api-ninjas.com/v1';

// Get current weather and forecast for a location
export const getWeather = async (locationId?: string): Promise<WeatherData> => {
  try {
    // Use 'New Delhi' as default location if none provided
    // For API Ninjas we only need the city name
    let query = 'New Delhi';
    
    if (locationId) {
      // If the location ID contains coordinates (from previous API format)
      if (locationId.includes(',')) {
        // This is a location ID from the old API format that contains coordinates
        // We'll just use the first part of the location ID for simplicity
        query = locationId.split(',')[0];
      } else {
        query = locationId;
      }
    }
    
    console.log(`Fetching weather data for: ${query}`);
    
    // Fetch weather data from API Ninjas
    const weatherResponse = await fetch(
      `${API_NINJAS_BASE_URL}/weather?city=${encodeURIComponent(query)}`,
      {
        headers: {
          'X-Api-Key': API_NINJAS_KEY
        }
      }
    );
    
    if (!weatherResponse.ok) {
      throw new Error(`Weather API error: ${weatherResponse.status}`);
    }
    
    const weatherData = await weatherResponse.json();
    console.log("API Ninjas Weather response:", weatherData);
    
    // We need city data for our display, but API Ninjas weather endpoint doesn't return it
    // So we'll use the query as the city name
    const cityName = query;
    
    // Fetch air quality data for the same location
    const airQualityData = await fetchAirQuality(cityName);
    
    // Map API Ninjas response to our app's data structure
    return transformWeatherData(weatherData, cityName, airQualityData);
  } catch (error) {
    console.error('Error fetching weather data:', error);
    throw error;
  }
};

// Search for locations - API Ninjas doesn't have a location search endpoint
// So we'll implement a simple one that just returns the query as a location
export const searchLocations = async (query: string): Promise<LocationSearchResult[]> => {
  if (!query) return [];
  
  try {
    // Since API Ninjas doesn't have a location search endpoint,
    // we'll just return the query as a location
    return [
      {
        id: query, // Use the city name as the ID
        name: query,
        region: '',
        country: ''
      }
    ];
  } catch (error) {
    console.error('Error searching locations:', error);
    throw error;
  }
};

// Helper function to transform API Ninjas response to our app's data structure
const transformWeatherData = (
  data: any, 
  cityName: string,
  airQuality: AirQuality | null
): WeatherData => {
  // Get the current date and time
  const now = new Date();
  const localTime = now.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true
  });
  
  // Map API Ninjas weather condition to our app's condition types
  // API Ninjas provides cloud_pct which we can use to determine conditions
  let condition: string;
  let conditionText: string;
  
  if (data.cloud_pct <= 10) {
    condition = 'clear';
    conditionText = 'Clear';
  } else if (data.cloud_pct <= 50) {
    condition = 'partly-cloudy';
    conditionText = 'Partly cloudy';
  } else {
    condition = 'cloudy';
    conditionText = 'Cloudy';
  }
  
  // If there's rain or snow, update condition
  if (data.humidity > 80 && data.temp < 0) {
    condition = 'snow';
    conditionText = 'Snow';
  } else if (data.humidity > 80) {
    condition = 'rain';
    conditionText = 'Rain';
  }
  
  // Generate mock forecast data since API Ninjas doesn't provide forecast
  const dailyForecast = generateMockDailyForecast(data.temp, condition as any, conditionText);
  const hourlyForecast = generateMockHourlyForecast(data.temp, condition as any, conditionText);
  
  return {
    location: {
      name: cityName,
      region: '',
      country: '',
      latitude: 0, // API Ninjas doesn't provide coordinates
      longitude: 0,
      timezone: '', // API Ninjas doesn't provide timezone
      localTime: localTime
    },
    current: {
      temperature: Math.round(data.temp),
      feelsLike: Math.round(data.feels_like),
      condition: condition as any,
      conditionText: conditionText,
      windSpeed: Math.round(data.wind_speed), // API Ninjas provides wind speed in mph
      windDirection: getWindDirection(data.wind_degrees),
      humidity: data.humidity,
      uvIndex: 0, // API Ninjas doesn't provide UV index
      visibility: 0, // API Ninjas doesn't provide visibility
      pressure: Math.round(data.pressure),
      precipitationProbability: 0, // API Ninjas doesn't provide precipitation probability
      lastUpdated: "Just now",
      airQuality: airQuality || undefined
    },
    forecast: {
      daily: dailyForecast,
      hourly: hourlyForecast
    }
  };
};

// Helper function to get wind direction from degrees
const getWindDirection = (degrees: number): string => {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index];
};

// Generate mock daily forecast data
const generateMockDailyForecast = (currentTemp: number, condition: any, conditionText: string) => {
  const forecast = [];
  const today = new Date();
  
  for (let i = 0; i < 7; i++) {
    const date = new Date();
    date.setDate(today.getDate() + i);
    
    const maxTemp = Math.round(currentTemp + Math.random() * 5);
    const minTemp = Math.round(currentTemp - Math.random() * 5);
    const precipProbability = Math.round(Math.random() * 30);
    
    forecast.push({
      date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      day: {
        condition: condition,
        conditionText: conditionText,
        maxTemp: maxTemp,
        minTemp: minTemp,
        precipitationProbability: precipProbability,
        sunrise: "06:30 AM",
        sunset: "06:30 PM",
      },
      night: {
        condition: condition,
        conditionText: conditionText,
        precipitationProbability: precipProbability,
      }
    });
  }
  
  return forecast;
};

// Generate mock hourly forecast data
const generateMockHourlyForecast = (currentTemp: number, condition: any, conditionText: string) => {
  const forecast = [];
  const currentHour = new Date().getHours();
  
  for (let i = 0; i < 24; i++) {
    const hour = (currentHour + i) % 24;
    const time = new Date();
    time.setHours(hour, 0, 0, 0);
    
    const temp = Math.round(currentTemp + (Math.random() * 4 - 2));
    const precipProbability = Math.round(Math.random() * 30);
    
    forecast.push({
      time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
      temperature: temp,
      condition: condition,
      conditionText: conditionText,
      precipitationProbability: precipProbability,
      windSpeed: Math.round(5 + Math.random() * 10),
    });
  }
  
  return forecast;
};
