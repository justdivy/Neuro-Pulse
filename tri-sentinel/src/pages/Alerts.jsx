import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, ShieldAlert, BatteryWarning, CheckCircle } from 'lucide-react';
import { io } from 'socket.io-client';

// Connect to your Node.js backend
const socket = io('http://localhost:5000');

export default function Alerts() {
  const navigate = useNavigate();
  
  // We start with one "System Normal" alert so the screen isn't empty, 
  // but new AI alerts will dynamically stack on top!
  const [alerts, setAlerts] = useState([
    {
      id: 'system-start',
      type: 'success',
      title: 'Device Reconnected · Sync Complete',
      message: 'System initialized and monitoring vitals securely.',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      meta: 'Auto-resolved'
    }
  ]);

  useEffect(() => {
    // Listen for real AI alerts from the Node backend
    socket.on('critical_health_alert', (aiAnalysis) => {
      
      const newAlert = {
        id: Date.now(), // Unique ID based on timestamp
        type: 'critical',
        title: 'AI Anomaly Detected',
        message: aiAnalysis.message,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        meta: `AI Confidence: ${(aiAnalysis.confidence * 100).toFixed(1)}%`
      };

      // Add the new alert to the TOP of the list
      setAlerts(prevAlerts => [newAlert, ...prevAlerts]);
    });

    // Cleanup listener when you leave the page
    return () => {
      socket.off('critical_health_alert');
    };
  }, []);

  // Helper function to pick the right icon based on alert type
  const getAlertIcon = (type) => {
    switch(type) {
      case 'critical': return <Activity className="w-6 h-6 text-white" />;
      case 'warning': return <ShieldAlert className="w-6 h-6 text-white" />;
      case 'success': return <CheckCircle className="w-6 h-6 text-white" />;
      default: return <Activity className="w-6 h-6 text-white" />;
    }
  };

  // Helper function to style the card border and icon background
  const getAlertStyle = (type) => {
    switch(type) {
      case 'critical': return { border: 'border-l-red-500', bg: 'bg-red-500' };
      case 'warning': return { border: 'border-l-orange-500', bg: 'bg-orange-500' };
      case 'success': return { border: 'border-l-emerald-500', bg: 'bg-emerald-500' };
      default: return { border: 'border-l-slate-500', bg: 'bg-slate-500' };
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      
      {/* Sidebar (Matches Dashboard) */}
      <aside className="w-64 bg-[#0f172a] flex flex-col shadow-2xl z-20">
        <div className="p-6">
          <Link to="/" className="text-2xl font-bold tracking-wider text-cyan-400 hover:text-cyan-300 transition-colors">
            Tri-Sentinel
          </Link>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4">
          <Link to="/dashboard" className="block py-2.5 px-4 text-slate-400 hover:bg-slate-800 hover:text-white rounded transition-colors">Dashboard</Link>
          <Link to="/monitoring" className="block py-2.5 px-4 text-slate-400 hover:bg-slate-800 hover:text-white rounded transition-colors">Monitoring</Link>
          <Link to="/alerts" className="block py-2.5 px-4 bg-slate-800 text-white rounded transition-colors">Alerts</Link>
          <Link to="/reports" className="block py-2.5 px-4 text-slate-400 hover:bg-slate-800 hover:text-white rounded transition-colors">Reports</Link>
          <Link to="/settings" className="block py-2.5 px-4 text-slate-400 hover:bg-slate-800 hover:text-white rounded transition-colors">Settings</Link>
        </nav>

        <button 
          onClick={() => {
            localStorage.removeItem('isAuthenticated');
            navigate('/login', { state: { notification: 'Session closed. Securely logged out.' } });
          }} 
          className="m-4 p-3 bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded text-sm font-semibold transition-colors"
        >
          Secure Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-10 relative">
        <div className="max-w-4xl">
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Alerts & Notifications</h1>
          <p className="text-slate-500 mt-1 mb-8">Patient monitoring · Active alerts shown first</p>

          <div className="space-y-4">
            {alerts.length === 0 ? (
              <p className="text-slate-500 italic">No active alerts. System is monitoring safely.</p>
            ) : (
              alerts.map((alert) => {
                const styles = getAlertStyle(alert.type);
                return (
                  <div key={alert.id} className={`bg-white rounded-xl shadow-sm border border-slate-100 border-l-4 ${styles.border} p-6 flex items-start gap-5 transition-all hover:shadow-md animate-in slide-in-from-top-2 duration-300`}>
                    
                    {/* Dynamic Icon */}
                    <div className={`mt-1 p-3 rounded-xl flex-shrink-0 shadow-sm ${styles.bg}`}>
                      {getAlertIcon(alert.type)}
                    </div>
                    
                    {/* Alert Text */}
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h3 className="text-lg font-bold text-slate-800">{alert.title}</h3>
                        {alert.type === 'critical' && (
                          <button className="px-4 py-1.5 bg-red-500 hover:bg-red-600 text-white text-sm font-bold rounded-lg shadow-sm transition-colors">
                            View Now
                          </button>
                        )}
                      </div>
                      <p className="text-slate-600 mt-1">{alert.message}</p>
                      
                      {/* Meta info (Time & Extra details) */}
                      <div className="flex items-center gap-3 mt-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        <span>{alert.time}</span>
                        <span>•</span>
                        <span className={alert.type === 'critical' ? 'text-red-400' : ''}>{alert.meta}</span>
                      </div>
                    </div>

                  </div>
                );
              })
            )}
          </div>
        </div>
      </main>
    </div>
  );
}