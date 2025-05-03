
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { getCurrentWeather, getWeatherForecast, getUserLocation, getWeatherByCoordinates, WeatherData, ForecastData } from "@/utils/weatherService";
import { CloudSun, CloudRain, Thermometer, Wind } from "lucide-react";

interface WeatherPanelProps {
  isMobile: boolean;
  setMessages: React.Dispatch<React.SetStateAction<any[]>>;
}

const WeatherPanel: React.FC<WeatherPanelProps> = ({ isMobile, setMessages }) => {
  const [searchLocation, setSearchLocation] = useState("");
  const [currentWeather, setCurrentWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastData[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Get weather for user's location on component mount
    const getLocationWeather = async () => {
      setIsLoading(true);
      const location = await getUserLocation();
      if (location) {
        const weather = await getWeatherByCoordinates(location);
        if (weather) {
          setCurrentWeather(weather);
          const forecastData = await getWeatherForecast(weather.location);
          setForecast(forecastData);
        }
      }
      setIsLoading(false);
    };
    
    getLocationWeather();
  }, []);

  const handleSearch = async () => {
    if (!searchLocation.trim()) {
      toast.error("Please enter a location");
      return;
    }
    
    setIsLoading(true);
    const weather = await getCurrentWeather(searchLocation);
    if (weather) {
      setCurrentWeather(weather);
      const forecastData = await getWeatherForecast(searchLocation);
      setForecast(forecastData);
      
      // Add message to chat
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "system",
          content: `Weather searched for: ${searchLocation}`,
          timestamp: new Date(),
        },
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: `Current weather in ${weather.location}, ${weather.country}: ${weather.temperature}°C, ${weather.description}. Humidity: ${weather.humidity}%, Wind: ${weather.windSpeed} m/s.`,
          timestamp: new Date(),
        }
      ]);
    }
    setIsLoading(false);
  };

  const getWeatherIcon = (iconCode: string) => {
    const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    return iconUrl;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).format(date);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={`flex-1 overflow-y-auto p-4 ${isMobile ? "" : "max-w-4xl mx-auto"}`}
    >
      <div className="mb-6">
        <div className="flex gap-2">
          <Input
            placeholder="Enter city name..."
            value={searchLocation}
            onChange={(e) => setSearchLocation(e.target.value)}
            className="bg-background/70 backdrop-blur-sm"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearch();
              }
            }}
          />
          <Button onClick={handleSearch} disabled={isLoading}>
            {isLoading ? "Loading..." : "Search"}
          </Button>
        </div>
      </div>

      {currentWeather ? (
        <div className="space-y-6">
          <Card className="bg-background/70 backdrop-blur-sm border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between">
                <span>{currentWeather.location}, {currentWeather.country}</span>
                <span className="text-2xl">{currentWeather.temperature}°C</span>
              </CardTitle>
              <CardDescription>
                Updated {new Date(currentWeather.timestamp).toLocaleTimeString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="flex items-center">
                  <img 
                    src={getWeatherIcon(currentWeather.icon)} 
                    alt={currentWeather.description}
                    className="w-16 h-16"
                  />
                  <span className="text-lg capitalize">{currentWeather.description}</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Thermometer className="h-4 w-4 text-orange-400" />
                    <span>Feels like: {currentWeather.feelsLike}°C</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CloudRain className="h-4 w-4 text-blue-400" />
                    <span>Humidity: {currentWeather.humidity}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Wind className="h-4 w-4 text-gray-400" />
                    <span>Wind: {currentWeather.windSpeed} m/s</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {forecast && (
            <Card className="bg-background/70 backdrop-blur-sm border-primary/20">
              <CardHeader>
                <CardTitle>5-Day Forecast</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`grid ${isMobile ? "grid-cols-2 gap-2" : "grid-cols-5 gap-4"}`}>
                  {forecast.map((day, index) => (
                    <div 
                      key={index} 
                      className="flex flex-col items-center p-2 rounded-md bg-background/40"
                    >
                      <div className="font-medium">{formatDate(day.date)}</div>
                      <img 
                        src={getWeatherIcon(day.icon)} 
                        alt={day.description} 
                        className="w-10 h-10"
                      />
                      <div className="text-lg">{day.temperature}°C</div>
                      <div className="text-xs text-center capitalize">{day.description}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-64">
          {isLoading ? (
            <div className="animate-pulse flex flex-col items-center">
              <CloudSun className="h-16 w-16 text-primary mb-4" />
              <p>Loading weather data...</p>
            </div>
          ) : (
            <div className="text-center">
              <CloudSun className="h-16 w-16 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-medium mb-2">Weather Information</h3>
              <p className="text-muted-foreground">
                Enter a city name to get weather information or allow location access.
              </p>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default WeatherPanel;
