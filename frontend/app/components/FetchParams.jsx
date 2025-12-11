import axios from 'axios';
import { useState } from 'react';

const FetchParams = ({ pageSize, setPageSize, setSelectedStore, setMessage, setFiles, setSkipped }) => {
  // Default to 'coed' so we always have a valid store
  const [localStore, setLocalStore] = useState('coed');

  const fetchTransfers = async (store) => {
    if (!store) {
      setMessage('Please select a store before fetching.');
      return;
    }

    setFiles([]);
    setSkipped([]);
    setSelectedStore(store);

    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

      const res = await axios.get(`${API_BASE}/fetch-transfers?store=${store}&pageSize=${pageSize}`);

      setMessage(res.data.message);
      setFiles(res.data.files);
      setSkipped(res.data.skippedOrders);
    } catch (error) {
      setMessage('Error: ' + (error.response?.data || error.message));
    }
  };

  const handleChange = (e) => {
    const store = e.target.value;
    setLocalStore(store);
  };

  return (
    <>
      Store:
      <select value={localStore} onChange={handleChange}>
        {/* <option value='alcolo'>Alcolo</option> */}
        <option value='coed'>Coed Naked</option>
        <option value='duke'>Duke Gomez</option>
        {/* <option value='dukeTT'>Duke Gomez Tik Tok</option>
        <option value='jakey'>Jakey Botch</option>
        <option value='mo'>Lil Mo</option>
        <option value='michaels'>Michael's</option>
        <option value='slick'>Slick Stevie</option>
        <option value='tony'>Too Turnt Tony</option> */}
      </select>

      <div>
        <label>
          Number of orders:
          <input
            type='number'
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
          />
        </label>
      </div>

      <div>
        <button onClick={() => fetchTransfers(localStore)}>Fetch & Copy</button>
      </div>
    </>
  );
};

export default FetchParams;