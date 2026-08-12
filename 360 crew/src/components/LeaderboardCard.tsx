import { LeaderboardInfo } from "../lib/dashboardAdapter";

export default function LeaderboardCard({
    leaderboard,
    limit,
}: {
    leaderboard: LeaderboardInfo;
    limit?: number;
}) {
    return (
        <div
            className="rounded-xl p-5"
            style={{
                background: "#fff",
                border: "1px solid #E5E7EB",
            }}
        >
            <div
                className="flex justify-between items-center mb-5"
            >
                <div>
                    <div
                        style={{
                            fontWeight: 700,
                            fontSize: 18,
                        }}
                    >
                        🏆 {leaderboard.station} Station
                    </div>

                    <div
                        style={{
                            color: "#6B7280",
                            fontSize: 13,
                            marginTop: 4,
                        }}
                    >
                        {leaderboard.employeeCount} Employees
                    </div>
                </div>
            </div>

            <div
                style={{
                    maxHeight: 500,
                    overflowY: "auto",
                }}
            >
                {(limit
                    ? leaderboard.leaderboard.slice(0, limit)
                    : leaderboard.leaderboard
                ).map((employee) => (
                    <div
                        key={employee.id}
                        className="flex justify-between items-center rounded-lg px-3 py-3 mb-2"
                        style={{
                            background: employee.current
                                ? "#DCFCE7"
                                : "#F8FAFC",

                            borderLeft:
                                employee.current
                                    ? "4px solid #16A34A"
                                    : "4px solid transparent",
                        }}
                    >
                        <div className="flex items-center gap-3">

                            <div
                                style={{
                                    width: 28,
                                    textAlign: "center",
                                    fontWeight: 700,
                                }}
                            >
                                {employee.rank === 1
                                    ? "🥇"
                                    : employee.rank === 2
                                    ? "🥈"
                                    : employee.rank === 3
                                    ? "🥉"
                                    : "🏅"}
                            </div>

                            <div>

                                <div
                                    style={{
                                        fontWeight:
                                            employee.current
                                                ? 700
                                                : 500,
                                    }}
                                >
                                    {employee.current
                                        ? "You"
                                        : employee.name}
                                </div>

                                <div
                                    style={{
                                        fontSize: 12,
                                        color: "#6B7280",
                                    }}
                                >
                                    {employee.points.toLocaleString()} pts
                                </div>

                            </div>

                        </div>

                        <strong
                            style={{
                                color: "#15803D",
                            }}
                        >
                            #{employee.rank}
                        </strong>
                    </div>
                ))}
            </div>

            {leaderboard.currentEmployee &&
                leaderboard.currentEmployee.rank > (limit ?? 9999) && (

                    <div
                        className="mt-5 rounded-lg p-3"
                        style={{
                            background: "#F0FDF4",
                            border: "1px solid #BBF7D0",
                        }}
                    >
                        <strong>
                            Your Position
                        </strong>

                        <div
                            className="flex justify-between mt-2"
                        >
                            <span>
                                #{leaderboard.currentEmployee.rank}{" "}
                                {leaderboard.currentEmployee.name}
                            </span>

                            <strong>
                                {leaderboard.currentEmployee.points.toLocaleString()}
                            </strong>
                        </div>
                    </div>
                )}
        </div>
    );
}