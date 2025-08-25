import { Zap } from "lucide-react";

interface GameCard {
  id: string;
  value: number;
  isPowerUp: boolean;
  used: boolean;
}

interface CardProps {
  card: GameCard;
  isSelected: boolean;
  onSelect: (cardId: string) => void;
  disabled?: boolean;
}

const Card = ({ card, isSelected, onSelect, disabled = false }: CardProps) => {
  const getCardValueDisplay = (value: number): string => {
    if (value >= 16) return 'PWR';
    if (value === 14) return 'A';
    if (value === 13) return 'K';
    if (value === 12) return 'Q';
    if (value === 11) return 'J';
    return value.toString();
  };

  const getSuitSymbol = (value: number): string => {
    if (value >= 16) return '';
    const suits = ['♠', '♥', '♦', '♣'];
    return suits[value % 4];
  };

  return (
    <div
      onClick={() => !disabled && onSelect(card.id)}
      className={`
        relative w-20 h-28 rounded-lg border-2 cursor-pointer transition-all duration-300 card-hover
        ${card.isPowerUp 
          ? 'power-card border-yellow-400' 
          : 'bg-white border-gray-300 text-gray-900'
        }
        ${isSelected ? 'neon-border neon-glow transform -translate-y-2' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${card.used ? 'opacity-30 grayscale' : ''}
      `}
    >
      {/* Card Value */}
      <div className="absolute top-1 left-1">
        <div className={`text-sm font-bold ${card.isPowerUp ? 'text-white' : 'text-gray-900'}`}>
          {getCardValueDisplay(card.value)}
        </div>
        {!card.isPowerUp && (
          <div className={`text-xs ${
            getSuitSymbol(card.value) === '♥' || getSuitSymbol(card.value) === '♦' 
              ? 'text-red-600' 
              : 'text-gray-900'
          }`}>
            {getSuitSymbol(card.value)}
          </div>
        )}
      </div>

      {/* Power-up indicator */}
      {card.isPowerUp && (
        <div className="absolute top-1 right-1">
          <Zap size={14} className="text-white" />
        </div>
      )}

      {/* Center value for power-ups */}
      {card.isPowerUp && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-2xl font-bold text-white">
            {card.value}
          </div>
        </div>
      )}

      {/* Bottom value (rotated) */}
      <div className="absolute bottom-1 right-1 transform rotate-180">
        <div className={`text-sm font-bold ${card.isPowerUp ? 'text-white' : 'text-gray-900'}`}>
          {getCardValueDisplay(card.value)}
        </div>
        {!card.isPowerUp && (
          <div className={`text-xs ${
            getSuitSymbol(card.value) === '♥' || getSuitSymbol(card.value) === '♦' 
              ? 'text-red-600' 
              : 'text-gray-900'
          }`}>
            {getSuitSymbol(card.value)}
          </div>
        )}
      </div>

      {/* Used overlay */}
      {card.used && (
        <div className="absolute inset-0 bg-gray-900 bg-opacity-75 rounded-lg flex items-center justify-center">
          <div className="text-white font-bold text-xs">USED</div>
        </div>
      )}

      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute -top-1 -left-1 w-22 h-30 border-2 border-emerald-400 rounded-lg animate-pulse" />
      )}
    </div>
  );
};

export default Card;
