import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileText, Download, User, Calendar, Activity } from 'lucide-react';

export default function Reports() {
  const navigate = useNavigate();
  const [isDownloading, setIsDownloading] = useState(false);

  // The function that talks to Node and downloads the PDF
  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      // Call our new Node.js PDF route
      const response = await fetch('http://localhost:5000/api/reports/25MCI10161');
      
      if (!response.ok) throw new Error('Failed to generate report');

      // Convert the response to a downloadable file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      // Create a hidden link, click it automatically, then destroy it
      const a = document.createElement('a');
      a.href = url;
      a.download = `TriSentinel_Report_25MCI10161.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

    } catch (error) {
      console.error("Download error:", error);
      alert("Could not download report. Make sure the backend is running and data exists in MongoDB.");
    } finally {
      setIsDownloading(false);
    }
  };

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
          <Link to="/reports" className="block py-2.5 px-4 bg-slate-800 text-white rounded transition-colors">Reports</Link>
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
        <div className="max-w-5xl">
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Clinical Reports</h1>
          <p className="text-slate-500 mt-1 mb-8">Export AI-analyzed patient data for medical records.</p>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
              <div className="bg-cyan-500/10 p-4 rounded-full">
                <User className="w-8 h-8 text-cyan-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800">Patient: 25MCI10161</h2>
                <p className="text-slate-500 flex items-center gap-2 text-sm mt-1">
                  <Activity className="w-4 h-4" /> Active Monitoring Session
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
              <div className="space-y-2">
                <h3 className="font-semibold text-slate-800">Full Diagnostic Summary</h3>
                <p className="text-sm text-slate-500 max-w-md">
                  Includes raw vital sign logs, AI anomaly flags, and timestamped events for Heart Rate, SpO2, and Body Temperature.
                </p>
              </div>

              <button 
                onClick={handleDownload}
                disabled={isDownloading}
                className={`flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-white transition-all shadow-lg ${
                  isDownloading 
                    ? 'bg-slate-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-cyan-900/20 hover:-translate-y-0.5'
                }`}
              >
                {isDownloading ? (
                  <>Generating PDF...</>
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    Download Medical Report
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}