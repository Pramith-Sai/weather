
import { WeatherCondition } from './types';

// Helper function to map API weather conditions to our app's condition types
export const mapWeatherCondition = (code: number): WeatherCondition => {
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
