// src/components/KakaoMap.jsx
// iframe 방식 — 부모 레이아웃 간섭 완전 차단
import { useMemo } from "react"

const KAKAO_JS_KEY = import.meta.env.VITE_KAKAO_JS_KEY

export default function KakaoMap({ restaurants = [], center, height = 240 }) {
  if (!KAKAO_JS_KEY) return null

  const lat = center?.lat ?? 37.5665
  const lng = center?.lng ?? 126.9780

  // 식당 마커 데이터
  const markersJson = useMemo(() => JSON.stringify(
    restaurants.filter(r => r.lat && r.lng).map(r => ({ lat: r.lat, lng: r.lng, name: r.name }))
  ), [restaurants])

  // iframe에 삽입할 완전한 HTML
  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  html, body, #map { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; }
</style>
</head>
<body>
<div id="map"></div>
<script>
function initMap() {
  var kakao = window.kakao;
  var container = document.getElementById('map');
  var options = { center: new kakao.maps.LatLng(${lat}, ${lng}), level: 4 };
  var map = new kakao.maps.Map(container, options);

  // 내 위치 별 마커
  new kakao.maps.Marker({
    map: map,
    position: new kakao.maps.LatLng(${lat}, ${lng}),
    image: new kakao.maps.MarkerImage(
      'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png',
      new kakao.maps.Size(24, 35)
    )
  });

  // 식당 마커
  var data = ${markersJson};
  var bounds = new kakao.maps.LatLngBounds();
  bounds.extend(new kakao.maps.LatLng(${lat}, ${lng}));
  data.forEach(function(r) {
    var pos = new kakao.maps.LatLng(r.lat, r.lng);
    var marker = new kakao.maps.Marker({ map: map, position: pos });
    var overlay = new kakao.maps.CustomOverlay({
      position: pos, yAnchor: 1.5, zIndex: 3,
      content: '<div style="background:#fff;border:1px solid #ddd;border-radius:6px;padding:3px 7px;font-size:11px;font-weight:500;white-space:nowrap;box-shadow:0 1px 4px rgba(0,0,0,.15)">' + r.name + '</div>'
    });
    kakao.maps.event.addListener(marker, 'click', function() {
      overlay.setMap(overlay.getMap() ? null : map);
    });
    bounds.extend(pos);
  });
  if (data.length > 0) map.setBounds(bounds);
}
</script>
<script src="//dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_JS_KEY}&onload=initMap"></script>
</body>
</html>`

  return (
    <div style={{ width:"100%", height, borderRadius:12, overflow:"hidden", marginBottom:10 }}>
      <iframe
        srcDoc={html}
        style={{ width:"100%", height:"100%", border:"none", display:"block" }}
        title="kakao-map"

      />
    </div>
  )
}
