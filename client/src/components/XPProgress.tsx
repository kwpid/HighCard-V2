import { Progress } from "./ui/progress";
import { Star, Trophy } from "lucide-react";
import { XPProgress as XPProgressType } from "../lib/xpSystem";

interface XPProgressProps {
  xpProgress: XPProgressType;
  showDetails?: boolean;
  className?: string;
}

const XPProgress = ({ xpProgress, showDetails = true, className = "" }: XPProgressProps) => {
  const { level, currentXP, xpToNextLevel, progressPercentage } = xpProgress;

  return (
    <div className={`bg-gray-800 rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Star className="w-5 h-5 text-yellow-400" />
            <span className="absolute -top-1 -right-1 text-xs font-bold text-white bg-blue-600 rounded-full w-4 h-4 flex items-center justify-center">
              {level}
            </span>
          </div>
          <span className="text-white font-semibold">Level {level}</span>
        </div>
        
        {showDetails && (
          <div className="text-right">
            <div className="text-sm text-gray-400">XP Progress</div>
            <div className="text-xs text-gray-500">
              {currentXP} / {xpToNextLevel}
            </div>
          </div>
        )}
      </div>
      
      <Progress 
        value={progressPercentage} 
        className="h-3 bg-gray-700"
      />
      
      {showDetails && (
        <div className="mt-2 text-center">
          <div className="text-xs text-gray-400">
            {Math.round(progressPercentage)}% to Level {level + 1}
          </div>
        </div>
      )}
    </div>
  );
};

export default XPProgress;
