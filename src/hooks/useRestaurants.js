// src/hooks/useRestaurants.js
import { useState, useCallback } from "react"

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL

function getLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) { reject(new Error("NO_GEOLOCATION")); return }
    navigator.geolocation.getCurrentPosition(
      pos => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      err => reject(new Error("CODE_" + err.code)),
      { timeout: 10000, maximumAge: 300000, enableHighAccuracy: false }
    )
  })
}

function getErrorMessage(msg) {
  if (msg.includes("CODE_1")) return "위치 권한이 거부됐어요. 브라우저 주소창 🔒에서 위치를 허용해 주세요."
  if (msg.includes("CODE_2")) return "위치를 확인할 수 없어요. 잠시 후 다시 시도해 주세요."
  if (msg.includes("CODE_3")) return "위치 요청이 너무 오래 걸려요. 다시 시도해 주세요."
  return msg
}

async function searchNearbyRestaurants(lat, lng, radius = 500, size = 15) {
  const params = new URLSearchParams({
    path: "/v2/local/search/category.json",
    category_group_code: "FD6",
    y: lat, x: lng, radius, size,
    sort: "distance",
  })

  const endpoint = SUPABASE_URL
    ? `${SUPABASE_URL}/functions/v1/kakao-proxy?${params}`
    : `/api/kakao/v2/local/search/category.json?${new URLSearchParams({ category_group_code:"FD6", y:lat, x:lng, radius, size, sort:"distance" })}`

  const res = await fetch(endpoint)
  if (!res.ok) throw new Error(`카카오 API 오류: ${res.status}`)
  const data = await res.json()
  return data.documents || []
}

function formatRestaurant(doc) {
  const distance = parseInt(doc.distance) || 0
  const categoryParts = doc.category_name?.split(" > ") || []
  const category = categoryParts[categoryParts.length - 1] || "음식점"
  return {
    id: doc.id, name: doc.place_name, category,
    distance: distance < 1000 ? `${distance}m` : `${(distance/1000).toFixed(1)}km`,
    distanceNum: distance,
    address: doc.road_address_name || doc.address_name,
    phone: doc.phone, kakaoUrl: doc.place_url,
    lat: parseFloat(doc.y), lng: parseFloat(doc.x),
    solo: /혼밥|1인|혼자/i.test(doc.place_name),
  }
}

export function useRestaurants() {
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [location, setLocation] = useState(null)

  const fetchRestaurants = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const loc = await getLocation()
      setLocation(loc)
      let results = await searchNearbyRestaurants(loc.lat, loc.lng, 500, 15)
      if (results.length === 0)
        results = await searchNearbyRestaurants(loc.lat, loc.lng, 1000, 15)
      setRestaurants(results.map(formatRestaurant))
    } catch (err) {
      setError(getErrorMessage(err.message)); setRestaurants([])
    } finally { setLoading(false) }
  }, [])

  return { restaurants, loading, error, location, fetch: fetchRestaurants }
}

export default useRestaurants
