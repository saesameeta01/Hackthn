import React, { useState, useEffect, useMemo } from 'react';
import { 
  Droplets, 
  Sprout, 
  CloudRain, 
  AlertTriangle, 
  CheckCircle2, 
  History, 
  Settings, 
  MessageSquare,
  Thermometer,
  Wind,
  Sun,
  ArrowRight,
  User
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  ReferenceLine
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import { CROPS, DEFAULT_CROP } from '../constants';
import { Crop, MoistureRecord, SoilCondition } from '../types';
import { getIrrigationAdvice } from '../services/gemini';

export default function Dashboard() {
  const [moisture, setMoisture] = useState(45);
  const [selectedCrop, setSelectedCrop] = useState<Crop>(DEFAULT_CROP);
  const [history, setHistory] = useState<MoistureRecord[]>([]);
  const [isIrrigating, setIsIrrigating] = useState(false);
  const [manualOverride, setManualOverride] = useState(false);
  const [advice, setAdvice] = useState<string>("");
  const [loadingAdvice, setLoadingAdvice] = useState(false);
  const [waterSaved, setWaterSaved] = useState(124.5); // Liters
  const [weather, setWeather] = useState({ temp: 24, forecast: "Sunny", rainChance: 5 });
  const [chartType, setChartType] = useState<'line' | 'area'>('line');

  // Determine soil condition
  const condition = useMemo((): SoilCondition => {
    if (moisture < selectedCrop.minMoisture) return 'Dry';
    if (moisture > selectedCrop.maxMoisture) return 'Wet';
    return 'Optimal';
  }, [moisture, selectedCrop]);

  // Auto-irrigation logic
  useEffect(() => {
    if (!manualOverride) {
      if (condition === 'Dry') {
        setIsIrrigating(true);
      } else if (condition === 'Optimal' || condition === 'Wet') {
        setIsIrrigating(false);
      }
    }
  }, [condition, manualOverride]);

  // Fetch history
  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/history');
      const data = await res.json();
      setHistory(data);
    } catch (e) {
      console.error(e);
    }
  };

  // Log data periodically
  useEffect(() => {
    const interval = setInterval(async () => {
      await fetch('/api/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          moisture_level: moisture,
          crop_type: selectedCrop.name,
          irrigation_status: isIrrigating
        })
      });
      fetchHistory();
    }, 10000);
    return () => clearInterval(interval);
  }, [moisture, selectedCrop, isIrrigating]);

  useEffect(() => {
    fetchHistory();
  }, []);

  // Get AI advice when condition changes or crop changes
  useEffect(() => {
    const fetchAdvice = async () => {
      setLoadingAdvice(true);
      const res = await getIrrigationAdvice(
        moisture, 
        selectedCrop.name, 
        condition, 
        `${weather.forecast}, ${weather.temp}°C, ${weather.rainChance}% rain chance`
      );
      setAdvice(res);
      setLoadingAdvice(false);
    };
    
    const timeout = setTimeout(fetchAdvice, 1000);
    return () => clearTimeout(timeout);
  }, [condition, selectedCrop, weather]);

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-900 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <Droplets className="text-blue-500 w-8 h-8" />
              TerraFlow <span className="text-slate-400 font-light">Dashboard</span>
            </h1>
            <p className="text-slate-500 mt-1">Smart Soil Moisture & Irrigation Management</p>
          </div>
          
          <div className="flex items-center gap-3">
            <Link to="/signup" className="hidden md:flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-100">
              <User className="w-4 h-4" />
              Farmer Signup
            </Link>
            <div className="bg-white px-4 py-2 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Sun className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-medium">{weather.temp}°C</span>
              </div>
              <div className="w-px h-4 bg-slate-200" />
              <div className="flex items-center gap-2">
                <CloudRain className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-medium">{weather.rainChance}%</span>
              </div>
            </div>
            <button className="p-2 bg-white rounded-xl shadow-sm border border-slate-100 hover:bg-slate-50 transition-colors">
              <Settings className="w-5 h-5 text-slate-600" />
            </button>
          </div>
        </header>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Status & Controls */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Moisture Gauge Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-slate-700">Soil Moisture</h3>
                <span className={cn(
                  "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
                  condition === 'Dry' ? "bg-red-50 text-red-600" :
                  condition === 'Wet' ? "bg-blue-50 text-blue-600" :
                  "bg-emerald-50 text-emerald-600"
                )}>
                  {condition}
                </span>
              </div>
              
              <div className="flex flex-col items-center justify-center py-4">
                <div className="relative w-48 h-48 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="96"
                      cy="96"
                      r="88"
                      fill="none"
                      stroke="#F1F5F9"
                      strokeWidth="12"
                    />
                    <motion.circle
                      cx="96"
                      cy="96"
                      r="88"
                      fill="none"
                      stroke={condition === 'Dry' ? "#EF4444" : condition === 'Wet' ? "#3B82F6" : "#10B981"}
                      strokeWidth="12"
                      strokeDasharray={552.92}
                      initial={{ strokeDashoffset: 552.92 }}
                      animate={{ strokeDashoffset: 552.92 - (552.92 * moisture) / 100 }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-5xl font-black text-slate-800">{Math.round(moisture)}%</span>
                    <span className="text-xs text-slate-400 font-medium uppercase tracking-widest mt-1">Relative</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Target Range</span>
                  <span className="font-medium text-slate-700">{selectedCrop.minMoisture}% - {selectedCrop.maxMoisture}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden flex">
                  <div className="h-full bg-slate-200" style={{ width: `${selectedCrop.minMoisture}%` }} />
                  <div className="h-full bg-emerald-400/30" style={{ width: `${selectedCrop.maxMoisture - selectedCrop.minMoisture}%` }} />
                  <div className="h-full bg-slate-200" style={{ width: `${100 - selectedCrop.maxMoisture}%` }} />
                </div>
              </div>
            </motion.div>

            {/* Irrigation Control Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className={cn(
                "p-6 rounded-3xl shadow-sm border transition-all duration-500",
                isIrrigating ? "bg-blue-600 border-blue-500 text-white" : "bg-white border-slate-100 text-slate-900"
              )}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "p-2 rounded-xl",
                    isIrrigating ? "bg-blue-500" : "bg-slate-100"
                  )}>
                    <Droplets className={cn("w-5 h-5", isIrrigating ? "text-white" : "text-slate-600")} />
                  </div>
                  <h3 className="font-semibold">Irrigation System</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium opacity-70">Manual</span>
                  <button 
                    onClick={() => setManualOverride(!manualOverride)}
                    className={cn(
                      "w-10 h-5 rounded-full relative transition-colors",
                      manualOverride ? "bg-emerald-400" : "bg-slate-300"
                    )}
                  >
                    <div className={cn(
                      "absolute top-1 w-3 h-3 bg-white rounded-full transition-all",
                      manualOverride ? "left-6" : "left-1"
                    )} />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{isIrrigating ? "ACTIVE" : "IDLE"}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {manualOverride ? "Manual Control Mode" : "Automatic Smart Mode"}
                  </p>
                </div>
                {manualOverride && (
                  <button 
                    onClick={() => setIsIrrigating(!isIrrigating)}
                    className={cn(
                      "px-6 py-2 rounded-xl font-bold text-sm transition-all",
                      isIrrigating ? "bg-white text-blue-600" : "bg-blue-600 text-white"
                    )}
                  >
                    {isIrrigating ? "STOP" : "START"}
                  </button>
                )}
              </div>
            </motion.div>

            {/* Crop Selection Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-emerald-50 rounded-xl">
                  <Sprout className="w-5 h-5 text-emerald-600" />
                </div>
                <h3 className="font-semibold text-slate-700">Crop Profile</h3>
              </div>
              
              <div className="space-y-4">
                <select 
                  value={selectedCrop.id}
                  onChange={(e) => {
                    const crop = CROPS.find(c => c.id === e.target.value);
                    if (crop) setSelectedCrop(crop);
                  }}
                  className="w-full p-3 rounded-xl bg-slate-50 border-none text-sm font-medium focus:ring-2 focus:ring-emerald-500"
                >
                  {CROPS.map(crop => (
                    <option key={crop.id} value={crop.id}>{crop.name}</option>
                  ))}
                </select>
                <p className="text-xs text-slate-500 leading-relaxed italic">
                  "{selectedCrop.description}"
                </p>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Analytics & AI */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4"
              >
                <div className="p-4 bg-blue-50 rounded-2xl">
                  <CheckCircle2 className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Water Saved</p>
                  <p className="text-2xl font-black text-slate-800">{waterSaved} L</p>
                </div>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4"
              >
                <div className="p-4 bg-amber-50 rounded-2xl">
                  <AlertTriangle className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">System Health</p>
                  <p className="text-2xl font-black text-slate-800">OPTIMAL</p>
                </div>
              </motion.div>
            </div>

            {/* Chart Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-100 rounded-xl">
                    <History className="w-5 h-5 text-slate-600" />
                  </div>
                  <h3 className="font-semibold text-slate-700">Moisture History</h3>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setChartType('line')}
                    className={cn(
                      "px-3 py-1 text-xs font-bold rounded-lg transition-colors",
                      chartType === 'line' ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"
                    )}
                  >
                    Line
                  </button>
                  <button 
                    onClick={() => setChartType('area')}
                    className={cn(
                      "px-3 py-1 text-xs font-bold rounded-lg transition-colors",
                      chartType === 'area' ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"
                    )}
                  >
                    Area
                  </button>
                </div>
              </div>

              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  {chartType === 'line' ? (
                    <LineChart data={history.slice().reverse()}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                      <XAxis dataKey="timestamp" hide />
                      <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12 }} />
                      <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                      <ReferenceLine y={selectedCrop.minMoisture} stroke="#EF4444" strokeDasharray="3 3" label={{ position: 'right', value: 'Min', fill: '#EF4444', fontSize: 10 }} />
                      <ReferenceLine y={selectedCrop.maxMoisture} stroke="#3B82F6" strokeDasharray="3 3" label={{ position: 'right', value: 'Max', fill: '#3B82F6', fontSize: 10 }} />
                      <Line type="monotone" dataKey="moisture_level" stroke="#3B82F6" strokeWidth={3} dot={{ r: 4, fill: '#3B82F6', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                    </LineChart>
                  ) : (
                    <AreaChart data={history.slice().reverse()}>
                      <defs>
                        <linearGradient id="colorMoisture" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                      <XAxis dataKey="timestamp" hide />
                      <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12 }} />
                      <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                      <Area type="monotone" dataKey="moisture_level" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorMoisture)" />
                    </AreaChart>
                  )}
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* AI Advice Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-slate-900 p-8 rounded-3xl shadow-xl text-white relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                <MessageSquare className="w-32 h-32" />
              </div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">Terra AI Insights</span>
                </div>
                
                <AnimatePresence mode="wait">
                  {loadingAdvice ? (
                    <motion.div 
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-2"
                    >
                      <div className="h-4 bg-white/10 rounded w-3/4 animate-pulse" />
                      <div className="h-4 bg-white/10 rounded w-1/2 animate-pulse" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="content"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                    >
                      <p className="text-xl font-medium leading-relaxed">
                        {advice}
                      </p>
                      <button className="mt-6 flex items-center gap-2 text-sm font-bold text-emerald-400 hover:text-emerald-300 transition-colors">
                        Ask Terra for more details <ArrowRight className="w-4 h-4" />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

          </div>
        </div>

        {/* Simulator Panel (Floating) */}
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
          <div className="bg-white/80 backdrop-blur-md px-6 py-4 rounded-2xl shadow-2xl border border-white/20 flex items-center gap-6">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sensor Simulator</span>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={moisture}
                onChange={(e) => setMoisture(parseInt(e.target.value))}
                className="w-48 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <span className="text-sm font-black text-slate-700 w-8">{moisture}%</span>
            </div>
            <div className="w-px h-8 bg-slate-200" />
            <div className="flex gap-2">
              <button 
                onClick={() => setMoisture(Math.max(0, moisture - 10))}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                title="Simulate Dry Soil"
              >
                <Sun className="w-4 h-4 text-amber-500" />
              </button>
              <button 
                onClick={() => setMoisture(Math.min(100, moisture + 10))}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                title="Simulate Rain"
              >
                <CloudRain className="w-4 h-4 text-blue-500" />
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
