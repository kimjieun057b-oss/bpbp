import RoomOptionForm from "@/components/form/RoomOptionForm";

export default function RoomOptionsNewPage() {
    return(
        <div className="space-y-6">
            <h2 className="text-sm font-semibold text-title">부가서비스 등록</h2>
            <RoomOptionForm/>
        </div>
    )
}