import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Activity, Bell } from 'lucide-react';

export default function Settings() {
  const navigate = useNavigate();
  
  // 1. Create a state variable to hold the user's data
  const [user, setUser] = useState({
    name: 'Loading...',
    uid: '...',
    institution: '...',
    dob: '...'
  });

  // 2. When the page loads, fetch the data from localStorage!
  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      
      {/* Sidebar */}
      <aside className="w-64 bg-[#0f172a] flex flex-col shadow-2xl z-20">
        <div className="p-6">
          <Link to="/" className="text-2xl font-bold tracking-wider text-cyan-400 hover:text-cyan-300 transition-colors">
            Tri-Sentinel
          </Link>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4">
          <Link to="/dashboard" className="block py-2.5 px-4 text-slate-400 hover:bg-slate-800 hover:text-white rounded transition-colors">Dashboard</Link>
          <Link to="/monitoring" className="block py-2.5 px-4 text-slate-400 hover:bg-slate-800 hover:text-white rounded transition-colors">Monitoring</Link>
          <Link to="/alerts" className="block py-2.5 px-4 text-slate-400 hover:bg-slate-800 hover:text-white rounded transition-colors">Alerts</Link>
          <Link to="/reports" className="block py-2.5 px-4 text-slate-400 hover:bg-slate-800 hover:text-white rounded transition-colors">Reports</Link>
          <Link to="/settings" className="block py-2.5 px-4 bg-slate-800 text-white rounded transition-colors">Settings</Link>
        </nav>

        <button 
          onClick={() => {
            localStorage.removeItem('isAuthenticated');
            localStorage.removeItem('currentUser'); // Clear user data on logout!
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
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">System Settings</h1>
          <p className="text-slate-500 mt-1 mb-8">Manage your profile and device configurations</p>

          <div className="space-y-6">
            
            {/* Dynamic User Profile Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 flex items-start gap-6">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-10 h-10 text-slate-400" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-slate-800">{user.name}</h2>
                <p className="text-slate-500 mt-1">Patient UID: {user.uid}</p>
                
                <div className="flex gap-12 mt-6">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Institution</p>
                    <p className="text-slate-700 font-medium mt-1">{user.institution}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Date of Birth</p>
                    <p className="text-slate-700 font-medium mt-1">{user.dob}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Hardware Status Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
              <div className="flex items-center gap-3 mb-4">
                <Activity className="w-5 h-5 text-cyan-600" />
                <h3 className="text-lg font-bold text-slate-800">Connected Hardware</h3>
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div>
                  <p className="font-bold text-slate-800">Tri-Sentinel Prop (BSW004)</p>
                  <p className="text-xs text-slate-500 mt-1">MAC: ED:B5:17:1B:FD:8B · Firmware: MOY-D4L3-2.0.3</p>
                </div>
                <span className="px-4 py-1.5 bg-emerald-100 text-emerald-700 text-sm font-bold rounded-full">
                  Connected
                </span>
              </div>
            </div>

            {/* Alert Preferences Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
              <div className="flex items-center gap-3 mb-4">
                <Bell className="w-5 h-5 text-cyan-600" />
                <h3 className="text-lg font-bold text-slate-800">Alert Preferences</h3>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-800">Critical AI Predictions</p>
                  <p className="text-sm text-slate-500 mt-1">Immediate alerts for anomalous biometric spikes</p>
                </div>
                {/* Visual-only Toggle Switch */}
                <div className="w-12 h-6 bg-[#0891b2] rounded-full relative cursor-pointer">
                  <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}