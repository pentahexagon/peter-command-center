"use client";

import { useState, useEffect } from "react";

type TabType = "overview" | "schedule" | "tasks" | "finance";

interface CalEvent {
  id: string;
  summary: string;
  start: string;
  end: string;
  location?: string;
  type?: string;
}

interface NotionTask {
  name: string;
  status: string;
  deadline?: string;
  url: string;
  assignee?: string;
}

/* ===== REAL DATA: Notion 프로젝트 보드 (업무) ===== */
const NOTION_TASKS: NotionTask[] = [
  { name: "창업대학 서류접수 마감일", status: "진행 중", deadline: "2026-03-23", url: "https://www.notion.so/31a7a0d68bfb803ca1f1cd5b7502c5b6", assignee: "대왕" },
  { name: "쿡링", status: "진행 중", deadline: "2026-04-17", url: "https://www.notion.so/31a7a0d68bfb80aa837afc81791d05e0", assignee: "대왕" },
  { name: "유튜브 채널 관리", status: "진행 중", url: "https://www.notion.so/31a7a0d68bfb802b81b7c18a8ea0c289", assignee: "김진모" },
  { name: "AI 통합 프로젝트", status: "진행 중", url: "https://www.notion.so/31a7a0d68bfb80f793f4d7e21c4b9565", assignee: "대왕" },
  { name: "김성엽", status: "시작 전", url: "https://www.notion.so/31d7a0d68bfb80a8ac17d1d458e7c904", assignee: "김성엽" },
];

/* ===== REAL DATA: Google Calendar 이벤트 (fallback) ===== */
const REAL_EVENTS: CalEvent[] = [
  {
    id: "flight-cairns",
    summary: "Flight to 케언즈 (JQ 934)",
    start: "2026-03-31T18:35:00+10:00",
    end: "2026-03-31T21:00:00+10:00",
    location: "브리즈번 BNE → 케언즈",
    type: "flight",
  },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const [events, setEvents] = useState<CalEvent[]>(REAL_EVENTS);
  const [currentWeek, setCurrentWeek] = useState(new Date());

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const brisbaneTime = new Date(now.toLocaleString("en-US", { timeZone: "Australia/Brisbane" }));
      setCurrentTime(brisbaneTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }));
      setCurrentDate(brisbaneTime.toLocaleDateString("ko-KR", { month: "long", day: "numeric", weekday: "short" }));
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch("/api/calendar");
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          setEvents(data);
        }
      } catch {
        // Keep REAL_EVENTS as fallback
      }
    };
    fetchEvents();
    const interval = setInterval(fetchEvents, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const tabs = [
    { key: "overview" as TabType, icon: "📊", label: "현황" },
    { key: "schedule" as TabType, icon: "📅", label: "스케줄" },
    { key: "tasks" as TabType, icon: "✅", label: "업무" },
    { key: "finance" as TabType, icon: "💰", label: "재무" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100dvh", backgroundColor: "#f8f7f4" }}>
      {/* Top Header */}
      <header style={{
        backgroundColor: "#1a1916",
        color: "#ffffff",
        padding: "14px 16px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "38px", height: "38px", borderRadius: "10px",
            background: "linear-gradient(135deg, #1a56db, #3b82f6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 700, fontSize: "15px",
          }}>PK</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: "15px", lineHeight: 1.2 }}>Peter Kim</div>
            <div style={{ fontSize: "11px", color: "#a8a59e" }}>Command Center</div>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "18px", fontWeight: 600 }}>{currentTime}</div>
          <div style={{ fontSize: "10px", color: "#a8a59e" }}>{currentDate} · Brisbane</div>
        </div>
      </header>

      {/* Content Area */}
      <main style={{ flex: 1, overflow: "auto", padding: "16px" }}>
        {activeTab === "overview" && <OverviewTab events={events} tasks={NOTION_TASKS} />}
        {activeTab === "schedule" && <ScheduleTab events={events} currentWeek={currentWeek} setCurrentWeek={setCurrentWeek} />}
        {activeTab === "tasks" && <TasksTab tasks={NOTION_TASKS} />}
        {activeTab === "finance" && <FinanceTab />}
      </main>

      {/* Bottom Tab Bar */}
      <nav style={{
        backgroundColor: "#ffffff",
        borderTop: "1px solid #e8e6e1",
        display: "flex",
        justifyContent: "space-around",
        padding: "6px 0",
        paddingBottom: "max(6px, env(safe-area-inset-bottom))",
        flexShrink: 0,
      }}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: "2px",
              padding: "4px 16px", border: "none", background: "none",
              color: activeTab === tab.key ? "#1a56db" : "#a8a59e",
              fontSize: "10px", fontWeight: activeTab === tab.key ? 700 : 500,
            }}
          >
            <span style={{ fontSize: "22px" }}>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

/* ===== OVERVIEW TAB ===== */
function OverviewTab({ events, tasks }: { events: CalEvent[]; tasks: NotionTask[] }) {
  const inProgressTasks = tasks.filter((t) => t.status === "진행 중");
  const flights = events.filter((e) => e.type === "flight" || e.summary?.toLowerCase().includes("flight"));
  const overdueTasks = tasks.filter((t) => t.deadline && new Date(t.deadline) < new Date() && t.status !== "완료");

  const companies = [
    { name: "EIJ Construction", emoji: "🏗️", progress: 65, color: "#057a55", desc: "Smile Sushi 프로젝트" },
    { name: "Pentahexagon", emoji: "⬡", progress: 40, color: "#7e3bda", desc: "쿡링 · AI 통합" },
    { name: "BeyondFleet", emoji: "🚛", progress: 25, color: "#b45309", desc: "MVP 개발 대기" },
    { name: "한국 인테리어", emoji: "🏠", progress: 10, color: "#6b6860", desc: "법인 설립 준비" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Greeting */}
      <div style={{ padding: "4px 0" }}>
        <div style={{ fontSize: "20px", fontWeight: 700, color: "#1a1916" }}>안녕하세요, 대왕님 👋</div>
        <div style={{ fontSize: "13px", color: "#6b6860", marginTop: "2px" }}>
          진행 중 업무 {inProgressTasks.length}건 · 오늘 일정 {events.filter((e) => isToday(e.start)).length}건
        </div>
      </div>

      {/* Flight Alert */}
      {flights.length > 0 && (
        <div style={{ background: "linear-gradient(135deg, #1e3a5f, #1a56db)", borderRadius: "14px", padding: "16px", color: "#ffffff" }}>
          <div style={{ fontSize: "12px", fontWeight: 600, opacity: 0.8, marginBottom: "8px" }}>✈️ 다가오는 항공편</div>
          {flights.map((f) => (
            <div key={f.id}>
              <div style={{ fontSize: "16px", fontWeight: 700 }}>{f.summary}</div>
              <div style={{ fontSize: "12px", opacity: 0.8, marginTop: "4px" }}>{f.location}</div>
              <div style={{ fontSize: "13px", fontWeight: 600, marginTop: "6px" }}>
                {new Date(f.start).toLocaleDateString("ko-KR", { month: "long", day: "numeric", weekday: "short" })}
                {" · "}
                {new Date(f.start).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Overdue Alert */}
      {overdueTasks.length > 0 && (
        <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fca5a5", borderRadius: "12px", padding: "12px 14px" }}>
          <div style={{ fontWeight: 600, fontSize: "13px", color: "#991b1b", marginBottom: "6px" }}>⚠️ 마감 지난 업무</div>
          {overdueTasks.map((t) => (
            <div key={t.name} style={{ fontSize: "12px", color: "#991b1b", padding: "2px 0" }}>
              • {t.name} (마감: {t.deadline})
            </div>
          ))}
        </div>
      )}

      {/* Metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
        <MetricCard title="활성 사업" value="4" bg="#dbeafe" color="#1a56db" />
        <MetricCard title="진행 중" value={inProgressTasks.length.toString()} bg="#fef3c7" color="#b45309" />
        <MetricCard title="긴급/지연" value={overdueTasks.length.toString()} bg="#fee2e2" color="#c81e1e" />
        <MetricCard title="이번주 일정" value={events.length.toString()} bg="#dcfce7" color="#057a55" />
      </div>

      {/* Company Progress */}
      <div>
        <div style={{ fontWeight: 700, fontSize: "15px", marginBottom: "10px" }}>사업 현황</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {companies.map((c) => (
            <div key={c.name} style={{
              backgroundColor: "#ffffff", borderRadius: "12px",
              border: "1px solid #f2f0ec", padding: "14px",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "18px" }}>{c.emoji}</span>
                  <span style={{ fontWeight: 600, fontSize: "14px" }}>{c.name}</span>
                </div>
                <span style={{ fontWeight: 700, fontSize: "15px", color: c.color }}>{c.progress}%</span>
              </div>
              <div style={{ fontSize: "11px", color: "#6b6860", marginBottom: "8px", marginLeft: "26px" }}>{c.desc}</div>
              <div style={{ backgroundColor: "#f2f0ec", borderRadius: "99px", height: "6px", overflow: "hidden" }}>
                <div style={{ width: `${c.progress}%`, height: "100%", backgroundColor: c.color, borderRadius: "99px", transition: "width 0.5s" }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <div style={{ fontWeight: 700, fontSize: "15px", marginBottom: "10px" }}>빠른 동작</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "8px" }}>
          {[
            { icon: "📧", label: "이메일" },
            { icon: "📋", label: "Notion" },
            { icon: "📄", label: "Drive" },
            { icon: "🤖", label: "AI 분석" },
          ].map((a) => (
            <button key={a.label} style={{
              backgroundColor: "#ffffff", border: "1px solid #f2f0ec", borderRadius: "12px",
              padding: "14px 4px", textAlign: "center", cursor: "pointer",
            }}>
              <div style={{ fontSize: "24px", marginBottom: "4px" }}>{a.icon}</div>
              <div style={{ fontSize: "11px", fontWeight: 600, color: "#1a1916" }}>{a.label}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ===== SCHEDULE TAB ===== */
function ScheduleTab({ events, currentWeek, setCurrentWeek }: { events: CalEvent[]; currentWeek: Date; setCurrentWeek: (d: Date) => void }) {
  const getWeekDays = (baseDate: Date) => {
    const week = [];
    const curr = new Date(baseDate);
    const first = curr.getDate() - curr.getDay() + 1;
    for (let i = 0; i < 7; i++) {
      const d = new Date(curr);
      d.setDate(first + i);
      week.push(d);
    }
    return week;
  };

  const weekDays = getWeekDays(currentWeek);
  const dayLabels = ["월", "화", "수", "목", "금", "토", "일"];
  const today = new Date();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Week Navigation */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <button onClick={() => { const d = new Date(currentWeek); d.setDate(d.getDate() - 7); setCurrentWeek(d); }}
          style={{ padding: "8px 14px", border: "1px solid #f2f0ec", borderRadius: "8px", backgroundColor: "#fff", fontSize: "16px", cursor: "pointer" }}>
          ◀
        </button>
        <button onClick={() => setCurrentWeek(new Date())}
          style={{ padding: "8px 20px", backgroundColor: "#1a56db", color: "#fff", border: "none", borderRadius: "8px", fontWeight: 600, fontSize: "13px", cursor: "pointer" }}>
          오늘
        </button>
        <button onClick={() => { const d = new Date(currentWeek); d.setDate(d.getDate() + 7); setCurrentWeek(d); }}
          style={{ padding: "8px 14px", border: "1px solid #f2f0ec", borderRadius: "8px", backgroundColor: "#fff", fontSize: "16px", cursor: "pointer" }}>
          ▶
        </button>
      </div>

      <div style={{ textAlign: "center", fontSize: "13px", color: "#6b6860", fontWeight: 500 }}>
        {weekDays[0].toLocaleDateString("ko-KR", { month: "long", day: "numeric" })} ~ {weekDays[6].toLocaleDateString("ko-KR", { month: "long", day: "numeric" })}
      </div>

      {/* Day Cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {weekDays.map((day, idx) => {
          const dayEvents = events.filter(
            (e) => new Date(e.start).toDateString() === day.toDateString()
          );
          const isToday_ = day.toDateString() === today.toDateString();
          const isPast = day < today && !isToday_;

          return (
            <div key={idx} style={{
              backgroundColor: isToday_ ? "#eff6ff" : "#ffffff",
              border: isToday_ ? "2px solid #1a56db" : "1px solid #f2f0ec",
              borderRadius: "12px", padding: "12px 14px",
              opacity: isPast ? 0.4 : 1,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: dayEvents.length > 0 ? "8px" : 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    width: "30px", height: "30px", borderRadius: "50%",
                    backgroundColor: isToday_ ? "#1a56db" : "transparent",
                    color: isToday_ ? "#ffffff" : "#1a1916",
                    fontWeight: 700, fontSize: "14px",
                  }}>{day.getDate()}</span>
                  <span style={{ fontSize: "13px", color: isToday_ ? "#1a56db" : "#6b6860", fontWeight: 600 }}>
                    {dayLabels[idx]}
                    {isToday_ && <span style={{ marginLeft: "6px", fontSize: "11px", fontWeight: 700 }}>오늘</span>}
                  </span>
                </div>
                {dayEvents.length > 0 && (
                  <span style={{
                    backgroundColor: isToday_ ? "#1a56db" : "#f2f0ec",
                    color: isToday_ ? "#ffffff" : "#6b6860",
                    borderRadius: "99px", padding: "2px 10px", fontSize: "11px", fontWeight: 600,
                  }}>{dayEvents.length}개</span>
                )}
              </div>
              {dayEvents.map((event) => {
                const isFlight = event.type === "flight" || event.summary?.includes("Flight");
                return (
                  <div key={event.id} style={{
                    backgroundColor: isFlight ? "#1e3a5f" : (isToday_ ? "#dbeafe" : "#f8f7f4"),
                    color: isFlight ? "#ffffff" : "#1a1916",
                    borderRadius: "8px", padding: "10px 12px", marginBottom: "4px",
                  }}>
                    <div style={{ fontSize: "13px", fontWeight: 600 }}>
                      {isFlight ? "✈️ " : ""}{event.summary}
                    </div>
                    <div style={{ fontSize: "11px", opacity: 0.7, marginTop: "2px" }}>
                      {new Date(event.start).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}
                      {event.location && ` · ${event.location}`}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ===== TASKS TAB (Notion 연동) ===== */
function TasksTab({ tasks }: { tasks: NotionTask[] }) {
  const [filter, setFilter] = useState("all");

  const filtered = tasks.filter((t) => {
    if (filter === "progress") return t.status === "진행 중";
    if (filter === "todo") return t.status === "시작 전";
    if (filter === "done") return t.status === "완료";
    if (filter === "overdue") return t.deadline && new Date(t.deadline) < new Date() && t.status !== "완료";
    return true;
  });

  const statusStyles: Record<string, { bg: string; color: string; label: string }> = {
    "진행 중": { bg: "#dbeafe", color: "#1a56db", label: "진행 중" },
    "시작 전": { bg: "#f2f0ec", color: "#6b6860", label: "시작 전" },
    "완료": { bg: "#dcfce7", color: "#057a55", label: "완료" },
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {/* Source Label */}
      <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", color: "#a8a59e" }}>
        <span>📋</span>
        <span>Notion 프로젝트 보드에서 연동됨</span>
      </div>

      {/* Filter Pills */}
      <div style={{ display: "flex", gap: "6px", overflowX: "auto", paddingBottom: "4px" }}>
        {[
          { key: "all", label: `전체 (${tasks.length})` },
          { key: "progress", label: `진행 중 (${tasks.filter(t => t.status === "진행 중").length})` },
          { key: "overdue", label: "⚠️ 지연" },
          { key: "todo", label: "시작 전" },
        ].map((f) => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            style={{
              padding: "6px 14px", borderRadius: "99px", border: "none",
              backgroundColor: filter === f.key ? "#1a56db" : "#f2f0ec",
              color: filter === f.key ? "#ffffff" : "#6b6860",
              fontSize: "12px", fontWeight: 600, whiteSpace: "nowrap", cursor: "pointer",
            }}>{f.label}</button>
        ))}
      </div>

      {/* Task List */}
      {filtered.map((task) => {
        const isOverdue = task.deadline && new Date(task.deadline) < new Date() && task.status !== "완료";
        const st = statusStyles[task.status] || statusStyles["시작 전"];

        return (
          <a key={task.name} href={task.url} target="_blank" rel="noopener noreferrer"
            style={{
              textDecoration: "none", color: "inherit",
              backgroundColor: "#ffffff",
              border: isOverdue ? "1px solid #fca5a5" : "1px solid #f2f0ec",
              borderRadius: "12px", padding: "14px",
              display: "block",
            }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: "14px", color: "#1a1916" }}>{task.name}</div>
                <div style={{ display: "flex", gap: "6px", marginTop: "8px", flexWrap: "wrap" }}>
                  <span style={{ backgroundColor: st.bg, color: st.color, padding: "2px 10px", borderRadius: "99px", fontSize: "11px", fontWeight: 600 }}>
                    {st.label}
                  </span>
                  {task.assignee && (
                    <span style={{ backgroundColor: "#f8f7f4", color: "#6b6860", padding: "2px 10px", borderRadius: "99px", fontSize: "11px", fontWeight: 500 }}>
                      👤 {task.assignee}
                    </span>
                  )}
                  {task.deadline && (
                    <span style={{
                      backgroundColor: isOverdue ? "#fee2e2" : "#f8f7f4",
                      color: isOverdue ? "#c81e1e" : "#6b6860",
                      padding: "2px 10px", borderRadius: "99px", fontSize: "11px", fontWeight: 500,
                    }}>
                      📅 {task.deadline}
                    </span>
                  )}
                </div>
              </div>
              <span style={{ color: "#a8a59e", fontSize: "18px", marginLeft: "8px" }}>›</span>
            </div>
          </a>
        );
      })}

      {filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: "40px 0", color: "#a8a59e", fontSize: "14px" }}>
          해당하는 업무가 없습니다
        </div>
      )}

      {/* Notion Link */}
      <a href="https://www.notion.so/31a7a0d68bfb8044917ce8cbfd7821e2" target="_blank" rel="noopener noreferrer"
        style={{
          padding: "14px", backgroundColor: "#1a1916", color: "#ffffff", border: "none",
          borderRadius: "12px", fontWeight: 600, fontSize: "14px", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
          textDecoration: "none",
        }}>
        📋 Notion에서 업무 추가/관리 →
      </a>
    </div>
  );
}

/* ===== FINANCE TAB ===== */
function FinanceTab() {
  const metrics = [
    { name: "EIJ 이번달", value: "12,500", unit: "AUD", color: "#057a55" },
    { name: "Pentahexagon", value: "8,900,000", unit: "KRW", color: "#7e3bda" },
    { name: "한국인테리어", value: "5,500,000", unit: "KRW", color: "#6b6860" },
    { name: "총 지출", value: "28,450", unit: "AUD", color: "#c81e1e" },
  ];

  const rows = [
    { name: "Smile Sushi 디자인비", co: "EIJ", amount: "5,000 AUD", status: "입금", statusColor: "#057a55", statusBg: "#dcfce7" },
    { name: "Pentahexagon 개발비", co: "Penta", amount: "3,500,000 KRW", status: "대기중", statusColor: "#b45309", statusBg: "#fef3c7" },
    { name: "BeyondFleet 컨설팅", co: "BF", amount: "2,800 AUD", status: "미지급", statusColor: "#c81e1e", statusBg: "#fee2e2" },
    { name: "한국 인테리어 상담료", co: "한국", amount: "1,200,000 KRW", status: "예정", statusColor: "#1a56db", statusBg: "#dbeafe" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
        {metrics.map((m) => (
          <div key={m.name} style={{ backgroundColor: "#ffffff", border: "1px solid #f2f0ec", borderRadius: "12px", padding: "14px" }}>
            <div style={{ fontSize: "11px", color: "#6b6860", marginBottom: "4px" }}>{m.name}</div>
            <div style={{ fontSize: "20px", fontWeight: 700, color: m.color }}>{m.value}</div>
            <div style={{ fontSize: "10px", color: "#a8a59e" }}>{m.unit}</div>
          </div>
        ))}
      </div>

      <div>
        <div style={{ fontWeight: 700, fontSize: "15px", marginBottom: "10px" }}>거래 내역</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {rows.map((r) => (
            <div key={r.name} style={{ backgroundColor: "#ffffff", border: "1px solid #f2f0ec", borderRadius: "12px", padding: "14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: "13px", color: "#1a1916" }}>{r.name}</div>
                  <div style={{ fontSize: "11px", color: "#6b6860", marginTop: "2px" }}>{r.co}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontWeight: 700, fontSize: "14px", color: "#1a1916" }}>{r.amount}</div>
                  <span style={{ backgroundColor: r.statusBg, color: r.statusColor, padding: "2px 8px", borderRadius: "99px", fontSize: "10px", fontWeight: 600, display: "inline-block", marginTop: "4px" }}>
                    {r.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", gap: "8px" }}>
        <button style={{ flex: 1, padding: "14px", backgroundColor: "#1a56db", color: "#ffffff", border: "none", borderRadius: "12px", fontWeight: 600, fontSize: "13px", cursor: "pointer" }}>
          + 항목 추가
        </button>
        <button style={{ flex: 1, padding: "14px", backgroundColor: "#ffffff", color: "#1a1916", border: "1px solid #f2f0ec", borderRadius: "12px", fontWeight: 600, fontSize: "13px", cursor: "pointer" }}>
          🤖 AI 분석
        </button>
      </div>
    </div>
  );
}

/* ===== HELPERS ===== */
function MetricCard({ title, value, bg, color }: { title: string; value: string; bg: string; color: string }) {
  return (
    <div style={{ backgroundColor: bg, borderRadius: "12px", padding: "14px" }}>
      <div style={{ fontSize: "11px", fontWeight: 500, color, opacity: 0.8 }}>{title}</div>
      <div style={{ fontSize: "28px", fontWeight: 700, color, marginTop: "4px" }}>{value}</div>
    </div>
  );
}

function isToday(dateString: string) {
  const date = new Date(dateString);
  const today = new Date();
  return date.getFullYear() === today.getFullYear() && date.getMonth() === today.getMonth() && date.getDate() === today.getDate();
}
