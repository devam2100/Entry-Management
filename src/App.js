import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import QRUploader from './components/QrUploader';
import InvalidDataPage from './components/InvalidDataPage';
import QRVerifier from './components/QrVarifyer';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<QRUploader />} />
        <Route path="/verify" element={<QRVerifier />} />
        <Route path="/invalid-data" element={<InvalidDataPage />} />
      </Routes>
    </Router>
  );
}

export default App;
