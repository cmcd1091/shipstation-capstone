import axios from 'axios';

const CopyButton = () => {
  const fetchTransfers = async () => {
    try {
      const res = await axios.get('http://localhost:3001/fetch-transfers');
      alert(res.data);
    } catch (error) {
      alert('Error: ' + (error.response?.data || error.message));
    }
  };

  return <button onClick={fetchTransfers}>Fetch transfers</button>;
};

export default CopyButton;