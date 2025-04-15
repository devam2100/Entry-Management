import React, { useState, useRef, useEffect } from 'react';
import Papa from 'papaparse';
import { QRCode } from 'react-qrcode-logo';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import CryptoJS from 'crypto-js';
import './QRUploader.css';
import NavBar from './Navbar';

const secretKey = 'k9f$VdL#39qpL@7x!';

const encryptData = (data) => {
  return CryptoJS.AES.encrypt(data, secretKey).toString();
};

const QRUploader = () => {
  const [validEntries, setValidEntries] = useState([]);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const fileInputRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    const savedValidEntries = localStorage.getItem('validEntries');
    const savedFileName = localStorage.getItem('uploadedFileName');

    if (savedValidEntries) {
      setValidEntries(JSON.parse(savedValidEntries));
    }

    if (savedFileName) {
      setUploadedFileName(savedFileName);
    }

    // Restore file input state
    if (savedFileName && fileInputRef.current) {
      fileInputRef.current.disabled = true;
    }
  }, []);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) {
      alert("Please select a file.");
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      alert("File size exceeds the maximum limit of 5MB.");
      return;
    }

    const isCSV = file.name.endsWith('.csv') && file.type === 'text/csv';
    if (!isCSV) {
      alert("Invalid file format. Please upload a .csv file.");
      return;
    }

    setUploadedFileName(file.name);
    localStorage.setItem('uploadedFileName', file.name);

    if (fileInputRef.current) {
      fileInputRef.current.disabled = true;
    }

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rows = results.data?.map((row) => ({
          ...row,
          qr_name: "Name: " + row.name,
        }));

        const valid = [];
        const invalid = [];

        rows.forEach((row) => {
          const hasAllFields =
            row.id?.trim() !== '' &&
            row.name?.trim() !== '' &&
            row.entry?.trim() !== '' &&
            row.exit?.trim() !== '';

          const isValidDate =
            dayjs(row.entry).isValid() && dayjs(row.exit).isValid();

          const isEntryBeforeExit = dayjs(row.entry).isBefore(dayjs(row.exit));

          const isValid = hasAllFields && isValidDate && isEntryBeforeExit;

          if (isValid) valid.push(row);
          else invalid.push(row);
        });

        localStorage.setItem('validEntries', JSON.stringify(valid));
        localStorage.setItem('invalidEntries', JSON.stringify(invalid));

        setValidEntries(valid);
      },
    });
  };

  const downloadQR = (id) => {
    const canvas = document.getElementById(`qr-${id}`)?.querySelector('canvas');
    if (!canvas) return;
    const pngUrl = canvas.toDataURL('image/png');
    const downloadLink = document.createElement('a');
    downloadLink.href = pngUrl;
    downloadLink.download = `${id}.png`;
    downloadLink.click();
  };

  const handleRemoveFile = () => {
    setValidEntries([]);
    setUploadedFileName('');
    localStorage.removeItem('validEntries');
    localStorage.removeItem('invalidEntries');
    localStorage.removeItem('uploadedFileName');

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.disabled = false;
    }

    navigate('/');
  };

  return (
    <>
      <NavBar />
      <div className="qr-container">
        <div className="qr-wrapper">
          <h2 className="qr-title">Upload CSV & Generate QR</h2>
          <div className="file-actions">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="file-input"
              ref={fileInputRef}
              disabled={uploadedFileName !== ''}
            />
            {uploadedFileName && (
              <div className="file-details">
                {/* <p className="file-name">Uploaded: {uploadedFileName}</p> */}
                <button onClick={handleRemoveFile} className="remove-button">
                  Remove File
                </button>
              </div>
            )}
          </div>

          {validEntries.length > 0 && (
            <div>
              <h3 className="qr-subtitle">Generated QR Codes</h3>
              <div className="qr-grid">
                {validEntries.map((entry) => (
                  <div key={entry.id} className="qr-card" id={`qr-${entry.id}`}>
                    <QRCode
                      value={encryptData(`${entry.id}|${entry.name}|${entry.entry}|${entry.exit}`)}
                      size={150}
                    />
                    <div className="qr-info">
                      <p className="entry-name">{entry.name}</p>
                      <p className="entry-id">{entry.id}</p>
                      <button
                        onClick={() => downloadQR(entry.id)}
                        className="download-button"
                      >
                        Download QR
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default QRUploader;
