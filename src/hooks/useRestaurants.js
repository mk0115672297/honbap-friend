// src/hooks/useRestaurants.js
// 카카오 로컬 API — Supabase Edge Function 프록시 + 위도/경도 포함
// 혼밥프렌드 전용

import { useState, useCallback } from "react"

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL

// 서울 중심부 기본 좌표 (위치 거부 시 폴백)
const SEOUL_DEFAULT = { lat: 37.5665, lng: 126.9780 }

function getLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("NO_GEOLOCATION"))
      return
    }
    navigator.geolocation.getCurrentPosition(
      pos => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      err => {
        // 1: PERMISSION_DENIED, 2: POSITION_UNAVAILABLE, 3: TIMEOUT
        reject(new Error("CODE_" + err.code))
      },
      { timeout: 10000, maximumAge: 300000, enableHighAccuracy: false }
    )
  })
}

function getErrorMessage(msg) {
  if (msg.includes("CODE_1")) return "위치 권한이 거부됐어요. 브라우저 주소창 왼쪽 🔒에서 위치를 허용해 주세요."
  if (msg.includes("CODE_2")) return "위치를 확인할 수 없어요. 잠시 후 다시 시도해 주세요."
  if (msg.includes("CODE_3")) return "위치 요청이 너무 오래 걸려요. 다시 시도해 주세요."
  if (msg.includes("NO_GEOLOCATION")) return "이 브라우저는 위치 서비스를 지원하지 않아요."
  return msg
}

async function searchKakao(query, lat, lng, radius = 1000) {
  const params = new URLSearchParams({
    query, y: lat, x: lng, radius, size: 5,
    category_group_code: "FD6",
  })
  const endpoint = SUPABASE_URL
    ? `${SUPABASE_URL}/functions/v1/kakao-proxy/v2/local/search/keyword.json?${params}`
    : `/api/kakao/v2/local/search/keyword.json?${params}`

  const res = await fetch(endpoint)
  if (!res.ok) throw new Error(`카카오 API 오류: ${res.status}`)
  const data = await res.json()
  return data.documents || []
}

function formatRestaurant(doc) {
  const distance = parseInt(doc.distance) || 0
  return {
    id:          doc.id,
    name:        doc.place_name,
    category:    doc.category_name?.split(" > ").pop() || "음식점",
    distance:    distance < 1000 ? `${distance}m` : `${(distance / 1000).toFixed(1)}km`,
    distanceNum: distance,
    address:     doc.road_address_name || doc.address_name,
    phone:       doc.phone,
    kakaoUrl:    doc.place_url,
    // ✅ 지도 마커용 좌표 추가
    lat:         parseFloat(doc.y),
    lng:         parseFloat(doc.x),
    solo:        /혼밥|1인|혼자|솔로|혼식/i.test(doc.place_name + doc.category_name),
    badge:       null,
    rating:      null,
  }
}

export function useRestaurants() {
  const [restaurants, setRestaurants] = useState([])
  const [loading,     setLoading]     = useState(false)
  const [error,       setError]       = useState(null)
  const [location,    setLocation]    = useState(null)

  const fetchRestaurants = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const loc = await getLocation()
      setLocation(loc)
      let results = []
      for (const query of ["1인 식당", "혼밥 맛집", "혼밥"]) {
        try {
          results = await searchKakao(query, loc.lat, loc.lng, 1000)
          if (results.length > 0) break
        } catch { continue }
      }
      setRestaurants(
        results.map(formatRestaurant).sort((a, b) => a.distanceNum - b.distanceNum)
      )
    } catch (err) {
      setError(getErrorMessage(err.message))
      setRestaurants([])
    } finally {
      setLoading(false)
    }
  }, [])

  return { restaurants, loading, error, location, fetch: fetchRestaurants }
}

export default useRestaurants
