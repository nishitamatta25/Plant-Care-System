import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

// Import all styles
import './assets/styles.css';
import './assets/auth-styles.css';
import './assets/modal-fix.css';
import './assets/scanner-styles.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  // Removing React.StrictMode so it doesn't run script twice or interfere with legacy DOM mounting
  <App />
);
