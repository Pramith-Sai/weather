
import { useState, useEffect } from 'react';
import { WeatherData } from '@/lib/types';
import { useAuth } from '@/context/AuthContext';
import { getPersonalizedInsights, trackLocationView } from '@/lib/userInsightsService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Lightbulb, RefreshCw } from 'lucide-react';

interface PersonalizedInsightsProps {
  weatherData: WeatherData;
  locationId?: string;
}

const PersonalizedInsights = ({ weatherData, locationId }: PersonalizedInsightsProps) => {
  const [insights, setInsights] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { session } = useAuth();
  
  const fetchInsights = async () => {
    setIsLoading(true);
    try {
      const personalizedInsights = await getPersonalizedInsights(
        session?.user?.id, 
        weatherData
      );
      setInsights(personalizedInsights);
      
      // Track this location view for future insights if logged in
      if (session?.user?.id && locationId) {
        trackLocationView(session.user.id, locationId, weatherData);
      }
    } catch (err) {
      console.error('Error fetching personalized insights:', err);
      // Set fallback insights in case of error
      setInsights([
        `Weather today in ${weatherData.location.name}: ${weatherData.current.conditionText}`,
        `Current temperature: ${weatherData.current.temperature}°C`
      ]);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (weatherData) {
      fetchInsights();
    }
  }, [weatherData, session?.user?.id]);
  
  if (insights.length === 0 && !isLoading) {
    return null;
  }
  
  return (
    <Card className="glass-panel hover:shadow-lg transition-all">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium flex items-center">
          <Lightbulb size={18} className="mr-2 text-yellow-400" />
          Personalized Insights
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={fetchInsights} disabled={isLoading}>
          <RefreshCw size={16} className={`mr-1 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-4">
            <RefreshCw size={24} className="animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-3">
            {insights.map((insight, index) => (
              <div key={index} className="flex items-start">
                <ArrowRight size={16} className="mr-2 mt-1 flex-shrink-0 text-primary" />
                <p className="text-sm text-muted-foreground">{insight}</p>
              </div>
            ))}
            {!session?.user && (
              <p className="text-xs text-muted-foreground italic mt-4">
                Sign in to get more personalized weather insights based on your usage patterns.
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PersonalizedInsights;
