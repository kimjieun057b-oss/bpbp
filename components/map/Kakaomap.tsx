"use client"
import Script from "next/script";
import { Map, useKakaoLoader } from "react-kakao-maps-sdk";

// https://apis.map.kakao.com/web/guide/
// npm install react-kakao-maps-sdk
// npm install kakao.maps.d.ts --save-dev
// 실제 등록된 도메인에서만 지도 렌더링 가능, 1앱 1서비스만 가능 (모던레지던스 때문에 안됨)
export default function Kakaomap() {
    const [loading, error] = useKakaoLoader({
        appkey: process.env.NEXT_PUBLIC_KAKAOMAP_KEY!,
        libraries: ["services", "clusterer", "drawing"],
    });

    if (loading) return (
        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#f4f6f8", color: "#4b5563", fontSize: "14px" }}>
            지도를 불러오는 중입니다...
        </div>
    );

    if (error) return (
        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#f9fafb", color: "#9ca3af", fontSize: "14px" }}>
            지도를 불러오지 못했습니다.
        </div>
    );

    return (
        <>
            <Script
                src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAOMAP_KEY}&libraries=services,clusterer,drawing&autoload=false`}
                strategy="afterInteractive"
            />
            {/* 부모 요소에 width / height 를 반드시 지정해야 지도가 렌더링됩니다 */}
            <Map
                center={{ lat: 33.5563, lng: 126.79581 }}
                style={{ width: "100%", height: "100%" }}
                level={3}
            />
        </>
    );
}
