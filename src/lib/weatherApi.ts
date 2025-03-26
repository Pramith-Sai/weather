
import { WeatherData, LocationSearchResult } from './types';
import { getWeather, searchLocations } from './weatherApiService';

// API service with real implementations
export const weatherApi = {
  getWeather,
  searchLocations
};
