
import { toast } from "sonner";

const API_KEY = "2e352944885625815c7a09cc02557b09";
const BASE_URL = "https://api.openweathermap.org/data/2.5";

export interface WeatherData {
  location: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  description: string;
  icon: string;
  country: string;
  timestamp: Date;
}

export interface ForecastData {
  date: Date;
  temperature: number;
  description: string;
  icon: string;
}

export async function getCurrentWeather(location: string): Promise<WeatherData | null> {
  try {
    const response = await fetch(
      `${BASE_URL}/weather?q=${encodeURIComponent(location)}&units=metric&appid=${API_KEY}`
    );
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("Location not found. Please try another location.");
      }
      throw new Error("Weather service error. Please try again later.");
    }
    
    const data = await response.json();
    
    return {
      location: data.name,
      temperature: Math.round(data.main.temp),
      feelsLike: Math.round(data.main.feels_like),
      humidity: data.main.humidity,
      windSpeed: data.wind.speed,
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      country: data.sys.country,
      timestamp: new Date()
    };
  } catch (error: any) {
    toast.error(error.message || "Failed to get weather data");
    return null;
  }
}

export async function getWeatherForecast(location: string): Promise<ForecastData[] | null> {
  try {
    const response = await fetch(
      `${BASE_URL}/forecast?q=${encodeURIComponent(location)}&units=metric&appid=${API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error("Weather forecast service error");
    }
    
    const data = await response.json();
    
    // Get one forecast per day (at noon) for the next 5 days
    const dailyForecasts = data.list
      .filter((item: any) => item.dt_txt.includes("12:00:00"))
      .slice(0, 5)
      .map((item: any) => ({
        date: new Date(item.dt * 1000),
        temperature: Math.round(item.main.temp),
        description: item.weather[0].description,
        icon: item.weather[0].icon
      }));
      
    return dailyForecasts;
  } catch (error) {
    console.error("Weather forecast error:", error);
    return null;
  }
}

export async function getUserLocation(): Promise<{ lat: number; lon: number } | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      resolve(null);
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lon: position.coords.longitude
        });
      },
      (error) => {
        console.error("Error getting location:", error);
        toast.error("Unable to get your location");
        resolve(null);
      }
    );
  });
}

export async function getWeatherByCoordinates(coordinates: { lat: number; lon: number }): Promise<WeatherData | null> {
  try {
    const response = await fetch(
      `${BASE_URL}/weather?lat=${coordinates.lat}&lon=${coordinates.lon}&units=metric&appid=${API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error("Weather service error for coordinates");
    }
    
    const data = await response.json();
    
    return {
      location: data.name,
      temperature: Math.round(data.main.temp),
      feelsLike: Math.round(data.main.feels_like),
      humidity: data.main.humidity,
      windSpeed: data.wind.speed,
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      country: data.sys.country,
      timestamp: new Date()
    };
  } catch (error) {
    console.error("Weather by coordinates error:", error);
    return null;
  }
}
