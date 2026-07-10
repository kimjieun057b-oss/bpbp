"use client";
import { useState } from "react";
import InquireBoardList from "@/components/board/InquireBoardList";
import InquireQuickList from "@/components/board/InquireQuickList";
import MailInquireList from "@/components/board/MailInquireList";

type InquireTab = "board" | "mail" | "quick";

const TABS: { key: InquireTab; label: string }[] = [
    { key: "board", label: "게시판 문의" },
    { key: "mail", label: "메일 문의" },
    { key: "quick", label: "간편 문의" },
];

export default function AdminInquirePage() {
    const [tab, setTab] = useState<InquireTab>("board");

    return (
        <div className="space-y-6">
            <div className="flex gap-2">
                {TABS.map((t) => (
                    <button
                        key={t.key}
                        type="button"
                        onClick={() => setTab(t.key)}
                        className={tab === t.key ? "btn-primary" : "btn-ghost"}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {tab === "board" && <InquireBoardList />}
            {tab === "mail" && <MailInquireList />}
            {tab === "quick" && <InquireQuickList />}
        </div>
    );
}
