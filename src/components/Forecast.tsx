import { useRef } from 'react';
import { ChevronLeft, ChevronRight, Sun, Cloud, CloudRain, CloudSnow, CloudLightning, CloudDrizzle, CloudFog, Umbrella } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DailyForecast, HourlyForecast, WeatherCondition } from '@/lib/types';

interface ForecastProps {
  dailyForecast: DailyForecast[];
  hourlyForecast?: HourlyForecast[];
  showHourlyForecast?: boolean;
}

const Forecast = ({
  dailyForecast,
  hourlyForecast = [],
  showHourlyForecast = true
}: ForecastProps) => {
  const hourlyScrollRef = useRef<HTMLDivElement>(null);

  const scrollHourly = (direction: 'left' | 'right') => {
    if (hourlyScrollRef.current) {
      const scrollAmount = direction === 'left' ? -240 : 240;
      hourlyScrollRef.current.scrollBy({
        left: scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const WeatherIcon = ({
    condition,
    size = 24
  }: {
    condition: WeatherCondition;
    size?: number;
  }) => {
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

  return <div className="space-y-8 animate-fade-in">
      {/* Hourly Forecast - Only show if showHourlyForecast is true */}
      {showHourlyForecast && hourlyForecast && hourlyForecast.length > 0 && <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-light">Hourly Forecast</h2>
            <div className="flex space-x-2">
              <Button variant="outline" size="icon" className="rounded-full" onClick={() => scrollHourly('left')}>
                <ChevronLeft size={18} />
              </Button>
              <Button variant="outline" size="icon" className="rounded-full" onClick={() => scrollHourly('right')}>
                <ChevronRight size={18} />
              </Button>
            </div>
          </div>
          
          <div className="relative">
            <div ref={hourlyScrollRef} className="flex overflow-x-auto pb-4 hide-scrollbar space-x-4">
              {hourlyForecast.map((hour, index) => <Card key={index} className="flex-shrink-0 w-[120px] glass-panel card-hover">
                  <CardContent className="p-4 flex flex-col items-center">
                    <p className="text-sm font-medium mb-2">{hour.time}</p>
                    <WeatherIcon condition={hour.condition} />
                    <p className="text-xl mt-2">{hour.temperature}°</p>
                    <div className="flex items-center mt-2 text-xs text-muted-foreground">
                      <Umbrella size={12} className="mr-1" />
                      <span>{hour.precipitationProbability}%</span>
                    </div>
                  </CardContent>
                </Card>)}
            </div>
          </div>
        </div>}
      
      {/* Daily Forecast */}
      <div>
        <h2 className="text-2xl font-light mb-4">7 Day Forecast</h2>
        
        <Card className="glass-panel overflow-hidden">
          <div className="divide-y divide-border">
            {dailyForecast.map((day, index) => <div key={index} className="flex items-center p-4 hover:bg-muted/30 transition-colors">
                <div className="w-[100px] text-sm">
                  {index === 0 ? 'Today' : day.date}
                </div>
                <div className="flex items-center flex-1">
                  <WeatherIcon condition={day.day.condition} />
                  <span className="ml-2 text-sm truncate hidden xs:block">
                    {day.day.conditionText}
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="flex items-center mr-6">
                    <Umbrella size={14} className="mr-1 text-muted-foreground" />
                    <span className="text-sm">{day.day.precipitationProbability}%</span>
                  </div>
                  <div className="w-[80px] flex justify-between text-sm">
                    <span className="font-medium">{day.day.maxTemp}°</span>
                    <span className="text-muted-foreground">{day.day.minTemp}°</span>
                  </div>
                </div>
              </div>)}
          </div>
        </Card>
      </div>
    </div>;
};

export default Forecast;
