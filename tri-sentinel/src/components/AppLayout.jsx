import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Footer from "./Footer";

const navigationItems = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/monitoring", label: "Monitoring" },
  { to: "/alerts", label: "Alerts" },
  { to: "/reports", label: "Reports" },
  { to: "/settings", label: "Settings" },
];

export default function AppLayout({ children }) {
  const navigate = useNavigate();
  const { logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 md:flex">
      <aside className="flex w-full flex-col bg-slate-900 text-white md:min-h-screen md:w-64 md:shrink-0">
        <div className="p-6">
          <Link to="/" className="text-2xl font-bold tracking-wider text-cyan-400 hover:text-cyan-300 transition-colors">
            NeuroPulse
          </Link>
        </div>
        <nav className="flex flex-1 flex-wrap gap-2 px-4 pb-4 md:block md:space-y-2" aria-label="Main navigation">
          {navigationItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `block rounded px-4 py-2.5 transition-colors ${isActive ? "bg-slate-800 text-white" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <button
          onClick={() => {
            logout();
            navigate("/login", { state: { notification: "Session closed. Securely logged out." } });
          }}
          className="m-4 rounded bg-slate-800 p-3 text-sm font-semibold text-slate-400 transition-colors hover:bg-red-500/20 hover:text-red-400"
        >
          Secure Logout
        </button>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <main className="min-w-0 flex-1">{children}</main>
        <Footer />
      </div>
    </div>
  );
}
