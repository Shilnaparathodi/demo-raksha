import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import './Dashboard.css';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const Dashboard = ({ requests, resources }) => {
    const priorityCounts = {
        1: requests.filter(r => r.priority === 1).length,
        2: requests.filter(r => r.priority === 2).length,
        3: requests.filter(r => r.priority === 3).length,
        4: requests.filter(r => r.priority === 4).length,
        5: requests.filter(r => r.priority === 5).length
    };

    const pendingCount = requests.filter(r => r.status === 'pending').length;
    const processedCount = requests.filter(r => r.status === 'processed').length;

    const resourceData = {
        labels: Object.keys(resources),
        datasets: [
            {
                label: 'Available Resources',
                data: Object.values(resources).map(r => r.quantity || 0),
                backgroundColor: 'rgba(54, 162, 235, 0.5)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }
        ]
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: { position: 'top' },
            title: { display: true, text: 'Resource Availability' }
        }
    };

    return (
        <div className="dashboard">
            <h2>📊 Live Dashboard</h2>
            <div className="stats-cards">
                <div className="stat-card">
                    <h3>Total Requests</h3>
                    <p className="stat-number">{requests.length}</p>
                </div>
                <div className="stat-card">
                    <h3>Pending</h3>
                    <p className="stat-number pending">{pendingCount}</p>
                </div>
                <div className="stat-card">
                    <h3>Processed</h3>
                    <p className="stat-number processed">{processedCount}</p>
                </div>
            </div>

            <div className="priority-stats">
                <h3>Requests by Priority</h3>
                <div className="priority-bars">
                    {[5, 4, 3, 2, 1].map(level => (
                        <div key={level} className="priority-item">
                            <span className="priority-label">Priority {level}</span>
                            <div className="priority-bar-container">
                                <div
                                    className={`priority-bar priority-${level}`}
                                    style={{ width: `${(priorityCounts[level] / (requests.length || 1)) * 100}%` }}
                                />
                            </div>
                            <span className="priority-count">{priorityCounts[level]}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="chart-container">
                <Bar data={resourceData} options={chartOptions} />
            </div>
        </div>
    );
};

export default Dashboard;
