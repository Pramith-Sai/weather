
import { WeatherData, LocationSearchResult, AirQuality } from './types';
import { mapWeatherCondition } from './weatherConditionMapping';
import { fetchAirQuality, extractWeatherApiAirQuality } from './airQualityService';

// API key for WeatherAPI.com
const API_KEY = 'bf117ba9a71244ec90b152210252204'; // Updated API key
const BASE_URL = 'https://api.weatherapi.com/v1';

// Get current weather and forecast for a location
export const getWeather = async (locationId?: string): Promise<WeatherData> => {
  try {
    const query = locationId || 'New Delhi'; // Default location set to New Delhi
    const response = await fetch(
      `${BASE_URL}/forecast.json?key=${API_KEY}&q=${query}&days=7&aqi=yes&alerts=no`
    );
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Get location coordinates for OpenWeatherMap air quality API
    const lat = data.location.lat;
    const lon = data.location.lon;
    
    // Fetch air quality data from OpenWeatherMap API
    const airQualityData = await fetchAirQuality(lat, lon);
    
    // Fallback to WeatherAPI's air quality if OpenWeatherMap fails
    let airQuality;
    if (airQualityData) {
      airQuality = airQualityData;
    } else {
      // Extract air quality data from WeatherAPI as fallback
      const apiAirQuality = data.current.air_quality || {};
      airQuality = extractWeatherApiAirQuality(apiAirQuality);
    }
    
    // For Surat special case - update location name if necessary
    // Explicitly check for Jalalpore and replace with Surat for any Surat-related search
    if (data.location.name.toLowerCase() === 'jalalpore') {
      // Either the query contains 'surat' or the location ID contains 'surat'
      if (query.toLowerCase().includes('surat') || 
          (locationId && locationId.toLowerCase().includes('surat')) ||
          (data.location.region && data.location.region.toLowerCase().includes('gujarat'))) {
        data.location.name = 'Surat';
        console.log('Changed location name from Jalalpore to Surat');
      }
    }
    
    // Transform API response to match our app's data structure
    return {
      location: transformLocation(data.location),
      current: transformCurrentWeather(data.current, airQuality),
      forecast: {
        daily: transformDailyForecast(data.forecast.forecastday),
        hourly: transformHourlyForecast(data.forecast.forecastday[0].hour)
      }
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
    const response = await fetch(
      `${BASE_URL}/search.json?key=${API_KEY}&q=${query}`
    );
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Transform API response to match our app's data structure
    return data.map((location: any) => {
      // Special case for Surat, Gujarat
      // More explicit check to ensure Jalalpore is replaced with Surat
      if (location.name.toLowerCase() === 'jalalpore') {
        // Check if the search query includes 'surat' or the region is Gujarat
        if (query.toLowerCase().includes('surat') || 
            (location.region && location.region.toLowerCase().includes('gujarat'))) {
          console.log('Changing location name from Jalalpore to Surat in search results');
          location.name = 'Surat';
        }
      }
      
      return {
        id: `${location.lat},${location.lon}`, // Use coordinates as ID
        name: location.name,
        region: location.region,
        country: location.country
      };
    });
  } catch (error) {
    console.error('Error searching locations:', error);
    throw error;
  }
};

// Helper functions to transform API responses
const transformLocation = (location: any) => ({
  name: location.name,
  region: location.region,
  country: location.country,
  latitude: location.lat,
  longitude: location.lon,
  timezone: location.tz_id,
  localTime: new Date(location.localtime).toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true
  }),
});

const transformCurrentWeather = (current: any, airQuality: AirQuality) => ({
  temperature: Math.round(current.temp_c),
  feelsLike: Math.round(current.feelslike_c),
  condition: mapWeatherCondition(current.condition.code),
  conditionText: current.condition.text,
  windSpeed: Math.round(current.wind_kph * 0.621371), // Convert km/h to mph
  windDirection: current.wind_dir,
  humidity: current.humidity,
  uvIndex: current.uv,
  visibility: Math.round(current.vis_miles),
  pressure: Math.round(current.pressure_mb),
  precipitationProbability: current.chance_of_rain || 0,
  lastUpdated: "Just now",
  airQuality: airQuality
});

const transformDailyForecast = (forecastDays: any[]) => {
  return forecastDays.map((day: any) => {
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
  });
};

const transformHourlyForecast = (hours: any[]) => {
  return hours.map((hour: any) => {
    const time = new Date(hour.time);
    return {
      time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
      temperature: Math.round(hour.temp_c),
      condition: mapWeatherCondition(hour.condition.code),
      conditionText: hour.condition.text,
      precipitationProbability: hour.chance_of_rain,
      windSpeed: Math.round(hour.wind_kph * 0.621371), // Convert km/h to mph
    };
  });
};
