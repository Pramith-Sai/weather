
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { WeatherIcon } from "@/components/WeatherIcon";
import { CurrentWeather } from "@/lib/types";
import { Droplets, Wind, Eye, Sunrise, Sunset, Compass, Pressure, ThermometerSun, CloudRain } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

interface TodayDetailsProps {
  data: CurrentWeather;
  hourlyData: { time: string; temperature: number; precipitationProbability: number }[];
  sunrise: string;
  sunset: string;
}

const TodayDetails = ({ data, hourlyData, sunrise, sunset }: TodayDetailsProps) => {
  // UV Index description
  const getUVDescription = (uv: number) => {
    if (uv <= 2) return "Low";
    if (uv <= 5) return "Moderate";
    if (uv <= 7) return "High";
    if (uv <= 10) return "Very High";
    return "Extreme";
  };

  // Filter hourly data to show only future hours
  const currentHour = new Date().getHours();
  
  // Chart data configuration for temperature
  const tempChartConfig = {
    temperature: {
      label: "Temperature",
      theme: {
        light: "#f97316",
        dark: "#f97316",
      }
    }
  };

  // Chart data configuration for precipitation
  const precipChartConfig = {
    precipitation: {
      label: "Chance of Rain",
      theme: {
        light: "#0ea5e9",
        dark: "#0ea5e9",
      }
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left column with main stats */}
      <div className="lg:col-span-4 space-y-6">
        {/* Wind Card */}
        <Card className="glass-panel card-hover">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-sm font-medium">
              <Wind size={16} className="mr-2 text-primary" /> Wind
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-light">{data.windSpeed} mph</p>
                <p className="text-sm text-muted-foreground">{data.windDirection}</p>
              </div>
              <div className="relative h-16 w-16">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Compass size={48} className="text-primary opacity-20" />
                </div>
                <div 
                  className="absolute inset-0 flex items-center justify-center" 
                  style={{ transform: `rotate(${data.windDirection === 'N' ? 0 : data.windDirection === 'E' ? 90 : data.windDirection === 'S' ? 180 : data.windDirection === 'W' ? 270 : 0}deg)` }}
                >
                  <div className="w-1 h-8 bg-primary rounded-full origin-bottom transform -translate-y-2"></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Humidity Card */}
        <Card className="glass-panel card-hover">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-sm font-medium">
              <Droplets size={16} className="mr-2 text-primary" /> Humidity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-2xl font-light">{data.humidity}%</p>
            <Progress value={data.humidity} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {data.humidity < 30 
                ? 'Low humidity can cause skin dryness.'
                : data.humidity > 70 
                  ? 'High humidity may feel uncomfortable.'
                  : 'Ideal humidity for comfort.'}
            </p>
          </CardContent>
        </Card>

        {/* Visibility Card */}
        <Card className="glass-panel card-hover">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-sm font-medium">
              <Eye size={16} className="mr-2 text-primary" /> Visibility
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-light">{data.visibility} mi</p>
            <p className="text-xs text-muted-foreground mt-1">
              {data.visibility > 5 
                ? 'Excellent visibility' 
                : data.visibility > 2 
                  ? 'Good visibility' 
                  : 'Poor visibility'}
            </p>
          </CardContent>
        </Card>

        {/* UV Index Card */}
        <Card className="glass-panel card-hover">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-sm font-medium">
              <ThermometerSun size={16} className="mr-2 text-primary" /> UV Index
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-2xl font-light">{data.uvIndex} <span className="text-sm text-muted-foreground">{getUVDescription(data.uvIndex)}</span></p>
            <Progress value={data.uvIndex * 10} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {data.uvIndex > 7 
                ? 'Wear SPF 30+ sunscreen and protective clothing.'
                : data.uvIndex > 3 
                  ? 'Wear sunscreen and a hat when outdoors.'
                  : 'Minimal UV risk today.'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Middle column with temperature chart and more stats */}
      <div className="lg:col-span-4 space-y-6">
        {/* Temperature Chart */}
        <Card className="glass-panel card-hover">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Temperature Forecast</CardTitle>
          </CardHeader>
          <CardContent className="h-[220px]">
            <ChartContainer config={tempChartConfig} className="h-full">
              <AreaChart data={hourlyData}>
                <defs>
                  <linearGradient id="temperatureGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-temperature)" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="var(--color-temperature)" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis 
                  dataKey="time" 
                  tick={{ fontSize: 10 }}
                  interval={2}
                />
                <YAxis 
                  tick={{ fontSize: 10 }}
                  domain={['dataMin - 2', 'dataMax + 2']}
                />
                <ChartTooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <ChartTooltipContent
                          className="bg-background/80 backdrop-blur-sm"
                          payload={payload}
                        />
                      );
                    }
                    return null;
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="temperature" 
                  stroke="var(--color-temperature)" 
                  fillOpacity={1} 
                  fill="url(#temperatureGradient)" 
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Precipitation Chart */}
        <Card className="glass-panel card-hover">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-sm font-medium">
              <CloudRain size={16} className="mr-2 text-primary" /> Precipitation Chance
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[220px]">
            <ChartContainer config={precipChartConfig} className="h-full">
              <AreaChart data={hourlyData}>
                <defs>
                  <linearGradient id="precipitationGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-precipitation)" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="var(--color-precipitation)" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis 
                  dataKey="time" 
                  tick={{ fontSize: 10 }}
                  interval={2}
                />
                <YAxis 
                  tick={{ fontSize: 10 }}
                  domain={[0, 100]}
                />
                <ChartTooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <ChartTooltipContent
                          className="bg-background/80 backdrop-blur-sm"
                          payload={payload}
                        />
                      );
                    }
                    return null;
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="precipitationProbability" 
                  name="precipitation"
                  stroke="var(--color-precipitation)" 
                  fillOpacity={1} 
                  fill="url(#precipitationGradient)" 
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Right column with sun info and air quality */}
      <div className="lg:col-span-4 space-y-6">
        {/* Sun information Card */}
        <Card className="glass-panel card-hover">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Sun & Moon</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <Sunrise size={24} className="mx-auto mb-2 text-primary" />
                <p className="text-sm font-medium">Sunrise</p>
                <p className="text-xl font-light">{sunrise}</p>
              </div>
              <div className="text-center">
                <Sunset size={24} className="mx-auto mb-2 text-primary" />
                <p className="text-sm font-medium">Sunset</p>
                <p className="text-xl font-light">{sunset}</p>
              </div>
            </div>
            <div className="mt-4 relative h-12">
              <div className="absolute inset-x-0 top-1/2 h-0.5 bg-gray-200 dark:bg-gray-700"></div>
              <div 
                className="absolute top-0 h-12 flex items-center"
                style={{ 
                  left: `${getSunPosition(sunrise, sunset)}%`,
                  transform: 'translateX(-50%)'
                }}
              >
                <div className="w-4 h-4 rounded-full bg-amber-400 shadow-lg"></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pressure Card */}
        <Card className="glass-panel card-hover">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-sm font-medium">
              <Pressure size={16} className="mr-2 text-primary" /> Pressure
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-light">{data.pressure} mb</p>
            <p className="text-xs text-muted-foreground mt-1">
              {data.pressure > 1013 
                ? 'High pressure - generally fair weather' 
                : data.pressure < 1013 
                  ? 'Low pressure - potential for unsettled weather' 
                  : 'Normal atmospheric pressure'}
            </p>
          </CardContent>
        </Card>

        {/* Feels Like Card */}
        <Card className="glass-panel card-hover">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-sm font-medium">
              <ThermometerSun size={16} className="mr-2 text-primary" /> Feels Like
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <p className="text-3xl font-light">{data.feelsLike}°</p>
              <div className="ml-4">
                <p className="text-xs text-muted-foreground">
                  {data.feelsLike > data.temperature 
                    ? 'Feels warmer due to humidity' 
                    : data.feelsLike < data.temperature 
                      ? 'Feels colder due to wind chill' 
                      : 'Feels same as actual temperature'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Weather Condition Card */}
        <Card className="glass-panel card-hover">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Current Conditions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xl font-light">{data.conditionText}</p>
                <p className="text-sm text-muted-foreground">
                  {getWeatherAdvice(data.condition, data.temperature)}
                </p>
              </div>
              <WeatherIcon condition={data.condition} size={40} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Helper function to calculate current sun position as percentage of day
const getSunPosition = (sunrise: string, sunset: string): number => {
  const now = new Date();
  const sunriseTime = new Date();
  const sunsetTime = new Date();
  
  // Parse sunrise time (format: "06:23 AM")
  const [sunriseHour, sunriseMinute] = sunrise.split(':');
  let hour = parseInt(sunriseHour);
  const isPM = sunrise.toLowerCase().includes('pm');
  if (isPM && hour < 12) hour += 12;
  if (!isPM && hour === 12) hour = 0;
  sunriseTime.setHours(hour);
  sunriseTime.setMinutes(parseInt(sunriseMinute));
  
  // Parse sunset time
  const [sunsetHour, sunsetMinute] = sunset.split(':');
  hour = parseInt(sunsetHour);
  const isPMSunset = sunset.toLowerCase().includes('pm');
  if (isPMSunset && hour < 12) hour += 12;
  if (!isPMSunset && hour === 12) hour = 0;
  sunsetTime.setHours(hour);
  sunsetTime.setMinutes(parseInt(sunsetMinute));
  
  // If it's before sunrise or after sunset
  if (now < sunriseTime) return 0;
  if (now > sunsetTime) return 100;
  
  // Calculate percentage through the day
  const totalDayTime = sunsetTime.getTime() - sunriseTime.getTime();
  const timeSinceSunrise = now.getTime() - sunriseTime.getTime();
  return (timeSinceSunrise / totalDayTime) * 100;
};

// Helper function to provide weather advice based on conditions
const getWeatherAdvice = (condition: string, temperature: number): string => {
  switch(condition) {
    case 'clear':
      return temperature > 30 ? 'Stay hydrated and use sunscreen' : 'Great day to be outside';
    case 'partly-cloudy':
      return 'Good conditions for most activities';
    case 'cloudy':
      return 'No need for sunscreen today';
    case 'rain':
      return 'Bring an umbrella with you';
    case 'showers':
      return 'Scattered showers expected';
    case 'thunderstorm':
      return 'Stay indoors during lightning';
    case 'snow':
      return 'Dress warmly and drive carefully';
    case 'fog':
      return 'Reduced visibility, drive carefully';
    default:
      return 'Check forecast for updates';
  }
};

export default TodayDetails;
