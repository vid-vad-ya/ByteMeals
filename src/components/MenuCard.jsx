export default function MenuCard({ name, price, veg, image }) {
  return (
    <div className="menu-card" style={{
      border: "1px solid #ccc",
      padding: "12px",
      borderRadius: "8px",
      width: "240px"
    }}>
      <img 
        src={image}
        alt={name}
        style={{
          width: "100%",
          height: "150px",
          objectFit: "cover",
          borderRadius: "6px"
        }} 
      />

      <h3 style={{ marginTop: "8px" }}>{name}</h3>
      <p>₹{price}</p>

      <p style={{ 
        color: veg ? "green" : "red", 
        fontWeight: "bold" 
      }}>
        {veg ? "Veg" : "Non‑Veg"}
      </p>
    </div>
  );
}
