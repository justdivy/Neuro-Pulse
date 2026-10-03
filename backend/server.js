const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");
const PDFDocument = require("pdfkit");
const VitalSign = require("./models/VitalSign");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

require("dotenv").config();

const missingEnvironmentVariables = ["MONGODB_URI", "JWT_SECRET"].filter(
  (name) => !process.env[name]
);

if (missingEnvironmentVariables.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missingEnvironmentVariables.join(", ")}`
  );
}

const app = express();
const server = http.createServer(app);
const User = require("./models/User")
const JWT_SECRET = process.env.JWT_SECRET;

function createUserProfile(user) {
  return {
    uid: user.uid,
    name: user.name,
    email: user.email,
    institution: user.institution,
    dateOfBirth: user.dateOfBirth || user.dob
  };
}

async function removeLegacyProfileDefaults(user) {
  let changed = false;

  if (user.institution === "Chandigarh University, Mohali") {
    user.institution = undefined;
    changed = true;
  }

  if (user.dateOfBirth === "2002" || user.dob === "2002") {
    user.dateOfBirth = undefined;
    user.dob = undefined;
    changed = true;
  }

  if (!user.dateOfBirth && user.dob && user.dob !== "2002") {
    user.dateOfBirth = user.dob;
    user.dob = undefined;
    changed = true;
  }

  if (changed) {
    await user.save();
  }
}

function requireAuth(req, res, next) {
  const authorization = req.headers.authorization;
  const token = authorization?.startsWith("Bearer ")
    ? authorization.slice(7)
    : null;

  if (!token) {
    return res.status(401).json({ message: "Authentication required." });
  }

  try {
    req.auth = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired authentication token." });
  }
}

// WebSockets - Connect backend to frontend
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("🟢 Connection with MongoDB is Successful.."))
  .catch((err) => console.error("🔴 MongoDB Connection Error", err));


// --- THE CORE DATA PIPELINE FUNCTION ---
// Handles both fake test data and real ESP32 data!
async function processAndSaveData(data) {
  let isDataAnomalous = false;

  // Step A: Ask the Python AI if this data is dangerous
  try {
    const aiResponse = await fetch('http://localhost:8000/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    const analysis = await aiResponse.json();
    
    // Step B: Trigger the red UI Alert if AI says it's dangerous
    if (analysis.status === "anomaly_detected") {
      console.log("⚠️ AI ALERT:", analysis.message);
      io.emit('critical_health_alert', analysis);
      isDataAnomalous = true;
    }
  } catch (err) {
    // If Python server isn't running yet, just ignore and keep saving data
  }

  // Step C: Save permanently to MongoDB
  try {
    const newRecord = new VitalSign({
      patientId: data.patientId,
      heartRate: data.heartRate,
      spO2: data.spO2,
      temp: data.temp,
      isAnomaly: isDataAnomalous
    });
    await newRecord.save();
  } catch (err) {
    console.error("🔴 Failed to save to DB:", err.message);
  }

  // Step D: Send to React Frontend for the Live Graphs
  io.emit("frontend_dashboard_update", data);
}
// ------------------------------------------


// Websocket Connection Logic
io.on("connection", (socket) => {
  console.log(`New Client Connected: ${socket.id}`);

  // Incoming data from REAL sensor ESP32 (When it arrives)
  socket.on("esp32_sensor_data", async (data) => {
    await processAndSaveData(data);
  });

  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// ==========================================
// --- REST API ROUTES ---
// ==========================================

// Health Check Endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "Neuro-Pulse Backend is live" });
});

// ==========================================
// --- AUTHENTICATION ROUTES ---
// ==========================================

// 1. Register a new user
app.post("/api/auth/register", async (req, res) => {
  try {
    const { uid, name, email, password } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { uid }] });
    if (existingUser) {
      return res.status(400).json({ message: "User with this UID or Email already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = new User({ uid, name, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: "Registration successful!" });
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ message: "Server error during registration." });
  }
});

// 2. Login an existing user
app.post("/api/auth/login", async (req, res) => {
  try {
    const { identifier, password } = req.body;

    // Find user by either UID or Email
    const user = await User.findOne({ 
      $or: [{ email: identifier }, { uid: identifier }] 
    });

    const passwordMatches = user && user.password?.startsWith("$2")
      ? await bcrypt.compare(password, user.password)
      : user?.password === password;

    if (!user || !passwordMatches) {
      return res.status(401).json({ message: "Invalid credentials. Access Denied." });
    }

    if (!user.password.startsWith("$2")) {
      user.password = await bcrypt.hash(password, 12);
      await user.save();
    }

    await removeLegacyProfileDefaults(user);
    const userProfile = createUserProfile(user);
    const token = jwt.sign({ sub: user._id.toString() }, JWT_SECRET, { expiresIn: "7d" });

    res.status(200).json({ message: "Login successful", token, user: userProfile });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server error during login." });
  }
});

// Restore and validate the current session after a page refresh.
app.get("/api/auth/me", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.auth.sub);

    if (!user) {
      return res.status(401).json({ message: "User account no longer exists." });
    }

    await removeLegacyProfileDefaults(user);
    res.status(200).json({ user: createUserProfile(user) });
  } catch (error) {
    console.error("Session validation error:", error);
    res.status(500).json({ message: "Server error during session validation." });
  }
});

// Update profile fields for the currently authenticated user only.
app.patch("/api/auth/me", requireAuth, async (req, res) => {
  try {
    const { institution, dateOfBirth } = req.body;
    const user = await User.findById(req.auth.sub);

    if (!user) {
      return res.status(401).json({ message: "User account no longer exists." });
    }

    user.institution = typeof institution === "string" ? institution.trim() : "";
    user.dateOfBirth = typeof dateOfBirth === "string" ? dateOfBirth.trim() : "";
    user.dob = undefined;
    await user.save();

    res.status(200).json({ message: "Profile updated successfully.", user: createUserProfile(user) });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({ message: "Server error while updating profile." });
  }
});

// PDF Report Generator Route
app.get('/api/reports/:patientId', requireAuth, async (req, res) => {
  try {
    const { patientId } = req.params;
    const user = await User.findById(req.auth.sub).select("uid");

    if (!user) {
      return res.status(401).json({ message: "User account no longer exists." });
    }

    if (patientId !== user.uid) {
      return res.status(403).json({ message: "You are not authorized to access this report." });
    }
    
    // 1. Fetch the last 50 readings from MongoDB for this patient
    const records = await VitalSign.find({ patientId })
      .sort({ timestamp: -1 })
      .limit(50);

    if (!records || records.length === 0) {
      return res.status(404).json({ message: "No data found for this patient." });
    }

    // 2. Set up the PDF Document
    const doc = new PDFDocument({ margin: 50 });
    
    // Set headers so the browser knows it's receiving a PDF file to download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=NeuroPulse_Report_${patientId}.pdf`);
    
    // Pipe the PDF directly to the user's browser
    doc.pipe(res);

    // 3. Draw the PDF Content
    // Header
    doc.fontSize(24).fillColor('#0891b2').text('NEURO-PULSE', { align: 'center' });
    doc.fontSize(10).fillColor('gray').text('AI-Powered Continuous Health Surveillance', { align: 'center' });
    doc.moveDown(2);

    // Patient Info
    doc.fontSize(16).fillColor('black').text('Clinical Vitals Report');
    doc.fontSize(12).fillColor('#333333').text(`Patient UID: ${patientId}`);
    doc.text(`Report Generated: ${new Date().toLocaleString()}`);
    doc.text(`Total Records Analyzed: ${records.length}`);
    doc.moveDown(2);

    // AI Summary
    const anomalies = records.filter(r => r.isAnomaly).length;
    doc.fontSize(14).fillColor(anomalies > 0 ? 'red' : 'green').text(`AI Anomaly Summary: ${anomalies} Critical Events Detected`);
    doc.moveDown(1);

    // Data Table Header
    doc.fontSize(10).fillColor('black');
    doc.text('Date & Time', 50, doc.y, { continued: true });
    doc.text('Heart Rate', 200, doc.y, { continued: true });
    doc.text('SpO2', 300, doc.y, { continued: true });
    doc.text('Temp (°C)', 400, doc.y);
    
    doc.moveTo(50, doc.y + 5).lineTo(550, doc.y + 5).stroke();
    doc.moveDown(1);

    // Data Rows
    records.forEach(record => {
      // If there's an anomaly, make the text red
      doc.fillColor(record.isAnomaly ? 'red' : '#475569');
      
      const timeStr = new Date(record.timestamp).toLocaleString();
      doc.text(timeStr, 50, doc.y, { continued: true });
      doc.text(`${record.heartRate} bpm`, 200, doc.y, { continued: true });
      doc.text(`${record.spO2}%`, 300, doc.y, { continued: true });
      doc.text(`${record.temp}`, 400, doc.y);
      doc.moveDown(0.5);
    });

    // 4. Finalize the PDF
    doc.end();

  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).send("Failed to generate report.");
  }
});

app.use("/api", (req, res) => {
  res.status(404).json({ message: "API endpoint not found." });
});

app.use((error, req, res, next) => {
  console.error("Unhandled API error:", error);
  if (req.path.startsWith("/api")) {
    return res.status(500).json({ message: "Unexpected server error." });
  }
  next(error);
});

const PORT = process.env.PORT || 5000;

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(`Port ${PORT} is already in use. The Neuro-Pulse backend may already be running.`);
    process.exit(1);
  }

  console.error("Backend server error:", error.message);
  process.exit(1);
});

server.listen(PORT, () => {
  console.log(`🟢 Server is running on Port ${PORT}`);
});