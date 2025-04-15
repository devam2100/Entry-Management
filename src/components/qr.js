
import React from 'react';
import QRUploader from './QrUploader';
import QRVerifier from './QrVarifyer';
import NavBar from './Navbar';
function QrApp() {
  return (
    <div className="p-4">
 
      <h1 className="text-2xl font-bold mb-4 text-center">QR Access Manager</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>

          <QRUploader />
        </div>
        <div>
          <QRVerifier />
        </div>
      </div>
    </div>
  );
}

export default QrApp;


