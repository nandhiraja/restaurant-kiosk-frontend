import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, Lock, Save, Trash2, X, MapPin, CreditCard } from 'lucide-react';
import './Styles/ConfigPage.css';

const ADMIN_PIN = '9579';
const API_URL = 'https://ktr-kiosk-9pcyp.ondigitalocean.app/admin/edc-config';

const ConfigPage = () => {
    const navigate = useNavigate();

    // Authentication state
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [pin, setPin] = useState(['', '', '', '']);
    const [pinError, setPinError] = useState('');
    const inputRefs = [useRef(), useRef(), useRef(), useRef()];

    // Configuration state
    const [edcConfigs, setEdcConfigs] = useState([]);
    const [selectedConfigId, setSelectedConfigId] = useState('');
    const [selectedConfig, setSelectedConfig] = useState(null);
    const [currentConfig, setCurrentConfig] = useState(null);
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    // Load current config from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('kiosk_config');
        if (saved) {
            setCurrentConfig(JSON.parse(saved));
        }
    }, []);

    // Handle PIN digit change
    const handlePinChange = (index, value) => {
        if (value.length > 1) value = value[0]; // Only one digit

        const newPin = [...pin];
        newPin[index] = value;
        setPin(newPin);
        setPinError('');

        // Auto-focus next input
        if (value && index < 3) {
            inputRefs[index + 1].current?.focus();
        }

        // Auto-submit when all digits filled
        if (index === 3 && value) {
            const fullPin = newPin.join('');
            if (fullPin === ADMIN_PIN) {
                setIsAuthenticated(true);
                fetchEDCConfigs();
            } else {
                setPinError('Invalid PIN');
                setPin(['', '', '', '']);
                inputRefs[0].current?.focus();
            }
        }
    };

    // Handle PIN digit keydown (backspace)
    const handlePinKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !pin[index] && index > 0) {
            inputRefs[index - 1].current?.focus();
        }
    };

    // Fetch EDC configurations from API
    const fetchEDCConfigs = async () => {
        setLoading(true);
        try {
            const response = await fetch(API_URL, {
                headers: { "ngrok-skip-browser-warning": "true" }
            });
            if (!response.ok) throw new Error('Failed to fetch configurations');

            const data = await response.json();
            setEdcConfigs(data);

            // If there's a current config, pre-select it
            if (currentConfig) {
                const config = data.find(c =>
                    c.store_id === currentConfig.store_id &&
                    c.mid_on_device === currentConfig.mid_on_device
                );
                if (config) {
                    setSelectedConfigId(config.id.toString());
                    setSelectedConfig(config);
                }
            }
        } catch (error) {
            console.error('Error fetching EDC configs:', error);
            setPinError('Failed to load configurations');
        } finally {
            setLoading(false);
        }
    };

    // Handle configuration selection
    const handleConfigChange = (e) => {
        const configId = e.target.value;
        setSelectedConfigId(configId);

        if (configId) {
            const config = edcConfigs.find(c => c.id.toString() === configId);
            setSelectedConfig(config);
        } else {
            setSelectedConfig(null);
        }
        setSuccessMessage('');
    };

    // Save configuration to localStorage
    const handleSaveConfig = () => {
        if (!selectedConfig) {
            alert('Please select a configuration');
            return;
        }

        const configToSave = {
            store_id: selectedConfig.store_id,
            merchant_id: selectedConfig.merchant_id,
            terminal_id: selectedConfig.terminal_id,
            mid_on_device: selectedConfig.mid_on_device,
            tid_on_device: selectedConfig.tid_on_device,
            configured_at: new Date().toISOString()
        };

        localStorage.setItem('kiosk_config', JSON.stringify(configToSave));
        setCurrentConfig(configToSave);
        setSuccessMessage('Configuration saved!');

        setTimeout(() => setSuccessMessage(''), 3000);
    };

    // Clear configuration
    const handleClearConfig = () => {
        if (window.confirm('Clear current configuration?')) {
            localStorage.removeItem('kiosk_config');
            setCurrentConfig(null);
            setSelectedConfigId('');
            setSelectedConfig(null);
            setSuccessMessage('Configuration cleared');
            setTimeout(() => setSuccessMessage(''), 3000);
        }
    };

    // PIN Authentication Screen
    if (!isAuthenticated) {
        return (
            <div className="config-overlay">
                <div className="config-pin-modal">
                    <div className="pin-icon">
                        <Lock size={36} />
                    </div>
                    <h2>Admin Access</h2>
                    <p>Enter 4-digit PIN</p>

                    <div className="pin-inputs">
                        {pin.map((digit, index) => (
                            <input
                                key={index}
                                ref={inputRefs[index]}
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]"
                                maxLength="1"
                                className="pin-digit"
                                value={digit}
                                onChange={(e) => handlePinChange(index, e.target.value)}
                                onKeyDown={(e) => handlePinKeyDown(index, e)}
                                autoFocus={index === 0}
                            />
                        ))}
                    </div>

                    {pinError && <div className="pin-error">{pinError}</div>}

                    <button onClick={() => navigate('/')} className="cancel-btn-full">
                        Cancel
                    </button>
                </div>
            </div>
        );
    }

    // Main Configuration Screen
    return (
        <div className="config-page">
            <div className="config-container">
                {/* Header */}
                <div className="config-header">
                    <div className="header-left">
                        <Settings size={24} />
                        <h1>EDC Config</h1>
                    </div>
                    <button onClick={() => navigate('/')} className="close-config-btn">
                        <X size={16} />
                        Close
                    </button>
                </div>

                {loading && <div className="loading">Loading...</div>}

                {successMessage && (
                    <div className="success-banner">
                        {successMessage}
                    </div>
                )}

                {/* Main Grid Layout */}
                <div className="config-grid">
                    {/* Current Configuration Card */}
                    <div className="config-card current-card">
                        <div className="card-header">
                            <MapPin size={18} />
                            <h3>Active Config</h3>
                        </div>

                        {currentConfig ? (
                            <>
                                <div className="config-info">
                                    <div className="info-row">
                                        <span className="info-label">Store</span>
                                        <span className="info-value">{currentConfig.store_id}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="info-label">MID</span>
                                        <span className="info-value">{currentConfig.mid_on_device}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="info-label">TID</span>
                                        <span className="info-value">{currentConfig.tid_on_device}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="info-label">Terminal</span>
                                        <span className="info-value small">{currentConfig.terminal_id}</span>
                                    </div>
                                </div>
                                <button onClick={handleClearConfig} className="clear-btn">
                                    <Trash2 size={14} />
                                    Clear
                                </button>
                            </>
                        ) : (
                            <div className="no-config">
                                <p>Not configured</p>
                            </div>
                        )}
                    </div>

                    {/* New Configuration Card */}
                    <div className="config-card setup-card">
                        <div className="card-header">
                            <CreditCard size={18} />
                            <h3>Select Machine</h3>
                        </div>

                        <select
                            value={selectedConfigId}
                            onChange={handleConfigChange}
                            className="edc-select"
                        >
                            <option value="">Choose...</option>
                            {edcConfigs.map(config => (
                                <option key={config.id} value={config.id}>
                                    {config.store_id} • {config.mid_on_device}
                                </option>
                            ))}
                        </select>

                        {selectedConfig && (
                            <>
                                <div className="config-info">
                                    <div className="info-row">
                                        <span className="info-label">Store</span>
                                        <span className="info-value">{selectedConfig.store_id}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="info-label">MID</span>
                                        <span className="info-value">{selectedConfig.mid_on_device}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="info-label">TID</span>
                                        <span className="info-value">{selectedConfig.tid_on_device}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="info-label">Terminal</span>
                                        <span className="info-value small">{selectedConfig.terminal_id}</span>
                                    </div>
                                </div>

                                <button onClick={handleSaveConfig} className="save-btn">
                                    <Save size={14} />
                                    Save Config
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfigPage;
