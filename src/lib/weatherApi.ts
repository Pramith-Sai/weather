import { WeatherData, LocationSearchResult, WeatherCondition } from './types';

// Mock data for demonstration purposes
const mockWeatherData: WeatherData = {
  location: {
    name: "Mumbai",
    region: "Maharashtra",
    country: "India",
    latitude: 19.0760,
    longitude: 72.8777,
    timezone: "Asia/Kolkata",
    localTime: new Date().toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true
    }),
  },
  current: {
    temperature: 32,
    feelsLike: 34,
    condition: "partly-cloudy",
    conditionText: "Partly cloudy",
    windSpeed: 8,
    windDirection: "SW",
    humidity: 75,
    uvIndex: 8,
    visibility: 10,
    pressure: 1008,
    precipitationProbability: 10,
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

// Mock data for location search results with Indian cities
const mockLocationResults: LocationSearchResult[] = [
  { id: "1", name: "Mumbai", region: "Maharashtra", country: "India" },
  { id: "2", name: "Delhi", region: "Delhi", country: "India" },
  { id: "3", name: "Bangalore", region: "Karnataka", country: "India" },
  { id: "4", name: "Chennai", region: "Tamil Nadu", country: "India" },
  { id: "5", name: "Kolkata", region: "West Bengal", country: "India" },
  { id: "6", name: "Hyderabad", region: "Telangana", country: "India" },
  { id: "7", name: "Ahmedabad", region: "Gujarat", country: "India" },
  { id: "8", name: "Pune", region: "Maharashtra", country: "India" },
  { id: "9", name: "Jaipur", region: "Rajasthan", country: "India" },
  { id: "10", name: "Lucknow", region: "Uttar Pradesh", country: "India" },
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
