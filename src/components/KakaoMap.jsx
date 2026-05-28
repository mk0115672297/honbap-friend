// src/components/KakaoMap.jsx — 최대한 단순한 구현
import { useEffect, useRef } from "react"

const KAKAO_JS_KEY = import.meta.env.VITE_KAKAO_JS_KEY

export default function KakaoMap({ restaurants = [], center, height = 240 }) {
  const divId   = "kakao-map-container"
  const mapRef  = useRef(null)

  useEffect(() => {
    if (!KAKAO_JS_KEY) return

    function createMap() {
      const container = document.getElementById(divId)
      if (!container) return
      const { kakao } = window

      const pos = center
        ? new kakao.maps.LatLng(center.lat, center.lng)
        : new kakao.maps.LatLng(37.5665, 126.978)

      // 기존 맵 제거
      if (mapRef.current) {
        container.innerHTML = ""
        mapRef.current = null
      }

      mapRef.current = new kakao.maps.Map(container, { center: pos, level: 4 })

      // 내 위치
      if (center) {
        new kakao.maps.Marker({
          map: mapRef.current, position: pos,
          image: new kakao.maps.MarkerImage(
            "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png",
            new kakao.maps.Size(24, 35)
          ),
        })
      }

      // 식당 마커
      const bounds = new kakao.maps.LatLngBounds()
      restaurants.forEach(r => {
        if (!r.lat || !r.lng) return
        const p = new kakao.maps.LatLng(r.lat, r.lng)
        new kakao.maps.Marker({ map: mapRef.current, position: p })
        bounds.extend(p)
      })
      if (restaurants.length > 0 && center) {
        bounds.extend(pos)
        mapRef.current.setBounds(bounds)
      }
    }

    // SDK 로드
    if (window.kakao?.maps?.Map) {
      createMap()
      return
    }
    if (window.kakao?.maps) {
      window.kakao.maps.load(createMap)
      return
    }
    const script = document.createElement("script")
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_JS_KEY}&autoload=false`
    script.onload = () => window.kakao.maps.load(createMap)
    document.head.appendChild(script)
    return () => { try { document.head.removeChild(script) } catch {} }
  }, [restaurants, center])

  if (!KAKAO_JS_KEY) return null

  return (
    <div
      id={divId}
      style={{
        width: "100%",
        height,
        marginBottom: 10,
        borderRadius: 12,
        background: "#f0f0f0",
      }}
    />
  )
}
