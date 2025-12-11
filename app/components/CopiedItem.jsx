"use client";

const CopiedItem = ({ file, selectedStore }) => {
  const { skuPart, orderPart } = parseFileName(file);

  return (
    <li style={{ margin: "1rem" }}>
      <img
        src={`/api/auth/images/${selectedStore}/${file}`}
        alt={file}
        style={{
          width: "100px",
          border: "1px solid #ccc",
        }}
      />
      <div>Order: {orderPart}</div>
      {/* <div>SKU: {skuPart}</div> */}
    </li>
  );
};

function parseFileName(file) {
  const fileWithoutExt = file.replace(".png", "");
  const splitIndex = fileWithoutExt.lastIndexOf("-CN-");
  const skuPart = splitIndex !== -1 ? fileWithoutExt.slice(0, splitIndex) : "";
  const orderPart =
    splitIndex !== -1 ? fileWithoutExt.slice(splitIndex + 1) : fileWithoutExt;
  return { skuPart, orderPart };
}

export default CopiedItem;
