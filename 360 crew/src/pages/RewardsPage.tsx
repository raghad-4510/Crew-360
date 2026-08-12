import React, { useEffect, useState } from "react";
import { Trophy, Gift, Medal } from "lucide-react";

import RewardHistoryTable from "../components/RewardHistoryTable";
import LeaderboardCard from "../components/LeaderboardCard";

import {
  loadRewardTypes,
  RewardType,
  loadRewards,
  RewardInfo,
  fetchLeaderboard,
  LeaderboardInfo,
  fetchRewardHistory,
  RewardHistoryItem,
} from "../lib/dashboardAdapter";

export default function RewardsPage() {
  const [rewardTypes, setRewardTypes] = useState<RewardType[]>([]);
  const [rewardInfo, setRewardInfo] = useState<RewardInfo | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardInfo | null>(null);
  const [history, setHistory] = useState<RewardHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [typesData, rewardData, boardData, historyData] = await Promise.all([
          loadRewardTypes(),
          loadRewards(),
          fetchLeaderboard(),
          fetchRewardHistory(),
        ]);

        setRewardTypes(typesData);
        setRewardInfo(rewardData);
        setLeaderboard(boardData);
        setHistory(historyData);
      } catch (error) {
        console.error("Failed to load rewards data:", error);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return (
    <div className="flex flex-col gap-6">
      {/* Header Banner */}
      <div
        className="rounded-xl p-6 transition-all"
        style={{
          background: "linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)",
          border: "1px solid #E5E7EB",
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="p-3 rounded-xl flex items-center justify-center"
            style={{ background: "#EAF7F0", color: "#1F6B42" }}
          >
            <Trophy size={28} />
          </div>
          <div>
            <h1
              style={{
                fontSize: 26,
                fontWeight: 800,
                color: "#1E252B",
                lineHeight: 1.2,
              }}
            >
              Rewards Center
            </h1>
            <p
              style={{
                marginTop: 4,
                color: "#64748B",
                fontSize: 14,
                fontWeight: 500,
              }}
            >
              View your station rank, track earned points, and explore reward tiers.
            </p>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <SummaryCard
          icon={<Gift size={22} style={{ color: "#B0924E" }} />}
          title="Total Points"
          value={rewardInfo ? rewardInfo.currentPoints.toLocaleString() : "--"}
          subtitle="Available balance"
        />

        <SummaryCard
          icon={<Trophy size={22} style={{ color: "#1F6B42" }} />}
          title="Station Rank"
          value={rewardInfo ? `#${rewardInfo.rank}` : "--"}
          subtitle={leaderboard ? `${leaderboard.station} Station` : "Global rank"}
        />

        <SummaryCard
          icon={<Medal size={22} style={{ color: "#B0924E" }} />}
          title="This Month"
          value={rewardInfo ? `+${rewardInfo.monthlyPoints}` : "--"}
          subtitle="Earned points"
        />
      </div>

      {/* Reward Types Section */}
      <Section title="Available Reward Actions">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {rewardTypes.map((type) => (
            <div
              key={type.id}
              className="rounded-xl p-4 transition-all hover:shadow-sm"
              style={{
                background: "#F8FAFC",
                border: "1px solid #E2E8F0",
              }}
            >
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 15,
                  color: "#1E252B",
                }}
              >
                {type.name}
              </div>

              <div
                style={{
                  marginTop: 10,
                  color: "#1F6B42",
                  fontSize: 24,
                  fontWeight: 800,
                }}
              >
                +{type.points}
              </div>

              <div
                style={{
                  marginTop: 2,
                  color: "#64748B",
                  fontSize: 12,
                  fontWeight: 500,
                }}
              >
                Points granted
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Leaderboard & Reward History (Side-by-Side Layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {leaderboard && <LeaderboardCard leaderboard={leaderboard} />}
        <RewardHistoryTable history={history} />
      </div>
    </div>
  );
}

// ─── Sub-Components ──────────────────────────────────────────────────────────

interface SummaryCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  subtitle?: string;
}

function SummaryCard({ icon, title, value, subtitle }: SummaryCardProps) {
  return (
    <div
      className="rounded-xl p-5 transition-all"
      style={{
        background: "#FFFFFF",
        border: "1px solid #E5E7EB",
      }}
    >
      <div className="flex items-center gap-2.5">
        {icon}
        <span
          style={{
            fontWeight: 700,
            fontSize: 14,
            color: "#1E252B",
          }}
        >
          {title}
        </span>
      </div>

      <div
        style={{
          fontSize: 28,
          fontWeight: 800,
          color: "#1E252B",
          marginTop: 12,
          lineHeight: 1,
        }}
      >
        {value}
      </div>

      {subtitle && (
        <div
          style={{
            fontSize: 11,
            color: "#64748B",
            marginTop: 6,
            fontWeight: 500,
          }}
        >
          {subtitle}
        </div>
      )}
    </div>
  );
}

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

function Section({ title, children }: SectionProps) {
  return (
    <div
      className="rounded-xl p-5"
      style={{
        background: "#FFFFFF",
        border: "1px solid #E5E7EB",
      }}
    >
      <h2
        style={{
          fontWeight: 700,
          fontSize: 16,
          color: "#1E252B",
          marginBottom: 16,
        }}
      >
        {title}
      </h2>

      {children}
    </div>
  );
}