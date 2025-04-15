import React, { useState } from 'react';
import { QrReader } from 'react-qr-reader';
import dayjs from 'dayjs';
import { FaCamera } from 'react-icons/fa'; // Import icon
import NavBar from './Navbar';

const QRVerifier = () => {
  const [scanResult, setScanResult] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [scanned, setScanned] = useState(false);
  const [isScannerVisible, setIsScannerVisible] = useState(false); // State to control scanner visibility

  const handleScan = (result, error) => {
    if (result?.text && !scanned) {
      const scannedId = result.text.trim();
      setScanResult(scannedId);
      verifyAccess(scannedId);
      setScanned(true);

      // Prevent multiple scans for 3 seconds
      setTimeout(() => setScanned(false), 3000);
    }

    if (error && error.name !== 'NotFoundException') {
      console.error('QR Decode Error:', error.message || error);
    }
  };

  const verifyAccess = (id) => {
    const validEntries = JSON.parse(localStorage.getItem('validEntries')) || [];
    const record = validEntries.find((entry) => entry.id === id);

    if (!record) {
      setFeedback('❌ Invalid User');
      return;
    }

    const now = dayjs();
    const entryTime = dayjs(record.entry);
    const exitTime = dayjs(record.exit);

    if (now.isAfter(entryTime) && now.isBefore(exitTime)) {
      setFeedback(`✅ Access Granted: ${record.name} (${record.id})`);
    } else {
      setFeedback('❌ Access Denied: Outside allowed time');
    }
  };

  const toggleScanner = () => {
    setIsScannerVisible(!isScannerVisible); // Toggle the scanner visibility
  };

  return (
    <>
    <NavBar></NavBar>
    <div style={styles.container}>
      <h2 style={styles.title}>Admin Panel - QR Verification</h2>

      {/* Button with Camera Icon to toggle scanner */}
      <button onClick={toggleScanner} style={styles.toggleButton}>
        <FaCamera style={styles.icon} /> Scan QR
      </button>

      {/* QR Scanner */}
      {isScannerVisible && (
        <div style={styles.scannerBox}>
          <QrReader
            onResult={handleScan}
            constraints={{ facingMode: 'environment' }}
            containerStyle={{ width: '100%' }}
          />
        </div>
      )}

      {scanResult && (
        <div style={styles.resultBox}>
          <p><strong>Scanned ID:</strong> {scanResult}</p>
          <p>{feedback}</p>
        </div>
      )}
    </div>
    </>
  );
};

export default QRVerifier;

// Inline styles
const styles = {
  container: {
    padding: '24px',
    maxWidth: '600px',
    margin: '0 auto',
    textAlign: 'center',
    fontFamily: 'Arial, sans-serif',
  },
  title: {
    fontSize: '20px',
    fontWeight: 'bold',
    marginBottom: '16px',
  },
  toggleButton: {
    backgroundColor: '#3182ce',
    color: 'white',
    padding: '10px 20px',
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '20px',
  },
  icon: {
    fontSize: '20px',
  },
  scannerBox: {
    border: '2px solid #ccc',
    borderRadius: '8px',
    overflow: 'hidden',
    marginBottom: '24px',
  },
  resultBox: {
    backgroundColor: '#f7fafc',
    padding: '16px',
    borderRadius: '8px',
    border: '1px solid #cbd5e0',
    marginTop: '16px',
  },
};
