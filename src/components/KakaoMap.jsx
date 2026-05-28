// src/components/KakaoMap.jsx
import { useEffect, useRef } from "react"

const KAKAO_JS_KEY = import.meta.env.VITE_KAKAO_JS_KEY

export default function KakaoMap({ restaurants = [], center, height = 240 }) {
  const containerRef = useRef(null)
  const mapObj       = useRef(null)
  const markers      = useRef([])

  useEffect(() => {
    if (!KAKAO_JS_KEY) return

    const load = () => window.kakao.maps.load(() => {
      // ✅ DOM이 완전히 렌더된 후 초기화 (너비 계산 타이밍 수정)
      setTimeout(() => initMap(), 100)
    })

    if (window.kakao?.maps) { load(); return }

    const script = document.createElement("script")
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_JS_KEY}&autoload=false`
    script.onload = load
    document.head.appendChild(script)
    return () => { try { document.head.removeChild(script) } catch {} }
  }, [])

  useEffect(() => {
    if (mapObj.current) updateMarkers()
  }, [restaurants])

  function initMap() {
    if (!containerRef.current || !window.kakao?.maps) return
    const { kakao } = window

    const pos = center
      ? new kakao.maps.LatLng(center.lat, center.lng)
      : new kakao.maps.LatLng(37.5665, 126.9780)

    mapObj.current = new kakao.maps.Map(containerRef.current, {
      center: pos, level: 4,
    })

    // ✅ 컨테이너 크기 재계산 (position:fixed 환경 대응)
    mapObj.current.relayout()

    if (center) {
      new kakao.maps.Marker({
        map: mapObj.current,
        position: pos,
        image: new kakao.maps.MarkerImage(
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

    markers.current.forEach(m => m.setMap(null))
    markers.current = []

    const bounds = new kakao.maps.LatLngBounds()

    restaurants.forEach(r => {
      if (!r.lat || !r.lng) return
      const pos    = new kakao.maps.LatLng(r.lat, r.lng)
      const marker = new kakao.maps.Marker({ map: mapObj.current, position: pos })

      const overlay = new kakao.maps.CustomOverlay({
        position: pos, yAnchor: 1.5, zIndex: 3,
        content: `<div style="background:#fff;border:1px solid #ddd;border-radius:8px;padding:4px 8px;font-size:11px;font-weight:500;box-shadow:0 2px 6px rgba(0,0,0,0.12);white-space:nowrap">${r.name}</div>`,
      })

      kakao.maps.event.addListener(marker, "click", () => {
        overlay.setMap(overlay.getMap() ? null : mapObj.current)
      })

      markers.current.push(marker)
      bounds.extend(pos)
    })

    if (restaurants.length > 0 && center) {
      bounds.extend(new kakao.maps.LatLng(center.lat, center.lng))
      mapObj.current.setBounds(bounds)
    }

    // ✅ 마커 업데이트 후 재레이아웃
    mapObj.current.relayout()
  }

  if (!KAKAO_JS_KEY) {
    return (
      <div style={{ height, borderRadius:12, background:"#f0f0f0", display:"flex", alignItems:"center", justifyContent:"center" }}>
        <p style={{ fontSize:12, color:"#888" }}>🗺️ VITE_KAKAO_JS_KEY 필요</p>
      </div>
    )
  }

  return (
    <div style={{ position:"relative", width:"100%", borderRadius:12, overflow:"hidden", marginBottom:10 }}>
      {/* ✅ 지도 div는 overflow:hidden 없이 — 너비 100% 보장 */}
      <div ref={containerRef} style={{ width:"100%", height }} />
      {restaurants.length > 0 && (
        <div style={{
          position:"absolute", bottom:8, right:8,
          background:"rgba(255,255,255,0.9)", borderRadius:8,
          padding:"4px 10px", fontSize:11, color:"#555",
          boxShadow:"0 1px 4px rgba(0,0,0,0.1)",
        }}>
          {restaurants.length}곳 표시 중
        </div>
      )}
    </div>
  )
}
