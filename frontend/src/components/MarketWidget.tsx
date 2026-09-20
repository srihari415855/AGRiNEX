"use client";
import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

type MarketData = {
  currency: string;
  unit: string;
  date: string;
  prices: {
    crop: string;
    price: number;
    trend: string;
  }[];
};

export default function MarketWidget({ token }: { token: string }) {
  const [market, setMarket] = useState<MarketData | null>(null);

  useEffect(() => {
    const fetchMarket = async () => {
      try {
        const res = await fetch("http://localhost:8000/data/market-prices", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) setMarket(await res.json());
      } catch (err) {
        console.error(err);
      }
    };
    if (token) fetchMarket();
  }, [token]);

  if (!market) return <div className="p-6 bg-white/60 rounded-3xl animate-pulse h-40"></div>;

  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col h-full">
      <div className="mb-4">
        <h3 className="text-xl font-bold text-gray-800">Market Intelligence</h3>
        <p className="text-gray-500 text-sm">{market.currency} {market.unit}</p>
      </div>
      
      <div className="flex-1 overflow-y-auto pr-2 space-y-3">
        {market.prices.map((item, idx) => (
          <div key={idx} className="flex justify-between items-center bg-gray-50 p-3 rounded-xl">
            <span className="font-semibold text-gray-700">{item.crop}</span>
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-900">{item.price}</span>
              {item.trend === "up" ? (
                <TrendingUp className="w-4 h-4 text-emerald-500" />
              ) : item.trend === "down" ? (
                <TrendingDown className="w-4 h-4 text-red-500" />
              ) : (
                <Minus className="w-4 h-4 text-gray-400" />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
