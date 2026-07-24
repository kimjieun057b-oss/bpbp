import RoomForm from "@/components/form/RoomForm";
import { UNIT_LABEL } from "@/config/terms";

export default function AdminRoomNewPage() {
    return (
        <div className="space-y-6">
            <h2 className="text-sm font-semibold text-title">{UNIT_LABEL} 등록</h2>
            <RoomForm />
        </div>
    )
}
