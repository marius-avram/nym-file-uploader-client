import React from 'react';
import { AppProvider } from './App.context';
import './App.css';
import { Homepage } from './components/Homepage';

function App() {
  return (
      <AppProvider>
        <div className="App">
          <p>&nbsp;</p>
          <Homepage />
        </div>
      </AppProvider>
  );
}

export default App;
