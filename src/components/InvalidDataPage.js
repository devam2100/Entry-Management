import React, { useEffect, useState } from 'react';
import NavBar from './Navbar';

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
    <NavBar></NavBar>
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-4">Invalid Entries</h2>
      {invalidEntries.length === 0 ? (
        <p className="text-gray-600">No invalid entries found.</p>
      ) : (
        <table className="table-auto w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="border px-4 py-2">ID</th>
              <th className="border px-4 py-2">Name</th>
              <th className="border px-4 py-2">Entry</th>
              <th className="border px-4 py-2">Exit</th>
            </tr>
          </thead>
          <tbody>
            {invalidEntries.map((entry, idx) => (
              <tr key={idx}>
                <td className="border px-4 py-2">{entry.id || '-'}</td>
                <td className="border px-4 py-2">{entry.name || '-'}</td>
                <td className="border px-4 py-2">{entry.entry || '-'}</td>
                <td className="border px-4 py-2">{entry.exit || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
    </>
  );
};

export default InvalidDataPage;
