"use client";
import { useEffect, useState } from "react";

export default function InquireBadge() {
    const [count, setCount] = useState(0);

    useEffect(() => {
        fetch('/api/inquire/badge')
            .then((res) => res.json())
            .then(({ count }) => setCount(count ?? 0))
            .catch(() => {});
    }, []);

    if (count === 0) return null;

    return (
        <span className="ml-1.5 inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-white text-[10px] font-bold leading-none">
            {count > 99 ? '99+' : count}
        </span>
    );
}
