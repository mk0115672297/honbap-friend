import { useState, useEffect } from "react";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

/**
 * KakaoMap — 카카오 정적 지도 이미지 컴포넌트
 * Props:
 *   restaurants  {Array}   식당 배열 [{ lat, lng }, ...]
 *   center       {Object}  중심/내 위치 { lat, lng }
 *   height       {number}  이미지 높이px (기본 220)
 */
export default function KakaoMap({ restaurants = [], center, height = 220 }) {
  const [imgSrc, setImgSrc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [containerWidth, setContainerWidth] = useState(375);

  useEffect(() => {
    const update = () => setContainerWidth(Math.min(window.innerWidth, 640));
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    if (!center?.lat || !center?.lng) return;

    let objectUrl = null;

    const fetchMap = async () => {
      setLoading(true);
      setError(null);

      try {
        // 마커 파라미터 구성
        const markerParts = [];

        // 식당 마커 (빨간 기본)
        restaurants.forEach(({ lat, lng }) => {
          if (lat && lng) markerParts.push(`default,${lng},${lat}`);
        });

        // 내 위치 마커 (파란색)
        markerParts.push(`blue,${center.lng},${center.lat}`);

        const params = new URLSearchParams({
          path: "/v2/maps/api/staticmap",
          center: `${center.lng},${center.lat}`,
          level: "4",
          w: String(containerWidth),
          h: String(height),
        });

        if (markerParts.length > 0) {
          params.append("marker", markerParts.join("|"));
        }

        const proxyUrl = `${SUPABASE_URL}/functions/v1/kakao-proxy?${params.toString()}`;
        const res = await fetch(proxyUrl);
        if (!res.ok) throw new Error(`지도 로드 실패: ${res.status}`);

        const blob = await res.blob();
        objectUrl = URL.createObjectURL(blob);
        setImgSrc(objectUrl);
      } catch (err) {
        console.error("[KakaoMap]", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMap();

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [center?.lat, center?.lng, restaurants, containerWidth, height]);

  if (!center?.lat || !center?.lng) return null;

  return (
    <div
      style={{
        width: "100%",
        height: `${height}px`,
        borderRadius: "12px",
        overflow: "hidden",
        background: "#e8e8e8",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 10,
        position: "relative",
      }}
    >
      {loading && (
        <div style={{ color: "#888", fontSize: 13 }}>지도 불러오는 중...</div>
      )}
      {error && !loading && (
        <div style={{ color: "#e55", fontSize: 12, padding: 8, textAlign: "center" }}>
          지도를 불러오지 못했습니다
        </div>
      )}
      {imgSrc && !loading && (
        <img
          src={imgSrc}
          alt="주변 맛집 지도"
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
      )}
    </div>
  );
}
