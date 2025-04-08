
import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <motion.footer 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-gray-900 border-t border-gray-800 py-8"
    >
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h3 className="text-xl font-bold text-white">Hynx Studios</h3>
            <p className="text-gray-400 text-sm mt-1">
              Powering the future of automation
            </p>
          </div>
          
          <div className="flex space-x-6">
            <Link to="/dashboard" className="text-gray-400 hover:text-white transition-colors">
              Dashboard
            </Link>
            <Link to="/automation" className="text-gray-400 hover:text-white transition-colors">
              Automation
            </Link>
            <Link to="/profile" className="text-gray-400 hover:text-white transition-colors">
              Profile
            </Link>
            <Link to="/settings" className="text-gray-400 hover:text-white transition-colors">
              Settings
            </Link>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-6 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm">
            &copy; {currentYear} Hynx Studios. All rights reserved.
          </p>
          
          <div className="flex space-x-4 mt-4 md:mt-0">
            <a href="#" className="text-gray-500 hover:text-white transition-colors text-sm">
              Privacy Policy
            </a>
            <a href="#" className="text-gray-500 hover:text-white transition-colors text-sm">
              Terms of Service
            </a>
            <a href="#" className="text-gray-500 hover:text-white transition-colors text-sm">
              Contact Us
            </a>
          </div>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;
