import { Link } from "react-router-dom";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-700/70 bg-[#0f172a] text-slate-300" aria-label="Site footer">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-6 py-8 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr] lg:px-8">
        <div>
          <Link to="/" className="text-lg font-bold tracking-wider text-cyan-400 hover:text-cyan-300">
            Neuro-Pulse
          </Link>
          <p className="mt-3 max-w-sm text-sm leading-6 text-slate-400">
            Intelligent health monitoring and patient safety platform.
          </p>
        </div>

        <nav aria-label="Footer navigation">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">Navigation</h2>
          <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
            <Link to="/dashboard" className="hover:text-cyan-300">Dashboard</Link>
            <Link to="/monitoring" className="hover:text-cyan-300">Monitoring</Link>
            <Link to="/alerts" className="hover:text-cyan-300">Alerts</Link>
            <Link to="/reports" className="hover:text-cyan-300">Reports</Link>
            <Link to="/settings" className="hover:text-cyan-300">Settings</Link>
          </div>
        </nav>
      </div>
      <div className="border-t border-slate-800 px-6 py-4 text-center text-xs text-slate-500 lg:px-8">
        © {year} Neuro-Pulse. All rights reserved.
      </div>
    </footer>
  );
}
