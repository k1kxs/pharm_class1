import React from 'react';
import ReactDOM from 'react-dom/client';
// Импортируем CSS
import './index.css';
import App from './App';
import './toastify.css';
import './components/styles/print-styles.css';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
); 