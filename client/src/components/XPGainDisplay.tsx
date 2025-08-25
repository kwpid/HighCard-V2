import { useState, useEffect } from "react";
import { Star, Zap, TrendingUp } from "lucide-react";
import XPProgress from "./XPProgress";
import { XPProgress as XPProgressType } from "../lib/xpSystem";

interface XPGainDisplayProps {
  xpGained: number;
  previousXPProgress: XPProgressType;
  currentXPProgress: XPProgressType;
  onClose: () => void;
}

const XPGainDisplay = ({ 
  xpGained, 
  previousXPProgress, 
  currentXPProgress, 
  onClose 
}: XPGainDisplayProps) => {
  const [showAnimation, setShowAnimation] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);
  
  const leveledUp = currentXPProgress.level > previousXPProgress.level;

  useEffect(() => {
    // Show XP gain animation
    setTimeout(() => setShowAnimation(true), 500);
    
    // Show level up animation if applicable
    if (leveledUp) {
      setTimeout(() => setShowLevelUp(true), 1500);
    }
    
    // Auto close after 5 seconds
    setTimeout(() => onClose(), 5000);
  }, [leveledUp, onClose]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
        {/* XP Gain Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Zap className="w-6 h-6 text-yellow-400" />
            <h2 className="text-xl font-bold text-white">Experience Gained!</h2>
          </div>
          
          <div className={`text-3xl font-bold transition-all duration-1000 ${
            showAnimation ? 'text-emerald-400 scale-110' : 'text-gray-400 scale-100'
          }`}>
            +{xpGained} XP
          </div>
        </div>

        {/* Level Up Notification */}
        {leveledUp && (
          <div className={`mb-6 p-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-center transition-all duration-1000 ${
            showLevelUp ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}>
            <div className="flex items-center justify-center gap-2 mb-2">
              <Star className="w-6 h-6 text-yellow-300" />
              <span className="text-lg font-bold text-white">Level Up!</span>
            </div>
            <div className="text-2xl font-bold text-white">
              Level {previousXPProgress.level} → Level {currentXPProgress.level}
            </div>
            <div className="text-sm text-blue-100 mt-1">
              Congratulations! You've reached a new level!
            </div>
          </div>
        )}

        {/* XP Progress */}
        <div className="mb-6">
          <XPProgress xpProgress={currentXPProgress} showDetails={true} />
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 
                   text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300"
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default XPGainDisplay;
