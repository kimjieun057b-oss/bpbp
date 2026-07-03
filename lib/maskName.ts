const MAX_MASK_LENGTH = 3;

// 문의자 이름 개인정보 보호 - 첫 글자만 노출하고 나머지는 최대 3개까지 * 처리 (예: 홍길동 -> 홍**)
export function maskName(name: string) {
    if (name.length <= 1) return name;
    const maskCount = Math.min(name.length - 1, MAX_MASK_LENGTH);
    return name[0] + '*'.repeat(maskCount);
}
