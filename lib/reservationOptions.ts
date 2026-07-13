// 예약 부가서비스 - room_options 테이블에서 관리(CRUD)되며, 예약 흐름에서는 조회한 목록을 그대로 사용
export interface AddonOption {
    id: string;
    label: string;
    price: number;
}

export function calcOptionsPrice(selectedIds: string[], options: AddonOption[]) {
    return selectedIds.reduce((sum, id) => {
        const option = options.find((o) => o.id === id);
        return sum + (option?.price ?? 0);
    }, 0);
}
