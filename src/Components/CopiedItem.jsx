const CopiedItem = ({ file, selectedStore }) => {
  const fileWithoutExt = file.replace('.png', '');
  // console.log(fileWithoutExt)
  const splitIndex = fileWithoutExt.lastIndexOf('-CN-');
  // console.log("split index:", splitIndex)
  const skuPart = fileWithoutExt.slice(0, splitIndex);
  // console.log("skuPart:", skuPart);
  const orderPart = fileWithoutExt.slice(splitIndex + 1)
  // console.log("orderPart:", orderPart)

  return (
    <>
      <li style={{
        margin: '1rem',
        textAlign: 'center'
      }}>
        <img
          src={`http://localhost:3001/images/${selectedStore}/${file}`}
          alt={file}
          style={{ 
            width: '100px',
            marginRight: '1rem',
            border: '1px solid #ccc'
          }}
        />
        <div>Order number: {orderPart}</div>
        {/* <div>SKU: {skuPart}</div> */}
      </li>
    </>
  )
}

export default CopiedItem;