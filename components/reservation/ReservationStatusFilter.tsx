import { ReservationStatus, STATUS_LABEL } from "@/lib/reservationStatus";

interface ReservationStatusFilterProps {
    statuses: ReservationStatus[];
    badgeClassMap: Record<ReservationStatus, string>;
    active: ReservationStatus | "all";
    onChange: (value: ReservationStatus | "all") => void;
}

export default function ReservationStatusFilter({ statuses, badgeClassMap, active, onChange }: ReservationStatusFilterProps) {
    return (
        <div className="flex flex-wrap gap-2">
            <button
                type="button"
                onClick={() => onChange("all")}
                className={`badge badge-muted cursor-pointer transition-opacity ${
                    active === "all" ? "opacity-100 ring-1 ring-muted ring-offset-1" : "opacity-60 hover:opacity-100"
                }`}
            >
                전체
            </button>
            {statuses.map((status) => (
                <button
                    key={status}
                    type="button"
                    onClick={() => onChange(status)}
                    className={`badge ${badgeClassMap[status]} cursor-pointer transition-opacity ${
                        active === status ? "opacity-100 ring-1 ring-muted ring-offset-1" : "opacity-60 hover:opacity-100"
                    }`}
                >
                    {STATUS_LABEL[status]}
                </button>
            ))}
        </div>
    );
}
