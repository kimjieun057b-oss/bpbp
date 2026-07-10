"use client";
// 간단문의 리스트 : 문자or메일 문의를 받지만 관리자페이지 내에서도 문의 들어온 것을 확인
// 문의 확인이 되면 접수 -> 완료 로 버튼 변경

import { usePagination } from "@/hooks/usePagination";
import { Fragment, useEffect, useState } from "react"
import Pagination from "../common/Pagination";

interface QuickInquireItem {
   id: number,
   name: string,
   phone_front: string,
   phone_middle: string,
   phone_last: string,
   is_answered: boolean,
   created_at: string
}

const ITEMS_PER_PAGE = 8;
const GRID_COLS = "grid-cols-[60px_minmax(90px,0.5fr)_minmax(120px,0.7fr)_minmax(120px,0.7fr)_minmax(100px,0.5fr)_minmax(100px,0.5fr)]";

// 접수 개수는 숫자 뱃지로 표시
export default function InquireQuickList() {

   const [inquire, setInquire] = useState<QuickInquireItem[]>([]);
   const [loading, setLoading] = useState(true);
   const { currentItems, currentPage, totalCount, onPageChange } = usePagination(inquire, ITEMS_PER_PAGE);

   useEffect(() => {
      const load = async () => {
         try {
            const res = await fetch('/api/inquire/quick');
            const { data } = await res.json();
            setInquire(data ?? []);
         } catch (err: any) {
            console.error("Fail data load...", err);
         } finally {
            setLoading(false);
         }
      };

      load();
   }, []);

   const handleToggleAnswered = async (id: number, current: boolean) => {
      setInquire(prev => prev.map(item => item.id === id ? { ...item, is_answered: !current } : item));

      try {
         const res = await fetch(`/api/inquire/quick/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ is_answered: !current }),
         });

         if (!res.ok) throw new Error('상태 변경에 실패했습니다.');
      } catch (err: any) {
         console.error(err);
         setInquire(prev => prev.map(item => item.id === id ? { ...item, is_answered: current } : item));
      }
   };

   if (loading) return <div className="loading">정보를 불러오는 중입니다.</div>;
   if (inquire.length === 0) return <div className="loading">문의 내용이 존재하지 않습니다.</div>;

   return (
      <>
         <div className={`card grid ${GRID_COLS} min-h-40`}>
            <span className="border-b border-gray-100 px-2 py-2.5 text-center text-xs font-medium text-muted">번호</span>
            <span className="border-b border-gray-100 px-5 py-2.5 text-center text-xs font-medium text-muted">구분</span>
            <span className="border-b border-gray-100 px-5 py-2.5 text-center text-xs font-medium text-muted">문의자</span>
            <span className="border-b border-gray-100 px-5 py-2.5 text-center text-xs font-medium text-muted">연락처</span>
            <span className="border-b border-gray-100 px-5 py-2.5 text-center text-xs font-medium text-muted">답변상태</span>
            <span className="border-b border-gray-100 px-5 py-2.5 text-center text-xs font-medium text-muted">접수일</span>

            {currentItems.map((item, index) => (
               <Fragment key={item.id}>
                  <span className="flex items-center justify-center border-b border-gray-100 px-2 py-4 text-center text-sm text-muted">
                     {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                  </span>
                  <span className="flex items-center justify-center border-b border-gray-100 px-5 py-4 text-center">
                     <span className="badge badge-info">간편문의</span>
                  </span>
                  <span className="flex items-center justify-center truncate border-b border-gray-100 px-5 py-4 text-center text-sm text-title">
                     {item.name}
                  </span>
                  <span className="flex items-center justify-center truncate border-b border-gray-100 px-5 py-4 text-center text-sm text-title">
                     {item.phone_front}-{item.phone_middle}-{item.phone_last}
                  </span>
                  <span className="flex items-center justify-center border-b border-gray-100 px-5 py-4 text-center">
                     <button
                        type="button"
                        onClick={() => handleToggleAnswered(item.id, item.is_answered)}
                        className={`badge cursor-pointer ${item.is_answered ? 'badge-success' : 'badge-warning'}`}
                     >
                        {item.is_answered ? '답변완료' : '답변대기'}
                     </button>
                  </span>
                  <span className="flex items-center justify-center border-b border-gray-100 px-5 py-4 text-center text-xs text-muted">
                     {new Date(item.created_at).toLocaleDateString("ko-KR")}
                  </span>
               </Fragment>
            ))
            }
         </div>
         <Pagination
            totalCount={totalCount}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={onPageChange}
         />
      </>
   )
}
