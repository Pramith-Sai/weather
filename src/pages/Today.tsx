
import { useState, useEffect } from 'react';
import { weatherApi } from '@/lib/weatherApi';
import { WeatherData } from '@/lib/types';
import NavBar from '@/components/NavBar';
import CurrentWeather from '@/components/CurrentWeather';
import TodayDetails from '@/components/TodayDetails';
import AirQualityIndicator from '@/components/AirQualityIndicator';
import LocationInfo from '@/components/LocationInfo';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';

const Today = () => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { session } = useAuth();
  
  // Fetch user's saved location if logged in
  useEffect(() => {
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
    
    fetchUserLocation();
  }, [session.user, session.isLoading]);
  
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
  
  // Handle location selection from search
  const handleLocationSelect = async (locationId: string) => {
    // Save the selected location for logged in users
    if (session.user) {
      try {
        const { error } = await supabase
          .from('profiles')
          .update({ location_id: locationId })
          .eq('id', session.user.id);
          
        if (error) throw error;
      } catch (err) {
        console.error('Error saving location:', err);
      }
    }
    
    fetchWeather(locationId);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/50 to-blue-100/30 dark:from-gray-900 dark:to-gray-800">
      <NavBar onLocationSelect={handleLocationSelect} />
      
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
            {/* Location info */}
            <LocationInfo location={weatherData.location} />
            
            {/* Current Weather and Air Quality Section */}
            <section>
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3">
                  <CurrentWeather 
                    data={weatherData.current} 
                    locationName={weatherData.location.name}
                    localTime={weatherData.location.localTime}
                  />
                </div>
                
                {/* Air Quality Card */}
                {weatherData.current.airQuality && (
                  <div className="lg:col-span-1">
                    <Card className="h-full glass-panel card-hover flex items-center justify-center p-6">
                      <CardContent className="p-0 flex flex-col items-center justify-center h-full">
                        <AirQualityIndicator airQuality={weatherData.current.airQuality} size="lg" />
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </section>
            
            {/* Today's Details Section */}
            <section>
              <h2 className="text-2xl font-light mb-6">Today's Weather Details</h2>
              <TodayDetails 
                data={weatherData.current} 
                hourlyData={weatherData.forecast.hourly}
                sunrise={weatherData.forecast.daily[0].day.sunrise}
                sunset={weatherData.forecast.daily[0].day.sunset}
              />
            </section>
            
            {/* Air Quality Details (if available) */}
            {weatherData.current.airQuality && (
              <section>
                <h2 className="text-2xl font-light mb-6">Air Quality Details</h2>
                <Card className="glass-panel">
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div className="flex flex-col items-center">
                        <AirQualityIndicator airQuality={weatherData.current.airQuality} />
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm font-medium mb-1">PM2.5</p>
                          <p className="text-xl font-light">{weatherData.current.airQuality.pm2_5} μg/m³</p>
                          <p className="text-xs text-muted-foreground mt-1">Fine particulate matter</p>
                        </div>
                        
                        <div>
                          <p className="text-sm font-medium mb-1">PM10</p>
                          <p className="text-xl font-light">{weatherData.current.airQuality.pm10} μg/m³</p>
                          <p className="text-xs text-muted-foreground mt-1">Coarse particulate matter</p>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm font-medium mb-1">O₃</p>
                          <p className="text-xl font-light">{weatherData.current.airQuality.o3} μg/m³</p>
                          <p className="text-xs text-muted-foreground mt-1">Ozone</p>
                        </div>
                        
                        <div>
                          <p className="text-sm font-medium mb-1">NO₂</p>
                          <p className="text-xl font-light">{weatherData.current.airQuality.no2} μg/m³</p>
                          <p className="text-xs text-muted-foreground mt-1">Nitrogen dioxide</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-sm">
                        {weatherData.current.airQuality.index <= 50 
                          ? "Air quality is good. It's a great day to be active outside!"
                          : weatherData.current.airQuality.index <= 100 
                            ? "Air quality is acceptable, but sensitive groups may experience health effects."
                            : weatherData.current.airQuality.index <= 150 
                              ? "Members of sensitive groups may experience health effects. Consider limiting prolonged outdoor exertion."
                              : weatherData.current.airQuality.index <= 200 
                                ? "Everyone may begin to experience health effects. Sensitive groups should limit outdoor activity."
                                : weatherData.current.airQuality.index <= 300 
                                  ? "Health alert: Everyone may experience more serious health effects. Avoid outdoor activity."
                                  : "Health warning: Emergency conditions. Everyone should avoid outdoor activity."
                        }
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </section>
            )}
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

export default Today;
