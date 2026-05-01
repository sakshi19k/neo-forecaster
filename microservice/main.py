import os
import math
import requests
import random
import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
from typing import List, Dict
from sklearn.ensemble import RandomForestClassifier
import shap
import json
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events."""
    try:
        get_cached_global_stats()
        print("AI Model & SHAP Cache Initialized.")
    except Exception as e:
        print(f"Startup Warning: {e}")
    yield

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration
NASA_API_KEY = os.getenv("NASA_API_KEY", "tdBdGkgqo3tm00E4lsoaCD5VBK2mnMQHuA6P0yzs")
NASA_BASE_URL = os.getenv("NASA_BASE_URL", "https://api.nasa.gov/neo/rest/v1/feed")

#Standard Astronomical estimate for density of asteroids in kg/m^3
DENSITY_KG_M3 = 2500

# Feature Names for SHAP
FEATURES = ["magnitude", "diameter_max_km", "velocity_kms", "miss_distance_km"]

# --- ML Model Initialization ---
import joblib

def load_real_model():
    """Load the real model trained on NASA data."""
    try:
        model = joblib.load("Forest.pkl")
        print("Loaded real AI model from Forest.pkl successfully.")
        explainer = shap.TreeExplainer(model)
        return model, explainer
    except Exception as e:
        print(f"Warning: Could not load Forest.pkl. Error: {e}. Falling back to basic dummy model.")
        X = np.array([[18, 1.5, 35, 500000], [22, 0.2, 15, 5000000]])
        y = np.array([1, 0])
        model = RandomForestClassifier(n_estimators=10, random_state=42)
        model.fit(X, y)
        explainer = shap.TreeExplainer(model)
        return model, explainer

# Global instances and cache
rf_model, shap_explainer = load_real_model()
CACHED_GLOBAL_STATS = None

def get_cached_global_stats():
    global CACHED_GLOBAL_STATS
    if CACHED_GLOBAL_STATS is None:
        background_data = np.array([
            [18, 1.5, 35, 500000],
            [22, 0.2, 15, 5000000],
            [19, 0.8, 25, 1000000],
            [25, 0.05, 10, 15000000]
        ])
        shap_values = shap_explainer.shap_values(background_data)
        
        # Robustly extract mean absolute importance for the "Danger" class
        if isinstance(shap_values, list):
            # List of arrays, take class 1
            vals = shap_values[1] if len(shap_values) > 1 else shap_values[0]
            mean_abs_shap = np.abs(vals).mean(axis=0)
        elif len(shap_values.shape) == 3:
            # (Samples, Features, Classes), take class 1
            mean_abs_shap = np.abs(shap_values[:, :, 1]).mean(axis=0)
        else:
            mean_abs_shap = np.abs(shap_values).mean(axis=0)
            
        global_importance = []
        for i, val in enumerate(mean_abs_shap):
            global_importance.append({
                "feature": FEATURES[i],
                "importance": float(np.atleast_1d(val)[0])
            })
        CACHED_GLOBAL_STATS = {
            "model": "Planetary Defense RF-v1",
            "global_importance": global_importance,
            "training_samples": 8
        }
    return CACHED_GLOBAL_STATS

def calculate_physics(diameter_km: float, velocity_kms: float) -> Dict:
    radius_m = (diameter_km * 1000) / 2
    volume_m3 = (4/3) * math.pi * (radius_m ** 3)
    mass_kg = DENSITY_KG_M3 * volume_m3
    velocity_ms = velocity_kms * 1000
    kinetic_energy_joules = 0.5 * mass_kg * (velocity_ms ** 2)
    energy_megatons = kinetic_energy_joules / (4.184 * 10**15)
    return {"mass_kg": mass_kg, "kinetic_energy_megatons": energy_megatons}

@app.get("/api/nasa-threats")
async def get_nasa_threats():
    # Fetching a 7-day range to provide enough data for pagination/refresh
    import datetime
    end_date = datetime.datetime.now()
    start_date = end_date - datetime.timedelta(days=7)
    
    start_str = start_date.strftime("%Y-%m-%d")
    end_str = end_date.strftime("%Y-%m-%d")
    
    url = f"{NASA_BASE_URL}?start_date={start_str}&end_date={end_str}&api_key={NASA_API_KEY}"
    try:
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()
        
        raw_neo = data.get("near_earth_objects", {})
        processed_neo = {}
        
        for date_str, objects in raw_neo.items():
            processed_date_list = []
            for obj in objects:
                mag = float(obj.get("absolute_magnitude_h", 0))
                diameter_max = float(obj.get("estimated_diameter", {}).get("kilometers", {}).get("estimated_diameter_max", 0))
                close_data = obj.get("close_approach_data", [{}])[0]
                velocity = float(close_data.get("relative_velocity", {}).get("kilometers_per_second", 0))
                miss_dist = float(close_data.get("miss_distance", {}).get("kilometers", 0))
                
                physics = calculate_physics(diameter_max, velocity)
                features_array = np.array([[mag, diameter_max, velocity, miss_dist]])
                prediction_prob = rf_model.predict_proba(features_array)[0][1]
                prediction = "DANGER" if prediction_prob > 0.4 else "SAFE"
                
                processed_date_list.append({
                    "id": obj.get("id"),
                    "name": obj.get("name"),
                    "absolute_magnitude": mag,
                    "diameter_max_km": diameter_max,
                    "velocity_kms": velocity,
                    "miss_distance_km": miss_dist,
                    "mass_kg": physics["mass_kg"],
                    "kinetic_energy_megatons": physics["kinetic_energy_megatons"],
                    "prediction": prediction,
                    "danger_probability": float(prediction_prob)
                })
            processed_neo[date_str] = processed_date_list
            
        return {"near_earth_objects": processed_neo}
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/explain/{asteroid_id}")
async def explain_impact(asteroid_id: str, mag: float, diameter: float, velocity: float, miss_dist: float):
    """Calculate SHAP values for a specific asteroid prediction."""
    try:
        features_array = np.array([[mag, diameter, velocity, miss_dist]])
        shap_values = shap_explainer.shap_values(features_array, check_additivity=False)
        
        # Robust extraction for single sample
        if isinstance(shap_values, list):
            importance = shap_values[1][0] if len(shap_values) > 1 else shap_values[0][0]
        elif len(shap_values.shape) == 3:
            importance = shap_values[0, :, 1]
        else:
            importance = shap_values[0]

        explanation = []
        for i, val in enumerate(importance):
            explanation.append({
                "feature": FEATURES[i],
                "score": float(np.atleast_1d(val)[0])
            })
        return {"asteroid_id": asteroid_id, "explanations": explanation}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/model-stats")
async def get_model_stats():
    """Return cached global feature importance."""
    try:
        return get_cached_global_stats()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
