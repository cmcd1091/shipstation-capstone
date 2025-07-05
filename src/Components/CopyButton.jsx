import { useState } from 'react';
import axios from 'axios';

const CopyButton = () => {
  const [message, setMessage] = useState('');
  const [files, setFiles] = useState([]);

  const fetchTransfers = async (store) => {
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
            <li key={idx}>{file}</li>
          ))}
        </ul>
      )}
    </>
  )
};

export default CopyButton;