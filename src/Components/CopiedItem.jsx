const CopiedItem = ({ file, selectedStore }) => {
  const parseFileName = (file) => {
    const fileWithoutExt = file.replace('.png', '');
    // console.log(fileWithoutExt)
    const splitIndex = fileWithoutExt.lastIndexOf('-CN-');
    // console.log("split index:", splitIndex)
    const skuPart = fileWithoutExt.slice(0, splitIndex);
    // console.log("skuPart:", skuPart);
    const orderPart = fileWithoutExt.slice(splitIndex + 1)
    // console.log("orderPart:", orderPart)
    return { skuPart, orderPart };
  }
  
  const { skuPart, orderPart } = parseFileName(file)

  return (
    <>
      <li style={{margin: '1rem'}}>
        <img
          src={`http://localhost:3001/images/${selectedStore}/${file}`}
          alt={file}
          style={{ 
            width: '100px',
            border: '1px solid #ccc'
          }}
        />
        <div>Order: {orderPart}</div>
        {/* <div>SKU: {skuPart}</div> */}
      </li>
    </>
  )
}

export default CopiedItem;