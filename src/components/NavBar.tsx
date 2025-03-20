import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Moon, Sun, User, LogOut } from 'lucide-react';
import { Button } from "@/components/ui/button";
import SearchBar from './SearchBar';
import { useAuth } from '@/context/AuthContext';
interface NavBarProps {
  onLocationSelect: (locationId: string) => void;
}
const NavBar = ({
  onLocationSelect
}: NavBarProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const {
    session,
    signOut
  } = useAuth();
  const navigate = useNavigate();

  // Handle scroll event to change navbar appearance
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Toggle theme between light and dark
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark');
  };
  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };
  return <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg shadow-sm' : 'bg-transparent'}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="text-2xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-400">
              Weather
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-primary dark:hover:text-primary transition-colors">
              Today
            </Link>
            <a href="#" className="text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-primary dark:hover:text-primary transition-colors">
              Hourly
            </a>
            <a href="#" className="text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-primary dark:hover:text-primary transition-colors">7 Day</a>
            <a href="#" className="text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-primary dark:hover:text-primary transition-colors">
              Radar
            </a>
          </nav>
          
          {/* Search and Auth Controls */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="w-64">
              <SearchBar onLocationSelect={onLocationSelect} />
            </div>
            <Button variant="ghost" size="icon" className="rounded-full" onClick={toggleTheme}>
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </Button>
            
            {session.user ? <Button variant="outline" size="sm" onClick={handleSignOut} className="ml-2">
                <LogOut size={16} className="mr-2" /> Sign Out
              </Button> : <Button variant="outline" size="sm" onClick={() => navigate('/auth')} className="ml-2">
                <User size={16} className="mr-2" /> Sign In
              </Button>}
          </div>
          
          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isMobileMenuOpen && <div className="md:hidden glass-panel animate-fade-in">
          <div className="px-4 pt-2 pb-4 space-y-4">
            <SearchBar onLocationSelect={onLocationSelect} />
            
            <div className="grid grid-cols-2 gap-2 pt-2">
              <Link to="/" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-primary dark:hover:text-primary transition-colors">
                Today
              </Link>
              <a href="#" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-primary dark:hover:text-primary transition-colors">
                Hourly
              </a>
              <a href="#" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-primary dark:hover:text-primary transition-colors">
                10 Day
              </a>
              <a href="#" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-primary dark:hover:text-primary transition-colors">
                Radar
              </a>
              <div className="col-span-2 flex justify-between pt-2">
                <Button variant="outline" className="w-1/2 justify-center mr-2" onClick={toggleTheme}>
                  {theme === 'light' ? <><Moon size={16} className="mr-2" /> Dark Mode</> : <><Sun size={16} className="mr-2" /> Light Mode</>}
                </Button>
                
                {session.user ? <Button variant="outline" className="w-1/2 justify-center" onClick={handleSignOut}>
                    <LogOut size={16} className="mr-2" /> Sign Out
                  </Button> : <Button variant="outline" className="w-1/2 justify-center" onClick={() => navigate('/auth')}>
                    <User size={16} className="mr-2" /> Sign In
                  </Button>}
              </div>
            </div>
          </div>
        </div>}
    </header>;
};
export default NavBar;