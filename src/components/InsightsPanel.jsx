// src/components/InsightsPanel.jsx
import "./insights.css";

export default function InsightsPanel({ orders }) {
  if (!orders || orders.length === 0) {
    return (
      <div className="insights-empty">
        No orders yet to generate insights.
      </div>
    );
  }

  // ---- COMPUTE INSIGHTS ----

  // 1) Most ordered dish
  const counts = {};
  for (const ord of orders) {
    for (const item of ord.items) {
      counts[item.name] = (counts[item.name] || 0) + item.qty;
    }
  }

  const mostOrdered = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];

  // 2) Veg vs Non‑veg ratio
  let veg = 0, nonveg = 0;
  for (const ord of orders) {
    for (const item of ord.items) {
      if (item.veg) veg += item.qty;
      else nonveg += item.qty;
    }
  }
  const total = veg + nonveg;
  const vegRatio = total === 0 ? 0 : Math.round((veg / total) * 100);

  // 3) Average order value
  const avgValue = Math.round(
    orders.reduce((s, o) => s + o.total, 0) / orders.length
  );

  // 4) Peak order time (hour)
  const hourly = {};
  for (const ord of orders) {
    const h = new Date(ord.createdAt).getHours();
    hourly[h] = (hourly[h] || 0) + 1;
  }
  const peakHour = Object.entries(hourly).sort((a, b) => b[1] - a[1])[0][0];

  // 5) Simple prediction for tomorrow
  const predicted = mostOrdered ? mostOrdered[0] : "";

  return (
    <div className="insights-grid">

      <div className="insight-card">
        <div className="insight-title">⭐ Most Ordered</div>
        <div className="insight-big">{mostOrdered?.[0] || "-"}</div>
      </div>

      <div className="insight-card">
        <div className="insight-title">🥗 Veg Preference</div>
        <div className="insight-big">{vegRatio}% Veg</div>
      </div>

      <div className="insight-card">
        <div className="insight-title">💰 Avg Order Value</div>
        <div className="insight-big">₹{avgValue}</div>
      </div>

      <div className="insight-card">
        <div className="insight-title">⏰ Peak Hour</div>
        <div className="insight-big">{peakHour}:00</div>
      </div>

      <div className="insight-card prediction">
        <div className="insight-title">🔮 Predicted Top Item</div>
        <div className="insight-big">{predicted}</div>
      </div>

    </div>
  );
}
