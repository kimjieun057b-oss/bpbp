import RoomForm from "@/components/form/RoomForm";

export default function AdminRoomNewPage() {
    return (
        <div className="space-y-6">
            <h2 className="text-sm font-semibold text-title">객실 등록</h2>
            <RoomForm />
        </div>
    )
}
