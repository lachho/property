
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowDown } from 'lucide-react';

const HeroSection = () => {
  const scrollToTools = () => {
    const toolsSection = document.getElementById('tools-section');
    if (toolsSection) {
      toolsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-h-[80vh] flex items-center">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-theme-blue/60 z-10"></div>
        <img 
          src="https://images.unsplash.com/photo-1487958449943-2429e8be8625?ixlib=rb-1.2.1&auto=format&fit=crop&w=2000&q=80" 
          alt="Property Development" 
          className="w-full h-full object-cover"
        />
      </div>
      
      {/* Content */}
      <div className="container-custom relative z-20 text-center md:text-left">
        <div className="max-w-3xl">
          <h1 className="heading-xl text-white mb-4">
            Smart Property Investment Solutions for Australians
          </h1>
          <p className="text-xl text-white/90 mb-8">
            Powerful tools to help you make informed decisions, maximize returns, and grow your property portfolio.
          </p>
          <Button 
            className="btn-primary text-lg group"
            onClick={scrollToTools}
          >
            Get Started Now
            <ArrowDown size={20} className="ml-2 group-hover:translate-y-1 transition-transform" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
