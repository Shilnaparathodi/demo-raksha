import React, { useState } from 'react';
import DisasterMap from '../components/DisasterMap';
import { Cloud, Droplets, Wind, Thermometer } from 'lucide-react';
import './Home.css';

const Home = ({ requests, alerts }) => {
    const [searchLocation, setSearchLocation] = useState('');
    const [weatherData, setWeatherData] = useState(null);

    const handleSearch = (e) => {
        e.preventDefault();
        // Mock Weather API Call
        if (searchLocation.trim() !== '') {
            setWeatherData({
                location: searchLocation,
                temperature: 28 + Math.floor(Math.random() * 5), // Mock temp 28-32
                humidity: 70 + Math.floor(Math.random() * 20), // Mock humidity 70-90
                precipitation: Math.floor(Math.random() * 50),
                windSpeed: 10 + Math.floor(Math.random() * 15),
                condition: ['Heavy Rain', 'Thunderstorm', 'Overcast', 'Mist'].includes(searchLocation) ? searchLocation : 'Heavy Rain'
            });
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
                    <button type="submit" className="weather-search-btn">Check Status</button>
                </form>
            </div>

            <div className="main-content">
                <div className="map-container">
                    <DisasterMap requests={requests} alerts={alerts} />
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
