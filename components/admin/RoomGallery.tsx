import Link from "next/link";
import Image from "next/image";

export interface RoomItem {
    id: string;
    name: string;
    base_price: number;
    base_people: number;
    max_people: number;
    quantity: number;
    image_url: string | null;
}

interface RoomGalleryProps {
    rooms: RoomItem[];
    // 카드를 클릭했을 때 이동할 경로를 만들어주는 함수 - 화면(관리자/사용자)마다 이동 대상이 다르므로 호출부에서 주입
    getHref?: (room: RoomItem) => string;
}

// 객실 갤러리 - rooms 데이터를 카드 그리드로 렌더링만 하는 순수 컴포넌트 (관리자/사용자 화면 공용)
export default function RoomGallery({ rooms, getHref }: RoomGalleryProps) {
    if (rooms.length === 0) {
        return <p className="px-5 py-8 text-center text-sm text-muted">등록된 객실이 없습니다.</p>;
    }

    return (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 pc:grid-cols-3">
            {rooms.map((room) => {
                const href = getHref?.(room);

                const cardContent = (
                    <>
                        <div className="relative h-40 w-full bg-surface">
                            {room.image_url ? (
                                <Image className="h-full w-full object-cover" src={room.image_url} alt={room.name} width={300} height={300} />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center text-sm text-muted">
                                    이미지 없음
                                </div>
                            )}

                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/60 text-center text-white opacity-0 transition-opacity group-hover:opacity-100">
                                <span>{room.name}</span>
                                <span className="text-sm">
                                    기준 {room.base_people}인 · 최대 {room.max_people}인
                                </span>
                                <span className="text-sm">객실 {room.quantity}개</span>
                            </div>
                        </div>

                        <div className="space-y-1 p-4">
                            <h3 className="truncate text-sm font-semibold text-title">{room.name}</h3>
                            <p className="text-sm text-primary">{room.base_price.toLocaleString()}원 / 1박</p>
                        </div>
                    </>
                );

                if (href) {
                    return (
                        <Link key={room.id} href={href} className="card group relative block overflow-hidden">
                            {cardContent}
                        </Link>
                    );
                }

                return (
                    <div key={room.id} className="card group relative overflow-hidden">
                        {cardContent}
                    </div>
                );
            })}
        </div>
    );
}
