
import { useState, useEffect } from 'react';
import { 
  Droplets, Wind, Eye, Sunrise, Sunset, 
  ThermometerSun, Sun, CloudRain, Cloud, CloudFog, 
  CloudSnow, CloudLightning, CloudDrizzle 
} from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { CurrentWeather as CurrentWeatherType, WeatherCondition } from '@/lib/types';

interface CurrentWeatherProps {
  data: CurrentWeatherType;
  locationName: string;
  localTime: string;
}

const CurrentWeather = ({ data, locationName, localTime }: CurrentWeatherProps) => {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) return null;
  
  // Function to render the appropriate weather icon based on condition
  const WeatherIcon = ({ condition }: { condition: WeatherCondition }) => {
    const iconSize = 64;
    const iconClasses = "text-primary";
    
    switch (condition) {
      case 'clear':
        return <Sun size={iconSize} className={iconClasses} />;
      case 'partly-cloudy':
        return <Cloud size={iconSize} className={iconClasses} />;
      case 'cloudy':
        return <Cloud size={iconSize} className={iconClasses} />;
      case 'rain':
        return <CloudRain size={iconSize} className={iconClasses} />;
      case 'showers':
        return <CloudDrizzle size={iconSize} className={iconClasses} />;
      case 'thunderstorm':
        return <CloudLightning size={iconSize} className={iconClasses} />;
      case 'snow':
        return <CloudSnow size={iconSize} className={iconClasses} />;
      case 'fog':
        return <CloudFog size={iconSize} className={iconClasses} />;
      default:
        return <Sun size={iconSize} className={iconClasses} />;
    }
  };
  
  return (
    <div className="animate-fade-in">
      <div className="text-center mb-6">
        <h1 className="text-4xl sm:text-5xl font-light mb-2">{locationName}</h1>
        <p className="text-muted-foreground">{localTime}</p>
      </div>
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Main weather card */}
        <Card className="flex-1 glass-panel card-hover overflow-hidden">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="flex items-center mb-4 md:mb-0">
                <WeatherIcon condition={data.condition} />
                <div className="ml-4">
                  <h2 className="text-6xl font-light">{data.temperature}°</h2>
                  <p className="text-lg text-muted-foreground">{data.conditionText}</p>
                </div>
              </div>
              
              <div className="text-center md:text-right">
                <p className="text-muted-foreground mb-1">Feels like {data.feelsLike}°</p>
                <div className="flex items-center justify-center md:justify-end text-sm">
                  <ThermometerSun size={16} className="mr-1 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    Updated {data.lastUpdated}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Details cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-2 lg:grid-cols-4 gap-4 flex-1">
          {/* Humidity */}
          <Card className="glass-panel card-hover">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
              <Droplets className="mb-2 text-primary" size={24} />
              <p className="text-sm font-medium">Humidity</p>
              <p className="text-2xl font-light">{data.humidity}%</p>
            </CardContent>
          </Card>
          
          {/* Wind */}
          <Card className="glass-panel card-hover">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
              <Wind className="mb-2 text-primary" size={24} />
              <p className="text-sm font-medium">Wind</p>
              <p className="text-2xl font-light">{data.windSpeed} mph</p>
              <p className="text-xs text-muted-foreground">{data.windDirection}</p>
            </CardContent>
          </Card>
          
          {/* Visibility */}
          <Card className="glass-panel card-hover">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
              <Eye className="mb-2 text-primary" size={24} />
              <p className="text-sm font-medium">Visibility</p>
              <p className="text-2xl font-light">{data.visibility} mi</p>
            </CardContent>
          </Card>
          
          {/* Precipitation */}
          <Card className="glass-panel card-hover">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
              <CloudRain className="mb-2 text-primary" size={24} />
              <p className="text-sm font-medium">Precipitation</p>
              <p className="text-2xl font-light">{data.precipitationProbability}%</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CurrentWeather;
