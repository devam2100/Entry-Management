import React, { useEffect, useRef, useState } from 'react';
import QrScanner from 'qr-scanner';
import dayjs from 'dayjs';
import CryptoJS from 'crypto-js';
import NavBar from './Navbar';
import './qr.css';

const secretKey = 'k9f$VdL#39qpL@7x!';

const decryptData = (cipherText) => {
  try {
    const bytes = CryptoJS.AES.decrypt(cipherText, secretKey);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (err) {
    console.error('Decryption failed:', err);
    return null;
  }
};

const QRVerifier2 = () => {
  const videoRef = useRef(null);
  const [scanResult, setScanResult] = useState('');
  const [feedback, setFeedback] = useState('');
  const [scanner, setScanner] = useState(null);

  const verifyAccess = (id) => {
    const validEntries = JSON.parse(localStorage.getItem('validEntries') || '[]');
    const record = validEntries.find((entry) => entry.id === id);

    if (!record) {
      setFeedback('❌ Invalid User');
      return;
    }

    const now = dayjs();
    const entryTime = dayjs(record.entry);
    const fifteenMinutesLater = entryTime.add(15, 'minute');

    if (now.isBefore(entryTime)) {
      setFeedback('⏳ Too Early: Please wait until your time slot starts.');
    } else if (now.isAfter(fifteenMinutesLater)) {
      setFeedback('❌ Access Denied: You are late, time slot expired.');
    } else {
      setFeedback(`✅ Access Granted: ${record.name} (${record.id})`);
    }
  };

  useEffect(() => {
    let qrScanner;

    if (videoRef.current) {
      qrScanner = new QrScanner(
        videoRef.current,
        (result) => {
          if (!scanResult) {
            const decrypted = decryptData(result.data.trim());

            if (!decrypted) {
              setFeedback('❌ Failed to decrypt QR code.');
              return;
            }

            const [id, name] = decrypted.split('|');
            setScanResult(`${id} - ${name}`);
            verifyAccess(id);
            qrScanner.stop();
          }
        },
        {
          returnDetailedScanResult: true,
          highlightScanRegion: true,
          highlightCodeOutline: true,
        }
      );

      qrScanner.start();
      setScanner(qrScanner);
    }

    return () => {
      if (qrScanner) {
        qrScanner.stop();
        qrScanner.destroy();
      }
    };
  }, []);

  return (
    <>
      <NavBar />
      <div className="qr-container">
        <h2>🎯 Admin QR Verification</h2>
        <div className="videoWrapper">
          <video className="qrVideo" ref={videoRef} />
        </div>
        {scanResult && (
          <div className="resultBox">
            <p><strong>Result:</strong> {scanResult}</p>
            <p>{feedback}</p>
          </div>
        )}
      </div>
    </>
  );
};

export default QRVerifier2;
