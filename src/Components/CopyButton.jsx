import axios from 'axios';

const CopyButton = ({ setSelectedStore, setMessage, setFiles }) => {

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
    </>
  )
};

export default CopyButton;