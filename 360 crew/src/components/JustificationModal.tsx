import { useState } from "react";

export default function JustificationModal({
    open,
    onClose,
    employeeId,
    attendanceId,
    onSubmitted,
}: {
    open: boolean;
    onClose: () => void;
    employeeId: number;
    attendanceId: number;
    onSubmitted: () => void;
}) {

    const [reason, setReason] = useState("");

    const [description, setDescription] = useState("");

    const [loading, setLoading] = useState(false);

    if (!open) return null;

    async function submit() {

        if (!reason || !description.trim()) {

            alert("Please complete all required fields.");

            return;
        }

       setLoading(true);

try {

    const form = new FormData();

    form.append("employee_id", String(employeeId));
    form.append("attendance_id", String(attendanceId));
    form.append("reason", reason);
    form.append("description", description);
    console.log({
    employeeId,
    attendanceId,
    reason,
    description,
});
    const response = await fetch(
        "http://localhost/smart-attendance/api/submit_justification.php",
        {
            method: "POST",
            body: form,
        }
    );

    console.log("Response status:", response.status);

    const data = await response.json();

    console.log(data);

    setLoading(false);

    if (!data.success) {
        alert(data.message);
        return;
    }

    onSubmitted();
    onClose();

} catch (error) {

    console.error(error);

    setLoading(false);

    alert("Failed to submit justification.");

}
    }

    return (
        
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[99999]">

            <div className="bg-white rounded-xl p-6 w-[500px]">

                <h2 className="text-xl font-bold mb-5">
                    Submit Justification
                </h2>

                <label className="block mb-2">
                    Reason
                </label>

                <select
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full border rounded-lg p-2 mb-4"
                >
                    <option value="">Select...</option>

                    <option>Medical</option>

                    <option>Transportation</option>

                    <option>Family Emergency</option>

                    <option>Official Duty</option>

                    <option>Personal</option>

                    <option>Other</option>

                </select>

                <label className="block mb-2">
                    Description
                </label>

                <textarea
                    value={description}
                    onChange={(e) =>
                        setDescription(e.target.value)
                    }
                    rows={5}
                    className="w-full border rounded-lg p-2"
                />

                <div className="flex justify-end gap-3 mt-5">

                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg border"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={submit}
                        disabled={loading}
                        className="px-4 py-2 rounded-lg bg-green-800 text-white"
                    >
                        {loading
                            ? "Submitting..."
                            : "Submit"}
                    </button>

                </div>

            </div>

        </div>

    );

}