import { Gift, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useGameStore } from "../lib/stores/useGameStore";

const RewardModal = () => {
  const { rewardQueue, rewardModalOpen, popReward, setModalsOpen } = useGameStore();
  const [current, setCurrent] = useState<{ id: string; type: 'title'; name: string } | null>(null);

  useEffect(() => {
    if (rewardModalOpen && !current) {
      const next = popReward();
      if (next) setCurrent(next);
    }
  }, [rewardModalOpen, popReward, current]);

  if (!rewardModalOpen || !current) return null;

  const hasMore = rewardQueue.length > 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-lg max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <Gift size={22} className="text-yellow-300" />
            <h2 className="text-xl font-bold text-white">NEW ITEM: {current.type.toUpperCase()}</h2>
          </div>
          <button onClick={() => setCurrent(null)} className="text-gray-400 hover:text-white transition-colors">
            <X size={22} />
          </button>
        </div>
        <div className="p-6 text-center space-y-4">
          <div className="text-lg font-semibold text-white">{current.name}</div>
          <div className="mx-auto w-40 h-16 bg-gray-700 rounded flex items-center justify-center text-gray-200">
            Title Preview
          </div>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => {
                const next = popReward();
                setCurrent(next);
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded"
            >
              {hasMore ? 'Next' : 'OK'}
            </button>
            {hasMore && (
              <button
                onClick={() => setCurrent(null)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded"
              >
                OK to All
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RewardModal;


