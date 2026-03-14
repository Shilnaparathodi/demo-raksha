import React from 'react';
import { NavLink } from 'react-router-dom';
import { Shield, Home, HelpCircle, Activity } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
    return (
        <nav className="raksha-navbar">
            <div className="navbar-container">
                <div className="navbar-brand">
                    <Shield className="brand-icon" size={28} />
                    <div className="brand-text">
                        <h1>RAKSHA</h1>
                        <span>Kerala Disaster Coordination</span>
                    </div>
                </div>
                <div className="navbar-links">
                    <NavLink to="/" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
                        <Home size={18} /> Home
                    </NavLink>
                    <NavLink to="/help" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
                        <HelpCircle size={18} /> Help
                    </NavLink>
                    <NavLink to="/dashboard" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
                        <Activity size={18} /> Live Dashboard
                    </NavLink>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
