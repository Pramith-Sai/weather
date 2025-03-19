
import { Sun, Cloud, CloudRain, CloudSnow, CloudLightning, CloudDrizzle, CloudFog, MapPin } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { WeatherCondition } from '@/lib/types';

interface WeatherCardProps {
  city: string;
  country: string;
  temperature: number;
  condition: WeatherCondition;
  conditionText: string;
  onClick?: () => void;
}

const WeatherCard = ({ city, country, temperature, condition, conditionText, onClick }: WeatherCardProps) => {
  // Function to render weather icon based on condition
  const WeatherIcon = ({ condition }: { condition: WeatherCondition }) => {
    const iconSize = 48;
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
    <Card 
      className="glass-panel card-hover h-full cursor-pointer transition-all duration-300 group"
      onClick={onClick}
    >
      <CardContent className="p-6 h-full flex flex-col">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-2xl font-medium">{city}</h3>
            <div className="flex items-center text-sm text-muted-foreground">
              <MapPin size={14} className="mr-1" />
              <span>{country}</span>
            </div>
          </div>
          <div className="text-4xl font-light">{temperature}°</div>
        </div>
        
        <div className="mt-auto flex items-center">
          <WeatherIcon condition={condition} />
          <p className="ml-3 text-lg">{conditionText}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default WeatherCard;
