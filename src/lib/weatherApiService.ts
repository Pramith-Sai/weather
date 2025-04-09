
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
    
    // Use standard weather API instead of OneCall 3.0 which requires subscription
    const currentWeatherResponse = await fetch(
      `${BASE_URL}/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
    );
    
    if (!currentWeatherResponse.ok) {
      throw new Error(`Weather API error: ${currentWeatherResponse.status}`);
    }
    
    const currentData = await currentWeatherResponse.json();
    
    // Fetch forecast data (5 days / 3 hour forecast)
    const forecastResponse = await fetch(
      `${BASE_URL}/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
    );
    
    if (!forecastResponse.ok) {
      throw new Error(`Forecast API error: ${forecastResponse.status}`);
    }
    
    const forecastData = await forecastResponse.json();
    
    // Fetch air quality data
    const airQualityData = await fetchAirQuality(lat, lon);
    
    // Transform API response to match our app's data structure
    return {
      location: {
        name: locationName,
        region: regionName,
        country: countryName,
        latitude: lat,
        longitude: lon,
        timezone: currentData.timezone ? `UTC${formatTimezoneOffset(currentData.timezone)}` : "UTC",
        localTime: new Date().toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: true
        }),
      },
      current: transformCurrentWeather(currentData, airQualityData),
      forecast: {
        daily: transformDailyForecast(forecastData),
        hourly: transformHourlyForecast(forecastData)
      }
    };
  } catch (error) {
    console.error('Error fetching weather data:', error);
    throw error;
  }
};

// Format timezone offset from seconds to UTC string
const formatTimezoneOffset = (offsetSeconds: number): string => {
  const hours = Math.floor(Math.abs(offsetSeconds) / 3600);
  const minutes = Math.floor((Math.abs(offsetSeconds) % 3600) / 60);
  const sign = offsetSeconds >= 0 ? '+' : '-';
  return `${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
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
  const weatherId = current.weather && current.weather[0] ? current.weather[0].id : 800;
  const conditionText = current.weather && current.weather[0] ? current.weather[0].description : 'Clear';
  
  // Map OpenWeatherMap condition codes to our app's conditions
  const condition = mapOpenWeatherCondition(weatherId);
  
  return {
    temperature: Math.round(current.main.temp),
    feelsLike: Math.round(current.main.feels_like),
    condition: condition,
    conditionText: conditionText,
    windSpeed: Math.round(current.wind.speed * 2.237), // Convert m/s to mph
    windDirection: degreesToDirection(current.wind.deg),
    humidity: current.main.humidity,
    uvIndex: 0, // Standard weather API doesn't provide UV index
    visibility: Math.round((current.visibility || 10000) / 1609.34), // Convert meters to miles
    pressure: Math.round(current.main.pressure),
    precipitationProbability: 0, // Standard weather API doesn't provide precipitation probability
    lastUpdated: "Just now",
    airQuality: airQuality
  };
};

// Extract daily forecast from the 5-day/3-hour forecast data
const transformDailyForecast = (forecastData: any) => {
  const dailyForecasts: { [key: string]: any[] } = {};
  
  // Group forecast entries by day
  forecastData.list.forEach((item: any) => {
    const date = new Date(item.dt * 1000);
    const dateKey = date.toISOString().split('T')[0];
    
    if (!dailyForecasts[dateKey]) {
      dailyForecasts[dateKey] = [];
    }
    
    dailyForecasts[dateKey].push(item);
  });
  
  // Process each day's data
  return Object.keys(dailyForecasts).slice(0, 7).map(dateKey => {
    const dayItems = dailyForecasts[dateKey];
    const dayDate = new Date(dateKey);
    
    // Find max and min temperatures for the day
    let maxTemp = -100;
    let minTemp = 100;
    let maxWindSpeed = 0;
    let totalPrecipProbability = 0;
    let count = 0;
    let mostFrequentWeatherId = 800; // Default to clear
    
    // Weather ID frequency counter
    const weatherIdCounts: { [key: number]: number } = {};
    
    dayItems.forEach(item => {
      maxTemp = Math.max(maxTemp, item.main.temp_max);
      minTemp = Math.min(minTemp, item.main.temp_min);
      maxWindSpeed = Math.max(maxWindSpeed, item.wind.speed);
      
      // Count precipitation probability if available
      if (item.pop !== undefined) {
        totalPrecipProbability += item.pop;
        count++;
      }
      
      // Track weather condition frequencies
      const weatherId = item.weather[0].id;
      weatherIdCounts[weatherId] = (weatherIdCounts[weatherId] || 0) + 1;
    });
    
    // Find most frequent weather condition
    let maxCount = 0;
    for (const [id, count] of Object.entries(weatherIdCounts)) {
      if (count > maxCount) {
        maxCount = count;
        mostFrequentWeatherId = parseInt(id);
      }
    }
    
    // Calculate average precipitation probability
    const avgPrecipProbability = count > 0 ? Math.round((totalPrecipProbability / count) * 100) : 0;
    
    // Get condition and text for the most frequent weather ID
    const condition = mapOpenWeatherCondition(mostFrequentWeatherId);
    const conditionText = dayItems[0].weather[0].description; // Just use the first item's description
    
    // Check if this is today to set the sunrise/sunset times
    const today = new Date();
    
    // Calculate sunrise and sunset (approximate for forecasted days)
    let sunrise = "06:00 AM";
    let sunset = "06:00 PM";
    
    return {
      date: dayDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      day: {
        condition: condition,
        conditionText: conditionText,
        maxTemp: Math.round(maxTemp),
        minTemp: Math.round(minTemp),
        precipitationProbability: avgPrecipProbability,
        sunrise: sunrise,
        sunset: sunset,
      },
      night: {
        condition: condition, // Using same condition for night for simplicity
        conditionText: conditionText,
        precipitationProbability: avgPrecipProbability,
      }
    };
  });
};

const transformHourlyForecast = (forecastData: any) => {
  return forecastData.list.slice(0, 24).map((hour: any) => {
    const time = new Date(hour.dt * 1000);
    const weatherId = hour.weather && hour.weather[0] ? hour.weather[0].id : 800;
    const conditionText = hour.weather && hour.weather[0] ? hour.weather[0].description : 'Clear';
    
    // Map condition code to our app's condition type
    const condition = mapOpenWeatherCondition(weatherId);
    
    return {
      time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
      temperature: Math.round(hour.main.temp),
      condition: condition,
      conditionText: conditionText,
      precipitationProbability: Math.round((hour.pop || 0) * 100),
      windSpeed: Math.round(hour.wind.speed * 2.237), // Convert m/s to mph
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
