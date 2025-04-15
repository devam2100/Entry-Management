import React, { useEffect, useRef, useState } from 'react';
import { FaCamera } from 'react-icons/fa';
import dayjs from 'dayjs';
import CryptoJS from 'crypto-js';
import NavBar from './Navbar';
import QrScanner from 'qr-scanner';

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
      console.log('No record found for ID:', id); // Debugging line
      return;
    }

    const now = dayjs();
    const entryTime = dayjs(record.entry); 
    const fifteenMinutesLater = entryTime.add(15, 'minute');

    console.log('Current time:', now.format()); 
    console.log('Entry time:', entryTime.format()); 
    console.log('Fifteen minutes after entry time:', fifteenMinutesLater.format()); // Debugging line

    if (now.isAfter(entryTime) && now.isBefore(fifteenMinutesLater)) {
      setFeedback(`✅ Access Granted: ${record.name} (${record.id})`);
    } else if (now.isBefore(entryTime)) {
      setFeedback('⏳ Too Early: Please wait until your time slot starts.');
    } else {
      setFeedback('❌ Access Denied: You are late, time slot expired.');
    }
  };

  useEffect(() => {
    const startScanner = async () => {
      const readerEl = document.getElementById('reader');

      if (readerEl && html5QrCodeRef.current === null) {
        const scanner = new QrScanner(readerEl, (decodedText) => {
          if (!scanResult) {
            const decrypted = decryptData(decodedText.trim());

            if (!decrypted) {
              setFeedback('❌ Failed to decrypt QR code.');
              return;
            }

            const [id, name] = decrypted.split('|');
            verifyAccess(id);
            setScanResult(`${id} - ${name}`);
          }
        });

        try {
          await scanner.start();
        } catch (err) {
          console.error("Failed to start scanner:", err);
        }
      }
    };

    if (scannerVisible) {
      startScanner();
    }

    return () => {
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current.stop().then(() => {
          html5QrCodeRef.current.clear();
          html5QrCodeRef.current = null;
        }).catch((err) => console.error('Error during scanner cleanup:', err));
      }
    };
  }, [scannerVisible]);

  const toggleScanner = async () => {
    setScanResult(null);
    setFeedback('');

    if (scannerVisible && html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop();
        await html5QrCodeRef.current.clear();
        html5QrCodeRef.current = null;
      } catch (err) {
        console.error("Error stopping scanner:", err);
      }
    }

    setScannerVisible((prev) => !prev);
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
