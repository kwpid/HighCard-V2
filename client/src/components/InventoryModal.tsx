import { X, Tag } from "lucide-react";
import { useGameStore } from "../lib/stores/useGameStore";
import { usePlayerStore } from "../lib/stores/usePlayerStore";

const InventoryModal = () => {
  const { modalsOpen, setModalsOpen } = useGameStore();
  const { playerStats, equipTitle } = usePlayerStore();

  if (!modalsOpen.inventory) return null;

  const titles = playerStats.ownedTitles || [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-lg max-w-xl w-full max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <Tag size={22} className="text-gray-300" />
            <h2 className="text-xl font-bold text-white">Inventory • Titles</h2>
          </div>
          <button onClick={() => setModalsOpen('inventory', false)} className="text-gray-400 hover:text-white transition-colors">
            <X size={22} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <button
              onClick={() => equipTitle(null)}
              className={`w-full mb-4 px-4 py-2 rounded-lg border ${playerStats.equippedTitleId === null ? 'border-emerald-500 text-white' : 'border-gray-600 text-gray-300'} hover:border-emerald-500`}
            >
              Equip No Title
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {titles.length === 0 && (
                <div className="text-gray-400">No titles owned yet. Play to earn rewards!</div>
              )}
              {titles.map((t) => (
                <div key={t.id} className={`border rounded-lg p-4 ${playerStats.equippedTitleId === t.id ? 'border-emerald-500' : 'border-gray-700'}`}>
                  <div className="text-white font-semibold mb-2">{t.name}</div>
                  <div className="text-xs text-gray-400 mb-3">{t.type === 'ranked' ? 'Ranked Reward' : 'Regular Title'}</div>
                  <button
                    onClick={() => equipTitle(t.id)}
                    className={`w-full px-3 py-2 rounded ${playerStats.equippedTitleId === t.id ? 'bg-emerald-600 text-white' : 'bg-gray-700 text-gray-200 hover:bg-gray-600'}`}
                  >
                    {playerStats.equippedTitleId === t.id ? 'Equipped' : 'Equip'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryModal;


