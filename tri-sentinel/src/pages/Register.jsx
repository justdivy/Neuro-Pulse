import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ShieldCheck, User, Mail, Lock, Hash, AlertCircle } from "lucide-react";
import { API_BASE_URL } from "../lib/api";

export default function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    uid: "",
    name: "",
    email: "",
    password: "",
  });

  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // --- THE REAL BACKEND CONNECTION ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // SUCCESS! Route them to login with a success message
        navigate("/login", {
          state: { notification: "Registration successful! You may now securely log in." },
        });
      } else {
        // FAILURE (e.g., Email already exists)
        setErrorMsg(data.message || "Failed to register.");
      }
    } catch (error) {
      setErrorMsg("Could not connect to the database. Is the server running?");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center relative font-sans py-12">
      
      {/* Error Toast */}
      {errorMsg && (
        <div className="absolute top-6 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-6 py-4 rounded-xl shadow-xl flex items-center gap-3 z-50 animate-in slide-in-from-top-4 duration-300">
          <AlertCircle className="w-6 h-6" />
          <span className="font-semibold tracking-wide text-sm">{errorMsg}</span>
        </div>
      )}

      {/* Register Card Container */}
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
              Device Registration
            </p>
          </div>

          {/* Light Form Section */}
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Name Input */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="block w-full pl-12 pr-4 py-3.5 bg-[#f8fafc] border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:bg-white transition-all"
                  placeholder="Full Name"
                />
              </div>

              {/* Medical UID Input */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Hash className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  name="uid"
                  required
                  value={formData.uid}
                  onChange={handleChange}
                  className="block w-full pl-12 pr-4 py-3.5 bg-[#f8fafc] border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:bg-white transition-all"
                  placeholder="Medical UID (e.g. 25MCI10161)"
                />
              </div>

              {/* Email Input */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full pl-12 pr-4 py-3.5 bg-[#f8fafc] border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:bg-white transition-all"
                  placeholder="Email Address"
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
                  placeholder="Create Password"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3.5 mt-2 rounded-lg font-bold transition-all shadow-md text-white ${
                  isSubmitting ? "bg-slate-400" : "bg-[#0891b2] hover:bg-[#0e7490]"
                }`}
              >
                {isSubmitting ? "Registering..." : "Register Device"}
              </button>
            </form>

            {/* Footer Text */}
            <div className="mt-8 text-center text-sm text-slate-500">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-bold text-slate-700 hover:text-cyan-600 transition-colors"
              >
                Sign in.
              </Link>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}