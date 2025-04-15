import React, { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import dayjs from 'dayjs';
import { FaCamera } from 'react-icons/fa';
import NavBar from './Navbar';
import CryptoJS from 'crypto-js';

const secretKey = 'k9f$VdL#39qpL@7x!';

const decryptData = (cipherText) => {
  try {
    const bytes = CryptoJS.AES.decrypt(cipherText, secretKey);
    const decryptedText = bytes.toString(CryptoJS.enc.Utf8);
    return decryptedText;
  } catch (err) {
    console.error("Decryption failed:", err);
    return null;
  }
};

const QRVerifier = () => {
  const [scanResult, setScanResult] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [scannerVisible, setScannerVisible] = useState(false);
  const [scannerInstance, setScannerInstance] = useState(null);

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
            const decrypted = decryptData(decodedText.trim());

            if (!decrypted) {
              setFeedback('❌ Failed to decrypt QR code.');
              return;
            }

            const [id, name] = decrypted.split('|');
            verifyAccess(id);
            setScanResult(id);
            setFeedback(`✅ Scanned ID: ${id} - ${name}`);

            scanner.clear().then(() => {
              console.log('Scanner stopped');
            }).catch((err) => console.error('Clear failed', err));
          }
        },
        (error) => {
          console.warn('QR scan error:', error);
        }
      );

      setScannerInstance(scanner);

      return () => {
        scanner.clear().catch((err) =>
          console.error('Failed to clear html5-qrcode', err)
        );
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
      <div style={styles.wrapper}>
        <div style={styles.card}>
          <h2 style={styles.title}>🎯 Admin QR Verification</h2>

          <button onClick={toggleScanner} style={styles.toggleButton}>
            <FaCamera style={styles.icon} />
            {scannerVisible ? 'Stop Scanner' : 'Start Scan'}
          </button>

          {scannerVisible && <div id="reader" style={styles.scanner}></div>}

          {scanResult && (
            <div style={styles.resultBox}>
              <h4 style={styles.resultTitle}>🔍 Scan Result</h4>
              <p><strong>ID:</strong> {scanResult}</p>
              <p>{feedback}</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default QRVerifier;

const styles = {
  wrapper: {
    display: 'flex',
    justifyContent: 'center',
    padding: '40px 20px',
    backgroundColor: '#f0f4f8',
    minHeight: '100vh',
  },
  card: {
    backgroundColor: '#ffffff',
    padding: '30px',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    maxWidth: '500px',
    width: '100%',
    textAlign: 'center',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#2c5282',
    marginBottom: '20px',
  },
  toggleButton: {
    backgroundColor: '#2b6cb0',
    color: '#fff',
    padding: '12px 24px',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '10px',
    cursor: 'pointer',
    transition: 'background 0.3s',
    marginBottom: '24px',
  },
  icon: {
    fontSize: '18px',
  },
  scanner: {
    width: '100%',
    maxWidth: '300px',
    margin: '0 auto 24px',
  },
  resultBox: {
    backgroundColor: '#e6fffa',
    padding: '20px',
    borderRadius: '10px',
    border: '1px solid #81e6d9',
    marginTop: '20px',
    color: '#234e52',
  },
  resultTitle: {
    fontSize: '18px',
    fontWeight: '600',
    marginBottom: '10px',
  },
};
