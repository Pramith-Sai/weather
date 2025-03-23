
import { useState, useEffect, useRef } from 'react';
import { Search, X, MapPin, Loader2 } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LocationSearchResult } from '@/lib/types';
import { weatherApi } from '@/lib/weatherApi';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

interface SearchBarProps {
  onLocationSelect: (locationId: string) => void;
}

const SearchBar = ({ onLocationSelect }: SearchBarProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LocationSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { session } = useAuth();
  
  // Handle search query changes
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      setIsDropdownOpen(false);
      return;
    }
    
    const fetchResults = async () => {
      setIsSearching(true);
      try {
        const results = await weatherApi.searchLocations(searchQuery);
        setSearchResults(results);
        setIsDropdownOpen(results.length > 0);
      } catch (error) {
        console.error('Error searching locations:', error);
      } finally {
        setIsSearching(false);
      }
    };
    
    const debounceTimer = setTimeout(fetchResults, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);
  
  // Handle clicks outside of the search component
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setIsDropdownOpen(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };
  
  // Handle location selection
  const handleLocationSelect = async (locationId: string) => {
    onLocationSelect(locationId);
    setIsDropdownOpen(false);
    setSearchQuery('');
    
    // Save the selected location to the user profile if logged in
    if (session?.user) {
      try {
        const { error } = await supabase
          .from('profiles')
          .update({ location_id: locationId })
          .eq('id', session.user.id);
          
        if (error) {
          throw error;
        }
        
        toast.success("Location saved to your profile");
      } catch (err) {
        console.error('Error saving location:', err);
        toast.error("Couldn't save location to your profile");
      }
    }
  };
  
  return (
    <div ref={searchRef} className="relative w-full">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search size={16} className="text-gray-400" />
        </div>
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search for location"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => searchResults.length > 0 && setIsDropdownOpen(true)}
          className="pl-10 pr-10 h-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full focus:ring-2 focus:ring-primary/30 transition-all"
        />
        {searchQuery && (
          <div className="absolute inset-y-0 right-0 flex items-center">
            {isSearching ? (
              <Loader2 size={16} className="text-gray-400 mr-3 animate-spin" />
            ) : (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 mr-1"
                onClick={clearSearch}
              >
                <X size={16} className="text-gray-400" />
              </Button>
            )}
          </div>
        )}
      </div>
      
      {/* Search Results Dropdown */}
      {isDropdownOpen && (
        <div className="absolute z-10 mt-1 w-full glass-panel rounded-lg shadow-lg overflow-hidden animate-fade-up">
          <ul className="py-1 max-h-60 overflow-auto">
            {searchResults.map((result) => (
              <li key={result.id}>
                <button
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center"
                  onClick={() => handleLocationSelect(result.id)}
                >
                  <MapPin size={16} className="mr-2 text-primary flex-shrink-0" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">{result.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {result.region}, {result.country}
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
