
import { useState, useEffect, useRef } from 'react';
import { weatherApi } from '@/lib/weatherApi';
import { WeatherData } from '@/lib/types';
import NavBar from '@/components/NavBar';
import { Loader2, Map, Layers, AlertTriangle } from 'lucide-react';
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

interface RadarProps {
  onLocationSelect: (locationId: string) => void;
  locationId?: string;
}

// Available OpenWeatherMap map layers
const MAP_LAYERS = [
  { id: 'precipitation_new', name: 'Precipitation', color: 'blue' },
  { id: 'clouds_new', name: 'Cloud Cover', color: 'gray' },
  { id: 'temp_new', name: 'Temperature', color: 'orange' },
  { id: 'wind_new', name: 'Wind Speed', color: 'green' }
];

const Radar = ({ onLocationSelect, locationId }: RadarProps) => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeLayer, setActiveLayer] = useState('precipitation_new');
  const [mapError, setMapError] = useState<string | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  
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

  // Cleanup previous map instance when component unmounts or before creating a new one
  const cleanupMap = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }
  };

  // Initialize the map when weather data is available
  useEffect(() => {
    if (!weatherData || !mapRef.current) return;
    
    // Clear any previous errors
    setMapError(null);
    
    // Clean up previous map instance
    cleanupMap();
    
    // Clear the map container
    if (mapRef.current) {
      mapRef.current.innerHTML = '';
    }
    
    // Use weather data coordinates or default ones
    const lat = weatherData?.location?.latitude || 20;
    const lon = weatherData?.location?.longitude || 77;

    // Load Leaflet CSS
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      link.id = 'leaflet-css';
      document.head.appendChild(link);
    }

    // Load Leaflet JS and initialize map
    const initMap = () => {
      try {
        if (!mapRef.current) return;
        
        // @ts-ignore - Leaflet is loaded via CDN
        const L = window.L;
        
        if (!L) {
          throw new Error("Leaflet library not loaded properly");
        }
        
        // Create a new map instance
        const map = L.map(mapRef.current, {
          center: [lat, lon],
          zoom: 6,
          zoomControl: true,
          attributionControl: true
        });
        
        mapInstanceRef.current = map;

        // Add OpenStreetMap base layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        // Add weather layer from OpenWeatherMap
        L.tileLayer(
          `https://tile.openweathermap.org/map/${activeLayer}/{z}/{x}/{y}.png?appid=2e11d9409c65f5ef0fd829a6e2245262`,
          {
            attribution: '&copy; <a href="https://openweathermap.org/">OpenWeatherMap</a>',
            maxZoom: 18
          }
        ).addTo(map);

        // Add marker for current location
        if (weatherData.location) {
          L.marker([weatherData.location.latitude, weatherData.location.longitude])
            .addTo(map)
            .bindPopup(`${weatherData.location.name}, ${weatherData.location.region}`)
            .openPopup();
        }
        
        // Force a resize to ensure map renders correctly
        setTimeout(() => {
          map.invalidateSize();
        }, 100);
        
        toast.success("Weather map loaded successfully");
      } catch (err) {
        console.error("Error initializing map:", err);
        setMapError("Failed to initialize the weather map. Please try refreshing the page.");
        toast.error("Failed to load weather map");
      }
    };

    // Check if Leaflet is already loaded
    // @ts-ignore
    if (window.L) {
      initMap();
    } else {
      // Load Leaflet JS if not already loaded
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = initMap;
      script.onerror = () => {
        setMapError("Failed to load map library. Please check your internet connection and try again.");
        toast.error("Failed to load map library");
      };
      document.body.appendChild(script);
    }

    // Cleanup function
    return () => {
      cleanupMap();
    };
  }, [weatherData, activeLayer]);

  // Update map when layer changes
  useEffect(() => {
    if (!mapInstanceRef.current || !weatherData) return;
    
    try {
      // @ts-ignore - Leaflet is loaded via CDN
      const L = window.L;
      
      // Remove existing tile layers except the base layer
      mapInstanceRef.current.eachLayer((layer: any) => {
        if (layer instanceof L.TileLayer && layer.options.attribution.includes('OpenWeatherMap')) {
          mapInstanceRef.current.removeLayer(layer);
        }
      });
      
      // Add the new weather layer
      L.tileLayer(
        `https://tile.openweathermap.org/map/${activeLayer}/{z}/{x}/{y}.png?appid=2e11d9409c65f5ef0fd829a6e2245262`,
        {
          attribution: '&copy; <a href="https://openweathermap.org/">OpenWeatherMap</a>',
          maxZoom: 18
        }
      ).addTo(mapInstanceRef.current);
    } catch (err) {
      console.error("Error updating map layer:", err);
    }
  }, [activeLayer]);

  const handleLayerChange = (layerId: string) => {
    setActiveLayer(layerId);
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
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-light">Weather Radar</h1>
                {weatherData.location && (
                  <p className="text-xl text-muted-foreground">
                    {weatherData.location.name}, {weatherData.location.region}
                  </p>
                )}
              </div>
              
              <div className="flex flex-wrap gap-2">
                {MAP_LAYERS.map((layer) => (
                  <button
                    key={layer.id}
                    onClick={() => handleLayerChange(layer.id)}
                    className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                      activeLayer === layer.id
                        ? `bg-${layer.color}-100 text-${layer.color}-700 border-2 border-${layer.color}-400 dark:bg-${layer.color}-900/30 dark:text-${layer.color}-400`
                        : 'bg-white/80 dark:bg-gray-800/80 hover:bg-gray-100 dark:hover:bg-gray-700/80'
                    }`}
                  >
                    {layer.name}
                  </button>
                ))}
              </div>
            </div>
            
            <Card className="glass-panel p-4 md:p-8">
              <div className="flex flex-col space-y-6">
                <div className="flex items-center space-x-2">
                  <Map className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-medium">Interactive Weather Map</h2>
                </div>
                
                {mapError ? (
                  <div className="w-full aspect-[4/3] md:aspect-video bg-red-50 dark:bg-red-900/20 rounded-lg flex items-center justify-center p-6">
                    <div className="flex flex-col items-center text-center gap-2">
                      <AlertTriangle className="h-8 w-8 text-red-500" />
                      <p className="text-red-500 font-medium">Map Error</p>
                      <p className="text-muted-foreground">{mapError}</p>
                      <button 
                        className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
                        onClick={() => {
                          if (weatherData) {
                            setMapError(null);
                            // Wait for next tick to ensure mapError state is updated
                            setTimeout(() => {
                              if (locationId) {
                                fetchWeather(locationId);
                              } else {
                                fetchWeather();
                              }
                            }, 0);
                          }
                        }}
                      >
                        Try Again
                      </button>
                    </div>
                  </div>
                ) : (
                  <div 
                    ref={mapRef} 
                    className="w-full aspect-[4/3] md:aspect-video bg-gradient-to-br from-blue-100 to-blue-300 dark:from-blue-950 dark:to-blue-900 rounded-lg"
                    style={{ height: '500px', maxHeight: '70vh' }}
                  >
                    {/* Map will be rendered here */}
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="p-4 bg-blue-50 dark:bg-blue-900/50">
                    <p className="font-medium">Precipitation</p>
                    <p className="text-muted-foreground text-sm">
                      {weatherData.current.precipitationProbability}% chance
                    </p>
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

                <div className="text-sm text-muted-foreground flex items-center gap-2">
                  <Layers size={16} />
                  <span>Click on a layer button above to toggle between different weather data visualizations</span>
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
