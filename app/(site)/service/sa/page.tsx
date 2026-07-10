import Kakaomap from "@/components/map/Kakaomap";

// naver, kakao map
export default function ServiceAPage() {

    return (
        <article>
            <div>
                <div>
                    {/* <h2>Service A</h2> */}
                </div>
                <div style={{ width: "100%", height: "500px" }}>
                    <Kakaomap/>
                </div>
            </div>
        </article>
    )
}