import React, { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import dayjs from 'dayjs';
import { FaCamera } from 'react-icons/fa';
import NavBar from './Navbar';

const QRVerifier = () => {
  const [scanResult, setScanResult] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [scannerVisible, setScannerVisible] = useState(false);

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

  useEffect(() => {
    if (scannerVisible) {
      const scanner = new Html5QrcodeScanner('reader', {
        fps: 10,
        qrbox: { width: 250, height: 250 },
      });

      scanner.render(
        (decodedText) => {
          if (!scanResult) {
            const scannedId = decodedText.trim();
            setScanResult(scannedId);
            verifyAccess(scannedId);
            scanner.clear(); // stop scanning after first scan
          }
        },
        (error) => {
          console.warn('QR scan error:', error);
        }
      );

      return () => {
        Html5QrcodeScanner.clear().catch(err => console.error('Failed to clear html5-qrcode', err));
      };
    }
  }, [scannerVisible]);

  const toggleScanner = () => {
    setScanResult(null);
    setFeedback('');
    setScannerVisible(!scannerVisible);
  };

  return (
    <>
      <NavBar />
      <div style={styles.container}>
        <h2 style={styles.title}>Admin Panel - QR Verification</h2>

        <button onClick={toggleScanner} style={styles.toggleButton}>
          <FaCamera style={styles.icon} /> {scannerVisible ? 'Stop Scanner' : 'Scan QR'}
        </button>

        {scannerVisible && (
          <div id="reader" style={styles.scannerBox}></div>
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
    width: '100%',
    maxWidth: '300px',
    margin: 'auto',
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
