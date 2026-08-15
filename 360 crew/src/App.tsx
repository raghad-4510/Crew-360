
import RewardsPage from "./pages/RewardsPage";
import { fetchMood, MoodInfo } from "./lib/dashboardAdapter";
import MoodBoardCard from "./components/MoodBoardCard";
import AttendanceDetailsModal from "./components/AttendanceDetailsModal";
import JustificationModal from "./components/JustificationModal";
import { useState, useEffect } from "react";
import StationMap from "./components/StationMap";
import { RadialBarChart, RadialBar, PolarAngleAxis } from "recharts"
import {
  LayoutDashboard,
  CalendarCheck,
  MapPin,
  History,
  Gift,
  ChevronRight,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  RefreshCw,
  User,
  
} from "lucide-react"
import {
  fetchEmployee,
  fetchShiftInfo,
  fetchTodayShifts,
  fetchAttendanceHistory,
  fetchRewardInfo,
  fetchRewardHistory,
  fetchFullAttendanceHistory,
  checkIn,
  fetchWeeklyMood,
   WeeklyMood,
   LeaderboardInfo,
fetchLeaderboard,
  type Employee,
  type ShiftInfo,
  type AttendanceRecord,
  type RewardInfo,
  type RewardHistoryItem,
} from "./lib/dashboardAdapter"


// ─── Sidebar ─────────────────────────────────────────────────────────────────

const NAV= [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "attendance", label: "Smart Attendance", icon: CalendarCheck },
  { id: "livemap", label: "Live Map", icon: MapPin },
  { id: "history", label: "Attendance History", icon: History },
  { id: "rewards", label: "Rewards", icon: Gift },
]

interface SidebarProps {
  active: string
  onNav: (id: string) => void
  employee: Employee | null
}

export function Sidebar({ active, onNav, employee }: SidebarProps) {
  return (
    <aside className="flex h-full w-[220px] min-w-[220px] flex-col border-r border-white/10 bg-gradient-to-b from-[#1b3d2e] to-[#0f2a1e] text-white select-none">
      {/* Brand / Logo */}
      <div className="flex flex-col items-center justify-center gap-1 border-b border-white/10 px-4 py-6">
        <div className="mb-1 flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-500/10 ring-1 ring-emerald-500/20">
          <svg className="h-9 w-9 text-emerald-400" viewBox="0 0 36 36" fill="none">
            <circle cx="18" cy="18" r="16" fill="currentColor" fillOpacity="0.15" />
            <path d="M10 22 L18 10 L26 22 Z" fill="currentColor" fillOpacity="0.8" />
            <circle cx="18" cy="22" r="4" fill="currentColor" />
          </svg>
        </div>
        <span className="text-center text-xs font-bold tracking-wide text-white">
          360 CREW
        </span>
        <span className="text-center text-[9px] font-medium text-white/50">
          Abu Al-Jadayel Fueled Services
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
        {NAV.map(({ id, label, icon: Icon }) => {
          const isActive = active === id
          return (
            <button
              key={id}
              onClick={() => onNav(id)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-xs transition-all ${
                isActive
                  ? "bg-emerald-400/15 font-semibold text-emerald-400 ring-1 ring-emerald-400/25"
                  : "font-normal text-white/60 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{label}</span>
              {isActive && (
                <ChevronRight className="ml-auto h-3.5 w-3.5 shrink-0 opacity-60" />
              )}
            </button>
          )
        })}
      </nav>

      {/* User Profile */}
      <div className="flex items-center gap-3 border-t border-white/10 px-4 py-4">
        <div className="flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-full bg-emerald-400 text-xs font-bold text-[#0f2a1e]">
          {employee?.avatarInitials ?? "??"}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-xs font-semibold text-white">
            {employee?.name ?? "Loading…"}
          </div>
          <div className="truncate text-[11px] text-white/45">
            {employee?.role ?? ""}
          </div>
        </div>
      </div>
    </aside>
  )
}

// ─── Header ───────────────────────────────────────────────────────────────────

interface HeaderProps {
  title?: string
}

export function Header({ title = "Dashboard" }: HeaderProps) {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const dateStr = now.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
  const timeStr = now.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  })

  return (
    <header className="flex min-h-[56px] items-center justify-between border-b border-white/10 bg-gradient-to-r from-[#1b3d2e] to-[#0f2a1e] px-6 py-3 text-white">
      <h1 className="text-lg font-bold tracking-tight text-white">{title}</h1>
      <div className="flex items-center gap-2 text-xs font-medium text-white/75">
        <Clock className="h-4 w-4 text-emerald-400 opacity-80" />
        <span>
          {dateStr}, {timeStr}
        </span>
      </div>
    </header>
  )
}
// ─── Smart Attendance Card ────────────────────────────────────────────────────

const ZONE_COLOR = {
    green: "#1F6B42",   
    blue: "#B0924E",    
    outside: "#E11D48", 
} as const;

const ZONE_LABEL = {
    green: "Green Zone",
    blue: "Blue Zone",
    outside: "Out of Zone",
} as const;
const format24Hour = (time?: string) => {
    if (!time) return "—";

    const date = new Date(`2000-01-01 ${time}`);

    if (Number.isNaN(date.getTime())) return time;

    return new Intl.DateTimeFormat("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    }).format(date);
};

type AttendanceZone = "green" | "blue" | "outside";

export function SmartAttendanceCard({
    shifts,
    zone,
    onOpenJustification,
    onCheckIn,
}: {
    shifts: ShiftInfo[];
    zone: AttendanceZone;
    onOpenJustification: (shift: ShiftInfo) => void;
    onCheckIn: (shift: ShiftInfo) => void;
}) {
    const color = ZONE_COLOR[zone];

    const getMinutes = (time: string) => {
    const [hours, minutes] = time.substring(0, 5).split(":").map(Number);
    return hours * 60 + minutes;
};

const now = new Date();
const nowMinutes = now.getHours() * 60 + now.getMinutes();

const getShiftTiming = (shift: ShiftInfo) => {
    const start = getMinutes(shift.shiftStart);
    const end = getMinutes(shift.shiftEnd);
    const checkInStart = (start - 30 + 1440) % 1440;
    const isOvernight = end <= start;

    const isCurrent = isOvernight
        ? nowMinutes >= start || nowMinutes < end
        : nowMinutes >= start && nowMinutes < end;

    const isUpcoming = isOvernight
        ? nowMinutes < start && nowMinutes >= end
        : nowMinutes < start;

    const isCheckInWindow = checkInStart > end
        ? nowMinutes >= checkInStart || nowMinutes < end
        : nowMinutes >= checkInStart && nowMinutes < end;

    return {
        isCurrent,
        isUpcoming,
        isEnded: !isCurrent && !isUpcoming,
        isCheckInWindow,
    };
};
const currentShift = shifts.find(
    (shift) =>
        !shift.checkedIn &&
        shift.attendanceStatus !== "Absent" &&
        getShiftTiming(shift).isCurrent
);

const upcomingShift = shifts.find(
    (shift) =>
        !shift.checkedIn &&
        shift.attendanceStatus !== "Absent" &&
        getShiftTiming(shift).isUpcoming
);

const actionShift = currentShift ?? upcomingShift ?? null;

    
    const attentionShift =
        shifts.find(
            (shift) =>
                shift.attendanceStatus === "Absent" &&
                shift.justificationStatus === "Required"
        ) ?? null;

    const canCheckIn =
    actionShift !== null &&
    getShiftTiming(actionShift).isCheckInWindow &&
    zone === "green";
        console.log(new Date().toString(), nowMinutes);
    const getShiftStatus = (shift: ShiftInfo) => {
        if (shift.attendanceStatus === "Absent") return "Reassigned";
        if (shift.checkedIn) return `Checked in${shift.checkInTime ? ` · ${shift.checkInTime}` : ""}`;
        if (shift === actionShift) return "Ready to check in";
        if (getShiftTiming(shift).isEnded) return "Shift ended";
if (getShiftTiming(shift).isCurrent) return "Ready to check in";

return "Upcoming";
        
    };

    return (
        <div
            className="rounded-xl p-5"
            style={{ background: "#FFFFFF", border: "1px solid #E5E7EB" }}
        >
            <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <CalendarCheck size={18} style={{ color: "#B0924E" }} />
                    <span style={{ fontWeight: 700, fontSize: 15, color: "#1E252B" }}>
                        Smart Attendance
                    </span>
                </div>

                <span style={{ fontSize: 12, color: "#64748B", fontWeight: 600 }}>
                    Today · {shifts.length} {shifts.length === 1 ? "shift" : "shifts"}
                </span>
            </div>

            {attentionShift && (
                <div
                    className="rounded-lg px-4 py-3 mb-4"
                    style={{ background: "#FFF1F2", border: "1px solid #FECDD3" }}
                >
                    <div className="flex items-center gap-2">
                        <AlertCircle size={18} style={{ color: "#E11D48" }} />
                        <span style={{ color: "#9F1239", fontWeight: 700, fontSize: 14 }}>
                            Shift reassigned
                        </span>
                    </div>

                    <p style={{ fontSize: 12, color: "#881337", marginTop: 8, lineHeight: 1.5 }}>
                        Your {attentionShift.shiftStart}–{attentionShift.shiftEnd} shift was
                        reassigned. Please submit your justification.
                    </p>

                    <button
                        onClick={() => onOpenJustification(attentionShift)}
                        className="mt-3 w-full rounded-lg py-2 font-semibold text-xs"
                        style={{ background: "#9F1239", color: "#FFFFFF" }}
                    >
                        Submit Justification
                    </button>
                </div>
            )}

            {!attentionShift &&
    (actionShift ? (
        <>
            <div
                className="rounded-lg px-4 py-3 mb-4"
                style={{
                    background:
                        zone === "green"
                            ? "#EAF7F0"
                            : zone === "blue"
                              ? "#EFF6FF"
                              : "#FFF1F2",
                    border: `1px solid ${
                        zone === "green"
                            ? "#8ED3AF"
                            : zone === "blue"
                              ? "#BFDBFE"
                              : "#FECDD3"
                    }`,
                }}
            >
                <div
                    style={{
                        fontWeight: 700,
                        fontSize: 13,
                        color:
                            zone === "green"
                                ? "#1F6B42"
                                : zone === "blue"
                                  ? "#1D4ED8"
                                  : "#B91C1C",
                    }}
                >
                    {zone === "green"
                        ? "Ready to check in"
                        : zone === "blue"
                          ? "Almost there"
                          : "Outside attendance zone"}
                </div>

                <div
                    style={{
                        marginTop: 2,
                        fontSize: 12,
                        color: "#475569",
                    }}
                >
                    For your {actionShift.shiftStart}–{actionShift.shiftEnd} shift
                    {actionShift.prepDeadline &&
                        ` · Preparation deadline: ${format24Hour(
                            actionShift.prepDeadline
                        )}`}
                </div>
            </div>

            <div
                className="rounded-lg px-3 py-2 mb-4 flex items-center justify-between"
                style={{
                    background: `${color}15`,
                    border: `1px solid ${color}40`,
                }}
            >
                <div className="flex items-center gap-2">
                    <div
                        className="rounded-full"
                        style={{ width: 8, height: 8, background: color }}
                    />
                    <span style={{ fontSize: 12, color, fontWeight: 700 }}>
                        {ZONE_LABEL[zone]}
                    </span>
                </div>

                <button
                    onClick={() => onCheckIn(actionShift)}
                    disabled={!canCheckIn}
                    className="rounded px-3.5 py-1.5 text-xs font-semibold"
                    style={{
                        background: canCheckIn ? "#418362" : "#A5A8AE",
                        color: "#FFFFFF",
                        cursor: canCheckIn ? "pointer" : "not-allowed",
                    }}
                >
                    Check in
                </button>
            </div>
        </>
    ) : (
        <div
            className="rounded-lg px-4 py-3 mb-4"
            style={{
                background: "#F8FAFC",
                border: "1px solid #E2E8F0",
            }}
        >
            <div
                style={{
                    fontWeight: 700,
                    fontSize: 13,
                    color: "#1E252B",
                }}
            >
                No remaining shifts today
            </div>

            <div
                style={{
                    marginTop: 2,
                    fontSize: 12,
                    color: "#64748B",
                }}
            >
                Your scheduled shifts are completed or require follow-up.
            </div>
        </div>
    ))}

            <div>
                <div
                    className="mb-2"
                    style={{ fontSize: 11, color: "#64748B", fontWeight: 700 }}
                >
                    TODAY’S SCHEDULE
                </div>

                <div className="space-y-2">
                    {shifts.map((shift, index) => {
                        const isActionShift = shift === actionShift;
                        const isCheckedIn = shift.checkedIn;

                        return (
                            <div
                                key={`${shift.shiftStart}-${shift.shiftEnd}-${index}`}
                                className="rounded-lg px-3 py-2.5 flex items-center justify-between"
                                style={{
                                    background: isActionShift ? "#F0FDF4" : "#F8FAFC",
                                    border: `1px solid ${
                                        isActionShift ? "#8ED3AF" : "#E2E8F0"
                                    }`,
                                }}
                            >
                                <div className="flex items-center gap-2">
                                    <div
                                        className="rounded-full"
                                        style={{
                                            width: 8,
                                            height: 8,
                                            background:
                                                shift.attendanceStatus === "Absent"
                                                    ? "#E11D48"
                                                    : isCheckedIn
                                                      ? "#1F6B42"
                                                      : isActionShift
                                                        ? "#B0924E"
                                                        : "#94A3B8",
                                        }}
                                    />
                                    <div>
                                        <div style={{ fontSize: 13, fontWeight: 700, color: "#1E252B" }}>
                                            {shift.shiftStart}–{shift.shiftEnd}
                                        </div>
                                        {shift.prepDeadline && (
                                            <div style={{ fontSize: 11, color: "#64748B" }}>
                                                Preparation deadline: {format24Hour(shift.prepDeadline)}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <span
                                    style={{
                                        fontSize: 11,
                                        fontWeight: 700,
                                        color:
                                            shift.attendanceStatus === "Absent"
                                                ? "#9F1239"
                                                : isCheckedIn
                                                  ? "#1F6B42"
                                                  : "#64748B",
                                    }}
                                >
                                    {getShiftStatus(shift)}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
// ─── Live Station Map ─────────────────────────────────────────────────────────

export function LiveMapCard({
  onZoneChange,
}: {
  onZoneChange: (data: {
    zone: "green" | "blue" | "outside";
    latitude: number;
    longitude: number;
    distance: number;
    gpsAccuracy: number;
  }) => void;
}) {
  return (
    <div
      className="rounded-xl p-5"
      style={{ background: "#FFFFFF", border: "1px solid #E5E7EB" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MapPin size={18} style={{ color: "#B0924E" }} />
          <span style={{ fontWeight: 700, fontSize: 15, color: "#1E252B" }}>
            Live Station Map
          </span>
        </div>

        {/* Live Indicator Badge */}
        <div
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
          style={{ background: "#EAF7F0", border: "1px solid #8ED3AF" }}
        >
          <div
            className="rounded-full animate-pulse"
            style={{ width: 7, height: 7, background: "#1F6B42" }}
          />
          <span style={{ fontSize: 11, color: "#1F6B42", fontWeight: 700 }}>
            Live
          </span>
        </div>
      </div>

      {/* SVG Map Container */}
      <div
        className="rounded-xl overflow-hidden border border-[#E2E8F0]"
        style={{
          height: 280,
          width: "100%",
        }}
      >
        <StationMap onZoneChange={onZoneChange} />
      </div>

      {/* Map Legend Footer */}
      <div className="flex items-center gap-4 mt-3 pt-1">
        <div className="flex items-center gap-1.5">
          <div
            className="rounded-full"
            style={{ width: 8, height: 8, background: "#1F6B42" }}
          />
          <span style={{ fontSize: 11, color: "#64748B", fontWeight: 600 }}>
            Green Zone (500m)
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <div
            className="rounded-full"
            style={{ width: 8, height: 8, background: "#6685b0" }}
          />
          <span style={{ fontSize: 11, color: "#64748B", fontWeight: 600 }}>
            Blue Zone (5000m)
          </span>
        </div>
      </div>
    </div>
  );
}
// ─── Attendance History ───────────────────────────────────────────────────────
const ATTENDANCE_META: Record<
  AttendanceRecord["attendance"],
  { color: string; bg: string; icon: typeof CheckCircle2 }
> = {
  Present: {
    color: "#1F6B42", 
    bg: "#EAF7F0",
    icon: CheckCircle2,
  },

  Late: {
    color: "#B0924E",
    bg: "#FDF8ED",
    icon: Clock,
  },

  Absent: {
    color: "#E11D48", 
    bg: "#FFF1F2",
    icon: XCircle,
  },

  Transferred: {
    color: "#475569", 
    bg: "#F1F5F9",
    icon: RefreshCw,
  },
};

export function AttendanceHistoryCard({
  records,
  onOpen,
  onViewAll,
}: {
  records: AttendanceRecord[];
  onOpen: (record: AttendanceRecord) => void;
  onViewAll: () => void;
}) {
  return (
    <div
      className="rounded-xl p-5"
      style={{ background: "#FFFFFF", border: "1px solid #E5E7EB" }}
    >
      {/* Card Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <History size={18} style={{ color: "#B0924E" }} />
          <span style={{ fontWeight: 700, fontSize: 15, color: "#1E252B" }}>
            Attendance History
          </span>
        </div>
      </div>

      {/* History Table */}
      <div className="overflow-x-auto">
        <table
          className="w-full"
          style={{ borderCollapse: "collapse", fontSize: 12 }}
        >
          <thead>
            <tr style={{ borderBottom: "1px solid #E2E8F0" }}>
              {[
                "Attendance",
                "Check In",
                "Date",
                "Justification",
                "Location",
              ].map((h) => (
                <th
                  key={h}
                  className="text-left py-2.5 px-2"
                  style={{
                    color: "#64748B",
                    fontWeight: 700,
                    fontSize: 11,
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {records.map((r) => {
              const meta = ATTENDANCE_META[r.attendance] ?? ATTENDANCE_META.Present;
              const Icon = meta.icon;

              return (
                <tr
                  key={r.id}
                  onClick={() => onOpen(r)}
                  className="transition-colors hover:bg-[#F8FAFC]"
                  style={{
                    borderBottom: "1px solid #F1F5F9",
                    cursor: "pointer",
                  }}
                >
                  {/* Attendance Status */}
                  <td className="py-3 px-2">
                    <div
                      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1"
                      style={{
                        background: meta.bg,
                        color: meta.color,
                        fontSize: 11,
                        fontWeight: 700,
                      }}
                    >
                      <Icon size={12} />
                      {r.attendance}
                    </div>
                  </td>

                  {/* Check In Time */}
                  <td className="py-3 px-2" style={{ color: "#1E252B", fontWeight: 600 }}>
                    {r.checkIn || "—"}
                  </td>

                  {/* Date */}
                  <td className="py-3 px-2" style={{ color: "#64748B", fontWeight: 500 }}>
                    {r.date}
                  </td>

                  {/* Justification Status */}
                  <td className="py-3 px-2">
                    {r.justificationStatus === "Not Required" ? (
                      <span style={{ color: "#94A3B8" }}>—</span>
                    ) : (
                      <span
                        className="inline-block rounded-full px-2.5 py-1"
                        style={{
                          background:
                            r.justificationStatus === "Approved"
                              ? "#EAF7F0"
                              : r.justificationStatus === "Submitted"
                              ? "#FDF8ED"
                              : "#FFF1F2",
                          color:
                            r.justificationStatus === "Approved"
                              ? "#1F6B42"
                              : r.justificationStatus === "Submitted"
                              ? "#B0924E"
                              : "#E11D48",
                          fontSize: 11,
                          fontWeight: 700,
                        }}
                      >
                        {r.justificationStatus}
                      </span>
                    )}
                  </td>

                  {/* Location */}
                  <td className="py-3 px-2" style={{ color: "#1E252B", fontWeight: 500 }}>
                    {r.location}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Action Footer */}
      <button
        onClick={onViewAll}
        className="mt-4 w-full rounded-lg py-2.5 text-xs font-bold transition-all hover:opacity-90 cursor-pointer"
        style={{
          background: "#EAF7F0",
          color: "#1F6B42",
          border: "1px solid #8ED3AF",
        }}
      >
        View Full History
      </button>
    </div>
  );
}


// ─── Employee Rewards ─────────────────────────────────────────────────────────
const LEVEL_STYLES = {
    Bronze: { gradient: "linear-gradient(135deg, #C28A54, #8C532B)", text: "#FFFFFF" },
    Silver: { gradient: "linear-gradient(135deg, #94A3B8, #64748B)", text: "#FFFFFF" },
    Gold: { gradient: "linear-gradient(135deg, #B0924E, #8C6F2D)", text: "#FFFFFF" },
    Platinum: { gradient: "linear-gradient(135deg, #1F6B42, #154D2F)", text: "#FFFFFF" },
};

 function RewardsCard({
    reward,
    leaderboard,
    onOpenRewards,
}: {
    reward: RewardInfo | null;
    leaderboard: LeaderboardInfo | null;
    onOpenRewards: () => void;
}) {
    if (!reward) return null;

    const pct =
        reward.levelMax > reward.levelMin
            ? Math.round(
                  ((reward.currentPoints - reward.levelMin) /
                      (reward.levelMax - reward.levelMin)) *
                      100
              )
            : 100;

    const chartData = [
        {
            value: pct,
            fill:
                reward.levelName === "Bronze"
                    ? "#C28A54"
                    : reward.levelName === "Silver"
                    ? "#94A3B8"
                    : reward.levelName === "Gold"
                    ? "#B0924E"
                    : "#1F6B42",
        },
    ];

    const levelStyle =
        LEVEL_STYLES[reward.levelName as keyof typeof LEVEL_STYLES] ??
        LEVEL_STYLES.Bronze;

    const remainingPoints = Math.max(
        0,
        reward.levelMax - reward.currentPoints
    );

    return (
        <div
            className="rounded-xl p-5"
            style={{ background: "#FFFFFF", border: "1px solid #E5E7EB" }}
        >
            {/* Header */}
            <div className="flex items-center gap-2 mb-4">
                <Gift size={18} style={{ color: "#B0924E" }} />
                <span style={{ fontWeight: 700, fontSize: 15, color: "#1E252B" }}>
                    Employee Rewards
                </span>
            </div>

            {/* Main Content Layout */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                
                {/* 1. Radial Progress Chart */}
                <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] h-full">
                    <div className="relative" style={{ width: 100, height: 100 }}>
                        <RadialBarChart
                            width={100}
                            height={100}
                            cx={50}
                            cy={50}
                            innerRadius={32}
                            outerRadius={46}
                            data={chartData}
                            startAngle={90}
                            endAngle={-270}
                        >
                            <PolarAngleAxis
                                type="number"
                                domain={[0, 100]}
                                angleAxisId={0}
                                tick={false}
                            />
                            <RadialBar
                                background={{ fill: "#E2E8F0" }}
                                dataKey="value"
                                angleAxisId={0}
                                cornerRadius={6}
                            />
                        </RadialBarChart>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span style={{ fontSize: 16, fontWeight: 800, color: "#1E252B" }}>
                                {pct}%
                            </span>
                        </div>
                    </div>
                    <span className="mt-2 text-[11px] font-semibold text-[#64748B]">Level Progress</span>
                </div>

                {/* 2. Rank & Points Summary */}
                <div className="text-center flex flex-col justify-between h-full">
                    <div>
                        <div
                            style={{
                                fontSize: 13,
                                fontWeight: 700,
                                color: "#B0924E",
                                marginBottom: 4,
                            }}
                        >
                            🏆 Rank #{reward.rank}
                        </div>

                        <div
                            style={{
                                fontSize: 28,
                                fontWeight: 800,
                                color: "#1E252B",
                                lineHeight: 1,
                            }}
                        >
                            {reward.currentPoints.toLocaleString()}
                        </div>

                        <div
                            style={{
                                fontSize: 11,
                                color: "#64748B",
                                marginTop: 4,
                                marginBottom: 12,
                                fontWeight: 500,
                            }}
                        >
                            Reward Points
                        </div>

                        <div className="grid grid-cols-2 gap-2 mb-3">
                            <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-2 text-center">
                                <div style={{ color: "#1F6B42", fontWeight: 800, fontSize: 16 }}>
                                    +{reward.weeklyPoints}
                                </div>
                                <div style={{ fontSize: 10, color: "#64748B", fontWeight: 600 }}>
                                    This Week
                                </div>
                            </div>

                            <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-2 text-center">
                                <div style={{ color: "#B0924E", fontWeight: 800, fontSize: 16 }}>
                                    +{reward.monthlyPoints}
                                </div>
                                <div style={{ fontSize: 10, color: "#64748B", fontWeight: 600 }}>
                                    This Month
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <div
                            style={{
                                background: levelStyle.gradient,
                                color: levelStyle.text,
                                borderRadius: 10,
                                padding: "8px",
                                fontWeight: 800,
                                fontSize: 14,
                                marginBottom: 4,
                                textAlign: "center",
                            }}
                        >
                            {reward.levelName}
                        </div>

                        <div style={{ fontSize: 11, color: "#64748B", fontWeight: 500 }}>
                            {remainingPoints.toLocaleString()} pts to {reward.nextLevel}
                        </div>
                    </div>
                </div>

                {/* 3. Station Leaderboard */}
                {leaderboard && (
                    <div className="rounded-xl p-3 bg-[#F8FAFC] border border-[#E2E8F0]">
                        <div className="mb-3">
                            <div style={{ fontWeight: 700, fontSize: 14, color: "#1E252B" }}>
                                {leaderboard.station} Station
                            </div>
                            <div style={{ fontSize: 11, color: "#64748B" }}>
                                Top 5 of {leaderboard.employeeCount} employees
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            {leaderboard.leaderboard.slice(0, 5).map((employee) => (
                                <div
                                    key={employee.id}
                                    className="flex items-center justify-between rounded-lg px-2.5 py-1.5 transition-all"
                                    style={{
                                        background: employee.current ? "#EAF7F0" : "#FFFFFF",
                                        borderLeft: employee.current ? "4px solid #1F6B42" : "1px solid #E2E8F0",
                                    }}
                                >
                                    <div className="flex items-center gap-2" style={{ fontSize: 12 }}>
                                        <span style={{ width: 20, textAlign: "center", fontWeight: 700 }}>
                                            {employee.rank === 1
                                                ? "🥇"
                                                : employee.rank === 2
                                                ? "🥈"
                                                : employee.rank === 3
                                                ? "🥉"
                                                : `#${employee.rank}`}
                                        </span>

                                        <span
                                            style={{
                                                fontWeight: employee.current ? 700 : 500,
                                                color: employee.current ? "#1F6B42" : "#1E252B",
                                            }}
                                        >
                                            {employee.current ? "You" : employee.name}
                                        </span>
                                    </div>

                                    <span
                                        style={{
                                            fontWeight: 700,
                                            fontSize: 12,
                                            color: employee.current ? "#1F6B42" : "#B0924E",
                                        }}
                                    >
                                        {employee.points.toLocaleString()}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Current Employee Standings Banner (Rendered outside map loop) */}
                        {leaderboard.currentEmployee && leaderboard.currentEmployee.rank > 5 && (
                            <div
                                className="mt-3 rounded-lg p-2.5"
                                style={{
                                    background: "#EAF7F0",
                                    border: "1px solid #8ED3AF",
                                }}
                            >
                                <div style={{ fontSize: 10, color: "#1F6B42", fontWeight: 700, marginBottom: 2 }}>
                                    Your Position
                                </div>

                                <div className="flex justify-between items-center text-xs">
                                    <div style={{ color: "#1E252B" }}>
                                        <strong>#{leaderboard.currentEmployee.rank}</strong>{" "}
                                        {leaderboard.currentEmployee.name}
                                    </div>

                                    <strong style={{ color: "#1F6B42" }}>
                                        {leaderboard.currentEmployee.points.toLocaleString()}
                                    </strong>
                                </div>
                            </div>
                        )}
                    </div>
                )}

            </div>

            {/* View History Button */}
            <button
                onClick={onOpenRewards}
                className="mt-4 w-full rounded-lg py-2.5 font-bold transition-all hover:opacity-90 cursor-pointer"
                style={{
                    background: "#1E252B",
                    color: "#FFFFFF",
                    fontSize: 12,
                }}
            >
                View Reward History
            </button>
        </div>
    );
}


// ─── Reward History Panel ─────────────────────────────────────────────────────

function RewardHistoryPanel({
    items,
    onClose,
}: {
    items: RewardHistoryItem[]
    onClose: () => void
}) {
  return (
    <div
      className="rounded-xl p-5 flex flex-col"
      style={{ background: "#fff", border: "1px solid #e5e7eb", minWidth: 220, maxWidth: 260 }}
    >
      <div className="flex items-center gap-2 mb-4">
        <Gift size={14} style={{ color: "#1b3d2e" }} />
        <span style={{ fontWeight: 700, fontSize: 13, color: "#111" }}>Reward History</span>
      </div>

      <div className="flex flex-col gap-2 flex-1">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between rounded-lg px-3 py-2"
            style={{ background: "#f9fafb", border: "1px solid #f3f4f6" }}
          >
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#111" }}>{item.label}</div>
              <div style={{ fontSize: 10, color: "#9ca3af" }}>{item.date}</div>
            </div>
            <span
              className="rounded-full px-2 py-0.5 font-bold"
              style={{ background: "#dcfce7", color: "#15803d", fontSize: 11, whiteSpace: "nowrap" }}
            >
              +{item.points} pts
            </span>
          </div>
        ))}
      </div>

     <button
    onClick={onClose}
    className="mt-4 w-full rounded-lg py-2 font-semibold hover:opacity-90 transition-all"
    style={{
        background: "#f3f4f6",
        color: "#374151",
        fontSize: 12,
    }}
>
    Close
</button>
    </div>
  )
}



// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {

  const [leaderboard, setLeaderboard] =useState<LeaderboardInfo | null>(null);
  const [weeklyMood, setWeeklyMood] = useState<WeeklyMood[]>([]);
  const [activeNav, setActiveNav] = useState("dashboard")
  const [employee, setEmployee] = useState<Employee | null>(null)
  const [shift, setShift] = useState<ShiftInfo | null>(null)
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
  const [reward, setReward] = useState<RewardInfo | null>(null)
  const [rewardHistory, setRewardHistory] = useState<RewardHistoryItem[]>([])
  const [sidebarOpen, setSidebarOpen] = useState(true)
 // const [showRewardHistory, setShowRewardHistory] = useState(false)
  const [showJustification, setShowJustification] = useState(false);
  const [locationData, setLocationData] = useState({
    zone: "outside" as "green" | "blue" | "outside",
    latitude: 0,
    longitude: 0,
    distance: 0,
    gpsAccuracy: 0,
});
const [todayShifts, setTodayShifts] = useState<ShiftInfo[]>([]);
const [mood, setMood] = useState<MoodInfo | null>(null);
    const [selectedAttendance, setSelectedAttendance] =
    useState<AttendanceRecord | null>(null);
  const [showAttendanceHistory, setShowAttendanceHistory] = useState(false);
  const [fullAttendanceHistory, setFullAttendanceHistory] = useState([]);
  async function loadDashboardData() {
    const [
      employeeData,
      shiftData,
      todayShiftsData,
      attendanceData,
      rewardData,
      rewardHistoryData,
      moodData,
      weeklyMoodData,
      leaderboardData,
    ] = await Promise.all([
      fetchEmployee(),
      fetchShiftInfo(),
      fetchTodayShifts(),
      fetchAttendanceHistory(),
      fetchRewardInfo(),
      fetchRewardHistory(),
      fetchMood(),
      fetchWeeklyMood(),
      fetchLeaderboard(),
    ]);

    setMood(moodData);
    if (employeeData) setEmployee(employeeData);
    setShift(shiftData);
    setTodayShifts(todayShiftsData);
    setAttendanceRecords(attendanceData);
    setReward(rewardData);
    setRewardHistory(rewardHistoryData);
    setWeeklyMood(weeklyMoodData);
    setLeaderboard(leaderboardData);
    if (
      shiftData?.attendanceStatus === "Absent" &&
      shiftData?.justificationStatus === "Required"
    ) {
      setShowJustification(true);
    }
}
async function handleCheckIn() {
    try {

        const result = await checkIn(locationData);

        if (result.success) {

            alert(result.message);

            await loadDashboardData();

        } else {

            alert(result.message);

        }

    } catch (err) {

        console.error(err);

        alert("Check-in failed.");

    }
}

async function openAttendanceHistory() {
  try {
    const history = await fetchFullAttendanceHistory();

    setFullAttendanceHistory(history);
    setShowAttendanceHistory(true);

  } catch (err) {
    console.error(err);
  }
}
 useEffect(() => {
  loadDashboardData();
  
}, []);


 

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: "#f3f4f6", fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      {/* Sidebar */}
      {sidebarOpen && (
        <Sidebar active={activeNav} onNav={setActiveNav} employee={employee} />
      )}

      {/* Main */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header />

        {/* Content */}
<main className="flex-1 overflow-auto p-5">

  {activeNav === "dashboard" && (
    <>
      {/* Mobile sidebar toggle */}
      <button
        className="mb-4 flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm lg:hidden"
        style={{ background: "#1b3d2e", color: "#fff" }}
        onClick={() => setSidebarOpen((v) => !v)}
      >
        <User size={14} />
        Menu
      </button>

      <div className="flex gap-5 min-w-0">
        {/* Left column */}
        <div
          className="flex flex-col gap-5 min-w-0"
          style={{ flex: "1 1 0" }}
        >
          {/* Top row */}
          <div
            className="grid gap-5"
            style={{ gridTemplateColumns: "1fr 1fr" }}
          >
          <SmartAttendanceCard
    shifts={todayShifts ?? []}
    zone={locationData.zone}
    onOpenJustification={(_selectedShift) =>
        setShowJustification(true)
    }
    onCheckIn={(_selectedShift) => handleCheckIn()}
/>

            <LiveMapCard
              onZoneChange={setLocationData}
            />
          </div>

          {/* Bottom row */}
          <div
            className="grid gap-5"
            style={{ gridTemplateColumns: "1fr 1fr" }}
          >
            <AttendanceHistoryCard
  records={attendanceRecords}
  onOpen={setSelectedAttendance}
  onViewAll={openAttendanceHistory}
/>

            <RewardsCard
              reward={reward}
              leaderboard={leaderboard}
              onOpenRewards={() =>
                setActiveNav("rewards")
              }
            />
          </div>

          <div className="mt-5">
            <MoodBoardCard
              mood={mood}
              weeklyMood={weeklyMood}
              onSaved={loadDashboardData}
            />
          </div>
        </div>

        <JustificationModal
          open={showJustification}
          onClose={() =>
            setShowJustification(false)
          }
          employeeId={
            employee ? Number(employee.id) : 0
          }
          attendanceId={shift?.attendanceId ?? 0}
          onSubmitted={async () => {
            await loadDashboardData();
          }}
        />

        <AttendanceDetailsModal
          open={selectedAttendance !== null}
          record={selectedAttendance}
          onClose={() =>
            setSelectedAttendance(null)
          }
          onEdit={(record) => {
            console.log(record);
          }}
        />
      </div>
    </>
  )}

  {activeNav === "rewards" && (
    <RewardsPage />
  )}

</main>
        

        {/* Footer */}
        <footer
          className="text-center py-2 text-xs"
          style={{
            background: "#1b3d2e",
            color: "rgba(255,255,255,0.4)",
            borderTop: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          © 2026 Abu Al-Jadayel Fueled Services. All rights reserved.
        </footer>
      </div>
      {showAttendanceHistory && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">

    <div
      className="bg-white rounded-2xl shadow-2xl w-[900px] max-h-[85vh] overflow-hidden"
    >

      {/* Header */}

      <div
        className="flex items-center justify-between px-6 py-5 border-b"
      >

        <div>

          <h2
            className="text-xl font-bold"
            style={{ color: "#1E252B" }}
          >
            Attendance History
          </h2>

          <p
            className="text-sm"
            style={{ color: "#64748B" }}
          >
            Complete attendance record
          </p>

        </div>

        <button
          onClick={() => setShowAttendanceHistory(false)}
          className="text-2xl font-bold hover:opacity-70"
        >
          ×
        </button>

      </div>

      {/* Body */}

      <div className="overflow-y-auto max-h-[65vh]">

        <table className="w-full">

          <thead
            className="sticky top-0 bg-white border-b"
          >
            <tr>

              <th className="text-left p-4">Attendance</th>

              <th className="text-left p-4">Check In</th>

              <th className="text-left p-4">Date</th>

              <th className="text-left p-4">Justification</th>

              <th className="text-left p-4">Station</th>

            </tr>

          </thead>

          <tbody>

            {fullAttendanceHistory.map((item: any) => (

              <tr
                key={item.id}
                className="border-b hover:bg-gray-50"
              >

                <td className="p-4">
                  {item.status}
                </td>

                <td className="p-4">
                  {item.check_in ?? "—"}
                </td>

                <td className="p-4">
                  {item.attendance_date}
                </td>

                <td className="p-4">
                  {item.justification_status ?? "—"}
                </td>

                <td className="p-4">
                  {item.station_name}
                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>

  </div>
)}
 
    </div>
    
  )
  
}
