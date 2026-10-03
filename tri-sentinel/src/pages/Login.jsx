import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { ShieldCheck, CheckCircle, Lock, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // State for the login form
  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  });

  // State for incoming notifications (like successful logout)
  const [notification, setNotification] = useState(
    () => location.state?.notification ?? ""
  );

  // Auto-hide the notification after 4 seconds when it appears
  useEffect(() => {
    if (!notification) return;

    const timer = setTimeout(() => setNotification(""), 4000);
    return () => clearTimeout(timer);
  }, [notification]);

  // Handle input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };


  // Handle form submission to REAL Backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const user = await login(formData);
      if (user) {
        navigate("/dashboard", {
          state: { notification: `Welcome back, ${user.name}!` },
        });
      }
    } catch (error) {
      console.error(error);
      setNotification(`❌ ${error.message}`);
      setTimeout(() => setNotification(""), 4000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center relative font-sans">
      
      {/* --- NOTIFICATION TOAST UI --- */}
      {notification && (
        <div className="absolute top-6 left-1/2 transform -translate-x-1/2 bg-slate-800 border border-emerald-500/30 text-white px-6 py-4 rounded-xl shadow-xl flex items-center gap-3 z-50 animate-in slide-in-from-top-4 duration-500">
          <CheckCircle className="text-emerald-400 w-6 h-6" />
          <span className="font-semibold tracking-wide text-sm">
            {notification}
          </span>
        </div>
      )}
      {/* ----------------------------- */}

      {/* Login Card Container */}
      <div className="w-full max-w-md relative z-10 px-6">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
          
          {/* Dark Header Section */}
          <div className="bg-[#0f172a] p-10 text-center flex flex-col items-center">
            <div className="w-14 h-14 flex items-center justify-center mb-4">
              <ShieldCheck className="w-12 h-12 text-cyan-400" strokeWidth={1.5} />
            </div>
            <h2 className="text-2xl font-bold text-white tracking-widest uppercase">
              Neuro-Pulse
            </h2>
            <p className="text-slate-400 text-xs mt-2 uppercase tracking-widest font-semibold">
              Secure Access
            </p>
          </div>

          {/* Light Form Section */}
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Identifier Input */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  name="identifier"
                  required
                  value={formData.identifier}
                  onChange={handleChange}
                  className="block w-full pl-12 pr-4 py-3.5 bg-[#f8fafc] border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:bg-white transition-all"
                  placeholder="Patient UID / Email"
                />
              </div>

              {/* Password Input */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full pl-12 pr-4 py-3.5 bg-[#f8fafc] border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:bg-white transition-all"
                  placeholder="••••••••"
                />
              </div>

              {/* Forgot Password Link */}
              <div className="flex justify-end pt-1">
                <a
                  href="#"
                  className="text-xs font-semibold text-cyan-600 hover:text-cyan-700 transition-colors"
                >
                  Forgot Password?
                </a>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3.5 bg-[#0891b2] hover:bg-[#0e7490] text-white rounded-lg font-bold transition-all shadow-md mt-2"
              >
                Authenticate
              </button>
            </form>

            {/* Footer Text */}
            <div className="mt-8 text-center text-sm text-slate-500">
              Don't have a configured patch?{" "}
              <Link
                to="/register"
                className="font-bold text-slate-700 hover:text-cyan-600 transition-colors"
              >
                Register Device.
              </Link>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}