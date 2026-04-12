const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");
const PDFDocument = require("pdfkit");
const VitalSign = require("./models/VitalSign");

require("dotenv").config();

const app = express();
const server = http.createServer(app);
const User = require("./models/User")

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
      patientId: data.patientId || '25MCI10161',
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

// Temporary Test Route (Fake Data Generator)
setInterval(async () => {
  const fakeData = {
    patientId: '25MCI10161',
    heartRate: Math.floor(Math.random() * (105 - 65 + 1) + 65), // Range tweaked to trigger AI alerts
    spO2: Math.floor(Math.random() * (100 - 93 + 1) + 93),      // Range tweaked to trigger AI alerts
    temp: parseFloat((Math.random() * (37.5 - 36.1) + 36.1).toFixed(1))
  };
  
  // We pass the fake test data into the exact same pipeline!
  await processAndSaveData(fakeData);
}, 2000);


// ==========================================
// --- REST API ROUTES ---
// ==========================================

// Health Check Endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "Tri-Sentinel Backend is live" });
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

    // Save to MongoDB
    const newUser = new User({ uid, name, email, password });
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

    // Check if user exists AND password matches
    if (!user || user.password !== password) {
      return res.status(401).json({ message: "Invalid credentials. Access Denied." });
    }

    // Success! Send back the user's profile data (excluding password)
    const userProfile = {
      uid: user.uid,
      name: user.name,
      email: user.email,
      institution: user.institution,
      dob: user.dob
    };

    res.status(200).json({ message: "Login successful", user: userProfile });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server error during login." });
  }
});

// PDF Report Generator Route
app.get('/api/reports/:patientId', async (req, res) => {
  try {
    const { patientId } = req.params;
    
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
    res.setHeader('Content-Disposition', `attachment; filename=TriSentinel_Report_${patientId}.pdf`);
    
    // Pipe the PDF directly to the user's browser
    doc.pipe(res);

    // 3. Draw the PDF Content
    // Header
    doc.fontSize(24).fillColor('#0891b2').text('TRI-SENTINEL', { align: 'center' });
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

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🟢 Server is running on Port ${PORT}`);
});