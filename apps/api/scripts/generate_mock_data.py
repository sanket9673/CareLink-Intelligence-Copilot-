import csv
import random
from datetime import datetime, timedelta
import os

def generate_mock_csv(file_path, num_rows=500):
    end_time = datetime.now()
    start_time = end_time - timedelta(minutes=15 * num_rows)
    
    # Ensure directory exists
    os.makedirs(os.path.dirname(file_path), exist_ok=True)
    
    headers = ['timestamp', 'glucose_level', 'event_type', 'value']
    
    current_glucose = 120
    
    with open(file_path, mode='w', newline='') as file:
        writer = csv.writer(file)
        writer.writerow(headers)
        
        for i in range(num_rows):
            timestamp = (start_time + timedelta(minutes=15 * i)).isoformat()
            
            # Simple random walk for glucose
            current_glucose += random.randint(-10, 10)
            current_glucose = max(70, min(250, current_glucose))
            
            # Randomly add meal/bolus events every few rows
            event_type = 'sensor'
            value = current_glucose
            
            if random.random() < 0.1: # 10% chance of a meal
                event_type = 'meal'
                value = random.randint(30, 80) # carbs
            elif random.random() < 0.1: # 10% chance of a bolus
                event_type = 'bolus'
                value = random.randint(2, 10) # units
                
            writer.writerow([timestamp, current_glucose, event_type, value])

    print(f"Data generated for window: {start_time} to {end_time}")
    print(f"Generated {num_rows} rows of mock data at {file_path}")

if __name__ == "__main__":
    file_path = os.path.join(os.path.dirname(__file__), "..", "data", "mock_carelink.csv")
    generate_mock_csv(file_path)
