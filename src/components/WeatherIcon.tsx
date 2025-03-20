
import { Sun, Cloud, CloudRain, CloudSnow, CloudLightning, CloudDrizzle, CloudFog } from 'lucide-react';
import { WeatherCondition } from '@/lib/types';

interface WeatherIconProps {
  condition: WeatherCondition;
  size?: number;
}

export const WeatherIcon = ({ condition, size = 24 }: WeatherIconProps) => {
  const iconClasses = "text-primary";
  
  switch (condition) {
    case 'clear':
      return <Sun size={size} className={iconClasses} />;
    case 'partly-cloudy':
      return <Cloud size={size} className={iconClasses} />;
    case 'cloudy':
      return <Cloud size={size} className={iconClasses} />;
    case 'rain':
      return <CloudRain size={size} className={iconClasses} />;
    case 'showers':
      return <CloudDrizzle size={size} className={iconClasses} />;
    case 'thunderstorm':
      return <CloudLightning size={size} className={iconClasses} />;
    case 'snow':
      return <CloudSnow size={size} className={iconClasses} />;
    case 'fog':
      return <CloudFog size={size} className={iconClasses} />;
    default:
      return <Sun size={size} className={iconClasses} />;
  }
};
