import { LocationSearchResult, WeatherData } from './types';

// Mock data for the weather API
const mockWeatherApi = {
  getWeather: async (locationId?: string): Promise<WeatherData> => {
    // Default to New Delhi if no locationId is provided
    const defaultLocation = {
      id: "1261481",
      name: "New Delhi",
      region: "Delhi",
      country: "India",
      lat: 28.61,
      lon: 77.21,
      localTime: new Date().toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: 'numeric',
        hour12: true 
      })
    };
    
    const location = locationId ? {
      id: locationId,
      name: 'London',
      region: 'City of London, Greater London',
      country: 'United Kingdom',
      lat: 51.52,
      lon: -0.11,
      localTime: new Date().toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
      })
    } : defaultLocation;

    // Mock current weather data
    const current = {
      temperature: 22,
      conditionText: 'Partly Cloudy',
      conditionIcon: '//cdn.weatherapi.com/weather/64x64/day/116.png',
      windSpeed: 10,
      windDirection: 'ESE',
      humidity: 60,
      precipitation: 0,
      feelsLike: 22,
      visibility: 10,
      uvIndex: 7,
      airQuality: {
        co: 200,
        no2: 20,
        o3: 50,
        so2: 10,
        pm2_5: 8,
        pm10: 15,
        index: 2
      }
    };

    const forecast = {
      daily: [
        {
          date: '2024-07-29',
          day: {
            maxTemp: 28,
            minTemp: 18,
            avgTemp: 23,
            maxWindSpeed: 15,
            precipitation: 0.1,
            precipitationProbability: 10,
            conditionText: 'Partly Cloudy',
            conditionIcon: '//cdn.weatherapi.com/weather/64x64/day/116.png',
            sunrise: '05:30 AM',
            sunset: '08:30 PM'
          }
        },
        {
          date: '2024-07-30',
          day: {
            maxTemp: 30,
            minTemp: 20,
            avgTemp: 25,
            maxWindSpeed: 12,
            precipitation: 0,
            precipitationProbability: 5,
            conditionText: 'Sunny',
            conditionIcon: '//cdn.weatherapi.com/weather/64x64/day/113.png',
            sunrise: '05:31 AM',
            sunset: '08:29 PM'
          }
        },
        {
          date: '2024-07-31',
          day: {
            maxTemp: 32,
            minTemp: 22,
            avgTemp: 27,
            maxWindSpeed: 10,
            precipitation: 0,
            precipitationProbability: 0,
            conditionText: 'Sunny',
            conditionIcon: '//cdn.weatherapi.com/weather/64x64/day/113.png',
            sunrise: '05:32 AM',
            sunset: '08:28 PM'
          }
        },
        {
          date: '2024-08-01',
          day: {
            maxTemp: 31,
            minTemp: 21,
            avgTemp: 26,
            maxWindSpeed: 11,
            precipitation: 0,
            precipitationProbability: 0,
            conditionText: 'Sunny',
            conditionIcon: '//cdn.weatherapi.com/weather/64x64/day/113.png',
            sunrise: '05:33 AM',
            sunset: '08:27 PM'
          }
        },
        {
          date: '2024-08-02',
          day: {
            maxTemp: 29,
            minTemp: 19,
            avgTemp: 24,
            maxWindSpeed: 13,
            precipitation: 0.2,
            precipitationProbability: 15,
            conditionText: 'Partly Cloudy',
            conditionIcon: '//cdn.weatherapi.com/weather/64x64/day/116.png',
            sunrise: '05:34 AM',
            sunset: '08:26 PM'
          }
        },
        {
          date: '2024-08-03',
          day: {
            maxTemp: 27,
            minTemp: 17,
            avgTemp: 22,
            maxWindSpeed: 14,
            precipitation: 0.5,
            precipitationProbability: 25,
            conditionText: 'Light Rain',
            conditionIcon: '//cdn.weatherapi.com/weather/64x64/day/302.png',
            sunrise: '05:35 AM',
            sunset: '08:25 PM'
          }
        },
        {
          date: '2024-08-04',
          day: {
            maxTemp: 26,
            minTemp: 16,
            avgTemp: 21,
            maxWindSpeed: 16,
            precipitation: 0.8,
            precipitationProbability: 30,
            conditionText: 'Moderate Rain',
            conditionIcon: '//cdn.weatherapi.com/weather/64x64/day/305.png',
            sunrise: '05:36 AM',
            sunset: '08:24 PM'
          }
        }
      ],
      hourly: [
        {
          time: '12:00 AM',
          temperature: 22,
          conditionText: 'Partly Cloudy',
          conditionIcon: '//cdn.weatherapi.com/weather/64x64/day/116.png',
          windSpeed: 10,
          windDirection: 'ESE',
          precipitationProbability: 10
        },
        {
          time: '01:00 AM',
          temperature: 21,
          conditionText: 'Partly Cloudy',
          conditionIcon: '//cdn.weatherapi.com/weather/64x64/day/116.png',
          windSpeed: 9,
          windDirection: 'ESE',
          precipitationProbability: 8
        },
        {
          time: '02:00 AM',
          temperature: 20,
          conditionText: 'Clear',
          conditionIcon: '//cdn.weatherapi.com/weather/64x64/day/113.png',
          windSpeed: 8,
          windDirection: 'ESE',
          precipitationProbability: 5
        },
        {
          time: '03:00 AM',
          temperature: 19,
          conditionText: 'Clear',
          conditionIcon: '//cdn.weatherapi.com/weather/64x64/day/113.png',
          windSpeed: 7,
          windDirection: 'ESE',
          precipitationProbability: 3
        },
        {
          time: '04:00 AM',
          temperature: 18,
          conditionText: 'Clear',
          conditionIcon: '//cdn.weatherapi.com/weather/64x64/day/113.png',
          windSpeed: 6,
          windDirection: 'ESE',
          precipitationProbability: 2
        },
        {
          time: '05:00 AM',
          temperature: 18,
          conditionText: 'Clear',
          conditionIcon: '//cdn.weatherapi.com/weather/64x64/day/113.png',
          windSpeed: 5,
          windDirection: 'ESE',
          precipitationProbability: 1
        },
        {
          time: '06:00 AM',
          temperature: 19,
          conditionText: 'Sunny',
          conditionIcon: '//cdn.weatherapi.com/weather/64x64/day/113.png',
          windSpeed: 6,
          windDirection: 'ESE',
          precipitationProbability: 0
        },
        {
          time: '07:00 AM',
          temperature: 20,
          conditionText: 'Sunny',
          conditionIcon: '//cdn.weatherapi.com/weather/64x64/day/113.png',
          windSpeed: 7,
          windDirection: 'ESE',
          precipitationProbability: 0
        },
        {
          time: '08:00 AM',
          temperature: 22,
          conditionText: 'Sunny',
          conditionIcon: '//cdn.weatherapi.com/weather/64x64/day/113.png',
          windSpeed: 8,
          windDirection: 'ESE',
          precipitationProbability: 0
        },
        {
          time: '09:00 AM',
          temperature: 24,
          conditionText: 'Sunny',
          conditionIcon: '//cdn.weatherapi.com/weather/64x64/day/113.png',
          windSpeed: 9,
          windDirection: 'ESE',
          precipitationProbability: 0
        },
        {
          time: '10:00 AM',
          temperature: 25,
          conditionText: 'Sunny',
          conditionIcon: '//cdn.weatherapi.com/weather/64x64/day/113.png',
          windSpeed: 10,
          windDirection: 'ESE',
          precipitationProbability: 0
        },
        {
          time: '11:00 AM',
          temperature: 26,
          conditionText: 'Sunny',
          conditionIcon: '//cdn.weatherapi.com/weather/64x64/day/113.png',
          windSpeed: 11,
          windDirection: 'ESE',
          precipitationProbability: 0
        },
        {
          time: '12:00 PM',
          temperature: 27,
          conditionText: 'Sunny',
          conditionIcon: '//cdn.weatherapi.com/weather/64x64/day/113.png',
          windSpeed: 12,
          windDirection: 'ESE',
          precipitationProbability: 0
        },
        {
          time: '01:00 PM',
          temperature: 28,
          conditionText: 'Sunny',
          conditionIcon: '//cdn.weatherapi.com/weather/64x64/day/113.png',
          windSpeed: 13,
          windDirection: 'ESE',
          precipitationProbability: 0
        },
        {
          time: '02:00 PM',
          temperature: 28,
          conditionText: 'Sunny',
          conditionIcon: '//cdn.weatherapi.com/weather/64x64/day/113.png',
          windSpeed: 14,
          windDirection: 'ESE',
          precipitationProbability: 0
        },
        {
          time: '03:00 PM',
          temperature: 27,
          conditionText: 'Sunny',
          conditionIcon: '//cdn.weatherapi.com/weather/64x64/day/113.png',
          windSpeed: 13,
          windDirection: 'ESE',
          precipitationProbability: 0
        },
        {
          time: '04:00 PM',
          temperature: 26,
          conditionText: 'Sunny',
          conditionIcon: '//cdn.weatherapi.com/weather/64x64/day/113.png',
          windSpeed: 12,
          windDirection: 'ESE',
          precipitationProbability: 0
        },
        {
          time: '05:00 PM',
          temperature: 25,
          conditionText: 'Sunny',
          conditionIcon: '//cdn.weatherapi.com/weather/64x64/day/113.png',
          windSpeed: 11,
          windDirection: 'ESE',
          precipitationProbability: 0
        },
        {
          time: '06:00 PM',
          temperature: 24,
          conditionText: 'Partly Cloudy',
          conditionIcon: '//cdn.weatherapi.com/weather/64x64/day/116.png',
          windSpeed: 10,
          windDirection: 'ESE',
          precipitationProbability: 5
        },
        {
          time: '07:00 PM',
          temperature: 23,
          conditionText: 'Partly Cloudy',
          conditionIcon: '//cdn.weatherapi.com/weather/64x64/day/116.png',
          windSpeed: 9,
          windDirection: 'ESE',
          precipitationProbability: 8
        },
        {
          time: '08:00 PM',
          temperature: 22,
          conditionText: 'Partly Cloudy',
          conditionIcon: '//cdn.weatherapi.com/weather/64x64/day/116.png',
          windSpeed: 8,
          windDirection: 'ESE',
          precipitationProbability: 10
        },
        {
          time: '09:00 PM',
          temperature: 21,
          conditionText: 'Partly Cloudy',
          conditionIcon: '//cdn.weatherapi.com/weather/64x64/day/116.png',
          windSpeed: 7,
          windDirection: 'ESE',
          precipitationProbability: 12
        },
        {
          time: '10:00 PM',
          temperature: 20,
          conditionText: 'Partly Cloudy',
          conditionIcon: '//cdn.weatherapi.com/weather/64x64/day/116.png',
          windSpeed: 6,
          windDirection: 'ESE',
          precipitationProbability: 10
        },
        {
          time: '11:00 PM',
          temperature: 19,
          conditionText: 'Partly Cloudy',
          conditionIcon: '//cdn.weatherapi.com/weather/64x64/day/116.png',
          windSpeed: 5,
          windDirection: 'ESE',
          precipitationProbability: 8
        }
      ]
    };

    // Return mock weather data
    return {
      location: location,
      current: current,
      forecast: forecast
    };
  },
  searchLocations: async (query: string): Promise<LocationSearchResult[]> => {
    const mockResults: LocationSearchResult[] = [
      {
        id: '2643743',
        name: 'London',
        region: 'City of London, Greater London',
        country: 'United Kingdom',
        lat: 51.52,
        lon: -0.11
      },
      {
        id: '1261481',
        name: 'New Delhi',
        region: 'Delhi',
        country: 'India',
        lat: 28.61,
        lon: 77.21
      },
      {
        id: '4119615',
        name: 'Delhi',
        region: 'LA',
        country: 'United States of America',
        lat: 33.73,
        lon: -117.93
      }
    ];

    const filteredResults = mockResults.filter(result =>
      result.name.toLowerCase().includes(query.toLowerCase()) ||
      result.region.toLowerCase().includes(query.toLowerCase()) ||
      result.country.toLowerCase().includes(query.toLowerCase())
    );

    return filteredResults;
  }
};

export const weatherApi = mockWeatherApi;
