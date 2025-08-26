import React from 'react';
import { getRankImagePath } from '../lib/utils';
import { RANKS } from '../lib/constants';

interface RankImageProps {
  rankName: string;
  division?: string | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showText?: boolean;
  showHighestDivision?: boolean; // New prop for showing highest division when no specific division is provided
}

const RankImage: React.FC<RankImageProps> = ({ 
  rankName, 
  division, 
  size = 'md', 
  className = '',
  showText = false,
  showHighestDivision = false
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  // For reference display (like rank ladder), show highest division if no specific division is provided
  let displayDivision = division;
  if (showHighestDivision && !division) {
    // Get the highest division for this rank
    const rankData = RANKS.find(r => r.name === rankName);
    if (rankData && rankData.divisions.length > 0) {
      displayDivision = rankData.divisions[rankData.divisions.length - 1]; // Last division is highest (III)
    }
  }
  
  const imagePath = getRankImagePath(rankName, displayDivision);
  
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    // Fallback to colored text if image fails to load
    e.currentTarget.style.display = 'none';
    const fallbackElement = e.currentTarget.nextElementSibling as HTMLElement;
    if (fallbackElement) {
      fallbackElement.style.display = 'flex';
    }
  };

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="relative">
        <img
          src={imagePath}
          alt={`${rankName} ${division || ''}`.trim()}
          className={`${sizeClasses[size]} object-contain`}
          onError={handleImageError}
        />
        {/* Fallback text display */}
        <div 
          className={`${sizeClasses[size]} hidden items-center justify-center rounded bg-gray-700 border border-gray-600`}
          style={{ display: 'none' }}
        >
          <div className={`font-bold text-center ${textSizes[size]} ${getRankColorClass(rankName)}`}>
            {rankName}
            {division && <div className="text-xs text-gray-300">{division}</div>}
          </div>
        </div>
      </div>
      
      {showText && (
        <div className={`text-center mt-1 ${textSizes[size]}`}>
          <div className={`font-medium ${getRankColorClass(rankName)}`}>
            {rankName}
          </div>
          {division && (
            <div className="text-gray-400 text-xs">{division}</div>
          )}
        </div>
      )}
    </div>
  );
};

// Helper function to get rank color classes
const getRankColorClass = (rankName: string): string => {
  const rankColors: Record<string, string> = {
    'Bronze': 'text-[#cd7f32]',
    'Silver': 'text-[#c0c0c0]',
    'Gold': 'text-[#ffd700]',
    'Platinum': 'text-[#e5e4e2]',
    'Diamond': 'text-[#b9f2ff]',
    'Champion': 'text-[#9d4edd]',
    'Grand Champion': 'text-[#ff006e]',
    'Supersonic Legend': 'text-white'
  };
  
  return rankColors[rankName] || 'text-gray-200';
};

export default RankImage;
