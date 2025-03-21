import React from 'react';
import { ToastContainer } from 'react-toastify';
import ModernDrugClassification from './components/ModernDrugClassification';
import { DrugClassificationProvider } from './components/context/DrugClassificationProvider';
import { AuthProvider } from './components/context/AuthProvider';
import './toastify.css';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <AuthProvider>
        <DrugClassificationProvider>
          <ModernDrugClassification />
          <ToastContainer 
            position="bottom-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            toastClassName="toast-theme-light"
          />
        </DrugClassificationProvider>
      </AuthProvider>
    </div>
  );
}

export default App; 