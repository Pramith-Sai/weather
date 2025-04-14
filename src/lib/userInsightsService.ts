
import { WeatherData } from './types';
import { supabase } from '@/integrations/supabase/client';

// Track when a user views the weather for a location
export const trackLocationView = async (userId: string | undefined, locationId: string, weatherData: WeatherData) => {
  if (!userId) return;
  
  try {
    const { error } = await supabase
      .from('location_views')
      .insert({
        user_id: userId,
        location_id: locationId,
        temperature: weatherData.current.temperature,
        condition: weatherData.current.condition,
        timestamp: new Date().toISOString()
      });
      
    if (error) throw error;
  } catch (err) {
    console.error('Error tracking location view:', err);
  }
};

// Get personalized insights based on user's viewing patterns
export const getPersonalizedInsights = async (userId: string | undefined, currentWeather: WeatherData): Promise<string[]> => {
  if (!userId) return getDefaultInsights(currentWeather);
  
  try {
    // Get user's recent location views
    const { data: locationViews, error } = await supabase
      .from('location_views')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })
      .limit(10);
      
    if (error) throw error;
    
    if (!locationViews || locationViews.length < 3) {
      return getDefaultInsights(currentWeather);
    }
    
    // Analyze user's viewing patterns to generate insights
    const insights: string[] = [];
    
    // Check if user frequently checks the weather during certain times
    const viewHours = locationViews.map(view => new Date(view.timestamp).getHours());
    const morningViews = viewHours.filter(hour => hour >= 5 && hour < 12).length;
    const afternoonViews = viewHours.filter(hour => hour >= 12 && hour < 18).length;
    const eveningViews = viewHours.filter(hour => hour >= 18 && hour < 22).length;
    const nightViews = viewHours.filter(hour => hour >= 22 || hour < 5).length;
    
    const maxViews = Math.max(morningViews, afternoonViews, eveningViews, nightViews);
    
    if (maxViews > 0) {
      if (morningViews === maxViews) {
        insights.push("You often check the weather in the morning. Today's morning forecast shows " + 
          getMorningForecast(currentWeather));
      } else if (afternoonViews === maxViews) {
        insights.push("Based on your afternoon weather checks, today's afternoon looks " + 
          getAfternoonForecast(currentWeather));
      } else if (eveningViews === maxViews) {
        insights.push("You frequently check evening weather. Tonight will be " + 
          getEveningForecast(currentWeather));
      }
    }
    
    // Check if user often views the same location
    const locationCounts: Record<string, number> = {};
    locationViews.forEach(view => {
      locationCounts[view.location_id] = (locationCounts[view.location_id] || 0) + 1;
    });
    
    const favoriteLocation = Object.entries(locationCounts)
      .sort((a, b) => b[1] - a[1])[0];
    
    if (favoriteLocation && favoriteLocation[1] > 3) {
      insights.push(`You seem interested in the weather in ${currentWeather.location.name}. We'll prioritize updates for this location.`);
    }
    
    // Check temperature preferences based on most viewed conditions
    const temperatureViews = locationViews.map(view => view.temperature);
    const avgTemperature = temperatureViews.reduce((sum, temp) => sum + temp, 0) / temperatureViews.length;
    
    if (currentWeather.current.temperature > avgTemperature + 5) {
      insights.push("It's warmer than what you typically check. Consider dressing lighter today.");
    } else if (currentWeather.current.temperature < avgTemperature - 5) {
      insights.push("It's cooler than what you typically check. Consider bringing a jacket.");
    }
    
    // Add a fallback insight if we couldn't generate any specific ones
    if (insights.length === 0) {
      return getDefaultInsights(currentWeather);
    }
    
    return insights;
  } catch (err) {
    console.error('Error getting personalized insights:', err);
    return getDefaultInsights(currentWeather);
  }
};

// Helper functions to generate forecast descriptions
const getMorningForecast = (weather: WeatherData): string => {
  const morningHours = weather.forecast.hourly.filter(hour => {
    const hourNum = parseInt(hour.time.split(':')[0]);
    return hourNum >= 6 && hourNum < 12;
  });
  
  if (morningHours.length === 0) return "no data available";
  
  const conditions = morningHours.map(hour => hour.condition);
  const mostCommon = getMostCommonCondition(conditions);
  const avgTemp = Math.round(morningHours.reduce((sum, hour) => sum + hour.temperature, 0) / morningHours.length);
  
  return `${avgTemp}°C with ${mostCommon} conditions`;
};

const getAfternoonForecast = (weather: WeatherData): string => {
  const afternoonHours = weather.forecast.hourly.filter(hour => {
    const hourNum = parseInt(hour.time.split(':')[0]);
    return hourNum >= 12 && hourNum < 18;
  });
  
  if (afternoonHours.length === 0) return "no data available";
  
  const conditions = afternoonHours.map(hour => hour.condition);
  const mostCommon = getMostCommonCondition(conditions);
  const avgTemp = Math.round(afternoonHours.reduce((sum, hour) => sum + hour.temperature, 0) / afternoonHours.length);
  
  return `${avgTemp}°C with ${mostCommon} conditions`;
};

const getEveningForecast = (weather: WeatherData): string => {
  const eveningHours = weather.forecast.hourly.filter(hour => {
    const hourNum = parseInt(hour.time.split(':')[0]);
    return hourNum >= 18 && hourNum < 22;
  });
  
  if (eveningHours.length === 0) return "no data available";
  
  const conditions = eveningHours.map(hour => hour.condition);
  const mostCommon = getMostCommonCondition(conditions);
  const avgTemp = Math.round(eveningHours.reduce((sum, hour) => sum + hour.temperature, 0) / eveningHours.length);
  
  return `${avgTemp}°C with ${mostCommon} conditions`;
};

// Get the most common weather condition from an array
const getMostCommonCondition = (conditions: string[]): string => {
  const counts: Record<string, number> = {};
  conditions.forEach(condition => {
    counts[condition] = (counts[condition] || 0) + 1;
  });
  
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])[0][0];
};

// Default insights when user has no history or is not logged in
const getDefaultInsights = (weather: WeatherData): string[] => {
  const insights: string[] = [];
  
  // Time-based greeting
  const hour = new Date().getHours();
  let greeting = "Good evening";
  if (hour >= 5 && hour < 12) greeting = "Good morning";
  else if (hour >= 12 && hour < 17) greeting = "Good afternoon";
  
  insights.push(`${greeting}! Today in ${weather.location.name}, expect ${weather.current.conditionText.toLowerCase()} conditions.`);
  
  // Temperature-based insight
  if (weather.current.temperature > 30) {
    insights.push("It's quite hot today. Stay hydrated and try to remain in shaded areas.");
  } else if (weather.current.temperature < 10) {
    insights.push("It's cold today. Remember to dress warmly if you're heading out.");
  }
  
  // Precipitation-based insight
  const willRain = weather.forecast.daily[0].day.precipitationProbability > 40;
  if (willRain) {
    insights.push("There's a good chance of rain today. Consider bringing an umbrella.");
  }
  
  return insights;
};
