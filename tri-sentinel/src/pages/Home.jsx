import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ShieldCheck,
  Activity,
  Brain,
  Clock,
  X,
  ArrowRight,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowPopup(true), 5000);
    return () => clearTimeout(timer);
  }, []);

  // Animation Variants
  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
  };

  return (
    <div className="min-h-screen bg-[#050B14] text-white relative overflow-hidden font-sans">
      {/* Animated Background Gradients */}
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] bg-cyan-600/20 rounded-full blur-[120px] pointer-events-none"
      />
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
        className="absolute -bottom-[20%] -right-[10%] w-[60vw] h-[60vw] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none"
      />

      {/* Navigation */}
      <nav className="p-6 flex justify-between items-center relative z-20 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2"
        >
          <ShieldCheck className="w-8 h-8 text-cyan-400" />
          <span className="text-2xl font-extrabold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            TRI-SENTINEL
          </span>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="gap-6 hidden md:flex items-center"
        >
          <Link
            to="/login"
            className="text-sm font-semibold text-slate-300 hover:text-cyan-400 transition-colors"
          >
            Sign In
          </Link>
          <button
            onClick={() => setShowPopup(true)}
            className="px-6 py-2.5 bg-cyan-500/10 border border-cyan-500/50 hover:bg-cyan-500 hover:text-white text-cyan-400 rounded-full font-bold transition-all shadow-[0_0_20px_rgba(8,145,178,0.3)] hover:shadow-[0_0_30px_rgba(8,145,178,0.6)]"
          >
            Launch Platform
          </button>
        </motion.div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 pt-12 pb-24 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
        {/* Left Column: Text Content */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="text-left"
        >
          <motion.div
            variants={fadeUp}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cyan-500/30 bg-cyan-950/50 text-cyan-300 text-xs font-bold tracking-widest mb-6 backdrop-blur-sm"
          >
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            LIVE DIAGNOSTIC FUSION
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="text-5xl md:text-7xl font-black tracking-tight mb-6 leading-[1.1]"
          >
            Detect the unseen. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500">
              Before it happens.
            </span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="text-lg md:text-xl text-slate-400 mb-8 max-w-xl leading-relaxed font-light"
          >
            The 3-in-1 continuous monitoring wearable. Powered by predictive AI,
            Tri-Sentinel isolates critical events for{" "}
            <span className="text-white font-medium">Cancer</span>,{" "}
            <span className="text-white font-medium">Cardiac</span>, and{" "}
            <span className="text-white font-medium">Diabetes</span> patients in
            real-time.
          </motion.p>

          <motion.div variants={fadeUp} className="flex flex-wrap gap-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="px-8 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-cyan-500/25 flex items-center gap-2 group"
            >
              Enter Dashboard
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        </motion.div>

        {/* Right Column: Floating Image & Stats */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative hidden lg:block h-[600px]"
        >
          {/* Animated AI Diagnostic Core (No Image Required) */}
          <motion.div
            animate={{ y: [-15, 15, -15] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-10 right-10 w-4/5 h-4/5 rounded-3xl overflow-hidden border border-slate-700/50 shadow-2xl shadow-cyan-900/40 z-20 bg-slate-900/80 backdrop-blur-xl flex items-center justify-center"
          >
            <div className="relative w-full h-full flex items-center justify-center">
              {/* Outer Rotating Dashed Ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                className="absolute w-80 h-80 rounded-full border-[2px] border-dashed border-cyan-500/20"
              />

              {/* Middle Pulsing Ring */}
              <motion.div
                animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.5, 0.2] }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute w-64 h-64 rounded-full border border-blue-500/40"
              />

              {/* Inner Fast Pulsing Ring */}
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.4, 0.1] }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.5,
                }}
                className="absolute w-48 h-48 rounded-full border border-purple-500/30"
              />

              {/* Center Glowing Core */}
              <div className="relative z-10 bg-gradient-to-br from-cyan-400 to-blue-600 w-28 h-28 rounded-full flex items-center justify-center shadow-[0_0_60px_rgba(8,145,178,0.6)]">
                <Brain className="w-12 h-12 text-white/90 drop-shadow-lg" />
              </div>

              {/* Floating Data Nodes (Simulating Biometric Processing) */}
              <motion.div
                animate={{ y: [-15, 15, -15] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute top-[25%] left-[25%] w-3 h-3 bg-cyan-400 rounded-full shadow-[0_0_15px_#22d3ee]"
              />
              <motion.div
                animate={{ y: [20, -20, 20] }}
                transition={{ duration: 5, repeat: Infinity }}
                className="absolute bottom-[20%] right-[30%] w-4 h-4 bg-purple-400 rounded-full shadow-[0_0_15px_#c084fc]"
              />
              <motion.div
                animate={{ x: [-15, 15, -15] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute top-[35%] right-[20%] w-2 h-2 bg-blue-400 rounded-full shadow-[0_0_10px_#60a5fa]"
              />
              <motion.div
                animate={{ x: [10, -10, 10], y: [10, -10, 10] }}
                transition={{ duration: 3.5, repeat: Infinity }}
                className="absolute bottom-[30%] left-[20%] w-2.5 h-2.5 bg-emerald-400 rounded-full shadow-[0_0_10px_#34d399]"
              />
            </div>
          </motion.div>

          {/* Floating Glassmorphism Stat Card 1 */}
          <motion.div
            animate={{ y: [10, -10, 10] }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
            className="absolute top-1/4 -left-8 bg-slate-900/80 backdrop-blur-md border border-slate-700 p-4 rounded-2xl shadow-xl z-30 flex items-center gap-4"
          >
            <div className="bg-red-500/20 p-3 rounded-xl">
              <Activity className="text-red-400 w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase font-bold">
                Live ECG
              </p>
              <p className="text-xl font-black text-white">
                74{" "}
                <span className="text-sm font-normal text-slate-500">bpm</span>
              </p>
            </div>
          </motion.div>

          {/* Floating Glassmorphism Stat Card 2 */}
          <motion.div
            animate={{ y: [-8, 8, -8] }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2,
            }}
            className="absolute bottom-1/4 -right-4 bg-slate-900/80 backdrop-blur-md border border-slate-700 p-4 rounded-2xl shadow-xl z-30 flex items-center gap-4"
          >
            <div className="bg-cyan-500/20 p-3 rounded-xl">
              <Brain className="text-cyan-400 w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase font-bold">
                AI Status
              </p>
              <p className="text-sm font-black text-emerald-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>{" "}
                Analyzing
              </p>
            </div>
          </motion.div>
        </motion.div>
      </main>

      {/* Modern Feature Grid (Bento Box Style) */}
      <div className="max-w-7xl mx-auto px-6 pb-32 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: Brain,
              title: "Predictive AI",
              desc: "Catches physiological spikes and anomalies before physical symptoms appear.",
              color: "text-purple-400",
              bg: "bg-purple-500/10",
            },
            {
              icon: Activity,
              title: "Omni-Modal Data",
              desc: "Unified liquid biopsy and biometric data for three major chronic conditions.",
              color: "text-blue-400",
              bg: "bg-blue-500/10",
            },
            {
              icon: Clock,
              title: "Always-On",
              desc: "24/7 wireless health surveillance with a painless microneedle wearable.",
              color: "text-emerald-400",
              bg: "bg-emerald-500/10",
            },
          ].map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.2 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="p-8 rounded-3xl bg-slate-800/40 border border-slate-700/50 backdrop-blur-md cursor-pointer group"
            >
              <div
                className={`${feature.bg} w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110`}
              >
                <feature.icon className={`w-7 h-7 ${feature.color}`} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">
                {feature.title}
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Smooth Modal Animation */}
      <AnimatePresence>
        {showPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: "spring", bounce: 0.4 }}
              className="bg-slate-900 rounded-3xl shadow-2xl shadow-cyan-900/20 w-full max-w-md overflow-hidden relative border border-slate-700"
            >
              <button
                onClick={() => setShowPopup(false)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-800 rounded-full transition-colors z-10"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="p-10 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-cyan-900/20 to-transparent pointer-events-none"></div>
                <div className="w-20 h-20 bg-cyan-950 border border-cyan-800 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(8,145,178,0.3)]">
                  <ShieldCheck className="w-10 h-10 text-cyan-400" />
                </div>
                <h2 className="text-3xl font-black text-white mb-3 tracking-tight">
                  System Ready
                </h2>
                <p className="text-slate-400 text-sm leading-relaxed px-4">
                  Your bio-signature patch is online. Access your secure
                  dashboard to view live analytics.
                </p>
              </div>

              <div className="p-8 pt-0 space-y-4">
                <button
                  onClick={() => navigate("/login")}
                  className="w-full py-4 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-cyan-900/50 flex justify-center items-center gap-2 group"
                >
                  Authenticate Securely{" "}
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => navigate("/register")}
                  className="w-full py-4 bg-transparent border-2 border-slate-700 hover:border-slate-500 text-slate-300 rounded-xl font-bold transition-colors"
                >
                  Pair New Device
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
