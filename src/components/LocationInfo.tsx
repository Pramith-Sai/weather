
import { MapPin } from 'lucide-react';
import { Location } from '@/lib/types';

interface LocationInfoProps {
  location: Location;
}

const LocationInfo = ({ location }: LocationInfoProps) => {
  return (
    <>
      <MapPin size={16} className="mr-2" />
      <span className="font-medium">{location.name}, {location.region}, {location.country}</span>
    </>
  );
};

export default LocationInfo;
