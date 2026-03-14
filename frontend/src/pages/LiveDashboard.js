import React from 'react';
import Dashboard from '../components/Dashboard';

const LiveDashboard = ({ requests, resources }) => {
    return (
        <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ marginBottom: '20px', background: 'white', padding: '15px 25px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', borderLeft: '4px solid #f39c12' }}>
                <h2 style={{ color: '#1e3c72', margin: '0 0 5px 0' }}>Live Operations Dashboard</h2>
                <p style={{ color: '#666', margin: 0 }}>Real-time coordination of emergency requests and resource allocation.</p>
            </div>
            <Dashboard requests={requests} resources={resources} />
        </div>
    );
};

export default LiveDashboard;
