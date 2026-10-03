import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { io } from "socket.io-client";
import { Activity, Droplet, Thermometer, CheckCircle } from "lucide-react";
// IMPORT RECHARTS
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function Dashboard() {
  const location = useLocation();

  // State for the latest single reading (for the top cards)
  const [vitals, setVitals] = useState({
    heartRate: "--",
    spO2: "--",
    temp: "--",
  });

  // NEW: State for the rolling chart data (array of objects)
  const [chartData, setChartData] = useState([]);
  const [hasReceivedData, setHasReceivedData] = useState(false);

  const [notification, setNotification] = useState("");

  useEffect(() => {
    if (location.state && location.state.notification) {
      setNotification(location.state.notification);
      setTimeout(() => setNotification(""), 3500);
    }

    const socket = io("http://localhost:5000");
    // Handle incoming data
    socket.on("frontend_dashboard_update", (data) => {
      setHasReceivedData(true);

      // 1. Update the top cards
      setVitals(data);

      // 2. Add a timestamp and push to the rolling chart array
      setChartData((prevData) => {
        const newDataPoint = {
          time: new Date().toLocaleTimeString([], {
            hour12: false,
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          }),
          ...data,
        };
        // Keep only the last 15 data points for a smooth scrolling effect
        const updatedData = [...prevData, newDataPoint];
        return updatedData.length > 15 ? updatedData.slice(1) : updatedData;
      });
    });

    return () => socket.disconnect();
  }, [location]);

  return (
    <div className="min-h-full bg-slate-50 relative">
      {/* Notification Toast */}
      {notification && (
        <div className="absolute top-6 left-1/2 transform -translate-x-1/2 bg-slate-900 border border-cyan-500/30 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 z-50 transition-all duration-500">
          <CheckCircle className="text-cyan-400 w-6 h-6" />
          <span className="font-semibold tracking-wide">{notification}</span>
        </div>
      )}

      {/* Main Content */}
      <main className="p-8 overflow-y-auto">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              Health Dashboard
            </h1>
            <p className="text-slate-500">Real-time Continuous Monitoring</p>
          </div>
          <div className={`px-4 py-2 rounded-full font-semibold text-sm flex items-center gap-2 shadow-sm border ${
            hasReceivedData
              ? "bg-emerald-100 text-emerald-700 border-emerald-200"
              : "bg-amber-100 text-amber-700 border-amber-200"
          }`}>
            <div className={`w-2 h-2 rounded-full ${hasReceivedData ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`}></div>
            {hasReceivedData ? "Monitoring Live" : "Awaiting Live Data"}
          </div>
        </header>

        {/* Top Number Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 text-slate-500 mb-4">
              <Activity className="text-red-500" />
              <span className="font-semibold uppercase tracking-wider text-sm">
                Heart Rate
              </span>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-5xl font-bold text-slate-800">
                {vitals.heartRate}
              </span>
              <span className="text-lg text-slate-500 mb-1">bpm</span>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 text-slate-500 mb-4">
              <Droplet className="text-blue-500" />
              <span className="font-semibold uppercase tracking-wider text-sm">
                Blood Oxygen
              </span>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-5xl font-bold text-slate-800">
                {vitals.spO2}
              </span>
              <span className="text-lg text-slate-500 mb-1">%</span>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 text-slate-500 mb-4">
              <Thermometer className="text-amber-500" />
              <span className="font-semibold uppercase tracking-wider text-sm">
                Temperature
              </span>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-5xl font-bold text-slate-800">
                {vitals.temp}
              </span>
              <span className="text-lg text-slate-500 mb-1">°C</span>
            </div>
          </div>
        </div>

        {/* NEW: Live Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Heart Rate Graph */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-800 mb-4">
              Live ECG Data
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f1f5f9"
                  />
                  <XAxis
                    dataKey="time"
                    tick={{ fontSize: 12, fill: "#94a3b8" }}
                  />
                  <YAxis
                    domain={["dataMin - 10", "dataMax + 10"]}
                    tick={{ fontSize: 12, fill: "#94a3b8" }}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="heartRate"
                    stroke="#ef4444"
                    strokeWidth={3}
                    dot={false}
                    activeDot={{ r: 6 }}
                    isAnimationActive={false} // Turn off animation for smoother streaming look
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Blood Oxygen Graph */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-800 mb-4">Live SpO2 Levels</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f1f5f9"
                  />
                  <XAxis
                    dataKey="time"
                    tick={{ fontSize: 12, fill: "#94a3b8" }}
                  />
                  <YAxis
                    domain={[90, 100]}
                    tick={{ fontSize: 12, fill: "#94a3b8" }}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="spO2"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={false}
                    activeDot={{ r: 6 }}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
