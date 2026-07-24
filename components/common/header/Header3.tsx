"use client";
import { USER_CATEGORY } from "@/datas/categories";
import { siteConfig } from "@/config/site";
import Link from "next/link";
import { useState } from "react";

// 전체 서브카테고리 박스가 헤더 아래 통째로 노출되는 메가메뉴. 모바일은 우측 슬라이드 패널 + 아코디언 서브메뉴
export default function Header3() {

    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [openSub, setOpenSub] = useState<string | null>(null);
    const [hoverKey, setHoverKey] = useState<string | null>(null);

    const categoryEntries = Object.entries(USER_CATEGORY);

    return (
        <>
            <header className="sticky top-0 bg-white border-b border-gray-100 shadow-card" onMouseLeave={() => setHoverKey(null)}>
                <div className="max-w-341.5 mx-auto px-5 pc:px-0 h-16 flex items-center justify-between">

                    <h3 className="text-base font-bold">
                        <Link href="/" className="text-title hover:text-primary">{siteConfig.name || "HOME"}</Link>
                    </h3>

                    {/* PC 메뉴: 헤더 정중앙 정렬 */}
                    <div className="hidden pc:flex pc:items-center pc:absolute pc:left-1/2 pc:top-0 pc:h-16 pc:-translate-x-1/2">
                        <ul className="flex items-center gap-8 h-full">
                            {categoryEntries.map(([key, c]) => {
                                const hasSubMenu = !!c.categories?.length;
                                return (
                                    <li key={key} onMouseEnter={() => hasSubMenu && setHoverKey(key)}>
                                        {hasSubMenu ? (
                                            <p className={`text-sm font-medium cursor-default transition-colors ${hoverKey === key ? "text-primary font-bold" : "text-body"}`}>
                                                {c.title}
                                            </p>
                                        ) : (
                                            <Link href={`/${key}`} className="text-sm font-medium text-body hover:text-primary">
                                                {c.title}
                                            </Link>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    </div>

                    <button
                        type="button"
                        onClick={() => setIsOpen(true)}
                        className="pc:hidden flex flex-col justify-center gap-1 w-6 h-5 shrink-0 cursor-pointer"
                        aria-label="메뉴 열기"
                    >
                        <span className="block h-0.5 w-full bg-title rounded-full"></span>
                        <span className="block h-0.5 w-full bg-title rounded-full"></span>
                        <span className="block h-0.5 w-full bg-title rounded-full"></span>
                    </button>
                </div>

                {/* PC 서브메뉴 */}
                <div className={`hidden pc:block absolute left-0 top-16 w-full bg-white border-t border-gray-100 shadow-card overflow-hidden transition-all duration-300
                    ${hoverKey ? "opacity-100 visible max-h-96" : "opacity-0 invisible max-h-0"}`}>
                    <div className="max-w-341.5 mx-auto flex divide-x divide-gray-100">
                        {categoryEntries
                            .filter(([, c]) => c.categories?.length)
                            .map(([key, c]) => (
                                <ul key={key} className="flex-1 py-4">
                                    {c.categories!.map((sub) => (
                                        <li key={sub.url}>
                                            <Link
                                                href={`/${key}/${sub.url}`}
                                                className="block px-6 py-2 text-sm text-body hover:text-primary hover:bg-surface transition-colors"
                                            >
                                                {sub.name}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            ))}
                    </div>
                </div>
            </header>

            {/* 모바일 슬라이드 패널 (아코디언 서브메뉴) */}
            <nav className={`fixed top-0 right-0 h-dvh w-[80%] max-w-80 bg-white z-50 shadow-card
                transition-transform duration-300 ease-in-out pc:hidden
                ${isOpen ? "translate-x-0" : "translate-x-full"}`}>

                <div className="flex justify-end px-5 py-4">
                    <button
                        type="button"
                        onClick={() => setIsOpen(false)}
                        className="text-title text-xl leading-none cursor-pointer"
                        aria-label="메뉴 닫기"
                    >
                        ✕
                    </button>
                </div>

                <ul className="px-5">
                    {categoryEntries.map(([key, c]) => {
                        const hasSubMenu = !!c.categories?.length;
                        const isSubOpen = openSub === key;
                        return (
                            <li key={key} className="border-b border-gray-100 last:border-0">
                                {hasSubMenu ? (
                                    <button
                                        type="button"
                                        onClick={() => setOpenSub(isSubOpen ? null : key)}
                                        className="w-full flex items-center justify-between py-3.5 text-left cursor-pointer"
                                    >
                                        <span className="text-sm font-medium text-title">{c.title}</span>
                                        <svg
                                            className={`w-3 h-3 text-muted transition-transform duration-300 ${isSubOpen ? "rotate-180" : ""}`}
                                            viewBox="0 0 12 8" fill="none"
                                        >
                                            <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </button>
                                ) : (
                                    <Link
                                        href={`/${key}`}
                                        onClick={() => setIsOpen(false)}
                                        className="block py-3.5 text-sm font-medium text-title"
                                    >
                                        {c.title}
                                    </Link>
                                )}
                                {hasSubMenu && (
                                    <ul className={`overflow-hidden transition-all duration-300 ${isSubOpen ? "max-h-60 pb-2" : "max-h-0"}`}>
                                        {c.categories!.map((sub) => (
                                            <li key={sub.url}>
                                                <Link
                                                    href={`/${key}/${sub.url}`}
                                                    onClick={() => { setIsOpen(false); setOpenSub(null); }}
                                                    className="block py-2 pl-3 text-sm text-body hover:text-primary"
                                                >
                                                    - {sub.name}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </li>
                        );
                    })}
                </ul>
            </nav>

            <div
                className={`fixed inset-0 bg-black/50 z-40 pc:hidden transition-opacity duration-300
                    ${isOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}
                onClick={() => setIsOpen(false)}
            />
        </>
    );
}
