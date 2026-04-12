import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
  const [chartData, setChartData] = useState([]);

  // Generate continuous fake data for the demo UI
  useEffect(() => {
    const interval = setInterval(() => {
      setChartData((prevData) => {
        const newDataPoint = {
          time: new Date().toLocaleTimeString([], {
            hour12: false,
            minute: "2-digit",
            second: "2-digit",
          }),
          heartRate: Math.floor(Math.random() * (85 - 70 + 1) + 70),
          spO2: Math.floor(Math.random() * (100 - 97 + 1) + 97),
        };
        const updatedData = [...prevData, newDataPoint];
        return updatedData.length > 30 ? updatedData.slice(1) : updatedData; // Keep 30 points for a wide graph
      });
    }, 1000); // Updates every second for a smoother "live" feel

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-6">
          <Link
            to="/"
            className="text-2xl font-bold tracking-wider text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            TriSentinel
          </Link>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          <Link
            to="/dashboard"
            className="block py-2.5 px-4 text-slate-400 hover:bg-slate-800 hover:text-white rounded transition-colors"
          >
            Dashboard
          </Link>
          <Link
            to="/monitoring"
            className="block py-2.5 px-4 text-slate-400 hover:bg-slate-800 hover:text-white rounded transition-colors"
          >
            Monitoring
          </Link>
          <Link
            to="/alerts"
            className="block py-2.5 px-4 text-slate-400 hover:bg-slate-800 hover:text-white rounded transition-colors"
          >
            Alerts
          </Link>
          <Link
            to="/reports"
            className="block py-2.5 px-4 text-slate-400 hover:bg-slate-800 hover:text-white rounded transition-colors"
          >
            Reports
          </Link>
          <Link
            to="/settings"
            className="block py-2.5 px-4 text-slate-400 hover:bg-slate-800 hover:text-white rounded transition-colors"
          >
            Settings
          </Link>
        </nav>
        <button
          onClick={() =>
            navigate("/login", {
              state: {
                notification:
                  "Session closed. Securely logged out of Tri-Sentinel.",
              },
            })
          }
          className="m-4 p-3 bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded text-sm font-semibold transition-colors"
        >
          Secure Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 bg-slate-900 text-white">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-cyan-400">
              Real-Time Monitoring
            </h1>
            <p className="text-slate-400">
              Patient: D. Verma · Patch ID: TSA-2204
            </p>
          </div>
          <div className="px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-full font-semibold text-sm flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
            LIVE
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
    </div>
  );
}
