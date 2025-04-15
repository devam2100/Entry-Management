import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
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
  const html5QrCodeRef = useRef(null);

  const verifyAccess = (id) => {
    const validEntries = JSON.parse(localStorage.getItem('validEntries')) || [];
    const record = validEntries.find((entry) => entry.id === id);

    if (!record) {
      setFeedback('❌ Invalid User');
      return;
    }

    const now = dayjs();
    const entryTime = dayjs(record.entry);
    const fifteenMinutesLater = entryTime.add(15, 'minute');

    if (now.isAfter(entryTime) && now.isBefore(fifteenMinutesLater)) {
      setFeedback(`✅ Access Granted: ${record.name} (${record.id})`);
    } else if (now.isBefore(entryTime)) {
      setFeedback('⏳ Too Early: Please wait until your time slot starts.');
    } else {
      setFeedback('❌ Access Denied: You are late, time slot expired.');
    }
  };

  const startScanner = async () => {
    if (!html5QrCodeRef.current) {
      html5QrCodeRef.current = new Html5Qrcode("reader");
    }

    try {
      await html5QrCodeRef.current.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          if (!scanResult) {
            const decrypted = decryptData(decodedText.trim());

            if (!decrypted) {
              setFeedback('❌ Failed to decrypt QR code.');
              return;
            }

            const [id, name] = decrypted.split('|');
            setScanResult(id);
            verifyAccess(id);
            setFeedback(`✅ Scanned ID: ${id} - ${name}`);

            html5QrCodeRef.current.stop().then(() => {
              console.log('Scanner stopped');
            }).catch((err) => console.error('Stop failed', err));
          }
        },
        (error) => {
          // Scanning error (can be ignored or logged)
        }
      );
    } catch (err) {
      console.error('Camera start failed', err);
      setFeedback('❌ Unable to access camera');
    }
  };

  const stopScanner = () => {
    if (html5QrCodeRef.current) {
      html5QrCodeRef.current.stop().then(() => {
        html5QrCodeRef.current.clear();
        console.log('Scanner stopped and cleared');
      }).catch((err) => {
        console.error('Failed to stop scanner', err);
      });
    }
  };

  const toggleScanner = () => {
    setScanResult(null);
    setFeedback('');
    setScannerVisible((prev) => {
      const newState = !prev;
      if (newState) startScanner();
      else stopScanner();
      return newState;
    });
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
