import React, { useState, useRef, useEffect } from 'react';
import Papa from 'papaparse';
import { QRCode } from 'react-qrcode-logo';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import './QRUploader.css';
import NavBar from './Navbar';

const QRUploader = () => {
  const [validEntries, setValidEntries] = useState([]);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const fileInputRef = useRef();
  const navigate = useNavigate();

  // Load validEntries and invalidEntries from localStorage on component mount
  useEffect(() => {
    const savedValidEntries = localStorage.getItem('validEntries');
    const savedInvalidEntries = localStorage.getItem('invalidEntries');

    if (savedValidEntries) {
      setValidEntries(JSON.parse(savedValidEntries));
    }
  }, []);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) {
      alert("Please select a file.");
      return;
    }

    const isCSV = file.name.endsWith('.csv') && file.type === 'text/csv';
    if (!isCSV) {
      alert("Invalid file format. Please upload a .csv file.");
      return;
    }

    setUploadedFileName(file.name);

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

        // Save valid and invalid entries to localStorage
        localStorage.setItem('validEntries', JSON.stringify(valid));
        localStorage.setItem('invalidEntries', JSON.stringify(invalid));

        // Update the state with valid entries
        setValidEntries(valid);

        // If there are invalid entries, navigate to the invalid data page
        if (invalid.length > 0) {
          navigate('/invalid-data');
        }
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
    // Clear valid entries state and uploaded file name
    setValidEntries([]);
    setUploadedFileName('');

    // Remove valid and invalid entries from localStorage
    localStorage.removeItem('validEntries');
    localStorage.removeItem('invalidEntries');

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    // Navigate to home page or wherever appropriate
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
            />
            {uploadedFileName && (
              <button onClick={handleRemoveFile} className="remove-button">
                Remove File
              </button>
            )}
          </div>

          {validEntries.length > 0 && (
            <div>
              <h3 className="qr-subtitle">Generated QR Codes</h3>
              <div className="qr-grid">
                {validEntries.map((entry) => (
                  <div key={entry.id} className="qr-card" id={`qr-${entry.id}`}>
                    <QRCode value={entry.name + '\n' + entry.id + '\n' + entry.entry + '\n' + entry.exit} size={150} />
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
