interface DayMood {
  day: string;
  score: number;
}

const moodEmoji: Record<number, string> = {
  5: "😄",
  4: "🙂",
  3: "😐",
  2: "😔",
  1: "😣",
};

export default function WeeklyMoodTrend({
  moods,
}: {
  moods: DayMood[];
}) {
  return (
    <div
      className="rounded-lg p-4 h-full"
      style={{
        background: "#F9FAFB",
        border: "1px solid #E5E7EB",
      }}
    >
      <div
        style={{
          fontWeight: 700,
          marginBottom: 16,
          color: "#1B3D2E",
        }}
      >
        Weekly Mood Trend
      </div>

      <div className="flex justify-between">
        {moods.map((mood) => (
          <div
            key={mood.day}
            className="flex flex-col items-center"
          >
            <div style={{ fontSize: 24 }}>
              {moodEmoji[mood.score]}
            </div>

            <div
              style={{
                marginTop: 6,
                fontSize: 12,
                color: "#6B7280",
              }}
            >
              {mood.day}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}