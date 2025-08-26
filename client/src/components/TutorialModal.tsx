import { useState } from "react";
import { useGameStore } from "../lib/stores/useGameStore";
import { X, HelpCircle, ChevronLeft, ChevronRight, Zap, Trophy, Users } from "lucide-react";

const TutorialModal = () => {
  const { modalsOpen, setModalsOpen } = useGameStore();
  const [currentStep, setCurrentStep] = useState(0);

  const tutorialSteps = [
    {
      title: "Welcome to HighCard!",
      icon: <HelpCircle size={32} className="text-emerald-400" />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-300">
            HighCard is a competitive card game where strategy meets luck. Each player gets 8 regular cards and 2 powerful Power-Up cards to battle opponents across 10 intense rounds.
          </p>
          <div className="bg-gray-700 rounded-lg p-4">
            <h4 className="font-semibold text-white mb-2">Game Objective:</h4>
            <p className="text-sm text-gray-300">
              Win more rounds than your opponents by playing higher-value cards. Each round victory earns you points, while losses cost you points.
            </p>
          </div>
        </div>
      )
    },
    {
      title: "Card System",
      icon: <Zap size={32} className="text-yellow-400" />,
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-700 rounded-lg p-4">
              <h4 className="font-semibold text-white mb-2">Regular Cards</h4>
              <p className="text-sm text-gray-300 mb-3">Values: 2-14 (Ace = 14)</p>
              <div className="w-16 h-24 bg-white rounded-lg flex items-center justify-center border-2 border-gray-300 mx-auto">
                <div className="text-gray-900 font-bold">A</div>
              </div>
            </div>
            <div className="bg-gray-700 rounded-lg p-4">
              <h4 className="font-semibold text-white mb-2">Power-Up Cards</h4>
              <p className="text-sm text-gray-300 mb-3">Values: 16-18</p>
              <div className="w-16 h-24 power-card rounded-lg flex items-center justify-center mx-auto">
                <div className="text-white font-bold">17</div>
              </div>
            </div>
          </div>
          <div className="bg-blue-900/20 border border-blue-400 rounded-lg p-3">
            <p className="text-sm text-blue-300">
              💡 <strong>Pro Tip:</strong> Save your Power-Up cards for crucial moments - they're your strongest weapons!
            </p>
          </div>
        </div>
      )
    },
    {
      title: "Scoring System",
      icon: <Trophy size={32} className="text-yellow-400" />,
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-emerald-900/20 border border-emerald-400 rounded-lg p-4">
              <h4 className="font-semibold text-emerald-400 mb-2">Round Win</h4>
              <div className="text-2xl font-bold text-emerald-400 mb-1">+2 Points</div>
              <p className="text-sm text-gray-300">Play the highest card to win the round</p>
            </div>
            <div className="bg-red-900/20 border border-red-400 rounded-lg p-4">
              <h4 className="font-semibold text-red-400 mb-2">Round Loss</h4>
              <div className="text-2xl font-bold text-red-400 mb-1">-1 Point</div>
              <p className="text-sm text-gray-300">Your card wasn't the highest</p>
            </div>
          </div>
          <div className="bg-gray-700 rounded-lg p-4">
            <h4 className="font-semibold text-white mb-2">Winning the Match</h4>
            <p className="text-sm text-gray-300">
              After 10 rounds, the player (or team) with the most points wins the entire match. 
              Ties are possible but rare!
            </p>
          </div>
        </div>
      )
    },
    {
      title: "Game Modes",
      icon: <Users size={32} className="text-blue-400" />,
      content: (
        <div className="space-y-4">
          <div className="space-y-3">
            <div className="bg-blue-900/20 border border-blue-400 rounded-lg p-4">
              <h4 className="font-semibold text-blue-400 mb-2">1v1 Mode</h4>
              <p className="text-sm text-gray-300">
                Face off against a single AI opponent. Pure skill and strategy determine the winner.
              </p>
            </div>
            <div className="bg-purple-900/20 border border-purple-400 rounded-lg p-4">
              <h4 className="font-semibold text-purple-400 mb-2">2v2 Mode</h4>
              <p className="text-sm text-gray-300">
                Team up with an AI partner against two AI opponents. Your team's combined card values determine round winners.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-700 rounded-lg p-3 text-center">
              <h5 className="text-blue-400 font-medium">Casual</h5>
              <p className="text-xs text-gray-400">Practice and have fun</p>
            </div>
            <div className="bg-gray-700 rounded-lg p-3 text-center">
              <h5 className="text-emerald-400 font-medium">Ranked</h5>
              <p className="text-xs text-gray-400">Competitive play</p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Ranked System",
      icon: <Trophy size={32} className="text-emerald-400" />,
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="bg-gray-700 p-2 rounded text-center">
              <div className="rank-bronze font-bold">Bronze</div>
            </div>
            <div className="bg-gray-700 p-2 rounded text-center">
              <div className="rank-silver font-bold">Silver</div>
            </div>
            <div className="bg-gray-700 p-2 rounded text-center">
              <div className="rank-gold font-bold">Gold</div>
            </div>
            <div className="bg-gray-700 p-2 rounded text-center">
              <div className="rank-platinum font-bold">Platinum</div>
            </div>
            <div className="bg-gray-700 p-2 rounded text-center">
              <div className="rank-diamond font-bold">Diamond</div>
            </div>
            <div className="bg-gray-700 p-2 rounded text-center">
              <div className="rank-champion font-bold">Champion</div>
            </div>
          </div>
          <div className="bg-gray-700 p-2 rounded text-center">
            <div className="rank-grand-champion font-bold">Grand Champion</div>
          </div>
          <div className="bg-gray-700 p-2 rounded text-center">
            <div className="font-bold text-white">Card Legend</div>
            <div className="text-[11px] text-gray-300">Special prestige rank for elite players</div>
          </div>
          
          <div className="space-y-3">
            <div className="bg-yellow-900/20 border border-yellow-400 rounded-lg p-3">
              <h4 className="font-semibold text-yellow-400 mb-1">Placement Matches</h4>
              <p className="text-xs text-gray-300">
                Play 5 placement matches each season to determine your starting rank.
              </p>
            </div>
            <div className="bg-green-900/20 border border-green-400 rounded-lg p-3">
              <h4 className="font-semibold text-green-400 mb-1">Season Rewards</h4>
              <p className="text-xs text-gray-300">
                Earn rewards by winning 10 ranked matches at each rank tier.
              </p>
            </div>

          </div>
        </div>
      )
    },
    {
      title: "Strategy Tips",
      icon: <Zap size={32} className="text-purple-400" />,
      content: (
        <div className="space-y-4">
          <div className="space-y-3">
            <div className="bg-purple-900/20 border border-purple-400 rounded-lg p-4">
              <h4 className="font-semibold text-purple-400 mb-2">💡 Card Management</h4>
              <p className="text-sm text-gray-300">
                Don't waste high-value cards early. Save your Aces and Power-Ups for when you really need them.
              </p>
            </div>
            <div className="bg-blue-900/20 border border-blue-400 rounded-lg p-4">
              <h4 className="font-semibold text-blue-400 mb-2">🎯 Reading Opponents</h4>
              <p className="text-sm text-gray-300">
                AI opponents have different playing styles. Some are aggressive, others are conservative.
              </p>
            </div>
            <div className="bg-green-900/20 border border-green-400 rounded-lg p-4">
              <h4 className="font-semibold text-green-400 mb-2">⚖️ Risk vs Reward</h4>
              <p className="text-sm text-gray-300">
                Sometimes it's better to lose a round with a low card than waste a high card on a guaranteed loss.
              </p>
            </div>
          </div>
          <div className="text-center bg-gray-700 rounded-lg p-3">
            <p className="text-sm text-emerald-400 font-medium">
              Ready to play? Good luck and may the highest cards be yours! 🃏
            </p>
          </div>
        </div>
      )
    }
  ];

  if (!modalsOpen.tutorial) return null;

  const nextStep = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const closeTutorial = () => {
    setCurrentStep(0);
    setModalsOpen('tutorial', false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            {tutorialSteps[currentStep].icon}
            <div>
              <h2 className="text-xl font-bold text-white">
                {tutorialSteps[currentStep].title}
              </h2>
              <div className="text-sm text-gray-400">
                Step {currentStep + 1} of {tutorialSteps.length}
              </div>
            </div>
          </div>
          <button
            onClick={closeTutorial}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 pt-4">
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / tutorialSteps.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {tutorialSteps[currentStep].content}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center p-6 border-t border-gray-700">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              currentStep === 0
                ? 'text-gray-500 cursor-not-allowed'
                : 'text-gray-300 hover:text-white hover:bg-gray-700'
            }`}
          >
            <ChevronLeft size={20} />
            Previous
          </button>

          <div className="flex gap-2">
            {tutorialSteps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentStep ? 'bg-emerald-500' : 'bg-gray-600'
                }`}
              />
            ))}
          </div>

          {currentStep === tutorialSteps.length - 1 ? (
            <button
              onClick={closeTutorial}
              className="px-6 py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white rounded-lg transition-all duration-300"
            >
              Get Started!
            </button>
          ) : (
            <button
              onClick={nextStep}
              className="flex items-center gap-2 px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
            >
              Next
              <ChevronRight size={20} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TutorialModal;
