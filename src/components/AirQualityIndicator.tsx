
import { AirQuality } from '@/lib/types';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';

interface AirQualityIndicatorProps {
  airQuality: AirQuality;
  size?: 'sm' | 'md' | 'lg';
}

const AirQualityIndicator = ({ airQuality, size = 'md' }: AirQualityIndicatorProps) => {
  const sizeClass = {
    sm: 'w-16 h-16 text-xl',
    md: 'w-24 h-24 text-3xl',
    lg: 'w-32 h-32 text-4xl'
  };

  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center gap-1 mb-2">
        <h3 className="font-medium text-sm">Air Quality</h3>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Info size={14} className="text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent className="max-w-80">
              <div className="space-y-2">
                <p className="font-medium text-sm">Air Quality Index (US EPA)</p>
                <ul className="text-xs space-y-1">
                  <li><span className="inline-block w-3 h-3 rounded-full bg-[#4ade80] mr-2"></span>
                    0-50: Good
                  </li>
                  <li><span className="inline-block w-3 h-3 rounded-full bg-[#facc15] mr-2"></span>
                    51-100: Moderate
                  </li>
                  <li><span className="inline-block w-3 h-3 rounded-full bg-[#fb923c] mr-2"></span>
                    101-150: Unhealthy for Sensitive Groups
                  </li>
                  <li><span className="inline-block w-3 h-3 rounded-full bg-[#f87171] mr-2"></span>
                    151-200: Unhealthy
                  </li>
                  <li><span className="inline-block w-3 h-3 rounded-full bg-[#c084fc] mr-2"></span>
                    201-300: Very Unhealthy
                  </li>
                  <li><span className="inline-block w-3 h-3 rounded-full bg-[#7f1d1d] mr-2"></span>
                    301+: Hazardous
                  </li>
                </ul>
                {airQuality.pm2_5 && (
                  <p className="text-xs">PM2.5: {airQuality.pm2_5} μg/m³</p>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <div 
        className={`${sizeClass[size]} rounded-full flex items-center justify-center font-bold text-white relative shadow-lg`}
        style={{ 
          backgroundColor: airQuality.color,
          background: `radial-gradient(circle at center, ${airQuality.color}cc, ${airQuality.color})`,
        }}
      >
        {airQuality.index}
        <div className="absolute inset-0 rounded-full border-4 border-white/20"></div>
      </div>
      <p className="mt-2 text-sm font-medium">{airQuality.level}</p>
    </div>
  );
};

export default AirQualityIndicator;
