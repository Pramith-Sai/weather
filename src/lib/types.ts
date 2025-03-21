
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

// Air quality data structure
export interface AirQuality {
  index: number;
  level: string;
  color: string;
  co: number | null;
  no2: number | null;
  o3: number | null;
  pm2_5: number | null;
  pm10: number | null;
  so2: number | null;
}

// Current weather data structure
export interface CurrentWeather {
  temperature: number;
  feelsLike: number;
  condition: WeatherCondition;
  conditionText: string;
  conditionIcon?: string;
  windSpeed: number;
  windDirection: string;
  humidity: number;
  uvIndex: number;
  visibility: number;
  pressure: number;
  precipitation?: number;
  precipitationProbability: number;
  lastUpdated: string;
  airQuality?: AirQuality;
}

// Daily forecast data structure
export interface DailyForecast {
  date: string;
  day: {
    condition: WeatherCondition;
    conditionText: string;
    conditionIcon?: string;
    maxTemp: number;
    minTemp: number;
    avgTemp?: number;
    maxWindSpeed?: number;
    precipitation?: number;
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
  conditionIcon?: string;
  precipitationProbability: number;
  windSpeed: number;
  windDirection?: string;
}

// Location data structure
export interface Location {
  id?: string;
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
  latitude: number;
  longitude: number;
}

export type AuthSession = {
  user: {
    id: string;
    email?: string;
  } | null;
  isLoading: boolean;
}

export type UserProfile = {
  id: string;
  username?: string;
  avatar_url?: string;
  location_id?: string;
  created_at: string;
  updated_at: string;
}
