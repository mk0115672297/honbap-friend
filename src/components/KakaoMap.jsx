// src/components/KakaoMap.jsx
// 카카오맵 JS SDK 임베드 컴포넌트 — 혼밥프렌드 전용
// 앱인토스 WebView 환경에서도 동작 (외부 앱 스킴 호출 없이 SDK 임베드 방식)

import { useEffect, useRef } from "react"

const KAKAO_JS_KEY = import.meta.env.VITE_KAKAO_JS_KEY

export default function KakaoMap({ restaurants = [], center, height = 280 }) {
  const mapRef    = useRef(null)
  const mapObj    = useRef(null)
  const markersRef = useRef([])

  // 카카오맵 SDK 동적 로드
  useEffect(() => {
    if (!KAKAO_JS_KEY) return
    if (window.kakao?.maps) { initMap(); return }

    const script = document.createElement("script")
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_JS_KEY}&autoload=false`
    script.onload = () => window.kakao.maps.load(initMap)
    document.head.appendChild(script)

    return () => { document.head.removeChild(script) }
  }, [])

  // 레스토랑 목록 변경 시 마커 업데이트
  useEffect(() => {
    if (!mapObj.current || !window.kakao?.maps) return
    updateMarkers()
  }, [restaurants])

  function initMap() {
    if (!mapRef.current) return
    const { kakao } = window

    const defaultCenter = center
      ? new kakao.maps.LatLng(center.lat, center.lng)
      : new kakao.maps.LatLng(37.5665, 126.9780) // 서울 시청 기본값

    mapObj.current = new kakao.maps.Map(mapRef.current, {
      center: defaultCenter,
      level:  4,
    })

    // 내 위치 마커
    if (center) {
      new kakao.maps.Marker({
        map:      mapObj.current,
        position: defaultCenter,
        image:    new kakao.maps.MarkerImage(
          "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png",
          new kakao.maps.Size(24, 35)
        ),
      })
    }

    updateMarkers()
  }

  function updateMarkers() {
    const { kakao } = window
    if (!kakao?.maps || !mapObj.current) return

    // 기존 마커 제거
    markersRef.current.forEach(m => m.setMap(null))
    markersRef.current = []

    const bounds = new kakao.maps.LatLngBounds()

    restaurants.forEach((r, i) => {
      if (!r.lat || !r.lng) return

      const pos    = new kakao.maps.LatLng(r.lat, r.lng)
      const marker = new kakao.maps.Marker({ map: mapObj.current, position: pos })

      // 말풍선 오버레이
      const overlay = new kakao.maps.CustomOverlay({
        position:  pos,
        yAnchor:   1.4,
        content:   `<div style="
          background:#fff;border:1px solid #e5e5e5;border-radius:8px;
          padding:6px 10px;font-size:12px;font-weight:500;
          box-shadow:0 2px 8px rgba(0,0,0,0.12);white-space:nowrap;
          ${r.badge ? "color:#D85A30;" : ""}
        ">${r.badge ? "✓ " : ""}${r.name}</div>`,
        zIndex:    3,
      })

      kakao.maps.event.addListener(marker, "click", () => {
        overlay.setMap(overlay.getMap() ? null : mapObj.current)
      })

      markersRef.current.push(marker)
      bounds.extend(pos)
    })

    if (restaurants.length > 0 && center) {
      bounds.extend(new kakao.maps.LatLng(center.lat, center.lng))
      mapObj.current.setBounds(bounds)
    }
  }

  if (!KAKAO_JS_KEY) {
    return (
      <div style={{ height, borderRadius: 12, background: "#f0f0f0", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 6 }}>
        <div style={{ fontSize: 24 }}>🗺️</div>
        <p style={{ fontSize: 12, color: "#888", margin: 0 }}>
          .env에 VITE_KAKAO_JS_KEY 필요
        </p>
      </div>
    )
  }

  return (
    <div style={{ position: "relative" }}>
      <div ref={mapRef} style={{ width: "100%", height, borderRadius: 12, overflow: "hidden" }} />
      {restaurants.length > 0 && (
        <div style={{
          position: "absolute", bottom: 10, right: 10,
          background: "white", borderRadius: 8, padding: "5px 10px",
          fontSize: 11, color: "#888", boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
        }}>
          {restaurants.length}곳 표시 중
        </div>
      )}
    </div>
  )
}
