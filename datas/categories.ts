export const USER_CATEGORY : { [key: string]: { title: string; categories?: {name: string, url: string}[], banner?: string } } = {
    service: { // room
        title:"SERVICE",
        categories: [
            {name: "service A", url: "sa"},
            {name: "service B", url: "sb"},
            {name: "service C", url: "sc"},
        ],
    },
    reservation: {
        title:"RESERVATION",
        categories: [
            {name: "check", url: "check"},
            {name: "register", url: "register"},
        ],
    },
    room: {
        title:"ROOM",
    },
    notice: {
        title:"NOTICE",
    },
    inquire: {
        title:"INQUIRE",
    },
}

export const ADMIN_CATEGORY : { [key: string]: { title: string; categories?: {name: string, url: string}[], banner?: string }} = {
    reservation: {
    title: "예약 및 현황 관리",
    categories: [
      { name: "실시간 예약 달력", url: "calendar" },
      { name: "예약 리스트 관리", url: "list" },
      { name: "예약 취소 관리", url: "cancel" },
    ],
  },
  room: {
    title: "객실 및 옵션 관리",
    categories: [
      { name: "객실 상태/요금 관리", url: "status" },
      { name: "부가 서비스 관리", url: "options" },
    ],
  },
  operation: {
    title: "운영 및 소통 관리",
    categories: [
      { name: "문의 관리", url: "inquiries" }, // 문의게시판, 간편상담 : 접수/답변완료
      { name: "공지사항 관리", url: "notices" },
      { name: "팝업 관리", url: "popup" }, // 팝업창 관리 (이미지 등록, 활성화/비활성화 : 토글)
    ],
  },
//   customer: {
//     title: "고객 관리",
//     categories: [
//       { name: "회원 명부 및 상태 관리", url: "users" },
//     ],
//   },
}