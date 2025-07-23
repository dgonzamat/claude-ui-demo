import React from 'react';
import ChartGenerator from './ChartGenerator';
import './chart-styles.css';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Generador Avanzado de Gráficos</h1>
        <p>Crea, personaliza y exporta gráficos de negocio con facilidad.</p>
      </header>
      <main>
        <ChartGenerator />
      </main>
      <Toaster 
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
    </div>
  );
}

export default App;
