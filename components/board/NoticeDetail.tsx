"use client";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Toast from "@/components/common/Toast";
import { useDelete } from "@/hooks/useDelete";
import PrevNextNavbar from "../common/PrevNextNavbar";
import PrevNextNavbar2 from "../common/PrevNextNavbar2";

interface NoticeDetail {
   id: number;
   category: string;
   name: string;
   mail_id: string;
   mail_address: string;
   title: string;
   contents: string;
   file_url: string | null;
   privacy: boolean;
   created_at: string;
   updated_at: string | null;
}

export default function NoticeDetail() {
   const params = useParams();
   const id = Array.isArray(params.id) ? params.id[0] : params.id;
   const pathname = usePathname();
   const router = useRouter();
   const isAdmin = pathname.startsWith('/admin');

   const [detail, setDetail] = useState<NoticeDetail | null>(null);
   const [loading, setLoading] = useState(true);
   const [vaild, setVaild] = useState<string | null>(null);
   const [pendingDelete, setPendingDelete] = useState(false);
   const [isSuccess, setIsSuccess] = useState(false);

   const [adjacent, setAdjacent] = useState<{
      prev: { id: number; title: string } | null;
      next: { id: number; title: string } | null;
   }>({ prev: null, next: null });

   const { remove, loading: deleteLoading } = useDelete('/api/notice', {
      onSuccess: () => {
         setPendingDelete(false);
         setIsSuccess(true);
         setVaild("삭제 완료되었습니다.");
      },
      onError: (message) => {
         setPendingDelete(false);
         setVaild(message);
      },
   });

   const fetchDetail = async () => {
      setLoading(true);
      try {
         const res = await fetch(`/api/notice/${id}`);
         const result = await res.json();
         setDetail(result.data);
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      fetchDetail();
      fetch(`/api/notice/${id}/adjacent`)
         .then((res) => res.json())
         .then((data) => setAdjacent(data));
   }, [id]);

   const handleToastSetVaild: Dispatch<SetStateAction<string | null>> = (val) => {
      if (isSuccess && val === null) router.push(isAdmin ? '/admin/operation/notices' : '/notice');
      setVaild(val);
      if (val === null) {
         setPendingDelete(false);
         setIsSuccess(false);
      }
   };

   const handleDelete = () => {
      setVaild("게시글을 삭제하시겠습니까?");
      setPendingDelete(true);
   };

   if (loading) return <div className="loading">데이터를 불러오는 중입니다.</div>;
   if (!detail) return <div className="loading">게시글을 찾을 수 없습니다.</div>;

   const listHref = isAdmin ? '/admin/operation/notices' : '/notice';
   const editHref = `/admin/operation/notices/${id}/edit`;

   return (
      <>
         <article>
            <div>
               <div className="card">
                  <div className="h-0.5 bg-primary" />

                  {/* 제목 / 메타 */}
                  <div className="px-6 py-6 border-b border-gray-100">
                     <h2 className="text-xl font-bold text-title">{detail.title}</h2>
                     <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs text-muted">
                           {new Date(detail.created_at).toLocaleDateString("ko-KR")}
                        </span>
                        {detail.updated_at && (
                           <span className="text-xs text-muted">
                              (수정됨: {new Date(detail.updated_at).toLocaleDateString("ko-KR")})
                           </span>
                        )}
                     </div>
                  </div>

                  {/* 본문 */}
                  <div
                     className="px-6 py-8 text-sm text-body leading-relaxed prose max-w-none"
                     dangerouslySetInnerHTML={{ __html: detail.contents }}
                  />

                  {/* 첨부파일 */}
                  {detail.file_url && (() => {
                     const raw = decodeURIComponent(detail.file_url!.split('/').pop() || '');
                     const fileName = raw.includes('_') ? raw.slice(raw.indexOf('_') + 1) : raw;
                     return (
                        <div className="px-6 pb-4">
                           <a
                              href={detail.file_url!}
                              download={fileName}
                              className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
                           >
                              📎 {fileName}
                           </a>
                        </div>
                     );
                  })()}

                  {/* 액션 */}
                  <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                     <Link href={listHref} className="btn-ghost text-xs px-4 py-2">
                        목록
                     </Link>
                     {isAdmin && (
                        <div className="flex gap-2">
                           <Link href={editHref} className="btn-ghost text-xs px-4 py-2">
                              수정
                           </Link>
                           <button
                              type="button"
                              onClick={handleDelete}
                              disabled={deleteLoading}
                              className="btn-danger"
                           >
                              {deleteLoading ? "삭제 중" : "삭제"}
                           </button>
                        </div>
                     )}
                  </div>
               </div>

               <PrevNextNavbar
                  prevLabel="이전 공지"
                  nextLabel="다음 공지"
                  prevItem={adjacent.prev ? { href: `/notice/${adjacent.prev.id}`, title: adjacent.prev.title } : null}
                  nextItem={adjacent.next ? { href: `/notice/${adjacent.next.id}`, title: adjacent.next.title } : null}
               />
            </div>
         </article>
         <Toast
            vaild={vaild}
            setVaild={handleToastSetVaild}
            onConfirm={pendingDelete ? () => remove(id!) : undefined}
         />
      </>
   );
}
