import { dummyMenu } from "../data/dummyMenu";
import MenuCard from "../components/MenuCard";
import "../styles/menu.css";

export default function Menu() {
  return (
    <div style={{ padding: 20 }}>
      <h1>Today's Menu</h1>

      <div style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "12px"
      }}>
        {dummyMenu.map(item => (
          <MenuCard 
            key={item.id}
            name={item.name}
            price={item.price}
            veg={item.veg}
            image={item.image}
          />
        ))}
      </div>
    </div>
  );
}
