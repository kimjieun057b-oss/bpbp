import Header2 from "@/components/common/header/Header2";
import Header3 from "@/components/common/header/Header3";

export default function ServiceCPage() {

    return (
        <article className="bg-gray-300">
            <div>
                <div>
                    {/* <h2>Service C</h2> */}
                </div>
                <div className="mt-10">
                    <h4>TYPE1</h4>
                    <Header2/>
                </div>
                <div className="mt-10">
                    <h4>TYPE2</h4>
                    <Header3/>
                </div>
            </div>
        </article>
    )
}