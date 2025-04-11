
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const CTASection = () => {
  return (
    <section className="bg-theme-blue py-16">
      <div className="container-custom text-center md:text-left">
        <div className="md:flex items-center justify-between">
          <div className="mb-8 md:mb-0 md:max-w-xl">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to optimize your property investments?
            </h2>
            <p className="text-white/90 text-lg">
              Get started with our powerful tools today and make data-driven investment decisions.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button className="bg-white text-theme-blue hover:bg-gray-100 text-lg">
              Start Free Trial
            </Button>
            <Button className="bg-transparent border-2 border-white text-white hover:bg-white/10 text-lg">
              Learn More
              <ArrowRight size={20} className="ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
