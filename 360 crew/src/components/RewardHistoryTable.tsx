import { RewardHistoryItem } from "../lib/dashboardAdapter";

export default function RewardHistoryTable({
    history,
}: {
    history: RewardHistoryItem[];
}) {
    return (
        <div
            className="rounded-xl p-5"
            style={{
                background: "#fff",
                border: "1px solid #E5E7EB",
            }}
        >
            <h2
                style={{
                    fontSize: 20,
                    fontWeight: 700,
                    marginBottom: 20,
                }}
            >
                📜 Reward History
            </h2>

            <div
                style={{
                    overflowX: "auto",
                }}
            >
                <table
                    style={{
                        width: "100%",
                        borderCollapse: "collapse",
                    }}
                >
                    <thead>
                        <tr
                            style={{
                                background: "#F8FAFC",
                            }}
                        >
                            <th
                                style={{
                                    textAlign: "left",
                                    padding: 14,
                                }}
                            >
                                Date
                            </th>

                            <th
                                style={{
                                    textAlign: "left",
                                    padding: 14,
                                }}
                            >
                                Reward Type
                            </th>

                            <th
                                style={{
                                    textAlign: "right",
                                    padding: 14,
                                }}
                            >
                                Points
                            </th>
                        </tr>
                    </thead>

                    <tbody>

                        {history.map((item) => (

                            <tr
                                key={item.id}
                                style={{
                                    borderTop:
                                        "1px solid #E5E7EB",
                                }}
                            >

                                <td
                                    style={{
                                        padding: 14,
                                        color: "#64748B",
                                    }}
                                >
                                    {item.date}
                                </td>

                                <td
                                    style={{
                                        padding: 14,
                                        fontWeight: 600,
                                    }}
                                >
                                    {item.label}
                                </td>

                                <td
                                    style={{
                                        padding: 14,
                                        textAlign: "right",
                                        color: "#16A34A",
                                        fontWeight: 700,
                                    }}
                                >
                                    +{item.points}
                                </td>

                            </tr>

                        ))}

                    </tbody>

                </table>
            </div>

        </div>
    );
}