
import { WeatherData, LocationSearchResult, AirQuality } from './types';
import { mapWeatherCondition } from './weatherConditionMapping';
import { extractWeatherApiAirQuality } from './airQualityService';

// API key for OpenWeatherMap
const OPENWEATHER_API_KEY = '2e11d9409c65f5ef0fd829a6e2245262';
const OPENWEATHER_BASE_URL = 'https://api.openweathermap.org/data/3.0';
const OPENWEATHER_GEO_URL = 'http://api.openweathermap.org/geo/1.0';

// Get current weather and forecast for a location
export const getWeather = async (locationId?: string): Promise<WeatherData> => {
  try {
    // Default location is New Delhi
    let lat = 28.6139;
    let lon = 77.2090;
    let locationName = "New Delhi";
    let regionName = "Delhi";
    let countryName = "India";
    
    // Parse locationId if provided (in format "lat,lon")
    if (locationId) {
      const [latitude, longitude] = locationId.split(',');
      if (latitude && longitude) {
        lat = parseFloat(latitude);
        lon = parseFloat(longitude);
        
        // Get location name from coordinates
        const reverseGeoResponse = await fetch(
          `${OPENWEATHER_GEO_URL}/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${OPENWEATHER_API_KEY}`
        );
        
        if (reverseGeoResponse.ok) {
          const geoData = await reverseGeoResponse.json();
          if (geoData && geoData.length > 0) {
            locationName = geoData[0].name || locationName;
            regionName = geoData[0].state || regionName;
            countryName = geoData[0].country || countryName;
          }
        }
      }
    }
    
    // Fetch weather data from OpenWeather One Call API 3.0
    const response = await fetch(
      `${OPENWEATHER_BASE_URL}/onecall?lat=${lat}&lon=${lon}&units=metric&exclude=minutely&appid=${OPENWEATHER_API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error(`OpenWeather API error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("OpenWeather OneCall API response:", data);
    
    // Create AirQuality object from OpenWeather response
    const airQuality = data.current.air_quality ? {
      index: calculateAQIFromComponents(data.current.air_quality),
      level: getAirQualityLevel(calculateAQIFromComponents(data.current.air_quality)),
      color: getAirQualityColor(calculateAQIFromComponents(data.current.air_quality)),
      pm2_5: data.current.air_quality.pm2_5 ? parseFloat(data.current.air_quality.pm2_5.toFixed(2)) : null,
      pm10: data.current.air_quality.pm10 ? parseFloat(data.current.air_quality.pm10.toFixed(2)) : null,
      no2: data.current.air_quality.no2 ? parseFloat(data.current.air_quality.no2.toFixed(2)) : null,
      o3: data.current.air_quality.o3 ? parseFloat(data.current.air_quality.o3.toFixed(2)) : null,
      co: data.current.air_quality.co ? parseFloat((data.current.air_quality.co / 1000).toFixed(2)) : null, // Convert from μg/m³ to mg/m³
      so2: data.current.air_quality.so2 ? parseFloat(data.current.air_quality.so2.toFixed(2)) : null
    } : null;
    
    // Get current date and time for location
    const timezone = data.timezone || 'UTC';
    const currentTime = new Date();
    const localTime = currentTime.toLocaleTimeString('en-US', { 
      timeZone: timezone,
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true
    });
    
    // Transform API response to match our app's data structure
    return {
      location: {
        name: locationName,
        region: regionName,
        country: countryName,
        latitude: lat,
        longitude: lon,
        timezone: timezone,
        localTime: localTime
      },
      current: transformCurrentWeather(data.current, airQuality),
      forecast: {
        daily: transformDailyForecast(data.daily, timezone),
        hourly: transformHourlyForecast(data.hourly)
      }
    };
  } catch (error) {
    console.error('Error fetching weather data:', error);
    throw error;
  }
};

// Search for locations using OpenWeatherMap Geocoding API
export const searchLocations = async (query: string): Promise<LocationSearchResult[]> => {
  if (!query) return [];
  
  try {
    const response = await fetch(
      `${OPENWEATHER_GEO_URL}/direct?q=${query}&limit=5&appid=${OPENWEATHER_API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Transform API response to match our app's data structure
    return data.map((location: any) => ({
      id: `${location.lat},${location.lon}`, // Use coordinates as ID
      name: location.name || 'Unknown',
      region: location.state || '',
      country: location.country || 'Unknown'
    }));
  } catch (error) {
    console.error('Error searching locations:', error);
    throw error;
  }
};

// Helper functions to transform API responses

// Map OpenWeatherMap weather code to our app's condition
const mapOpenWeatherCondition = (weatherId: number): ReturnType<typeof mapWeatherCondition> => {
  if (weatherId >= 200 && weatherId < 300) return 'thunderstorm';
  if (weatherId >= 300 && weatherId < 400) return 'showers';
  if (weatherId >= 500 && weatherId < 600) return weatherId >= 520 ? 'showers' : 'rain';
  if (weatherId >= 600 && weatherId < 700) return 'snow';
  if (weatherId >= 700 && weatherId < 800) return 'fog';
  if (weatherId === 800) return 'clear';
  if (weatherId > 800 && weatherId < 900) return weatherId <= 802 ? 'partly-cloudy' : 'cloudy';
  
  return 'partly-cloudy'; // Default fallback
};

// Calculate AQI based on individual components
const calculateAQIFromComponents = (airQuality: any): number => {
  // Simple estimation based on PM2.5 (this is a simplification - actual AQI calculation is complex)
  if (!airQuality || !airQuality.pm2_5) return 25; // Default to Good
  
  const pm25 = airQuality.pm2_5;
  
  if (pm25 <= 12) return Math.max(0, Math.round((pm25 / 12) * 50)); // Good
  if (pm25 <= 35.4) return Math.round(50 + ((pm25 - 12) / (35.4 - 12)) * 50); // Moderate
  if (pm25 <= 55.4) return Math.round(100 + ((pm25 - 35.4) / (55.4 - 35.4)) * 50); // Unhealthy for Sensitive Groups
  if (pm25 <= 150.4) return Math.round(150 + ((pm25 - 55.4) / (150.4 - 55.4)) * 50); // Unhealthy
  if (pm25 <= 250.4) return Math.round(200 + ((pm25 - 150.4) / (250.4 - 150.4)) * 100); // Very Unhealthy
  return Math.min(500, Math.round(300 + ((pm25 - 250.4) / (350.4 - 250.4)) * 200)); // Hazardous
};

// Get AQI level description
const getAirQualityLevel = (aqi: number): string => {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Moderate';
  if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
  if (aqi <= 200) return 'Unhealthy';
  if (aqi <= 300) return 'Very Unhealthy';
  return 'Hazardous';
};

// Get AQI color code
const getAirQualityColor = (aqi: number): string => {
  if (aqi <= 50) return '#4ade80'; // Green
  if (aqi <= 100) return '#facc15'; // Yellow
  if (aqi <= 150) return '#fb923c'; // Orange
  if (aqi <= 200) return '#f87171'; // Red
  if (aqi <= 300) return '#c084fc'; // Purple
  return '#7f1d1d'; // Dark Red/Maroon
};

const transformCurrentWeather = (current: any, airQuality: AirQuality | null) => {
  const weatherId = current.weather && current.weather[0] ? current.weather[0].id : 800;
  const condition = mapOpenWeatherCondition(weatherId);
  
  return {
    temperature: Math.round(current.temp),
    feelsLike: Math.round(current.feels_like),
    condition: condition,
    conditionText: current.weather && current.weather[0] ? current.weather[0].description : 'Clear',
    windSpeed: Math.round(current.wind_speed * 2.237), // Convert m/s to mph
    windDirection: degToDirection(current.wind_deg),
    humidity: current.humidity,
    uvIndex: current.uvi,
    visibility: Math.round(current.visibility / 1609.34), // Convert meters to miles
    pressure: Math.round(current.pressure),
    precipitationProbability: current.pop ? Math.round(current.pop * 100) : 0,
    lastUpdated: "Just now",
    airQuality: airQuality || undefined
  };
};

const transformDailyForecast = (forecastDays: any[], timezone: string) => {
  return forecastDays.map((day: any, index: number) => {
    const date = new Date(day.dt * 1000);
    const localDate = new Date(date.toLocaleString('en-US', { timeZone: timezone }));
    
    return {
      date: localDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      day: {
        condition: mapOpenWeatherCondition(day.weather[0].id),
        conditionText: day.weather[0].description,
        maxTemp: Math.round(day.temp.max),
        minTemp: Math.round(day.temp.min),
        precipitationProbability: Math.round(day.pop * 100),
        sunrise: formatTime(day.sunrise * 1000, timezone),
        sunset: formatTime(day.sunset * 1000, timezone),
      },
      night: {
        condition: mapOpenWeatherCondition(day.weather[0].id),
        conditionText: day.weather[0].description,
        precipitationProbability: Math.round(day.pop * 100),
      }
    };
  });
};

const transformHourlyForecast = (hours: any[]) => {
  return hours.slice(0, 24).map((hour: any) => {
    const time = new Date(hour.dt * 1000);
    
    return {
      time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
      temperature: Math.round(hour.temp),
      condition: mapOpenWeatherCondition(hour.weather[0].id),
      conditionText: hour.weather[0].description,
      precipitationProbability: Math.round(hour.pop * 100),
      windSpeed: Math.round(hour.wind_speed * 2.237), // Convert m/s to mph
    };
  });
};

// Helper function to convert degrees to cardinal direction
const degToDirection = (deg: number): string => {
  const directions = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  return directions[Math.round(deg / 22.5) % 16];
};

// Helper function to format time with AM/PM
const formatTime = (timestamp: number, timezone: string): string => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', { 
    timeZone: timezone,
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });
};
