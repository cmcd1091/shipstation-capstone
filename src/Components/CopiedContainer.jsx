import CopiedItem from "./CopiedItem";

const CopiedContainer = ({ files, selectedStore }) => {

  return (
    files.length > 0 && (
      <ul style={{ 
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '0.5rem',
        listStyle: 'none'
      }}>
        
        {files.map((file, idx) => (
          <CopiedItem file={file} selectedStore={selectedStore} key={idx}/>
        ))}
      </ul>
    )
  )
}

export default CopiedContainer;