import { useState, useEffect } from 'react';
import { weatherApi } from '@/lib/weatherApi';
import { WeatherData } from '@/lib/types';
import NavBar from '@/components/NavBar';
import CurrentWeather from '@/components/CurrentWeather';
import Forecast from '@/components/Forecast';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface IndexProps {
  onLocationSelect: (locationId: string) => void;
  locationId?: string;
}

const Index = ({ onLocationSelect, locationId }: IndexProps) => {
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
            {/* Current Weather Section */}
            <section>
              <CurrentWeather 
                data={weatherData.current} 
                locationName={weatherData.location.name}
                localTime={weatherData.location.localTime}
              />
            </section>
            
            {/* Forecast Section */}
            <section>
              <Forecast 
                dailyForecast={weatherData.forecast.daily} 
                hourlyForecast={weatherData.forecast.hourly}
              />
            </section>
          </div>
        ) : null}
      </main>
      
      {/* Footer */}
      <footer className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm py-8 border-t border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center">
          <div className="mb-4 sm:mb-0">
            <span className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-400">
              Weather
            </span>
          </div>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-primary transition-colors">Cookie Policy</a>
          </div>
          <div className="mt-4 sm:mt-0 text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Weather App
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
