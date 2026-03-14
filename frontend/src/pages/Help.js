import React from 'react';
import RequestForm from '../components/RequestForm';
import AIChatbotRequestForm from '../components/AIChatbotRequestForm';
import './Help.css';

const Help = ({ onSubmit }) => {
    return (
        <div className="help-page">
            <div className="help-header">
                <h2>Emergency Assistance</h2>
                <p>Request help using our standard form or chat with Raksha AI</p>
            </div>
            
            <div className="help-content flex-container">
                <div className="form-section flex-75">
                    <div className="section-card">
                        <div className="card-header">
                            <h3>Standard Request Form</h3>
                        </div>
                        <div className="card-body form-wrapper">
                            <RequestForm onSubmit={onSubmit} />
                        </div>
                    </div>
                </div>
                
                <div className="chatbot-section flex-25">
                    <div className="section-card">
                        <div className="card-header bg-chat">
                            <h3>Raksha AI Assistant</h3>
                        </div>
                        <div className="card-body chat-wrapper">
                            <AIChatbotRequestForm onSubmit={onSubmit} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Help;
