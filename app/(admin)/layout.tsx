import SideMenu from "@/components/common/category/SideMenu";
import AdminHeader from "@/components/common/header/AdminHeader";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <AdminHeader />
            <div className="flex">
                <SideMenu/>
                <main className="flex-1 min-h-screen overflow-auto p-6">
                    {children}
                </main>
            </div>
        </>
    );
}
