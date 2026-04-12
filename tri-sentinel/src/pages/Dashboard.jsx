import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
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
  const navigate = useNavigate();
  const location = useLocation();

  // State for the latest single reading (for the top cards)
  const [vitals, setVitals] = useState({
    heartRate: "--",
    spO2: "--",
    temp: "--",
  });

  // NEW: State for the rolling chart data (array of objects)
  const [chartData, setChartData] = useState([]);

  const [isConnected, setIsConnected] = useState(false);
  const [notification, setNotification] = useState("");

  useEffect(() => {
    if (location.state && location.state.notification) {
      setNotification(location.state.notification);
      setTimeout(() => setNotification(""), 3500);
    }

    const socket = io("http://localhost:5000");
    socket.on("connect", () => setIsConnected(true));
    socket.on("disconnect", () => setIsConnected(false));

    // Handle incoming data
    socket.on("frontend_dashboard_update", (data) => {
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

  const handleLogout = () => {
    navigate("/login", {
      state: {
        notification: "Session closed. Securely logged out of Tri-Sentinel.",
      },
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex relative">
      {/* Notification Toast */}
      {notification && (
        <div className="absolute top-6 left-1/2 transform -translate-x-1/2 bg-slate-900 border border-cyan-500/30 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 z-50 transition-all duration-500">
          <CheckCircle className="text-cyan-400 w-6 h-6" />
          <span className="font-semibold tracking-wide">{notification}</span>
        </div>
      )}

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
        <div className="p-4 bg-slate-800 m-4 rounded flex items-center gap-3">
          <div
            className={`w-3 h-3 rounded-full ${isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"}`}
          ></div>
          <span className="text-sm">
            {isConnected ? "Patch Active" : "Disconnected"}
          </span>
        </div>
        <button
          onClick={() => {
            localStorage.removeItem("isAuthenticated"); // Destroys the key
            navigate("/login", {
              state: {
                notification:
                  "Session closed. Securely logged out of Tri-Sentinel.",
              },
            });
          }}
          className="m-4 p-3 bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded text-sm font-semibold transition-colors"
        >
          Secure Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              Health Dashboard
            </h1>
            <p className="text-slate-500">Real-time Continuous Monitoring</p>
          </div>
          <div className="px-4 py-2 bg-green-100 text-green-700 rounded-full font-semibold text-sm flex items-center gap-2 shadow-sm border border-green-200">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>{" "}
            System Normal
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
              Live ECG Simulation
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
