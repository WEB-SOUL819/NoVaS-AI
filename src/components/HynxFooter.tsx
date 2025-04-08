
import React from "react";
import { HeartIcon } from "lucide-react";

const currentYear = new Date().getFullYear();

const HynxFooter: React.FC = () => {
  return (
    <footer className="w-full border-t border-gray-800 bg-black/30 backdrop-blur-sm py-4 px-6">
      <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center">
        <div className="flex items-center mb-3 sm:mb-0">
          <span className="text-sm text-gray-400">
            &copy; {currentYear} Hynx Studios. All rights reserved.
          </span>
        </div>
        
        <div className="flex items-center space-x-4">
          <span className="text-xs text-gray-500 flex items-center">
            Made with <HeartIcon className="h-3 w-3 text-red-500 mx-1" /> by Hynx Studios
          </span>
        </div>
      </div>
    </footer>
  );
};

export default HynxFooter;
