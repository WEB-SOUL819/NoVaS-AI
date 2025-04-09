
import React from "react";
import { Link } from "react-router-dom";

const currentYear = new Date().getFullYear();

const HynxFooter: React.FC = () => {
  return (
    <footer className="w-full border-t border-gray-800 bg-black/30 backdrop-blur-sm py-3 px-4">
      <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center">
        <div className="text-xs text-gray-500">
          &copy; {currentYear} Hynx Studios
        </div>
        
        <div className="flex items-center space-x-4 mt-2 sm:mt-0">
          <Link to="/privacy-policy" className="text-xs text-gray-500 hover:text-white transition-colors">
            Privacy Policy
          </Link>
          <Link to="/terms-of-service" className="text-xs text-gray-500 hover:text-white transition-colors">
            Terms of Service
          </Link>
          <Link to="/contact-us" className="text-xs text-gray-500 hover:text-white transition-colors">
            Contact Us
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default HynxFooter;
