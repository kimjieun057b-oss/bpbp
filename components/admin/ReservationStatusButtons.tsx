import { EDITABLE_STATUSES, ReservationStatus, STATUS_LABEL } from "@/lib/reservationStatus";

interface ReservationStatusButtonsProps {
    status: ReservationStatus;
    onChange: (status: ReservationStatus) => void;
    size?: "default" | "compact";
}

export default function ReservationStatusButtons({ status, onChange, size = "default" }: ReservationStatusButtonsProps) {
    const buttonClass = size === "compact" ? "px-2.5 py-1 text-xs rounded-lg" : "px-3 py-2 text-sm rounded-lg";

    return (
        <div className="flex gap-1.5">
            {EDITABLE_STATUSES.map((s) => (
                <button
                    key={s}
                    type="button"
                    onClick={() => onChange(s)}
                    className={`flex-1 font-medium transition-colors cursor-pointer ${buttonClass} ${
                        status === s
                            ? "bg-primary text-white"
                            : "bg-white border border-gray-200 text-body hover:bg-surface"
                    }`}
                >
                    {STATUS_LABEL[s]}
                </button>
            ))}
        </div>
    );
}
