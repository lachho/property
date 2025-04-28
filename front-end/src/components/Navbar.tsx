import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, User, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleSignInClick = () => {
    navigate('/auth');
    if (isMenuOpen) setIsMenuOpen(false);
  };

  const handleSignOutClick = async () => {
    await signOut();
    if (isMenuOpen) setIsMenuOpen(false);
  };

  return (
    <nav className="bg-white py-4 shadow-sm sticky top-0 z-50">
      <div className="container-custom flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <span className="text-theme-blue text-2xl font-bold">PropertyPathfinder</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          <Link to="/borrowing-capacity" className="text-gray-800 hover:text-theme-blue font-medium transition-colors">
            Borrowing Capacity
          </Link>
          <Link to="/mortgage-calculator" className="text-gray-800 hover:text-theme-blue font-medium transition-colors">
            Mortgage Calculator
          </Link>
          <Link to="/portfolio-manager" className="text-gray-800 hover:text-theme-blue font-medium transition-colors">
            Portfolio Manager
          </Link>
          
          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {profile?.role === 'ADMIN' ? 'Admin' : 'Client'}: {user.email}
              </span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSignOutClick}
                className="flex items-center gap-2"
              >
                <LogOut size={16} />
                Sign Out
              </Button>
            </div>
          ) : (
            <Button onClick={handleSignInClick} className="bg-theme-blue hover:bg-theme-blue/90">
              Sign In
            </Button>
          )}
        </div>

        {/* Mobile menu button */}
        <button 
          onClick={toggleMenu}
          className="md:hidden text-gray-800 focus:outline-none"
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-white absolute top-16 left-0 right-0 shadow-md z-50">
          <div className="container-custom py-4 flex flex-col space-y-4">
            <Link 
              to="/borrowing-capacity" 
              className="text-gray-800 hover:text-theme-blue font-medium transition-colors p-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Borrowing Capacity
            </Link>
            <Link 
              to="/mortgage-calculator" 
              className="text-gray-800 hover:text-theme-blue font-medium transition-colors p-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Mortgage Calculator
            </Link>
            <Link 
              to="/portfolio-manager" 
              className="text-gray-800 hover:text-theme-blue font-medium transition-colors p-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Portfolio Manager
            </Link>
            
            {user ? (
              <>
                <div className="p-2">
                  <p className="text-sm text-gray-600">
                    {profile?.role === 'ADMIN' ? 'Admin' : 'Client'}: {user.email}
                  </p>
                </div>
                <Button 
                  variant="outline"
                  onClick={handleSignOutClick}
                  className="w-full flex items-center justify-center gap-2"
                >
                  <LogOut size={16} />
                  Sign Out
                </Button>
              </>
            ) : (
              <Button 
                className="bg-theme-blue hover:bg-theme-blue/90 w-full"
                onClick={handleSignInClick}
              >
                Sign In
              </Button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
