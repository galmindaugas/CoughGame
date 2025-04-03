import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { BarChart3 } from "lucide-react";

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
    <div className={`fixed inset-0 flex items-center justify-center p-4 z-50 transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <div className="absolute inset-0 bg-secondary bg-opacity-30 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white rounded-lg max-w-md w-full p-6 shadow-xl transform transition-all duration-300 scale-[1.02]">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary bg-opacity-10 rounded-full mb-4">
            <BarChart3 className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-secondary mb-2">Results</h2>
          <p className="text-secondary-medium mb-3">
            Here's how other participants responded:
          </p>
          <p className="text-primary font-medium italic mb-4 max-w-xs mx-auto">{stats.message}</p>
        </div>
        
        <div className="space-y-5 mb-8">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium flex items-center">
                <span className="w-3 h-3 bg-primary rounded-full mr-2"></span>
                Cough
              </span>
              <span className="text-sm font-medium">{stats.coughPercentage}%</span>
            </div>
            <div className="w-full bg-hyfe-lightgrey rounded-full h-3">
              <div
                className="bg-primary h-3 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${stats.coughPercentage}%` }}
              ></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium flex items-center">
                <span className="w-3 h-3 bg-secondary rounded-full mr-2"></span>
                Throat Clear
              </span>
              <span className="text-sm font-medium">{stats.throatClearPercentage}%</span>
            </div>
            <div className="w-full bg-hyfe-lightgrey rounded-full h-3">
              <div
                className="bg-secondary h-3 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${stats.throatClearPercentage}%` }}
              ></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium flex items-center">
                <span className="w-3 h-3 bg-hyfe-grey rounded-full mr-2"></span>
                Other
              </span>
              <span className="text-sm font-medium">{stats.otherPercentage}%</span>
            </div>
            <div className="w-full bg-hyfe-lightgrey rounded-full h-3">
              <div
                className="bg-hyfe-grey h-3 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${stats.otherPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>
        
        <div className="text-center">
          <Button
            onClick={onClose}
            className="bg-primary hover:bg-primary-hover text-secondary px-8 py-2 text-base font-medium shadow-md"
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FeedbackModal;
