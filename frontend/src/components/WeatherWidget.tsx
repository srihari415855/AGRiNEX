"use client";
import { useEffect, useState } from "react";
import { CloudRain, Sun, Cloud, Thermometer, Wind, Droplets } from "lucide-react";

type WeatherData = {
  location: string;
  current: {
    temp: number;
    condition: string;
    humidity: number;
    wind_kph: number;
  };
  forecast: {
    date: string;
    condition: string;
    temp_high: number;
    temp_low: number;
    precipitation_chance: number;
  }[];
};

export default function WeatherWidget({ token }: { token: string }) {
  const [weather, setWeather] = useState<WeatherData | null>(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const res = await fetch("http://localhost:8000/data/weather", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) setWeather(await res.json());
      } catch (err) {
        console.error(err);
      }
    };
    if (token) fetchWeather();
  }, [token]);

  if (!weather) return <div className="p-6 bg-white/60 rounded-3xl animate-pulse h-40"></div>;

  const renderIcon = (condition: string) => {
    if (condition.includes("Rain")) return <CloudRain className="w-10 h-10 text-blue-500" />;
    if (condition.includes("Cloud")) return <Cloud className="w-10 h-10 text-gray-500" />;
    return <Sun className="w-10 h-10 text-yellow-500" />;
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-3xl shadow-sm border border-blue-100 flex flex-col justify-between h-full">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-800">Farm Weather</h3>
          <p className="text-gray-500 text-sm">{weather.location}</p>
        </div>
        {renderIcon(weather.current.condition)}
      </div>
      
      <div className="flex items-end gap-2 mb-4">
        <span className="text-5xl font-black text-gray-800">{weather.current.temp}°</span>
        <span className="text-lg text-gray-500 font-medium mb-1">{weather.current.condition}</span>
      </div>
      
      <div className="flex gap-4 text-sm text-gray-600 border-t border-blue-100/50 pt-4">
        <div className="flex items-center gap-1"><Droplets className="w-4 h-4 text-blue-400"/> {weather.current.humidity}%</div>
        <div className="flex items-center gap-1"><Wind className="w-4 h-4 text-gray-400"/> {weather.current.wind_kph} km/h</div>
      </div>
    </div>
  );
}
