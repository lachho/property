
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
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
          <Link to="/finance-calculator" className="text-gray-800 hover:text-theme-blue font-medium transition-colors">
            Finance Calculator
          </Link>
          <Link to="/portfolio-manager" className="text-gray-800 hover:text-theme-blue font-medium transition-colors">
            Portfolio Manager
          </Link>
          <Button className="bg-theme-blue hover:bg-theme-blue/90">
            Sign In
          </Button>
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
              to="/finance-calculator" 
              className="text-gray-800 hover:text-theme-blue font-medium transition-colors p-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Finance Calculator
            </Link>
            <Link 
              to="/portfolio-manager" 
              className="text-gray-800 hover:text-theme-blue font-medium transition-colors p-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Portfolio Manager
            </Link>
            <Button 
              className="bg-theme-blue hover:bg-theme-blue/90 w-full"
              onClick={() => setIsMenuOpen(false)}
            >
              Sign In
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
