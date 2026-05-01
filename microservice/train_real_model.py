import os
import requests
import datetime
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score
import joblib

NASA_API_KEY = os.getenv("NASA_API_KEY", "tdBdGkgqo3tm00E4lsoaCD5VBK2mnMQHuA6P0yzs")
NASA_BASE_URL = "https://api.nasa.gov/neo/rest/v1/feed"

def fetch_historical_nasa_data():
    """Fetches several weeks of historical data to build a good dataset."""
    print("Fetching historical asteroid data from NASA API...")
    
    # We will pick 5 representative 7-day windows to get ~500-1000 real records
    date_ranges = [
        ("2023-01-01", "2023-01-07"),
        ("2023-04-10", "2023-04-16"),
        ("2022-08-01", "2022-08-07"),
        ("2021-11-15", "2021-11-21"),
        ("2024-02-01", "2024-02-07")
    ]
    
    dataset = []
    
    for start_str, end_str in date_ranges:
        print(f"  Downloading window: {start_str} to {end_str}")
        url = f"{NASA_BASE_URL}?start_date={start_str}&end_date={end_str}&api_key={NASA_API_KEY}"
        
        response = requests.get(url)
        if response.status_code != 200:
            print(f"  Warning: Failed to fetch {start_str} (Status: {response.status_code})")
            continue
            
        data = response.json()
        near_earth_objects = data.get("near_earth_objects", {})
        
        for date, objects in near_earth_objects.items():
            for obj in objects:
                # Target feature
                is_hazardous = obj.get("is_potentially_hazardous_asteroid", False)
                
                # Model features based on main.py definitions
                mag = float(obj.get("absolute_magnitude_h", 0))
                diameter_max = float(obj.get("estimated_diameter", {}).get("kilometers", {}).get("estimated_diameter_max", 0))
                
                close_data = obj.get("close_approach_data", [{}])
                if len(close_data) > 0:
                    velocity = float(close_data[0].get("relative_velocity", {}).get("kilometers_per_second", 0))
                    miss_dist = float(close_data[0].get("miss_distance", {}).get("kilometers", 0))
                else:
                    velocity = 0.0
                    miss_dist = 0.0
                    
                dataset.append({
                    "magnitude": mag,
                    "diameter_max_km": diameter_max,
                    "velocity_kms": velocity,
                    "miss_distance_km": miss_dist,
                    "is_hazardous": 1 if is_hazardous else 0
                })
                
    return pd.DataFrame(dataset)

def train_and_export():
    df = fetch_historical_nasa_data()
    
    if df.empty:
        print("Error: No data was fetched from NASA API. Check your internet connection or API key.")
        return
        
    print(f"\nDataset built successfully. Total records: {len(df)}")
    print(f"Data Distribution (Safe=0, Danger=1):\n{df['is_hazardous'].value_counts()}")
    
    # Define features and target
    X = df[["magnitude", "diameter_max_km", "velocity_kms", "miss_distance_km"]]
    y = df["is_hazardous"]
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    
    print("\nTraining Random Forest model on REAL NASA data...")
    # Increase estimators for a genuinely robust model
    model = RandomForestClassifier(n_estimators=200, random_state=42, max_depth=10, class_weight='balanced')
    model.fit(X_train, y_train)
    
    # Evaluate
    predictions = model.predict(X_test)
    acc = accuracy_score(y_test, predictions)
    print(f"\nModel Accuracy: {acc * 100:.2f}%")
    print("Classification Report:")
    print(classification_report(y_test, predictions))
    
    # Export
    filename = "Forest.pkl"
    joblib.dump(model, filename)
    print(f"\nSUCCESS: Model successfully saved as '{filename}'.")
    print("Now update main.py to load this file.")

if __name__ == "__main__":
    import ssl
    # Handle occasional python cert issues on some windows machines
    ssl._create_default_https_context = ssl._create_unverified_context
    train_and_export()
