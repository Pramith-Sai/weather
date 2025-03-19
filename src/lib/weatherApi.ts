
import { WeatherData, LocationSearchResult, WeatherCondition } from './types';

// Mock data for demonstration purposes
const mockWeatherData: WeatherData = {
  location: {
    name: "New York",
    region: "New York",
    country: "United States",
    latitude: 40.7128,
    longitude: -74.0060,
    timezone: "America/New_York",
    localTime: new Date().toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true
    }),
  },
  current: {
    temperature: 72,
    feelsLike: 74,
    condition: "partly-cloudy",
    conditionText: "Partly cloudy",
    windSpeed: 8,
    windDirection: "NE",
    humidity: 65,
    uvIndex: 6,
    visibility: 10,
    pressure: 1015,
    precipitationProbability: 20,
    lastUpdated: "Just now",
  },
  forecast: {
    daily: Array(7).fill(null).map((_, i) => {
      const date = new Date();
      date.setDate(date.getDate() + i);
      
      // Randomly generate conditions for demo
      const conditions: WeatherCondition[] = [
        "clear", "partly-cloudy", "cloudy", "rain", "showers", 
        "thunderstorm", "clear", "partly-cloudy"
      ];
      const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];
      const nightCondition = conditions[Math.floor(Math.random() * conditions.length)];
      
      const conditionTextMap: Record<WeatherCondition, string> = {
        "clear": "Clear sky",
        "partly-cloudy": "Partly cloudy",
        "cloudy": "Cloudy",
        "rain": "Rain",
        "showers": "Showers",
        "thunderstorm": "Thunderstorm",
        "snow": "Snow",
        "sleet": "Sleet",
        "fog": "Fog",
        "windy": "Windy"
      };
      
      return {
        date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        day: {
          condition: randomCondition,
          conditionText: conditionTextMap[randomCondition],
          maxTemp: Math.floor(65 + Math.random() * 15),
          minTemp: Math.floor(50 + Math.random() * 10),
          precipitationProbability: Math.floor(Math.random() * 100),
          sunrise: "6:24 AM",
          sunset: "7:32 PM",
        },
        night: {
          condition: nightCondition,
          conditionText: conditionTextMap[nightCondition],
          precipitationProbability: Math.floor(Math.random() * 100),
        }
      };
    }),
    hourly: Array(24).fill(null).map((_, i) => {
      const date = new Date();
      date.setHours(date.getHours() + i);
      
      const conditions: WeatherCondition[] = [
        "clear", "partly-cloudy", "cloudy", "rain", "showers", 
        "thunderstorm", "clear", "partly-cloudy"
      ];
      const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];
      
      const conditionTextMap: Record<WeatherCondition, string> = {
        "clear": "Clear sky",
        "partly-cloudy": "Partly cloudy",
        "cloudy": "Cloudy",
        "rain": "Rain",
        "showers": "Showers",
        "thunderstorm": "Thunderstorm",
        "snow": "Snow",
        "sleet": "Sleet",
        "fog": "Fog",
        "windy": "Windy"
      };
      
      return {
        time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
        temperature: Math.floor(60 + Math.random() * 20),
        condition: randomCondition,
        conditionText: conditionTextMap[randomCondition],
        precipitationProbability: Math.floor(Math.random() * 100),
        windSpeed: Math.floor(5 + Math.random() * 15),
      };
    })
  }
};

// Mock data for location search results
const mockLocationResults: LocationSearchResult[] = [
  { id: "1", name: "New York", region: "New York", country: "United States" },
  { id: "2", name: "Los Angeles", region: "California", country: "United States" },
  { id: "3", name: "Chicago", region: "Illinois", country: "United States" },
  { id: "4", name: "San Francisco", region: "California", country: "United States" },
  { id: "5", name: "Miami", region: "Florida", country: "United States" },
  { id: "6", name: "London", region: "London", country: "United Kingdom" },
  { id: "7", name: "Paris", region: "Île-de-France", country: "France" },
  { id: "8", name: "Tokyo", region: "Tokyo", country: "Japan" },
  { id: "9", name: "Sydney", region: "New South Wales", country: "Australia" },
  { id: "10", name: "Berlin", region: "Berlin", country: "Germany" },
];

// API service with mock implementations
export const weatherApi = {
  // Get current weather and forecast for a location
  getWeather: async (locationId?: string): Promise<WeatherData> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 600));
    return mockWeatherData;
  },
  
  // Search for locations
  searchLocations: async (query: string): Promise<LocationSearchResult[]> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 400));
    
    // Filter locations based on the query
    if (!query) return [];
    
    const filteredResults = mockLocationResults.filter(location => 
      location.name.toLowerCase().includes(query.toLowerCase()) ||
      location.region.toLowerCase().includes(query.toLowerCase()) ||
      location.country.toLowerCase().includes(query.toLowerCase())
    );
    
    return filteredResults;
  }
};
