
import { useState, useEffect } from 'react';
import { weatherApi } from '@/lib/weatherApi';
import { WeatherData } from '@/lib/types';
import NavBar from '@/components/NavBar';
import CurrentWeather from '@/components/CurrentWeather';
import TodayDetails from '@/components/TodayDetails';
import PersonalizedInsights from '@/components/PersonalizedInsights';
import { Loader2 } from 'lucide-react';
import LocationInfo from '@/components/LocationInfo';

interface TodayProps {
  onLocationSelect: (locationId: string) => void;
  locationId?: string;
}

const Today = ({ onLocationSelect, locationId }: TodayProps) => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch weather when locationId changes
  useEffect(() => {
    if (locationId) {
      fetchWeather(locationId);
    } else {
      fetchWeather(); // Use default location if no locationId is provided
    }
  }, [locationId]);
  
  // Fetch weather data
  const fetchWeather = async (id?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await weatherApi.getWeather(id);
      setWeatherData(data);
    } catch (err) {
      console.error('Error fetching weather data:', err);
      setError('Failed to load weather data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/50 to-blue-100/30 dark:from-gray-900 dark:to-gray-800">
      <NavBar onLocationSelect={onLocationSelect} />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16 max-w-7xl">
        <h1 className="text-3xl font-light mb-2">Today's Weather</h1>
        
        {weatherData?.location && (
          <div className="flex items-center text-sm text-muted-foreground mb-6">
            <LocationInfo location={weatherData.location} />
          </div>
        )}
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <Loader2 size={48} className="text-primary animate-spin mb-4" />
            <p className="text-muted-foreground">Loading weather data...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="text-destructive mb-2 text-lg">Error</div>
            <p className="text-muted-foreground">{error}</p>
          </div>
        ) : weatherData ? (
          <div className="space-y-12">
            {/* Personalized Insights Section */}
            <section>
              <PersonalizedInsights 
                weatherData={weatherData}
                locationId={locationId}
              />
            </section>
            
            {/* Current Weather Section */}
            <section>
              <CurrentWeather 
                data={weatherData.current} 
                locationName={weatherData.location.name}
                localTime={weatherData.location.localTime}
              />
            </section>
            
            {/* Weather Details Section */}
            <section>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <TodayDetails 
                  data={weatherData.current}
                  hourlyData={weatherData.forecast.hourly}
                  sunrise={weatherData.forecast.daily[0].day.sunrise}
                  sunset={weatherData.forecast.daily[0].day.sunset}
                />
              </div>
            </section>
          </div>
        ) : null}
      </main>
    </div>
  );
};

export default Today;
