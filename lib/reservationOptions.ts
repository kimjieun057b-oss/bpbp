// 예약 부가서비스 마스터 데이터 - 클라이언트(표시)와 서버(가격 재계산) 양쪽에서 공유
export const ADDON_OPTIONS = [
    { id: "bbq", label: "바비큐 (숯불)", price: 10000 },
    { id: "campfire", label: "불멍 (장작)", price: 15000 },
] as const;

export type AddonOptionId = (typeof ADDON_OPTIONS)[number]["id"];

export function calcOptionsPrice(optionIds: string[]) {
    return optionIds.reduce((sum, id) => {
        const option = ADDON_OPTIONS.find((o) => o.id === id);
        return sum + (option?.price ?? 0);
    }, 0);
}
