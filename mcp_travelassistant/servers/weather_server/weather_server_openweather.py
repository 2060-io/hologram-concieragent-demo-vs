import requests
import json
import os
from typing import Dict, Optional, Any
from datetime import datetime
from mcp.server.fastmcp import FastMCP

# Directory to store weather search results
WEATHER_DIR = "weather_data"

# Initialize FastMCP server
mcp = FastMCP("weather-search-openweather")

# OpenWeatherMap API base URL
OWM_BASE_URL = "https://api.openweathermap.org/data/2.5"

def get_api_key() -> Optional[str]:
    """Get OpenWeatherMap API key from environment variable."""
    api_key = os.getenv("OPENWEATHER_API_KEY")
    if not api_key:
        # Try without API key for free tier (limited requests)
        return None
    return api_key

def save_weather_data(data: Dict[str, Any], filename: str) -> str:
    """Save weather data to file and return file path."""
    os.makedirs(WEATHER_DIR, exist_ok=True)
    file_path = os.path.join(WEATHER_DIR, f"{filename}.json")
    
    with open(file_path, "w") as f:
        json.dump(data, f, indent=2)
    
    return file_path

@mcp.tool()
def get_current_conditions(
    location: str,
    units: str = "metric"
) -> Dict[str, Any]:
    """
    Get current weather conditions for a location.
    
    Args:
        location: City name (e.g., "Tokyo, Japan" or "New York, US") or coordinates "lat,lon"
        units: Temperature units - "metric" (Celsius), "imperial" (Fahrenheit), or "kelvin"
        
    Returns:
        Dict containing current weather conditions
    """
    api_key = get_api_key()
    if not api_key:
        return {"error": "OPENWEATHER_API_KEY environment variable is required. Get a free key at https://openweathermap.org/api"}
    
    try:
        # Build API URL
        if "," in location and location.replace(",", "").replace(".", "").replace("-", "").replace(" ", "").isdigit():
            # It's coordinates
            url = f"{OWM_BASE_URL}/weather"
            params = {
                "lat": location.split(",")[0].strip(),
                "lon": location.split(",")[1].strip(),
                "units": units,
                "appid": api_key
            }
        else:
            # It's a city name
            url = f"{OWM_BASE_URL}/weather"
            params = {
                "q": location,
                "units": units,
                "appid": api_key
            }
        
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        # Format the response
        result = {
            "location": {
                "name": data.get("name", location),
                "country": data.get("sys", {}).get("country", ""),
                "coordinates": {
                    "lat": data.get("coord", {}).get("lat"),
                    "lon": data.get("coord", {}).get("lon")
                }
            },
            "current": {
                "temperature": data.get("main", {}).get("temp"),
                "feels_like": data.get("main", {}).get("feels_like"),
                "humidity": data.get("main", {}).get("humidity"),
                "pressure": data.get("main", {}).get("pressure"),
                "description": data.get("weather", [{}])[0].get("description", ""),
                "main_condition": data.get("weather", [{}])[0].get("main", ""),
                "wind_speed": data.get("wind", {}).get("speed"),
                "wind_direction": data.get("wind", {}).get("deg"),
                "visibility": data.get("visibility"),
                "cloudiness": data.get("clouds", {}).get("all")
            },
            "units": units,
            "timestamp": datetime.now().isoformat()
        }
        
        # Save the data
        search_id = f"current_{location.replace(' ', '_').replace(',', '_')}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        save_weather_data(result, search_id)
        result["search_id"] = search_id
        
        return result
        
    except requests.exceptions.RequestException as e:
        return {"error": f"API request failed: {str(e)}"}
    except Exception as e:
        return {"error": f"Error processing weather data: {str(e)}"}

@mcp.tool()
def get_weather_forecast(
    location: str,
    days: int = 5,
    units: str = "metric"
) -> Dict[str, Any]:
    """
    Get weather forecast for a location.
    
    Args:
        location: City name (e.g., "Tokyo, Japan" or "New York, US") or coordinates "lat,lon"
        days: Number of days to forecast (1-5 days, free tier supports up to 5)
        units: Temperature units - "metric" (Celsius), "imperial" (Fahrenheit), or "kelvin"
        
    Returns:
        Dict containing weather forecast
    """
    api_key = get_api_key()
    if not api_key:
        return {"error": "OPENWEATHER_API_KEY environment variable is required. Get a free key at https://openweathermap.org/api"}
    
    try:
        # Limit days to 5 for free tier
        if days > 5:
            days = 5
        
        # Build API URL
        if "," in location and location.replace(",", "").replace(".", "").replace("-", "").replace(" ", "").isdigit():
            # It's coordinates
            url = f"{OWM_BASE_URL}/forecast"
            params = {
                "lat": location.split(",")[0].strip(),
                "lon": location.split(",")[1].strip(),
                "units": units,
                "cnt": days * 8,  # 8 forecasts per day (3-hour intervals)
                "appid": api_key
            }
        else:
            # It's a city name
            url = f"{OWM_BASE_URL}/forecast"
            params = {
                "q": location,
                "units": units,
                "cnt": days * 8,
                "appid": api_key
            }
        
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        # Format the forecast
        forecasts = []
        for item in data.get("list", [])[:days * 8]:
            forecasts.append({
                "datetime": item.get("dt_txt"),
                "temperature": item.get("main", {}).get("temp"),
                "feels_like": item.get("main", {}).get("feels_like"),
                "humidity": item.get("main", {}).get("humidity"),
                "pressure": item.get("main", {}).get("pressure"),
                "description": item.get("weather", [{}])[0].get("description", ""),
                "main_condition": item.get("weather", [{}])[0].get("main", ""),
                "wind_speed": item.get("wind", {}).get("speed"),
                "wind_direction": item.get("wind", {}).get("deg"),
                "cloudiness": item.get("clouds", {}).get("all"),
                "precipitation_probability": item.get("pop", 0) * 100  # Convert to percentage
            })
        
        result = {
            "location": {
                "name": data.get("city", {}).get("name", location),
                "country": data.get("city", {}).get("country", ""),
                "coordinates": {
                    "lat": data.get("city", {}).get("coord", {}).get("lat"),
                    "lon": data.get("city", {}).get("coord", {}).get("lon")
                }
            },
            "forecast_days": days,
            "forecasts": forecasts,
            "units": units,
            "timestamp": datetime.now().isoformat()
        }
        
        # Save the data
        search_id = f"forecast_{location.replace(' ', '_').replace(',', '_')}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        save_weather_data(result, search_id)
        result["search_id"] = search_id
        
        return result
        
    except requests.exceptions.RequestException as e:
        return {"error": f"API request failed: {str(e)}"}
    except Exception as e:
        return {"error": f"Error processing forecast data: {str(e)}"}

@mcp.tool()
def get_weather_data_details(search_id: str) -> str:
    """
    Get detailed information about a specific weather search.
    
    Args:
        search_id: The search ID returned from weather tools
        
    Returns:
        JSON string with detailed weather information
    """
    file_path = os.path.join(WEATHER_DIR, f"{search_id}.json")
    
    if not os.path.exists(file_path):
        return json.dumps({"error": f"Weather search not found: {search_id}"})
    
    try:
        with open(file_path, "r") as f:
            data = json.load(f)
        return json.dumps(data, indent=2)
    except Exception as e:
        return json.dumps({"error": f"Error reading weather data: {str(e)}"})

if __name__ == "__main__":
    mcp.run()

