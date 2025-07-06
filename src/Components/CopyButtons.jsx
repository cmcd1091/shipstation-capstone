import axios from 'axios';
import '../CopyButtons.css';

const CopyButtons = ({ pageSize, setSelectedStore, setMessage, setFiles, setSkipped }) => {

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

  return (
    <>
      <button onClick={() => fetchTransfers('coed')}>Fetch Coed transfers</button>
      <button onClick={() => fetchTransfers('duke')}>Fetch Duke transfers</button>
      <button onClick={() => fetchTransfers('tony')}>Fetch Tony transfers</button>
    </>
  )
};

export default CopyButtons;