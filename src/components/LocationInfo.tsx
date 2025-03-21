
import { MapPin } from 'lucide-react';
import { Location } from '@/lib/types';

interface LocationInfoProps {
  location: Location;
  className?: string;
}

const LocationInfo = ({ location, className = "" }: LocationInfoProps) => {
  return (
    <div className={`inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm ${className}`}>
      <MapPin size={14} className="mr-1" />
      <span className="font-medium truncate max-w-[200px]">{location.name}, {location.region}, {location.country}</span>
    </div>
  );
};

export default LocationInfo;
