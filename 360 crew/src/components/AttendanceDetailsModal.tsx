import { AttendanceRecord } from "../lib/dashboardAdapter";

export default function AttendanceDetailsModal({
    record,
    open,
    onClose,
    onEdit,
}: {
    record: AttendanceRecord | null;
    open: boolean;
    onClose: () => void;
    onEdit: (record: AttendanceRecord) => void;
}) {

    if (!open || !record) return null;

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

            <div className="bg-white rounded-xl p-6 w-[520px]">

                <h2 className="text-xl font-bold mb-5">
                    Attendance Details
                </h2>

                <div className="space-y-3">

                    <Detail
                        title="Attendance"
                        value={record.attendance}
                    />

                    <Detail
                        title="Check In"
                        value={record.checkIn}
                    />

                    <Detail
                        title="Date"
                        value={record.date}
                    />

                    <Detail
                        title="Location"
                        value={record.location}
                    />

                    <Detail
                        title="Justification Status"
                        value={record.justificationStatus}
                    />

                    <Detail
                        title="Reason"
                        value={record.reason || "—"}
                    />

                    <Detail
                        title="Description"
                        value={record.justification || "—"}
                    />

                </div>

                <div className="flex justify-end gap-3 mt-6">

                    {record.justificationStatus === "Submitted" && (

                        <button
                            onClick={() => onEdit(record)}
                            className="px-4 py-2 rounded-lg bg-amber-500 text-white"
                        >
                            Edit
                        </button>

                    )}

                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg border"
                    >
                        Close
                    </button>

                </div>

            </div>

        </div>
    );
}

function Detail({
    title,
    value,
}: {
    title: string;
    value: string;
}) {

    return (
        <div>

            <div className="text-xs text-gray-500">
                {title}
            </div>

            <div className="font-medium">
                {value}
            </div>

        </div>
    );

}