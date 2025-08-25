import { useState } from "react";
import { useGameStore } from "../lib/stores/useGameStore";
import { X, Settings, Volume2, VolumeX } from "lucide-react";

const SettingsModal = () => {
  const { modalsOpen, setModalsOpen } = useGameStore();
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [musicVolume, setMusicVolume] = useState(50);
  const [sfxVolume, setSfxVolume] = useState(70);
  const [animations, setAnimations] = useState(true);

  if (!modalsOpen.settings) return null;

  const handleSave = () => {
    // Save settings to localStorage
    const settings = {
      soundEnabled,
      musicVolume,
      sfxVolume,
      animations,
    };
    localStorage.setItem('highcard-settings', JSON.stringify(settings));
    setModalsOpen('settings', false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-lg max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <Settings size={24} className="text-gray-400" />
            <h2 className="text-xl font-bold text-white">Settings</h2>
          </div>
          <button
            onClick={() => setModalsOpen('settings', false)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Audio Settings */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
              Audio
            </h3>
            
            {/* Master Sound Toggle */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-300">Enable Sound</span>
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-gray-800 ${
                  soundEnabled ? 'bg-emerald-600' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    soundEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Volume Controls */}
            <div className={`space-y-4 ${!soundEnabled ? 'opacity-50' : ''}`}>
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Music Volume: {musicVolume}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={musicVolume}
                  onChange={(e) => setMusicVolume(Number(e.target.value))}
                  disabled={!soundEnabled}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Sound Effects: {sfxVolume}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={sfxVolume}
                  onChange={(e) => setSfxVolume(Number(e.target.value))}
                  disabled={!soundEnabled}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
            </div>
          </div>

          {/* Visual Settings */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Visual</h3>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Enable Animations</span>
              <button
                onClick={() => setAnimations(!animations)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-gray-800 ${
                  animations ? 'bg-emerald-600' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    animations ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Game Info */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Game Information</h3>
            <div className="space-y-2 text-sm text-gray-400">
              <div>Version: 1.0.0</div>
              <div>Build: Pre-Season</div>
              <div>Theme: Dark Mode (Default)</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-700">
          <button
            onClick={() => setModalsOpen('settings', false)}
            className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white rounded-lg transition-all duration-300"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
