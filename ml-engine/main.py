from fastapi import FastAPI
from pydantic import BaseModel
import random

app = FastAPI(title="Neuro-Pulse AI Engine")

# Define the data structure we expect from Node.js
class VitalSigns(BaseModel):
    heartRate: int
    spO2: int
    temp: float
    patientId: str

@app.get("/")
def read_root():
    return {"status": "AI Engine Online", "version": "1.0"}

@app.post("/predict")
def predict_anomaly(vitals: VitalSigns):
    print(f"Analyzing Vitals -> HR: {vitals.heartRate}, SpO2: {vitals.spO2}, Temp: {vitals.temp}")
    
    is_anomaly = False
    warning_message = []

    # 1. Cardiac Check (Tachycardia / Bradycardia)
    if vitals.heartRate > 100:
        is_anomaly = True
        warning_message.append(f"Elevated Heart Rate ({vitals.heartRate} bpm)")
    elif vitals.heartRate < 50:
        is_anomaly = True
        warning_message.append(f"Depressed Heart Rate ({vitals.heartRate} bpm)")

    # 2. Respiratory/Hypoxia Check
    if vitals.spO2 < 95:
        is_anomaly = True
        warning_message.append(f"Critical SpO2 Drop ({vitals.spO2}%)")

    # 3. Fever / Infection Check
    if vitals.temp > 37.8:
        is_anomaly = True
        warning_message.append(f"Elevated Temperature ({vitals.temp}°C)")

    # Formulate the response expected by Node.js
    if is_anomaly:
        final_message = " | ".join(warning_message)
        return {
            "status": "anomaly_detected",
            "confidence": round(random.uniform(0.85, 0.99), 2), # Simulated ML confidence score
            "message": final_message
        }
    else:
        return {
            "status": "normal",
            "confidence": 0.99,
            "message": "Vitals stable."
        }