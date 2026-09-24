"use client";
import { useState } from "react";
import { Camera, X, Loader2, Sparkles, Sprout, Trees } from "lucide-react";

export default function AiCameraModal({ 
  token, 
  onClose 
}: { 
  token: string; 
  onClose: () => void 
}) {
  const [mode, setMode] = useState<"plant" | "soil" | "grow">("plant");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [file, setFile] = useState<File | null>(null);

  const handleAnalyze = async () => {
    if ((mode === "plant" || mode === "soil") && !file) return;
    setLoading(true);
    setResult(null);
    
    try {
      const endpoint = 
        mode === "plant" ? "/ai/analyze-plant" : 
        mode === "soil" ? "/ai/analyze-soil" : 
        "/ai/what-to-grow";

      const formData = new FormData();
      if (file) formData.append("file", file);

      const res = await fetch(`http://localhost:8000${endpoint}`, {
        method: mode === "grow" ? "GET" : "POST",
        headers: mode === "grow" ? { Authorization: `Bearer ${token}` } : { Authorization: `Bearer ${token}` },
        body: mode === "grow" ? undefined : formData
      });
      
      if (res.ok) {
        setResult(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6" />
            <h3 className="text-xl font-bold">AGRiNEX Crop & Soil Insights</h3>
          </div>
          <button onClick={onClose} className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto">
          <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-xl">
            <button onClick={() => {setMode("plant"); setResult(null)}} className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${mode === "plant" ? "bg-white shadow text-emerald-700" : "text-gray-500 hover:text-gray-700"}`}>
              <Trees className="w-4 h-4" /> Plant
            </button>
            <button onClick={() => {setMode("soil"); setResult(null)}} className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${mode === "soil" ? "bg-white shadow text-emerald-700" : "text-gray-500 hover:text-gray-700"}`}>
              <Camera className="w-4 h-4" /> Soil
            </button>
            <button onClick={() => {setMode("grow"); setResult(null)}} className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${mode === "grow" ? "bg-white shadow text-emerald-700" : "text-gray-500 hover:text-gray-700"}`}>
              <Sprout className="w-4 h-4" /> Grow?
            </button>
          </div>

          {(mode === "plant" || mode === "soil") && !result && (
            <div className="mb-6">
              <label className="block w-full border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors">
                <Camera className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <span className="text-gray-600 font-medium block">
                  {file ? file.name : "Tap to upload or take a photo"}
                </span>
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
              </label>
            </div>
          )}

          {mode === "grow" && !result && (
            <div className="mb-6 text-center text-gray-600 p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
              <Sprout className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
              <p>Analyze your current farm telemetry and soil to get AI recommendations on the best crops to plant right now.</p>
            </div>
          )}

          {!result && (
            <button 
              onClick={handleAnalyze} 
              disabled={loading || ((mode === "plant" || mode === "soil") && !file)}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Sparkles className="w-5 h-5" />}
              {loading ? "Analyzing Engine..." : "Analyze with AI"}
            </button>
          )}

          {result && mode === "plant" && (
            <div className="bg-emerald-50 border border-emerald-100 p-5 rounded-2xl animate-in slide-in-from-bottom-4 fade-in">
              <h4 className="font-bold text-lg text-emerald-900 mb-4 flex items-center gap-2">
                <Trees className="w-5 h-5 text-emerald-600" /> Plant Analysis
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between border-b border-emerald-200/50 pb-2">
                  <span className="text-gray-600">Health Status</span>
                  <span className="font-bold text-emerald-800">{result.analysis.health_status}</span>
                </div>
                <div className="flex justify-between border-b border-emerald-200/50 pb-2">
                  <span className="text-gray-600">AI Confidence</span>
                  <span className="font-bold text-emerald-800">{result.analysis.confidence}%</span>
                </div>
                <div>
                  <span className="text-gray-600 block mb-1">Recommended Action</span>
                  <p className="font-semibold text-gray-800 bg-white p-3 rounded-lg shadow-sm border border-emerald-100">{result.analysis.recommended_action}</p>
                </div>
              </div>
            </div>
          )}

          {result && mode === "soil" && (
            <div className="bg-amber-50 border border-amber-100 p-5 rounded-2xl animate-in slide-in-from-bottom-4 fade-in">
              <h4 className="font-bold text-lg text-amber-900 mb-4 flex items-center gap-2">
                <Camera className="w-5 h-5 text-amber-600" /> Soil Analysis
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between border-b border-amber-200/50 pb-2">
                  <span className="text-gray-600">Soil Type</span>
                  <span className="font-bold text-amber-800">{result.analysis.soil_type_estimate}</span>
                </div>
                <div className="flex justify-between border-b border-amber-200/50 pb-2">
                  <span className="text-gray-600">Visual Moisture</span>
                  <span className="font-bold text-amber-800">{result.analysis.visual_moisture}</span>
                </div>
                <div>
                  <span className="text-gray-600 block mb-1">Recommended Action</span>
                  <p className="font-semibold text-gray-800 bg-white p-3 rounded-lg shadow-sm border border-amber-100">{result.analysis.recommended_action}</p>
                </div>
              </div>
            </div>
          )}

          {result && mode === "grow" && (
            <div className="space-y-3 animate-in slide-in-from-bottom-4 fade-in">
              <h4 className="font-bold text-lg text-emerald-900 mb-2">Crop Recommendations</h4>
              {result.recommendations.map((rec: any, idx: number) => (
                <div key={idx} className="bg-white border border-gray-200 p-4 rounded-2xl shadow-sm">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-gray-800 text-lg">{rec.crop}</span>
                    <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded font-bold text-sm">{rec.suitability}% Match</span>
                  </div>
                  <p className="text-gray-600 text-sm">{rec.reason}</p>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
