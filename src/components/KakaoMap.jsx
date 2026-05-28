// src/components/KakaoMap.jsx
import { useEffect, useRef, useState } from "react"

const KAKAO_JS_KEY = import.meta.env.VITE_KAKAO_JS_KEY

export default function KakaoMap({ restaurants = [], center, height = 240 }) {
  const wrapRef  = useRef(null)   // 실제 너비 측정용 wrapper
  const mapRef   = useRef(null)   // kakao map 인스턴스
  const markers  = useRef([])
  const [mapW, setMapW] = useState(0)

  // ✅ wrapper 렌더 후 실제 픽셀 너비 측정
  useEffect(() => {
    if (!wrapRef.current) return
    const measure = () => {
      const w = wrapRef.current?.offsetWidth || 0
      if (w > 0) setMapW(w)
    }
    measure()
    // ResizeObserver로 너비 변경 감지
    const ro = new ResizeObserver(measure)
    ro.observe(wrapRef.current)
    return () => ro.disconnect()
  }, [])

  // ✅ 너비가 확정된 후 지도 초기화
  useEffect(() => {
    if (!mapW || !KAKAO_JS_KEY) return

    const load = () => window.kakao.maps.load(() => {
      setTimeout(() => initMap(), 50)
    })

    if (window.kakao?.maps?.Map) { initMap(); return }
    if (window.kakao?.maps) { load(); return }

    const script = document.createElement("script")
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_JS_KEY}&autoload=false`
    script.onload = load
    document.head.appendChild(script)
    return () => { try { document.head.removeChild(script) } catch {} }
  }, [mapW])

  useEffect(() => {
    if (mapRef.current) {
      updateMarkers()
      mapRef.current.relayout()
    }
  }, [restaurants])

  function initMap() {
    const container = document.getElementById("kakao-map-inner")
    if (!container || !window.kakao?.maps) return
    const { kakao } = window

    const pos = center
      ? new kakao.maps.LatLng(center.lat, center.lng)
      : new kakao.maps.LatLng(37.5665, 126.9780)

    mapRef.current = new kakao.maps.Map(container, { center: pos, level: 4 })

    // 내 위치 별 마커
    if (center) {
      new kakao.maps.Marker({
        map: mapRef.current, position: pos,
        image: new kakao.maps.MarkerImage(
          "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png",
          new kakao.maps.Size(24, 35)
        ),
      })
    }

    // ✅ 여러 번 relayout (position:fixed 환경 대응)
    mapRef.current.relayout()
    setTimeout(() => mapRef.current?.relayout(), 200)
    setTimeout(() => mapRef.current?.relayout(), 500)

    updateMarkers()
  }

  function updateMarkers() {
    const { kakao } = window
    if (!kakao?.maps || !mapRef.current) return

    markers.current.forEach(m => m.setMap(null))
    markers.current = []
    const bounds = new kakao.maps.LatLngBounds()

    restaurants.forEach(r => {
      if (!r.lat || !r.lng) return
      const pos    = new kakao.maps.LatLng(r.lat, r.lng)
      const marker = new kakao.maps.Marker({ map: mapRef.current, position: pos })
      const overlay = new kakao.maps.CustomOverlay({
        position: pos, yAnchor: 1.5, zIndex: 3,
        content: `<div style="background:#fff;border:1px solid #ddd;border-radius:8px;padding:4px 8px;font-size:11px;font-weight:500;box-shadow:0 2px 6px rgba(0,0,0,.12);white-space:nowrap">${r.name}</div>`,
      })
      kakao.maps.event.addListener(marker, "click", () => {
        overlay.setMap(overlay.getMap() ? null : mapRef.current)
      })
      markers.current.push(marker)
      bounds.extend(pos)
    })

    if (restaurants.length > 0 && center) {
      bounds.extend(new kakao.maps.LatLng(center.lat, center.lng))
      mapRef.current.setBounds(bounds)
    }
    setTimeout(() => mapRef.current?.relayout(), 100)
  }

  if (!KAKAO_JS_KEY) return (
    <div style={{ height, background:"#f0f0f0", borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center" }}>
      <p style={{ fontSize:12, color:"#888" }}>🗺️ JS 키 필요</p>
    </div>
  )

  return (
    // ✅ wrapper는 border-radius + overflow:hidden 담당
    <div ref={wrapRef} style={{ width:"100%", borderRadius:12, overflow:"hidden", marginBottom:10, position:"relative" }}>
      {/* ✅ 지도 div: 측정된 픽셀 너비를 명시적으로 지정 */}
      <div
        id="kakao-map-inner"
        style={{ width: mapW > 0 ? mapW : "100%", height, display:"block" }}
      />
      {restaurants.length > 0 && (
        <div style={{
          position:"absolute", bottom:8, right:8,
          background:"rgba(255,255,255,0.9)", borderRadius:8,
          padding:"4px 10px", fontSize:11, color:"#555",
          boxShadow:"0 1px 4px rgba(0,0,0,0.1)",
        }}>
          {restaurants.length}곳
        </div>
      )}
    </div>
  )
}
