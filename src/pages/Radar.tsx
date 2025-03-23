
import { useState, useEffect } from 'react';
import { weatherApi } from '@/lib/weatherApi';
import { WeatherData } from '@/lib/types';
import NavBar from '@/components/NavBar';
import { Loader2 } from 'lucide-react';
import { Card } from "@/components/ui/card";

interface RadarProps {
  onLocationSelect: (locationId: string) => void;
  locationId?: string;
}

const Radar = ({ onLocationSelect, locationId }: RadarProps) => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (locationId) {
      fetchWeather(locationId);
    } else {
      fetchWeather();
    }
  }, [locationId]);
  
  // Fetch weather data
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
          <div className="space-y-8">
            <h1 className="text-3xl font-light">Weather Radar</h1>
            {weatherData.location && (
              <p className="text-xl text-muted-foreground">
                {weatherData.location.name}, {weatherData.location.region}
              </p>
            )}
            
            <Card className="glass-panel p-8">
              <div className="flex flex-col items-center justify-center min-h-[50vh]">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-medium mb-2">Interactive Radar Map</h2>
                  <p className="text-muted-foreground max-w-2xl mx-auto">
                    View real-time precipitation, cloud cover, and temperature patterns for your area. 
                    Zoom in and out to see detailed weather information.
                  </p>
                </div>
                
                <div className="w-full aspect-video bg-gradient-to-br from-blue-100 to-blue-300 dark:from-blue-950 dark:to-blue-900 rounded-lg flex items-center justify-center">
                  <p className="text-muted-foreground">Weather radar map would be displayed here</p>
                  {/* In a real app, this would be a weather map component with actual radar data */}
                </div>
                
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
                  <Card className="p-4 bg-blue-50 dark:bg-blue-900/50">
                    <p className="font-medium">Precipitation</p>
                    <p className="text-muted-foreground text-sm">Light rain in some areas</p>
                  </Card>
                  <Card className="p-4 bg-blue-50 dark:bg-blue-900/50">
                    <p className="font-medium">Cloud Cover</p>
                    <p className="text-muted-foreground text-sm">{weatherData.current.conditionText}</p>
                  </Card>
                  <Card className="p-4 bg-blue-50 dark:bg-blue-900/50">
                    <p className="font-medium">Temperature</p>
                    <p className="text-muted-foreground text-sm">{weatherData.current.temperature}° in your area</p>
                  </Card>
                  <Card className="p-4 bg-blue-50 dark:bg-blue-900/50">
                    <p className="font-medium">Wind</p>
                    <p className="text-muted-foreground text-sm">{weatherData.current.windSpeed} mph {weatherData.current.windDirection}</p>
                  </Card>
                </div>
              </div>
            </Card>
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

export default Radar;
