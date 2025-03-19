
// Weather condition types
export type WeatherCondition = 
  | 'clear' 
  | 'partly-cloudy' 
  | 'cloudy' 
  | 'rain' 
  | 'showers'
  | 'thunderstorm' 
  | 'snow' 
  | 'sleet' 
  | 'fog' 
  | 'windy';

// Current weather data structure
export interface CurrentWeather {
  temperature: number;
  feelsLike: number;
  condition: WeatherCondition;
  conditionText: string;
  windSpeed: number;
  windDirection: string;
  humidity: number;
  uvIndex: number;
  visibility: number;
  pressure: number;
  precipitationProbability: number;
  lastUpdated: string;
}

// Daily forecast data structure
export interface DailyForecast {
  date: string;
  day: {
    condition: WeatherCondition;
    conditionText: string;
    maxTemp: number;
    minTemp: number;
    precipitationProbability: number;
    sunrise: string;
    sunset: string;
  };
  night: {
    condition: WeatherCondition;
    conditionText: string;
    precipitationProbability: number;
  };
}

// Hourly forecast data structure
export interface HourlyForecast {
  time: string;
  temperature: number;
  condition: WeatherCondition;
  conditionText: string;
  precipitationProbability: number;
  windSpeed: number;
}

// Location data structure
export interface Location {
  name: string;
  region: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone: string;
  localTime: string;
}

// Complete weather data for a location
export interface WeatherData {
  location: Location;
  current: CurrentWeather;
  forecast: {
    daily: DailyForecast[];
    hourly: HourlyForecast[];
  };
}

// Location search result
export interface LocationSearchResult {
  id: string;
  name: string;
  region: string;
  country: string;
}
