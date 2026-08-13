import React, { useMemo, useState } from "react";
import { Smile, CheckCircle2 } from "lucide-react";
import {
  MoodInfo,
  WeeklyMood,
  saveMood,
} from "../lib/dashboardAdapter";

const moods = [
  { score: 5, emoji: "😄", label: "Excellent" },
  { score: 4, emoji: "🙂", label: "Happy" },
  { score: 3, emoji: "😐", label: "Neutral" },
  { score: 2, emoji: "😔", label: "Tired" },
  { score: 1, emoji: "😣", label: "Stressed" },
];

interface Props {
  mood: MoodInfo | null;
  weeklyMood: WeeklyMood[];
  onSaved: () => Promise<void>;
}

export default function MoodBoardCard({
  mood,
  weeklyMood,
  onSaved,
}: Props) {
  const [selectedMood, setSelectedMood] =
    useState<(typeof moods)[number] | null>(null);

  const [comment, setComment] = useState("");

  const alreadySubmitted = mood?.submitted ?? false;

  const selectedEmoji = useMemo(() => {
    return moods.find((m) => m.label === mood?.label);
  }, [mood]);

  async function handleSave() {
    if (!selectedMood) {
      alert("Please select your mood.");
      return;
    }

    try {
      const result = await saveMood(
        selectedMood.score,
        selectedMood.label,
        comment
      );

      alert(result.message);

      if (result.success) {
        await onSaved();
      }
    } catch (err) {
      console.error(err);
      alert("Unable to save mood.");
    }
  }

  
  const moodColors: Record<number, string> = {
    5: "#1F6B42", // Excellent 
    4: "#2E8B57", // Happy 
    3: "#B0924E", // Neutral 
    2: "#D97706", // Tired 
    1: "#E11D48", // Stressed 
  };

  const moodEmojis: Record<number, string> = {
    5: "😄",
    4: "🙂",
    3: "😐",
    2: "😔",
    1: "😣",
  };

  return (
    <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-xs">
      {/* Header */}
      <div className="mb-5 flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FDF8ED] text-[#B0924E]">
          <Smile size={20} />
        </div>
        <div>
          <h3 className="text-base font-bold text-[#1E252B]">Mood Board</h3>
        </div>
      </div>

      {!alreadySubmitted ? (
        <>
          <p className="mb-4 text-xs font-semibold text-[#64748B]">
            How are you feeling today?
          </p>

          {/* Mood Selector Grid */}
          <div className="mb-5 grid grid-cols-5 gap-2">
            {moods.map((item) => {
              const isSelected = selectedMood?.score === item.score;
              return (
                <button
                  key={item.score}
                  type="button"
                  onClick={() => setSelectedMood(item)}
                  className={`flex flex-col items-center justify-center rounded-xl py-3 px-1 transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? "border-2 border-[#1F6B42] bg-[#EAF7F0] shadow-xs scale-[1.02]"
                      : "border border-[#E2E8F0] bg-white hover:border-[#1F6B42]/40 hover:bg-[#EAF7F0]/40"
                  }`}
                >
                  <span className="text-2xl leading-none">{item.emoji}</span>
                  <span
                    className={`mt-1.5 text-[10px] font-bold tracking-tight ${
                      isSelected ? "text-[#1F6B42]" : "text-[#64748B]"
                    }`}
                  >
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Comment Box */}
          <textarea
            rows={3}
            placeholder="Anything you'd like to share? (optional)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3 text-xs text-[#1E252B] transition-all focus:border-[#1F6B42] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#1F6B42]/20 placeholder:text-slate-400 resize-none"
          />

          {/* Save Action Button */}
          <button
            onClick={handleSave}
            className="mt-4 w-full rounded-xl bg-[#1E252B] py-3 text-xs font-bold text-white shadow-xs transition-all hover:opacity-90 active:scale-[0.99] cursor-pointer"
          >
            Save Mood
          </button>
        </>
      ) : (
        <>
          {/* Submitted Dashboard Layout */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Today's Mood Card */}
            <div className="flex flex-col justify-between rounded-xl border border-[#8ED3AF] bg-[#EAF7F0] p-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#1F6B42]">
                  Today's Mood
                </span>

                <div className="mt-3 flex items-center gap-3">
                  <span className="text-4xl">{selectedEmoji?.emoji}</span>
                  <div>
                    <div className="text-base font-bold text-[#1E252B]">
                      {mood?.label}
                    </div>
                    <div className="text-[11px] text-[#1F6B42] font-medium opacity-80">
                      Submitted Today
                    </div>
                  </div>
                </div>
              </div>

              {mood?.comment && (
                <div className="mt-3 rounded-lg border border-[#8ED3AF]/50 bg-white/80 p-2.5 text-xs italic text-[#1F6B42]">
                  "{mood.comment}"
                </div>
              )}
            </div>

            {/* Weekly Trend Card */}
            <div className="rounded-xl border border-[#E2E8F0] bg-white p-4">
              <div className="mb-4 text-xs font-bold text-[#1E252B]">
                Weekly Mood Trend
              </div>

              {weeklyMood.length === 0 ? (
                <div className="flex h-[100px] items-center justify-center text-xs text-slate-400">
                  No mood history yet.
                </div>
              ) : (
                <div className="flex items-end justify-between h-[100px] pt-2">
                  {weeklyMood.map((day) => (
                    <div
                      key={day.mood_date}
                      className="flex flex-col items-center gap-1.5"
                    >
                      <span className="text-sm">
                        {
                          moodEmojis[
                            day.mood_score as keyof typeof moodEmojis
                          ]
                        }
                      </span>

                      <div
                        className="w-4 rounded-full transition-all duration-300"
                        style={{
                          height: `${day.mood_score * 12}px`,
                          backgroundColor:
                            moodColors[
                              day.mood_score as keyof typeof moodColors
                            ] || "#1F6B42",
                        }}
                      />

                      <span className="text-[10px] font-semibold text-[#64748B]">
                        {new Date(day.mood_date).toLocaleDateString("en-US", {
                          weekday: "short",
                        })}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {weeklyMood.length > 0 && (
                <div className="mt-3 border-t border-[#F1F5F9] pt-2 text-[11px] text-[#64748B]">
                  Entries this week:{" "}
                  <strong className="text-[#1E252B]">
                    {weeklyMood.length}/7
                  </strong>
                </div>
              )}
            </div>
          </div>

          {/* Success Status Banner */}
          <div className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-[#8ED3AF] bg-[#EAF7F0] p-3 text-center text-[#1F6B42]">
            <CheckCircle2 size={16} className="text-[#1F6B42]" />
            <div className="text-xs font-bold">
              Feedback submitted for today!
            </div>
          </div>
        </>
      )}
    </div>
  );
}