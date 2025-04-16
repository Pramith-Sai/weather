
import { WeatherData } from './types';
import { supabase } from '@/integrations/supabase/client';

// Track when a user views the weather for a location
export const trackLocationView = async (userId: string | undefined, locationId: string, weatherData: WeatherData) => {
  if (!userId) return;
  
  try {
    // Store the user's location view preference in their profile instead of a non-existent location_views table
    const { error } = await supabase
      .from('profiles')
      .update({
        location_id: locationId,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);
      
    if (error) throw error;
  } catch (err) {
    console.error('Error tracking location view:', err);
  }
};

// Get personalized insights based on user's viewing patterns
export const getPersonalizedInsights = async (userId: string | undefined, currentWeather: WeatherData): Promise<string[]> => {
  // If user is not logged in, return default insights
  if (!userId) return getDefaultInsights(currentWeather);
  
  try {
    // Get user's profile with their saved location
    const { data: userProfile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (error) throw error;
    
    // If we don't have enough data to create personalized insights, return defaults
    if (!userProfile || !userProfile.location_id) {
      return getDefaultInsights(currentWeather);
    }
    
    // Generate personalized insights based on the user's saved location and current weather
    const insights: string[] = [];
    
    // Add a personalization message if the user has a saved location
    if (userProfile.location_id) {
      insights.push(`Welcome back! You're viewing weather for ${currentWeather.location.name}, which appears to be a location you're interested in.`);
    }
    
    // Time-based personalization
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      insights.push("Good morning! Today's morning forecast shows " + getMorningForecast(currentWeather));
    } else if (hour >= 12 && hour < 17) {
      insights.push("Good afternoon! The rest of today looks " + getAfternoonForecast(currentWeather));
    } else if (hour >= 17 && hour < 22) {
      insights.push("Good evening! Tonight will be " + getEveningForecast(currentWeather));
    } else {
      insights.push("It's late night. Tomorrow's forecast shows " + getTomorrowForecast(currentWeather));
    }
    
    // Temperature-based insight
    if (currentWeather.current.temperature > 30) {
      insights.push("It's warmer than usual today. Consider dressing lighter and staying hydrated.");
    } else if (currentWeather.current.temperature < 10) {
      insights.push("It's cooler than usual today. Consider bringing a jacket with you.");
    }
    
    // Add a fallback insight if we couldn't generate any specific ones
    if (insights.length < 2) {
      const defaultInsights = getDefaultInsights(currentWeather);
      insights.push(defaultInsights[0]);
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

// New helper function for tomorrow's forecast
const getTomorrowForecast = (weather: WeatherData): string => {
  if (weather.forecast.daily.length < 2) return "no data available for tomorrow";
  
  const tomorrow = weather.forecast.daily[1].day;
  return `a high of ${tomorrow.maxTemp}°C and ${tomorrow.conditionText.toLowerCase()} conditions`;
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
