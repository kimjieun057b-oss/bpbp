import { ADMIN_CATEGORY } from "@/datas/categories";
import Link from "next/link";
import CountBadge from "@/components/common/CountBadge";

export default function SideMenu() {
    return (
        <aside className="w-56 shrink-0 bg-surface border-r border-gray-100 min-h-screen">
            <nav className="py-4">
                <ul className="space-y-1">
                    {Object.entries(ADMIN_CATEGORY).map(([key, value]) => (
                        <li key={key}>
                            <p className="px-5 pt-4 pb-1 text-xs font-semibold text-muted uppercase tracking-wider">
                                {value.title}
                            </p>
                            {value.categories && (
                                <ul>
                                    {value.categories.map((sub) => (
                                        <li key={sub.url}>
                                            <Link
                                                href={`/admin/${key}/${sub.url}`}
                                                className="flex items-center px-5 py-2 text-sm text-body hover:text-primary hover:bg-muted transition-colors"
                                            >
                                                {sub.name}
                                                {sub.url === 'inquiries' && <CountBadge endpoint="/api/inquire/badge" />}
                                                {sub.url === 'cancel' && (
                                                    <CountBadge endpoint="/api/admin/reservation/cancellations/badge" />
                                                )}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </li>
                    ))}
                </ul>
            </nav>
        </aside>
    );
}
