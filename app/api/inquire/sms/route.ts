import { NextResponse } from "next/server";
import { SolapiMessageService } from "solapi";

// 문자 문의
// npm install --save solapi
export async function POST(req: Request) {
    try {
        const formData = await req.formData();

        const name = formData.get("name");
        const phoneFront = formData.get("phoneFront");
        const phoneMiddle = formData.get("phoneMiddle");
        const phoneLast = formData.get("phoneLast");
        const requestText = formData.get("request");

        const apiKey = process.env.SOLAPI_API_KEY!;
        const apiSecret = process.env.SOLAPI_API_SECRET!;
        const apinumber = process.env.SOLAPI_API_NUMBER!;

        const messageService = new SolapiMessageService(apiKey, apiSecret);

        const message = `
[0000 문의]

이름: ${name}
연락처: ${phoneFront}-${phoneMiddle}-${phoneLast}
요청 사항: ${requestText || "-"}
`.trim();

        const sendResult = await messageService.send({
            to: apinumber,
            from: apinumber,
            text: message,
            subject: "[견적문의]",
        });

        console.log(message);

        return NextResponse.json({ success: true, sendResult });

    } catch (error: any) {
        console.error("MMS 발송 실패:", error);
        return NextResponse.json({ success: false, error: error.message });
    }
}
