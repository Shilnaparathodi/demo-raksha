import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Help from './pages/Help';
import LiveDashboard from './pages/LiveDashboard';
import './App.css';

function App() {
    const [requests, setRequests] = useState([
        {
            id: '1',
            name: 'John Doe',
            type: 'medical',
            description: 'Need ambulance for injured person',
            location: 'Kochi',
            priority: 4,
            urgency: 4,
            people: 1,
            status: 'pending',
            timestamp: new Date()
        },
        {
            id: '2',
            name: 'Jane Smith',
            type: 'food',
            description: 'Family stranded, need food',
            location: 'Alappuzha',
            priority: 2,
            urgency: 3,
            people: 4,
            status: 'pending',
            timestamp: new Date()
        }
    ]);

    const [resources, setResources] = useState({
        food: { quantity: 100 },
        medicine: { quantity: 50 },
        boats: { quantity: 10 },
        shelter: { quantity: 200 },
        water: { quantity: 300 }
    });

    const [alerts, setAlerts] = useState([
        {
            id: 'alert1',
            type: 'Flood Alert',
            severity: 'High',
            country: 'India',
            lat: 9.9312,
            lng: 76.2673
        }
    ]);

    const handleSubmitRequest = async (requestData) => {
        // 1. Calculate Priority (simulating the Cloud Function)
        const description = (requestData.description || '').toLowerCase();
        const requestType = requestData.type || '';

        let priority = 3; // Default medium

        if (description.includes('heart attack') ||
            description.includes('bleeding') ||
            description.includes('trapped') ||
            description.includes('unconscious') ||
            description.includes('fire') ||
            description.includes('collapse')) {
            priority = 5;
        } else if (description.includes('medical') ||
            description.includes('injured') ||
            description.includes('hospital') ||
            description.includes('ambulance') ||
            requestType === 'medical' ||
            description.includes('chest pain')) {
            priority = 4;
        } else if (description.includes('food') ||
            description.includes('water') ||
            requestType === 'food' ||
            requestType === 'water') {
            priority = 2;
        } else if (description.includes('information') ||
            description.includes('query') ||
            description.includes('help')) {
            priority = 1;
        }

        // 2. Add To State
        const newRequest = {
            ...requestData,
            id: Date.now().toString(),
            priority,
            status: 'pending',
            timestamp: new Date()
        };

        setRequests(prev => [newRequest, ...prev]);

        // 3. Decrement Resources based on request type
        setResources(prev => {
            const newResources = { ...prev };

            if (requestType === 'food' || requestType === 'water') {
                if (newResources[requestType] && newResources[requestType].quantity > 0) {
                    newResources[requestType].quantity -= 1;
                }
            } else if (requestType === 'medical') {
                if (newResources.medicine && newResources.medicine.quantity > 0) {
                    newResources.medicine.quantity -= 1;
                }
            } else if (requestType === 'rescue') {
                if (newResources.boats && newResources.boats.quantity > 0) {
                    newResources.boats.quantity -= 1;
                }
            }
            return newResources;
        });

        return true;
    };

    return (
        <Router>
            <div className="App">
                <Navbar />
                <main className="App-main">
                    <Routes>
                        <Route path="/" element={<Home requests={requests} alerts={alerts} />} />
                        <Route path="/help" element={<Help onSubmit={handleSubmitRequest} />} />
                        <Route path="/dashboard" element={<LiveDashboard requests={requests} resources={resources} />} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

export default App;
