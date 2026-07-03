import InquireBoardList from "@/components/board/InquireBoardList";
import InquireQuickList from "@/components/board/InquireQuickList";
import MailInquireList from "@/components/board/MailInquireList";

export default function AdminInquirePage () {
    return (
        <div className="space-y-6">
        <div className="flex">
        <InquireBoardList/>
        <MailInquireList/>
        </div>
            <hr className="border-gray-100"/>
            <InquireQuickList/>
        </div>
    )
}