import { useState } from "react"
import CopyButton from "./CopyButton"
import CopiedContainer from "./CopiedContainer"

const App = () => {
  const [files, setFiles] = useState([]);
  const [message, setMessage] = useState('');
  const [selectedStore, setSelectedStore] = useState('');

  return (
    <>
      <div style={{ margin: '0 auto', padding: '1rem', fontFamily: 'Arial, sans-serif' }}>
        <h1>Shipstation App</h1>
        <CopyButton 
          setFiles={setFiles}
          setMessage={setMessage}
          setSelectedStore={setSelectedStore}
        />
        {message && <p>{message}</p>}
        <CopiedContainer files={files} selectedStore={selectedStore}/>
      </div>
    </>
  )
}

export default App
