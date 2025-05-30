import { useState, useEffect } from 'react';
import { weatherApi } from '@/lib/weatherApi';
import { WeatherData, Location } from '@/lib/types';
import NavBar from '@/components/NavBar';
import { Loader2, Umbrella, Wind } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { WeatherIcon } from '@/components/WeatherIcon';
import { Card, CardContent } from "@/components/ui/card";

interface HourlyProps {
  onLocationSelect: (locationId: string) => void;
  locationId?: string;
}

const Hourly = ({ onLocationSelect, locationId }: HourlyProps) => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { session } = useAuth();
  
  useEffect(() => {
    if (locationId) {
      fetchWeather(locationId);
    } else {
      fetchUserLocation();
    }
  }, [locationId]);
  
  const fetchUserLocation = async () => {
    if (session.user && !session.isLoading) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('location_id')
          .eq('id', session.user.id)
          .single();
          
        if (error) throw error;
        
        if (data && data.location_id) {
          fetchWeather(data.location_id);
        } else {
          fetchWeather(); // Use default location
        }
      } catch (err) {
        console.error('Error fetching user location:', err);
        fetchWeather(); // Use default location on error
      }
    } else {
      fetchWeather(); // Use default location if not logged in
    }
  };
  
  const fetchWeather = async (locationId?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await weatherApi.getWeather(locationId);
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
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
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
          <div className="space-y-8">
            <h1 className="text-3xl font-light">Hourly Forecast</h1>
            {weatherData.location && (
              <p className="text-xl text-muted-foreground">
                {weatherData.location.name}, {weatherData.location.region}
              </p>
            )}
            
            <div className="flex flex-col space-y-4 mt-8">
              {weatherData.forecast.hourly.map((hour, index) => (
                <Card key={index} className="glass-panel card-hover w-full">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <p className="font-medium text-lg">{hour.time}</p>
                        <WeatherIcon condition={hour.condition} size={36} />
                      </div>
                      <p className="text-3xl font-semibold">{hour.temperature}°</p>
                    </div>
                    
                    <div className="mt-4 grid grid-cols-3 gap-4">
                      <div className="flex items-center">
                        <Umbrella size={16} className="mr-2 text-blue-500" />
                        <span>{hour.precipitationProbability}% chance</span>
                      </div>
                      <div className="flex items-center">
                        <Wind size={16} className="mr-2 text-blue-500" />
                        <span>{hour.windSpeed} mph</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-sm text-muted-foreground">{hour.conditionText}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : null}
      </main>
      
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

export default Hourly;
