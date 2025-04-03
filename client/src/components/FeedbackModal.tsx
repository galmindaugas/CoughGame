import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface FeedbackModalProps {
  stats: {
    coughPercentage: number;
    throatClearPercentage: number;
    otherPercentage: number;
    message: string;
  };
  onClose: () => void;
}

const FeedbackModal = ({ stats, onClose }: FeedbackModalProps) => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    setIsVisible(true);
  }, []);
  
  return (
    <div className={`fixed inset-0 flex items-center justify-center p-4 z-50 transition-opacity duration-200 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      <div className="relative bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6 shadow-xl">
        <div className="text-center mb-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary bg-opacity-10 rounded-full mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-primary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-2">Results</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            Here's how other participants responded:
          </p>
          <p className="text-secondary italic mb-4">{stats.message}</p>
        </div>
        
        <div className="space-y-4 mb-6">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium flex items-center">
                <span className="w-3 h-3 bg-blue-500 rounded-full mr-1"></span>
                Cough
              </span>
              <span className="text-sm font-medium">{stats.coughPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
              <div
                className="bg-blue-500 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${stats.coughPercentage}%` }}
              ></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium flex items-center">
                <span className="w-3 h-3 bg-orange-500 rounded-full mr-1"></span>
                Throat Clear
              </span>
              <span className="text-sm font-medium">{stats.throatClearPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
              <div
                className="bg-orange-500 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${stats.throatClearPercentage}%` }}
              ></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium flex items-center">
                <span className="w-3 h-3 bg-gray-500 rounded-full mr-1"></span>
                Other
              </span>
              <span className="text-sm font-medium">{stats.otherPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
              <div
                className="bg-gray-500 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${stats.otherPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>
        
        <div className="text-center">
          <Button
            onClick={onClose}
            className="bg-primary hover:bg-opacity-90 text-white font-medium py-3 px-6"
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FeedbackModal;
