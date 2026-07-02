import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

async function getTodayInquiries() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const { data: posts } = await supabaseAdmin
        .from('inquire_board')
        .select('id, title')
        .gte('created_at', today.toISOString())
        .lt('created_at', tomorrow.toISOString())
        .order('created_at', { ascending: false })
        .limit(5);

    if (!posts || posts.length === 0) return [];

    const postIds = posts.map((p) => p.id);
    const { data: comments } = await supabaseAdmin
        .from('comment')
        .select('inquire_id, is_admin')
        .in('inquire_id', postIds);

    const statsMap = new Map<number, { count: number; is_answered: boolean }>();
    for (const c of comments ?? []) {
        const s = statsMap.get(c.inquire_id) ?? { count: 0, is_answered: false };
        s.count++;
        if (c.is_admin) s.is_answered = true;
        statsMap.set(c.inquire_id, s);
    }

    return posts.map((post) => ({
        ...post,
        comment_count: statsMap.get(post.id)?.count ?? 0,
        is_answered: statsMap.get(post.id)?.is_answered ?? false,
    }));
}

export default async function Dashboard() {
    const inquiries = await getTodayInquiries();

    return (
        <div className="p-6 space-y-6">
            {/* 오늘 접수된 문의 카드 */}
            <div className="card">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                    <h2 className="text-sm font-semibold text-title">오늘 접수된 문의</h2>
                    <Link
                        href="/admin/operation/inquiries"
                        className="text-xs text-primary hover:underline"
                    >
                        더보기
                    </Link>
                </div>

                {inquiries.length === 0 ? (
                    <p className="px-5 py-8 text-sm text-muted text-center">오늘 접수된 문의가 없습니다.</p>
                ) : (
                    <ul className="divide-y divide-gray-100">
                        {inquiries.map((item) => (
                            <li key={item.id}>
                                <Link
                                    href={`/admin/operation/inquiries/${item.id}`}
                                    className="flex items-center gap-3 px-5 py-3.5 hover:bg-surface transition-colors"
                                >
                                    <span className="text-sm text-body truncate flex-1">
                                        {item.title}
                                        {item.comment_count > 0 && (
                                            <span className="ml-1.5 text-primary font-medium">
                                                ({item.comment_count})
                                            </span>
                                        )}
                                    </span>
                                    <span className={`badge ${item.is_answered ? 'badge-success' : 'badge-warning'}`}>
                                        {item.is_answered ? '답변완료' : '답변대기'}
                                    </span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
