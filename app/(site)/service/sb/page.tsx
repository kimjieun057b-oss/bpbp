import MailForm from "@/components/form/MailForm";
import MailUiTemplate from "@/components/MailUiTemplate";

export default function ServiceBPage() {

    return (
        <>
        <article>
            <div>
                <div>메일문의</div>
                <div>
                    <MailForm />
                </div>
            </div>
        </article>
        <MailUiTemplate/>
        </>
    )
}