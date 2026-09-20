"use client";
import { X, BarChart3 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const mockData = [
  { name: 'Mon', waterUsed: 4000, yieldExpected: 2400 },
  { name: 'Tue', waterUsed: 3000, yieldExpected: 1398 },
  { name: 'Wed', waterUsed: 2000, yieldExpected: 9800 },
  { name: 'Thu', waterUsed: 2780, yieldExpected: 3908 },
  { name: 'Fri', waterUsed: 1890, yieldExpected: 4800 },
  { name: 'Sat', waterUsed: 2390, yieldExpected: 3800 },
  { name: 'Sun', waterUsed: 3490, yieldExpected: 4300 },
];

export default function AnalyticsModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-900 text-white">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-emerald-400" />
            <h3 className="text-xl font-bold">Farm Analytics & Reporting</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-8 flex-1 overflow-y-auto">
          <h4 className="text-lg font-bold text-gray-800 mb-6">Weekly Water Usage vs. Expected Yield</h4>
          
          <div className="h-80 w-full bg-gray-50 rounded-2xl p-4 border border-gray-100">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={mockData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend />
                <Bar dataKey="waterUsed" name="Water Used (Liters)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="yieldExpected" name="Expected Yield (kg)" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
              <p className="text-emerald-800 font-medium text-sm">Total Water Saved</p>
              <p className="text-3xl font-black text-emerald-600 mt-2">1,240 L</p>
              <p className="text-xs text-emerald-700/70 mt-1">This week vs last week</p>
            </div>
            <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
              <p className="text-blue-800 font-medium text-sm">Avg Soil Moisture</p>
              <p className="text-3xl font-black text-blue-600 mt-2">42%</p>
              <p className="text-xs text-blue-700/70 mt-1">Optimal range maintained</p>
            </div>
            <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100">
              <p className="text-amber-800 font-medium text-sm">Action Items</p>
              <p className="text-3xl font-black text-amber-600 mt-2">2</p>
              <p className="text-xs text-amber-700/70 mt-1">Pending AI recommendations</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
