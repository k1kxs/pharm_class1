import React, { FC } from 'react';
import ModernDrugClassification from './components/ModernDrugClassification';
import { DrugClassificationProvider } from './components/context/DrugClassificationProvider';
import { AuthProvider } from './components/context/AuthProvider';

const App: FC = () => {
  return (
    <div className="App">
      <AuthProvider>
        <DrugClassificationProvider>
          <ModernDrugClassification />
        </DrugClassificationProvider>
      </AuthProvider>
    </div>
  );
}

export default App; 