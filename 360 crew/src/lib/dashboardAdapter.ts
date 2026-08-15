

export interface Employee {
  id: string
  name: string
  role: string
  avatarInitials: string
}
export interface ShiftInfo {
  attendanceId: number
  attendanceStatus: string
  justificationStatus: string
  replacementStatus: string
  replacementEmployeeId: number | null

  shiftStart: string
  shiftEnd: string
  prepDeadline: string

  zone: "green" | "blue" | "out"

  checkedIn: boolean
  checkInTime: string | null
}

export interface AttendanceRecord {
  id: string

  date: string

  checkIn: string

  attendance: "Present" | "Late" | "Absent" | "Transferred"

  justificationStatus:
    | "Not Required"
    | "Required"
    | "Submitted"
    | "Approved"
    | "Rejected"

  location: string

  reason?: string

  justification?: string
}

export interface RewardInfo {
  currentPoints: number

  levelName: string

  levelMin: number

  levelMax: number

  nextLevel: string

  progress: number

  rank: number

  weeklyPoints: number

  monthlyPoints: number
}

export interface RewardHistoryItem {
  id: string
  label: string
  points: number
  date: string
}
export interface RewardType {
    id: number;
    name: string;
    points: number;
}

export interface LiveStation {
  name: string
  lat: number
  lng: number
  greenZoneRadius: number
  blueZoneRadius: number
}
export interface WeeklyMood {
  mood_score: number;
  mood_date: string;
}
export interface MoodInfo {
    submitted: boolean;
    score: number;
    label: string;
    comment: string;
}
export interface LeaderboardItem {
  rank: number;
  id: number;
  name: string;
  points: number;
  current: boolean;
}
export interface LeaderboardEntry {
    rank: number;
    id: number;
    name: string;
    points: number;
    current: boolean;
}

export interface LeaderboardInfo {
    station: string;
    employeeCount: number;
    leaderboard: LeaderboardEntry[];
    currentEmployee: LeaderboardEntry | null;
}

export async function fetchEmployee(): Promise<Employee | null> {
  const response = await fetch(
    "http://localhost/smart-attendance/api/employee_data.php"
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error ?? "Could not load employee data");
  }

  const shiftRows = Array.isArray(data) ? data : [];

  if (shiftRows.length === 0) {
    // Once the employee checks in to their final shift, this endpoint can
    // legitimately return no remaining rows for the day.
    return null;
  }


  const employee = shiftRows[0];

  const firstName = employee.first_name ?? "";
  const lastName = employee.last_name ?? "";

  return {
    id: String(employee.id),
    name: `${firstName} ${lastName}`.trim(),
    role: employee.position ?? "",
    avatarInitials: `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase(),
  };
}

export async function fetchShiftInfo(): Promise<ShiftInfo | null> {

  const response = await fetch(
    "http://localhost/smart-attendance/api/get_station.php"
  );

  const data = await response.json();

  // There is no active station once the final shift has been checked in.
  // Treat that response as an empty state instead of calling `substring` on
  // missing times and crashing the dashboard refresh.
  if (
    !response.ok ||
    !data ||
    typeof data.start_time !== "string" ||
    typeof data.end_time !== "string"
  ) {
    return null;
  }

 return {
    shiftStart: data.start_time.substring(0,5),
    shiftEnd: data.end_time.substring(0,5),
    prepDeadline: "",

    zone: "out",
    checkedIn: Boolean(data.checked_in),

checkInTime: data.check_in_time
    ? new Date(data.check_in_time).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
      })
    : null,
    attendanceId: Number(data.attendance_id ?? 0),
attendanceStatus: data.attendance_status ?? "",
justificationStatus: data.justification_status ?? "Not Required",
replacementStatus: data.replacement_status ?? "None",
replacementEmployeeId: data.replacement_employee_id,
};

}
export async function fetchTodayShifts(): Promise<ShiftInfo[]> {
  const response = await fetch(
    "http://localhost/smart-attendance/api/employee_data.php"
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error ?? "Could not load today's shifts");
  }

  if (!Array.isArray(data)) {
    return [];
  }

  return data.map((row) => ({
    attendanceId: Number(row.attendance_id ?? 0),
    attendanceStatus: row.attendance_status ?? "",
    justificationStatus: row.justification_status ?? "Not Required",
    replacementStatus: row.replacement_status ?? "None",
    replacementEmployeeId: row.replacement_employee_id
      ? Number(row.replacement_employee_id)
      : null,

    shiftStart: String(row.start_time ?? "").substring(0, 5),
    shiftEnd: String(row.end_time ?? "").substring(0, 5),

    prepDeadline: String(row.prep_deadline ?? ""),

    zone: "out",

    checkedIn: Boolean(row.checked_in),
    checkInTime: row.check_in_time
      ? String(row.check_in_time).substring(0, 5)
      : null,
  }));
}
export async function fetchAttendanceHistory(): Promise<AttendanceRecord[]> {

  const response = await fetch(
    "http://localhost/smart-attendance/api/get_attendance_history.php"
  );

  const data = await response.json();

  return data.map((item: any) => ({

    id: String(item.id),

    attendance:
        item.replacement_status === "Assigned"
            ? "Transferred"
            : item.status,

    checkIn: item.check_in
        ? new Date(item.check_in).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
          })
        : "—",

    date: new Date(item.attendance_date).toLocaleDateString(
        "en-GB",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
        }
    ),

    justificationStatus:
        item.justification_status ?? "Not Required",

    location:
        item.station_name,

    reason:
        item.reason ?? "",

    justification:
    item.justification ?? "",

}));

}
export async function fetchFullAttendanceHistory() {

    const response = await fetch(
        "http://localhost/smart-attendance/api/attendance_history_full.php"
    );

    return await response.json();

}

export async function fetchRewardInfo(): Promise<RewardInfo> {

  const response = await fetch(
    "http://localhost/smart-attendance/api/rewards.php?employee_id=2"
  );//لازم اخليه يتغير حسب الموظف

  const data = await response.json();
console.log("Rewards API:", data);
  if (!data.success) {
    throw new Error(data.message ?? "Failed to load rewards");
  }

 return {
    currentPoints: data.current_points,
    levelName: data.level,
    levelMin: data.level_min,
    levelMax: data.level_max,
    nextLevel: data.next_level,
    progress: data.progress,
    rank: data.rank,
    weeklyPoints: data.earned_this_week,
    monthlyPoints: data.earned_this_month,
};

}
export async function fetchRewardHistory(): Promise<RewardHistoryItem[]> {

    const response = await fetch(
        "http://localhost/smart-attendance/api/reward_history.php?employee_id=2"
    );

    const data = await response.json();
    console.log("Reward History:", data);

    return data.map((item: any) => ({

        id: String(item.id),

        label: item.label,

        points: Number(item.points),

        date: item.date,

    }));

}
export async function fetchLeaderboard(): Promise<LeaderboardInfo> {

    const response = await fetch(
        "http://localhost/smart-attendance/api/leaderboard.php"
    );

    const data = await response.json();

    if (!data.success) {
        throw new Error(data.message);
    }

    return {
    station: data.station,
    employeeCount: data.employeeCount,
    leaderboard: data.leaderboard,
    currentEmployee: data.currentEmployee,
};
}

export async function fetchLiveStation(_employeeId = "emp-001"): Promise<LiveStation> {
  return {
    name: "Main Fuel Station",
    lat: 24.7136,
    lng: 46.6753,
    greenZoneRadius: 500,
    blueZoneRadius: 1000,
  }
}
export async function checkIn(data: {
    latitude: number;
    longitude: number;
    distance: number;
    gpsAccuracy: number;
}) {

    const response = await fetch(
        "http://localhost/smart-attendance/api/check_in.php",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                latitude: data.latitude,
                longitude: data.longitude,
                distance: data.distance,
                gps_accuracy: data.gpsAccuracy,
            }),
        }
    );

    return await response.json();
}
export async function saveMood(
    score: number,
    label: string,
    comment: string
) {
    const response = await fetch(
        "http://localhost/smart-attendance/api/save_mood.php",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                score,
                label,
                comment,
            }),
        }
    );

    return await response.json();
}
export async function fetchMood(): Promise<MoodInfo> {

    const response = await fetch(
        "http://localhost/smart-attendance/api/get_mood.php"
    );

    return await response.json();
}

export async function fetchWeeklyMood(): Promise<WeeklyMood[]> {

    const response = await fetch(
        "http://localhost/smart-attendance/api/get_weekly_mood.php"
    );

    return await response.json();

}
export async function loadRewardTypes(): Promise<RewardType[]> {

    const response = await fetch(
        "http://localhost/smart-attendance/api/reward-types.php"
    );

    const data = await response.json();

    return data.rewardTypes;
}
export async function loadRewards(): Promise<RewardInfo> {

    const response = await fetch(
        "http://localhost/smart-attendance/api/rewards.php",
        
    );

    const data = await response.json();

    return {
    currentPoints: data.current_points,
    rank: data.rank,
    weeklyPoints: data.earned_this_week,
    monthlyPoints: data.earned_this_month,
    levelName: data.level,
    levelMin: data.level_min,
    levelMax: data.level_max,
    progress: data.progress,
    nextLevel: data.next_level,
};
}
