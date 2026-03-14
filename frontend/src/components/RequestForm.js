import React, { useState } from 'react';
import './RequestForm.css';

const RequestForm = ({ onSubmit }) => {
    const [formData, setFormData] = useState({
        type: 'food',
        description: '',
        location: '',
        urgency: 3,
        people: 1,
        name: ''
    });
    
    // Automatically detect real-world connection
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [offlineQueue, setOfflineQueue] = useState(() => JSON.parse(localStorage.getItem('offlineRequests') || '[]'));
    const [submitting, setSubmitting] = useState(false);

    // Set up listeners for the browser's internet connection
    React.useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            syncOfflineRequests();
        };
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        if (!navigator.onLine) {
            const queue = JSON.parse(localStorage.getItem('offlineRequests') || '[]');
            queue.push({ ...formData, offlineId: Date.now() });
            localStorage.setItem('offlineRequests', JSON.stringify(queue));
            setOfflineQueue(queue);
            alert('You are offline. Request saved locally. It will auto-sync when your internet returns.');
            setFormData({ type: 'food', description: '', location: '', urgency: 3, people: 1, name: '' });
        } else {
            const success = await onSubmit(formData);
            if (success) {
                setFormData({ type: 'food', description: '', location: '', urgency: 3, people: 1, name: '' });
            }
        }
        setSubmitting(false);
    };

    const syncOfflineRequests = async () => {
        const queue = JSON.parse(localStorage.getItem('offlineRequests') || '[]');
        for (const req of queue) {
            await onSubmit(req);
        }
        localStorage.removeItem('offlineRequests');
        setOfflineQueue([]);
        alert('All offline requests synced!');
    };

    return (
        <div className="request-form-container">
            <h2>🚨 Submit Emergency Request</h2>
            <div className="offline-status">
                {!isOnline && (
                    <div className="offline-banner">
                        🔴 No Internet Connection - Offline Mode Active. Your requests will be saved and synced automatically when back online.
                    </div>
                )}
                
                {isOnline && offlineQueue.length > 0 && (
                    <div className="syncing-banner">
                        🟢 Back Online! Auto-syncing {offlineQueue.length} saved requests...
                    </div>
                )}
            </div>

            <form onSubmit={handleSubmit} className="request-form">
                <div className="form-group">
                    <label>Your Name</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Request Type</label>
                    <select name="type" value={formData.type} onChange={handleChange}>
                        <option value="food">Food</option>
                        <option value="medical">Medical Help</option>
                        <option value="rescue">Rescue</option>
                        <option value="shelter">Shelter</option>
                        <option value="water">Drinking Water</option>
                    </select>
                </div>
                <div className="form-group">
                    <label>Description</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Describe your emergency..."
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Location</label>
                    <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        placeholder="Enter city or area"
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Urgency Level (1-5): {formData.urgency}</label>
                    <input
                        type="range"
                        name="urgency"
                        min="1"
                        max="5"
                        value={formData.urgency}
                        onChange={handleChange}
                    />
                </div>
                <div className="form-group">
                    <label>Number of People</label>
                    <input
                        type="number"
                        name="people"
                        min="1"
                        value={formData.people}
                        onChange={handleChange}
                        required
                    />
                </div>
                <button type="submit" disabled={submitting} className="submit-btn">
                    {submitting ? 'Submitting...' : 'Submit Request'}
                </button>
            </form>
        </div>
    );
};

export default RequestForm;
