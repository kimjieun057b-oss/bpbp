import InquireBoardList from "@/components/board/InquireBoardList";
import InquireQuickList from "@/components/board/InquireQuickList";

export default function AdminInquirePage () {
    return (
        <div className="space-y-6">
            <InquireBoardList/>
            <hr className="border-gray-100"/>
            <InquireQuickList/>
        </div>
    )
}