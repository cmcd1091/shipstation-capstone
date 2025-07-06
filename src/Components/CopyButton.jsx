import { useState } from 'react';
import axios from 'axios';
import CopiedItem from './CopiedItem';

const CopyButton = () => {
  const [files, setFiles] = useState([]);
  const [message, setMessage] = useState('');
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
        <ul style={{ 
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          marginBottom: '0.5rem',
          listStyle: 'none'
        }}>
          
          {files.map((file, idx) => (
            <CopiedItem file={file} selectedStore={selectedStore} key={idx}/>
          ))}
        </ul>
      )}
    </>
  )
};

export default CopyButton;