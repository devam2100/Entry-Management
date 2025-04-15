import React, { useEffect, useState } from 'react';
import NavBar from './Navbar';
import './InvalidDataPage.css'; // Importing custom CSS

const InvalidDataPage = () => {
  const [invalidEntries, setInvalidEntries] = useState([]);

  useEffect(() => {
    const data = localStorage.getItem('invalidEntries');
    if (data) {
      setInvalidEntries(JSON.parse(data));
    }
  }, []);

  return (
    <>
      <NavBar />
      <div className="invalid-container">
        <h2 className="invalid-title">Invalid Entries</h2>
        {invalidEntries.length === 0 ? (
          <p className="no-entries">No invalid entries found.</p>
        ) : (
          <div className="table-wrapper">
            <table className="invalid-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Entry</th>
                  <th>Exit</th>
                </tr>
              </thead>
              <tbody>
                {invalidEntries.map((entry, idx) => (
                  <tr key={idx}>
                    <td>{entry.id || '-'}</td>
                    <td>{entry.name || '-'}</td>
                    <td>{entry.entry || '-'}</td>
                    <td>{entry.exit || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
};

export default InvalidDataPage;
