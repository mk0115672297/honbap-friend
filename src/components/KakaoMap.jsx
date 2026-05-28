// src/components/KakaoMap.jsx
// 카카오맵 딥링크 버튼 — SDK/iframe 없이 확실하게 동작
export default function KakaoMap({ restaurants = [], center, height = 120 }) {
  if (!center) return null

  const lat = center.lat
  const lng = center.lng

  // 카카오맵 웹 URL — 현재 위치 근처 음식점 검색
  const kakaoMapUrl = `https://map.kakao.com/?q=${encodeURIComponent('음식점')}&p=${lng},${lat}`

  // 주변 식당 개수
  const count = restaurants.length

  return (
    <div style={{
      width: "100%",
      height,
      background: "linear-gradient(135deg, #FAF3E0 0%, #FEE9A0 100%)",
      borderRadius: 12,
      marginBottom: 10,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      cursor: "pointer",
      border: "1px solid #FEE500",
    }}
      onClick={() => window.open(kakaoMapUrl, "_blank")}
    >
      <div style={{ fontSize: 32 }}>🗺️</div>
      <div style={{ fontSize: 14, fontWeight: 600, color: "#3A1D00" }}>
        카카오맵에서 지도 보기
      </div>
      <div style={{ fontSize: 12, color: "#7A5C00" }}>
        {count > 0 ? `주변 ${count}곳 발견 · 탭해서 카카오맵 열기` : "탭해서 카카오맵 열기"}
      </div>
    </div>
  )
}
