import { useState } from 'react';
import axios from 'axios';

const CopyButton = () => {
  const [message, setMessage] = useState('');
  const [files, setFiles] = useState([]);
  const [selectedStore, setSelectedStore] = useState('');

  const fetchTransfers = async (store) => {
    setSelectedStore(store);
    try {
      const res = await axios.get(`http://localhost:3001/fetch-transfers?store=${store}`);
      setMessage(res.data.message);
      setFiles(res.data.files)
    } catch (error) {
      setMessage('Error: ' + (error.response?.data || error.message));
      setFiles([]);
    }
  };

  return (
    <>
      <button onClick={() => fetchTransfers('coed')}>Fetch Coed transfers</button>
      <button onClick={() => fetchTransfers('duke')}>Fetch Duke transfers</button>
      <button onClick={() => fetchTransfers('tony')}>Fetch Tony transfers</button>

      {message && <p>{message}</p>}
      {files.length > 0 && (
        <ul>
          {files.map((file, idx) => (
            <li key={idx} style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
              <img
                src={`http://localhost:3001/images/${selectedStore}/${file}`}
                alt={file}
                style={{ width: '100px', marginRight: '1rem', border: '1px solid #ccc' }}
              />
              <span>{file}</span>
            </li>
          ))}
        </ul>
      )}
    </>
  )
};

export default CopyButton;