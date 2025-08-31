import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface MMRDataPoint {
  date: string;
  mmr: number;
  rank: string;
  division?: string;
}

interface MMRHistoryGraphProps {
  data: MMRDataPoint[];
  gameMode: '1v1' | '2v2';
}

const MMRHistoryGraph: React.FC<MMRHistoryGraphProps> = ({ data, gameMode }) => {
  const formatTooltipLabel = (label: string) => {
    return new Date(label).toLocaleDateString();
  };

  const formatTooltipValue = (value: number) => {
    return [`${value} MMR`, 'MMR'];
  };

  const getLineColor = (mode: '1v1' | '2v2') => {
    return mode === '1v1' ? '#10b981' : '#8b5cf6'; // emerald-500 for 1v1, violet-500 for 2v2
  };

  if (!data || data.length === 0) {
    return (
      <div className="bg-gray-700 rounded-lg p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 text-lg mb-2">No MMR History Available</div>
          <div className="text-gray-500 text-sm">
            Play some ranked {gameMode} games to see your MMR progression
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-700 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-semibold text-white flex items-center gap-2">
          {gameMode} MMR History
        </h4>
        <div className="text-sm text-gray-400">
          {data.length} data points
        </div>
      </div>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="date" 
              tick={{ fill: '#9ca3af', fontSize: 12 }}
              tickFormatter={formatTooltipLabel}
              stroke="#6b7280"
            />
            <YAxis 
              tick={{ fill: '#9ca3af', fontSize: 12 }}
              stroke="#6b7280"
              domain={['dataMin - 50', 'dataMax + 50']}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1f2937',
                border: '1px solid #374151',
                borderRadius: '6px',
                color: '#f9fafb'
              }}
              labelFormatter={formatTooltipLabel}
              formatter={formatTooltipValue}
            />
            <Legend 
              wrapperStyle={{ color: '#f9fafb' }}
            />
            <Line
              type="monotone"
              dataKey="mmr"
              stroke={getLineColor(gameMode)}
              strokeWidth={2}
              dot={{ fill: getLineColor(gameMode), strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: getLineColor(gameMode), strokeWidth: 2 }}
              name={`${gameMode} MMR`}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-600">
        <div className="text-center">
          <div className="text-sm text-gray-400">Highest</div>
          <div className="text-lg font-semibold text-emerald-400">
            {Math.max(...data.map(d => d.mmr))}
          </div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-400">Current</div>
          <div className="text-lg font-semibold text-white">
            {data[data.length - 1]?.mmr || 0}
          </div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-400">Change</div>
          <div className={`text-lg font-semibold ${
            data.length >= 2 && data[data.length - 1]?.mmr >= data[0]?.mmr
              ? 'text-emerald-400' 
              : 'text-red-400'
          }`}>
            {data.length >= 2 
              ? `${data[data.length - 1]?.mmr - data[0]?.mmr >= 0 ? '+' : ''}${data[data.length - 1]?.mmr - data[0]?.mmr}`
              : '0'
            }
          </div>
        </div>
      </div>
    </div>
  );
};

export default MMRHistoryGraph;