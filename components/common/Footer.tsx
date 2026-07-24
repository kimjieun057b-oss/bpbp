import { siteConfig } from "@/config/site";
import Link from "next/link";
import QuickForm from "../form/QuickForm";

export default function Footer() {
    return (
        // 진행중 : 버튼 링크 연결
        <footer className="bg-white border-t border-gray-100 mt-auto">
            <div className="max-w-341.5 mx-auto px-5 pc:px-0 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
                <p className="text-xs text-muted">
                    © {new Date().getFullYear()}{siteConfig.name ? ` ${siteConfig.name}` : ""}. All rights reserved.
                </p>
                <div className="flex items-center gap-4">
                    {/* 간편문의 / 메일문의 버튼 */}
                    <QuickForm/>
                    <Link href="/inquire-mail">메일문의</Link>
                </div>
            </div>
        </footer>
    );
}
