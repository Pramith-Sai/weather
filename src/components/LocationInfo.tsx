
import { MapPin } from 'lucide-react';
import { Location } from '@/lib/types';

interface LocationInfoProps {
  location: Location;
}

const LocationInfo = ({ location }: LocationInfoProps) => {
  return (
    <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary">
      <MapPin size={16} className="mr-2" />
      <span className="font-medium">{location.name}, {location.region}, {location.country}</span>
    </div>
  );
};

export default LocationInfo;
