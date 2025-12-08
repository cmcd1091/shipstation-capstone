import axios from 'axios';
import '../Styling/FetchParams.css';
import { useState } from 'react';

const FetchParams = ({ pageSize, setPageSize, setSelectedStore, setMessage, setFiles, setSkipped }) => {
  const [localStore, setLocalStore] = useState('')

  const fetchTransfers = async (store) => {
    setFiles([]);
    setSkipped([]);
    setSelectedStore(store);
    try {
      const res = await axios.get(`http://localhost:3001/fetch-transfers?store=${store}&pageSize=${pageSize}`);
      setMessage(res.data.message);
      setFiles(res.data.files);
      setSkipped(res.data.skippedOrders);
    } catch (error) {
      setMessage('Error: ' + (error.response?.data || error.message));
    }
  };

  const handleChange = (e) => {
    const store = e.target.value;
    if (store) {
      setLocalStore(store);
    }
  }

  return (
    <>
      Store:
      <select defaultValue='' onChange={handleChange}>
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
  )
};

export default FetchParams;