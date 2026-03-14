import React, { useState } from 'react';
import DisasterMap from '../components/DisasterMap';
import { Cloud, Droplets, Wind, Thermometer } from 'lucide-react';
import './Home.css';

const Home = ({ requests, alerts }) => {
    const [searchLocation, setSearchLocation] = useState('');
    const [weatherData, setWeatherData] = useState(null);
    const [searchedCoords, setSearchedCoords] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSearch = async (e) => {
        e.preventDefault();
        const query = searchLocation.trim();
        if (!query) return;

        setIsLoading(true);
        try {
            // 1. Geocode with Nominatim (OpenStreetMap)
            const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`);
            if (!geoRes.ok) throw new Error('Geocoding API failed');
            const geoData = await geoRes.json();

            if (geoData.length === 0) {
                alert('Location not found in OpenStreetMap. Please try a different city or region name.');
                setIsLoading(false);
                return;
            }

            const { lat, lon, display_name } = geoData[0];
            const parsedLat = parseFloat(lat);
            const parsedLon = parseFloat(lon);
            
            // Extract a shorter name for the weather card (usually the city/locality)
            const shortName = display_name.split(',')[0];
            setSearchedCoords({ lat: parsedLat, lng: parsedLon, name: shortName });

            // 2. Fetch actual weather from Open-Meteo
            const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${parsedLat}&longitude=${parsedLon}&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,weather_code`);
            if (!weatherRes.ok) throw new Error('Weather API failed');
            const weatherJson = await weatherRes.json();
            
            const current = weatherJson.current;

            const getWeatherDescription = (code) => {
                if (code === 0) return 'Clear Sky';
                if (code >= 1 && code <= 3) return 'Partly Cloudy';
                if (code === 45 || code === 48) return 'Foggy';
                if (code >= 51 && code <= 55) return 'Drizzle';
                if (code >= 56 && code <= 57) return 'Freezing Drizzle';
                if (code >= 61 && code <= 65) return 'Rain';
                if (code >= 66 && code <= 67) return 'Freezing Rain';
                if (code >= 71 && code <= 75) return 'Snow';
                if (code === 77) return 'Snow Grains';
                if (code >= 80 && code <= 82) return 'Rain Showers';
                if (code >= 85 && code <= 86) return 'Snow Showers';
                if (code >= 95 && code <= 99) return 'Thunderstorm';
                return 'Overcast';
            };

            setWeatherData({
                location: shortName,
                temperature: current.temperature_2m,
                humidity: current.relative_humidity_2m,
                precipitation: current.precipitation,
                windSpeed: current.wind_speed_10m,
                condition: getWeatherDescription(current.weather_code)
            });

        } catch (err) {
            console.error('Error fetching APIs', err);
            alert('Could not connect to the API services. Check console for details.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="home-page">
            <div className="search-section">
                <form onSubmit={handleSearch} className="weather-search-form">
                    <input 
                        type="text" 
                        placeholder="Search district for local weather (e.g., Kochi)" 
                        value={searchLocation}
                        onChange={(e) => setSearchLocation(e.target.value)}
                        className="weather-input"
                    />
                    <button type="submit" className="weather-search-btn" disabled={isLoading}>
                        {isLoading ? 'Searching...' : 'Check Status'}
                    </button>
                </form>
            </div>

            <div className="main-content">
                <div className="map-container">
                    <DisasterMap 
                        requests={requests} 
                        alerts={alerts} 
                        searchedLocation={searchedCoords} 
                    />
                </div>
                
                <div className="sidebar">
                    {weatherData ? (
                        <div className="weather-card">
                            <h3>Current Weather: {weatherData.location}</h3>
                            <div className="weather-condition">{weatherData.condition}</div>
                            
                            <div className="weather-stats">
                                <div className="weather-stat">
                                    <Thermometer className="weather-icon" size={20} />
                                    <span>{weatherData.temperature}°C</span>
                                </div>
                                <div className="weather-stat">
                                    <Droplets className="weather-icon" size={20} />
                                    <span>{weatherData.humidity}% Humidity</span>
                                </div>
                                <div className="weather-stat">
                                    <Cloud className="weather-icon" size={20} />
                                    <span>{weatherData.precipitation}mm Rain</span>
                                </div>
                                <div className="weather-stat">
                                    <Wind className="weather-icon" size={20} />
                                    <span>{weatherData.windSpeed} km/h Wind</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="weather-card empty">
                            <Cloud size={48} color="#ccc" />
                            <p>Enter a location above to view weather conditions</p>
                            {/* Replace with real API integration like OpenWeatherMap later */}
                        </div>
                    )}
                    
                    <div className="info-card">
                        <h3>NDMA Emergency Guidelines</h3>
                        <ul>
                            <li>Stay tuned to local radio/TV stations</li>
                            <li>Move to higher ground if flash flood warning is issued</li>
                            <li>Do not walk or drive through flowing water</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
