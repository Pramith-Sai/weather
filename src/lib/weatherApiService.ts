
import { WeatherData, LocationSearchResult, AirQuality, WeatherCondition } from './types';
import { fetchAirQuality } from './airQualityService';

// API key for OpenWeatherMap
const API_KEY = '2e11d9409c65f5ef0fd829a6e2245262';
const BASE_URL = 'https://api.openweathermap.org';

// Get current weather and forecast for a location
export const getWeather = async (locationId?: string): Promise<WeatherData> => {
  try {
    // Default to New Delhi if no location provided
    let lat = 28.6;
    let lon = 77.2;
    let locationName = "New Delhi";
    let regionName = "Delhi";
    let countryName = "India";
    
    // If locationId is provided, it's in the format of "lat,lon"
    if (locationId) {
      const coords = locationId.split(',');
      if (coords.length >= 2) {
        lat = parseFloat(coords[0]);
        lon = parseFloat(coords[1]);
        
        // Try to get the location name from coordinates using reverse geocoding
        try {
          const reverseGeoResponse = await fetch(
            `${BASE_URL}/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${API_KEY}`
          );
          
          if (reverseGeoResponse.ok) {
            const geoData = await reverseGeoResponse.json();
            if (geoData && geoData.length > 0) {
              locationName = geoData[0].name || locationName;
              regionName = geoData[0].state || regionName;
              countryName = geoData[0].country || countryName;
            }
          }
        } catch (err) {
          console.error('Error with reverse geocoding:', err);
          // Continue with default or provided location name
        }
      }
    }
    
    // Fetch weather data from OpenWeatherMap OneCall API
    const response = await fetch(
      `${BASE_URL}/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=minutely&units=metric&appid=${API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error(`OneCall API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Fetch air quality data from OpenWeatherMap API
    const airQualityData = await fetchAirQuality(lat, lon);
    
    // Transform API response to match our app's data structure
    return {
      location: {
        name: locationName,
        region: regionName,
        country: countryName,
        latitude: lat,
        longitude: lon,
        timezone: data.timezone,
        localTime: new Date(data.current.dt * 1000).toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: true
        }),
      },
      current: transformCurrentWeather(data.current, airQualityData),
      forecast: {
        daily: transformDailyForecast(data.daily),
        hourly: transformHourlyForecast(data.hourly)
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
      `${BASE_URL}/geo/1.0/direct?q=${query}&limit=10&appid=${API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error(`Geocoding API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Transform API response to match our app's data structure
    return data.map((location: any) => ({
      id: `${location.lat},${location.lon}`, // Use coordinates as ID
      name: location.name,
      region: location.state || '',
      country: location.country
    }));
  } catch (error) {
    console.error('Error searching locations:', error);
    throw error;
  }
};

// Helper functions to transform API responses
const transformCurrentWeather = (current: any, airQuality: AirQuality | null) => {
  // Map weather condition code to our app's condition type
  // OpenWeatherMap uses different codes, so we need to map them
  const weatherId = current.weather && current.weather[0] ? current.weather[0].id : 800;
  const conditionText = current.weather && current.weather[0] ? current.weather[0].description : 'Clear';
  
  // Map OpenWeatherMap condition codes to our app's conditions
  const condition = mapOpenWeatherCondition(weatherId);
  
  return {
    temperature: Math.round(current.temp),
    feelsLike: Math.round(current.feels_like),
    condition: condition,
    conditionText: conditionText,
    windSpeed: Math.round(current.wind_speed * 2.237), // Convert m/s to mph
    windDirection: degreesToDirection(current.wind_deg),
    humidity: current.humidity,
    uvIndex: current.uvi,
    visibility: Math.round(current.visibility / 1609.34), // Convert meters to miles
    pressure: Math.round(current.pressure),
    precipitationProbability: current.pop ? Math.round(current.pop * 100) : 0,
    lastUpdated: "Just now",
    airQuality: airQuality
  };
};

const transformDailyForecast = (dailyData: any[]) => {
  return dailyData.slice(0, 7).map((day: any) => {
    const date = new Date(day.dt * 1000);
    const weatherId = day.weather && day.weather[0] ? day.weather[0].id : 800;
    const conditionText = day.weather && day.weather[0] ? day.weather[0].description : 'Clear';
    
    // Map condition code to our app's condition type
    const condition = mapOpenWeatherCondition(weatherId);
    
    return {
      date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      day: {
        condition: condition,
        conditionText: conditionText,
        maxTemp: Math.round(day.temp.max),
        minTemp: Math.round(day.temp.min),
        precipitationProbability: Math.round(day.pop * 100),
        sunrise: new Date(day.sunrise * 1000).toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit', 
          hour12: true 
        }),
        sunset: new Date(day.sunset * 1000).toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit', 
          hour12: true 
        }),
      },
      night: {
        condition: condition, // Using same condition for night for simplicity
        conditionText: conditionText,
        precipitationProbability: Math.round(day.pop * 100),
      }
    };
  });
};

const transformHourlyForecast = (hourlyData: any[]) => {
  return hourlyData.slice(0, 24).map((hour: any) => {
    const time = new Date(hour.dt * 1000);
    const weatherId = hour.weather && hour.weather[0] ? hour.weather[0].id : 800;
    const conditionText = hour.weather && hour.weather[0] ? hour.weather[0].description : 'Clear';
    
    // Map condition code to our app's condition type
    const condition = mapOpenWeatherCondition(weatherId);
    
    return {
      time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
      temperature: Math.round(hour.temp),
      condition: condition,
      conditionText: conditionText,
      precipitationProbability: Math.round(hour.pop * 100),
      windSpeed: Math.round(hour.wind_speed * 2.237), // Convert m/s to mph
    };
  });
};

// Helper function to convert wind degrees to direction
const degreesToDirection = (degrees: number): string => {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index];
};

// Helper function to map OpenWeatherMap condition codes to our app's conditions
const mapOpenWeatherCondition = (code: number): WeatherCondition => {
  // Weather condition mapping based on OpenWeatherMap condition codes
  // https://openweathermap.org/weather-conditions
  
  // Thunderstorm
  if (code >= 200 && code < 300) return 'thunderstorm';
  
  // Drizzle and Rain
  if (code >= 300 && code < 400) return 'showers';
  if (code >= 500 && code < 600) {
    if (code === 500 || code === 501) return 'showers';
    return 'rain';
  }
  
  // Snow
  if (code >= 600 && code < 700) {
    if (code === 611 || code === 612 || code === 613) return 'sleet';
    return 'snow';
  }
  
  // Atmosphere (fog, mist, etc.)
  if (code >= 700 && code < 800) return 'fog';
  
  // Clear
  if (code === 800) return 'clear';
  
  // Clouds
  if (code === 801 || code === 802) return 'partly-cloudy';
  if (code >= 803 && code <= 804) return 'cloudy';
  
  // Default to clear if unknown
  return 'clear';
};
