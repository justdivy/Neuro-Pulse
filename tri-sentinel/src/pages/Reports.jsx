import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FileText, Download, User, Calendar, Activity } from 'lucide-react';

export default function Reports() {
  const { user, authenticatedFetch } = useAuth();
  const [isDownloading, setIsDownloading] = useState(false);

  // The function that talks to Node and downloads the PDF
  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      // Call our new Node.js PDF route
      const patientId = encodeURIComponent(user.uid);
      const response = await authenticatedFetch(`/api/reports/${patientId}`);
      
      if (!response.ok) throw new Error('Failed to generate report');

      // Convert the response to a downloadable file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      // Create a hidden link, click it automatically, then destroy it
      const a = document.createElement('a');
      a.href = url;
      a.download = `NeuroPulse_Report_${user.uid}.pdf`;
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
      <main className="min-h-full overflow-y-auto p-10 relative">
        <div className="max-w-5xl">
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Clinical Reports</h1>
          <p className="text-slate-500 mt-1 mb-8">Export AI-analyzed patient data for medical records.</p>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
              <div className="bg-cyan-500/10 p-4 rounded-full">
                <User className="w-8 h-8 text-cyan-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800">Patient: {user.uid}</h2>
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
                    : 'bg-linear-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-cyan-900/20 hover:-translate-y-0.5'
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
  );
}