import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { io } from "socket.io-client";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function Monitoring() {
  const { user, authLoading } = useAuth();
  const [chartData, setChartData] = useState([]);
  const [isReceivingData, setIsReceivingData] = useState(false);

  useEffect(() => {
    const socket = io("http://localhost:5000");

    socket.on("frontend_dashboard_update", (data) => {
      setIsReceivingData(true);
      setChartData((prevData) => {
        const newDataPoint = {
          time: new Date().toLocaleTimeString([], {
            hour12: false,
            minute: "2-digit",
            second: "2-digit",
          }),
          ...data,
        };
        const updatedData = [...prevData, newDataPoint];
        return updatedData.length > 30 ? updatedData.slice(1) : updatedData;
      });
    });

    return () => socket.disconnect();
  }, []);

    return (
      <main className="min-h-full p-8 bg-slate-900 text-white">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-cyan-400">
              Real-Time Monitoring
            </h1>
            <p className="text-slate-400">
              {authLoading
                ? "Loading patient information..."
                : user
                  ? `Patient: ${user.name?.trim() || "Unknown Patient"} · Patient ID: ${user.uid?.trim() || "Not available"}`
                  : "Patient information unavailable."}
            </p>
          </div>
          <div className={`${isReceivingData ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"} px-4 py-2 rounded-full font-semibold text-sm flex items-center gap-2`}>
            <div className={`w-2 h-2 rounded-full ${isReceivingData ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`}></div>
            {isReceivingData ? "RECEIVING" : "WAITING FOR DATA"}
          </div>
        </header>

        {/* Large ECG Graph */}
        <div className="mb-8 p-6 bg-slate-800 rounded-xl border border-slate-700">
          <h3 className="font-semibold text-slate-400 mb-4">
            ECG · Heart Rate
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#334155"
                />
                <XAxis dataKey="time" tick={{ fill: "#94a3b8" }} />
                <YAxis
                  domain={["dataMin - 10", "dataMax + 10"]}
                  tick={{ fill: "#94a3b8" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "none",
                    color: "#fff",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="heartRate"
                  stroke="#06b6d4"
                  strokeWidth={3}
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </main>
  );
}
