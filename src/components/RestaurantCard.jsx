const CATEGORY_COLORS = {
  "한식": "#D85A30", "일식": "#1D9E75", "중식": "#E05C97",
  "분식": "#EF9F27", "양식": "#7F77DD", "카페": "#BA7517",
};

function getCategoryColor(category = "") {
  for (const [key, color] of Object.entries(CATEGORY_COLORS)) {
    if (category.includes(key)) return color;
  }
  return "#888";
}

export default function RestaurantCard({ restaurant }) {
  if (!restaurant) return null;
  const {
    name = "식당", category = "음식점", distance = "",
    address = "", phone = "", kakaoUrl = "#",
    solo = false, badge = null, rating = null,
  } = restaurant;
  const catColor = getCategoryColor(category);

  return (
    <a href={kakaoUrl} target="_blank" rel="noopener noreferrer"
      style={{ display:"flex", gap:10, alignItems:"flex-start",
        background:"var(--color-background-primary)",
        border:"0.5px solid var(--color-border-tertiary)",
        borderLeft:`3px solid ${catColor}`, borderRadius:12,
        padding:"0.85rem 1rem", textDecoration:"none", color:"inherit",
        transition:"transform 0.15s, box-shadow 0.15s", cursor:"pointer" }}
      onMouseEnter={e => { e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow="0 4px 16px rgba(0,0,0,0.08)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow="none"; }}>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:3, flexWrap:"wrap" }}>
          <span style={{ fontSize:14, fontWeight:500 }}>{name}</span>
          {badge && <span style={{ fontSize:10, padding:"2px 7px", borderRadius:999, background:"#FAECE7", color:"#D85A30", fontWeight:500, border:"0.5px solid #F0997B" }}>{badge}</span>}
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:4, flexWrap:"wrap" }}>
          <span style={{ fontSize:11, padding:"1px 7px", borderRadius:999, background:`${catColor}20`, color:catColor, fontWeight:500 }}>{category}</span>
          {distance && <span style={{ fontSize:11, color:"var(--color-text-tertiary)" }}>📍 {distance}</span>}
          {solo && <span style={{ fontSize:10, padding:"1px 7px", borderRadius:999, background:"#E1F5EE", color:"#0F6E56", fontWeight:500 }}>혼밥 OK</span>}
          {rating && <span style={{ fontSize:11, color:"#EF9F27" }}>★ {rating}</span>}
        </div>
        {address && <p style={{ fontSize:11, color:"var(--color-text-secondary)", margin:0, lineHeight:1.4 }}>{address}</p>}
        {phone   && <p style={{ fontSize:11, color:"var(--color-text-tertiary)", margin:"2px 0 0" }}>{phone}</p>}
      </div>
      <span style={{ color:"var(--color-text-tertiary)", fontSize:16, alignSelf:"center", flexShrink:0 }}>›</span>
    </a>
  );
}
