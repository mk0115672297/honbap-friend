// src/hooks/useRestaurants.js
// 카카오 로컬 API — Vite 프록시(/api/kakao)를 통해 호출 → CORS 문제 없음
// 혼밥프렌드 전용

import { useState, useCallback } from "react"

function getLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("위치 서비스를 지원하지 않는 브라우저입니다."))
      return
    }
    navigator.geolocation.getCurrentPosition(
      pos => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      err => reject(err),
      { timeout: 6000, maximumAge: 60000 }
    )
  })
}

async function searchKakao(query, lat, lng, radius = 1000) {
  // ✅ 직접 dapi.kakao.com 호출 대신 /api/kakao 프록시 사용 → CORS 없음
  const params = new URLSearchParams({
    query,
    y: lat,
    x: lng,
    radius,
    size: 5,
    category_group_code: "FD6",  // 음식점만
  })
  const res = await fetch(`/api/kakao/v2/local/search/keyword.json?${params}`)
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

      // 검색어 순차 시도 — 결과 있으면 중단
      let results = []
      for (const query of ["1인 식당", "혼밥 맛집", "혼밥"]) {
        try {
          results = await searchKakao(query, loc.lat, loc.lng, 1000)
          if (results.length > 0) break
        } catch { continue }
      }

      const formatted = results
        .map(formatRestaurant)
        .sort((a, b) => a.distanceNum - b.distanceNum)

      setRestaurants(formatted)
    } catch (err) {
      setError(err.message)
      setRestaurants([])
    } finally {
      setLoading(false)
    }
  }, [])

  return { restaurants, loading, error, location, fetch: fetchRestaurants }
}

export default useRestaurants
