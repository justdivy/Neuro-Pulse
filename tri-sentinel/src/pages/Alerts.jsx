import { useState, useEffect } from 'react';
import { Activity, ShieldAlert, CheckCircle } from 'lucide-react';
import { io } from 'socket.io-client';

// Connect to your Node.js backend
const socket = io('http://localhost:5000');

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);

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
      <main className="min-h-full overflow-y-auto p-10 relative">
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
  );
}