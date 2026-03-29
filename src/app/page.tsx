"use client";

import { useState, useEffect } from "react";

type TabType = "overview" | "schedule" | "tasks" | "finance";

interface Event {
  id: string;
  summary: string;
  start: string;
  end: string;
  location?: string;
  type?: string;
}

interface Task {
  id: number;
  text: string;
  co: "eij" | "penta" | "bf" | "kr";
  pr: "urgent" | "normal";
  done: boolean;
}

const SAMPLE_TASKS: Task[] = [
  { id: 1, text: "Smile Sushi 최종 도면 승인 확인", co: "eij", pr: "urgent", done: false },
  { id: 2, text: "PENTAGATE 와이어프레임 다음 모듈", co: "penta", pr: "normal", done: false },
  { id: 3, text: "중진공 정책자금 서류 보완 제출", co: "penta", pr: "urgent", done: false },
  { id: 4, text: "EIJ 인보이스 클라이언트 발송", co: "eij", pr: "normal", done: false },
  { id: 5, text: "한국 법인 설립 서류 검토", co: "kr", pr: "normal", done: false },
];

const COMPANY_NAMES: Record<string, string> = {
  eij: "EIJ",
  penta: "Penta",
  bf: "BeyondFleet",
  kr: "한국",
};

const SAMPLE_EVENTS: Event[] = [
  {
    id: "1",
    summary: "전략 회의",
    start: new Date().toISOString(),
    end: new Date(Date.now() + 3600000).toISOString(),
    type: "meeting",
  },
  {
    id: "2",
    summary: "서울 출장 ✈️",
    start: new Date(Date.now() + 86400000).toISOString(),
    end: new Date(Date.now() + 172800000).toISOString(),
    location: "Seoul",
    type: "flight",
  },
  {
    id: "3",
    summary: "EIJ Construction 미팅",
    start: new Date(Date.now() + 172800000).toISOString(),
    end: new Date(Date.now() + 176400000).toISOString(),
    type: "meeting",
  },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [currentTime, setCurrentTime] = useState("");
  const [events, setEvents] = useState<Event[]>([]);
  const [tasks, setTasks] = useState<Task[]>(SAMPLE_TASKS);
  const [currentWeek, setCurrentWeek] = useState(new Date());

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const brisbaneTime = new Date(now.toLocaleString("en-US", { timeZone: "Australia/Brisbane" }));
      setCurrentTime(brisbaneTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }));
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
        setEvents(data);
      } catch {
        setEvents(SAMPLE_EVENTS);
      }
    };
    fetchEvents();
    const interval = setInterval(fetchEvents, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleTask = (id: number) => {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  };

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
        padding: "12px 16px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "36px",
            height: "36px",
            borderRadius: "8px",
            background: "linear-gradient(135deg, #1a56db, #3b82f6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 700,
            fontSize: "14px",
          }}>PK</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: "15px", lineHeight: 1.2 }}>Peter Kim</div>
            <div style={{ fontSize: "11px", color: "#a8a59e" }}>Command Center</div>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "16px", fontWeight: 600 }}>{currentTime}</div>
          <div style={{ fontSize: "10px", color: "#a8a59e" }}>Brisbane AEST</div>
        </div>
      </header>

      {/* Content Area */}
      <main style={{ flex: 1, overflow: "auto", padding: "16px" }}>
        {activeTab === "overview" && <OverviewTab events={events} />}
        {activeTab === "schedule" && <ScheduleTab events={events} currentWeek={currentWeek} setCurrentWeek={setCurrentWeek} />}
        {activeTab === "tasks" && <TasksTab tasks={tasks} onToggle={toggleTask} />}
        {activeTab === "finance" && <FinanceTab />}
      </main>

      {/* Bottom Tab Bar - Mobile App Style */}
      <nav style={{
        backgroundColor: "#ffffff",
        borderTop: "1px solid #f2f0ec",
        display: "flex",
        justifyContent: "space-around",
        padding: "8px 0",
        paddingBottom: "max(8px, env(safe-area-inset-bottom))",
        flexShrink: 0,
      }}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "2px",
              padding: "4px 12px",
              border: "none",
              background: "none",
              color: activeTab === tab.key ? "#1a56db" : "#a8a59e",
              fontSize: "10px",
              fontWeight: activeTab === tab.key ? 700 : 500,
              transition: "color 0.2s",
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
function OverviewTab({ events }: { events: Event[] }) {
  const upcomingFlights = events.filter((e) => e.type === "flight").slice(0, 2);
  const todayEvents = events.filter((e) => isToday(e.start));
  const companies = [
    { name: "EIJ Construction", progress: 65, color: "#057a55" },
    { name: "Pentahexagon", progress: 40, color: "#7e3bda" },
    { name: "BeyondFleet", progress: 25, color: "#b45309" },
    { name: "한국 인테리어", progress: 10, color: "#6b6860" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Metric Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
        <MetricCard title="활성 사업" value="4" bg="#dbeafe" color="#1a56db" />
        <MetricCard title="미완료 업무" value="5" bg="#fef3c7" color="#b45309" />
        <MetricCard title="긴급 업무" value="2" bg="#fee2e2" color="#c81e1e" />
        <MetricCard title="오늘 일정" value={todayEvents.length.toString()} bg="#dcfce7" color="#057a55" />
      </div>

      {/* Flight Alert */}
      {upcomingFlights.length > 0 && (
        <div style={{ backgroundColor: "#fffbeb", border: "1px solid #fde68a", borderRadius: "12px", padding: "14px" }}>
          <div style={{ fontWeight: 600, fontSize: "14px", marginBottom: "10px", color: "#92400e" }}>✈️ 예정된 항공편</div>
          {upcomingFlights.map((f) => (
            <div key={f.id} style={{
              backgroundColor: "#ffffff",
              borderRadius: "8px",
              padding: "10px 12px",
              marginBottom: "6px",
              border: "1px solid #fde68a",
            }}>
              <div style={{ fontWeight: 600, fontSize: "13px" }}>{f.summary}</div>
              <div style={{ fontSize: "11px", color: "#6b6860", marginTop: "2px" }}>
                {f.location} · {new Date(f.start).toLocaleDateString("ko-KR", { month: "short", day: "numeric", weekday: "short" })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Company Progress */}
      <div>
        <div style={{ fontWeight: 700, fontSize: "15px", marginBottom: "10px" }}>사업 진행 상황</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {companies.map((c) => (
            <div key={c.name} style={{
              backgroundColor: "#ffffff",
              borderRadius: "10px",
              border: "1px solid #f2f0ec",
              padding: "12px 14px",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <span style={{ fontWeight: 600, fontSize: "13px" }}>{c.name}</span>
                <span style={{ fontWeight: 700, fontSize: "14px", color: c.color }}>{c.progress}%</span>
              </div>
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
            { icon: "📞", label: "연락처" },
            { icon: "📄", label: "계약서" },
            { icon: "🤖", label: "AI 분석" },
          ].map((a) => (
            <button key={a.label} style={{
              backgroundColor: "#ffffff",
              border: "1px solid #f2f0ec",
              borderRadius: "10px",
              padding: "12px 4px",
              textAlign: "center",
              cursor: "pointer",
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
function ScheduleTab({ events, currentWeek, setCurrentWeek }: { events: Event[]; currentWeek: Date; setCurrentWeek: (d: Date) => void }) {
  const getWeekDays = (baseDate: Date) => {
    const week = [];
    const curr = new Date(baseDate);
    const first = curr.getDate() - curr.getDay() + 1; // Monday first
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
          style={{ padding: "8px 12px", border: "1px solid #f2f0ec", borderRadius: "8px", backgroundColor: "#fff", fontSize: "14px", cursor: "pointer" }}>
          ◀
        </button>
        <button onClick={() => setCurrentWeek(new Date())}
          style={{ padding: "8px 16px", backgroundColor: "#1a56db", color: "#fff", border: "none", borderRadius: "8px", fontWeight: 600, fontSize: "13px", cursor: "pointer" }}>
          오늘
        </button>
        <button onClick={() => { const d = new Date(currentWeek); d.setDate(d.getDate() + 7); setCurrentWeek(d); }}
          style={{ padding: "8px 12px", border: "1px solid #f2f0ec", borderRadius: "8px", backgroundColor: "#fff", fontSize: "14px", cursor: "pointer" }}>
          ▶
        </button>
      </div>

      {/* Week Date Range */}
      <div style={{ textAlign: "center", fontSize: "13px", color: "#6b6860", fontWeight: 500 }}>
        {weekDays[0].toLocaleDateString("ko-KR", { month: "long", day: "numeric" })} ~ {weekDays[6].toLocaleDateString("ko-KR", { month: "long", day: "numeric" })}
      </div>

      {/* Day Cards - Mobile Friendly */}
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
              borderRadius: "10px",
              padding: "12px 14px",
              opacity: isPast ? 0.5 : 1,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: dayEvents.length > 0 ? "8px" : 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    backgroundColor: isToday_ ? "#1a56db" : "transparent",
                    color: isToday_ ? "#ffffff" : "#1a1916",
                    fontWeight: 700,
                    fontSize: "14px",
                  }}>
                    {day.getDate()}
                  </span>
                  <span style={{ fontSize: "13px", color: isToday_ ? "#1a56db" : "#6b6860", fontWeight: 600 }}>
                    {dayLabels[idx]}
                    {isToday_ && <span style={{ marginLeft: "6px", fontSize: "11px", fontWeight: 700 }}>오늘</span>}
                  </span>
                </div>
                {dayEvents.length > 0 && (
                  <span style={{
                    backgroundColor: isToday_ ? "#1a56db" : "#f2f0ec",
                    color: isToday_ ? "#ffffff" : "#6b6860",
                    borderRadius: "99px",
                    padding: "2px 8px",
                    fontSize: "11px",
                    fontWeight: 600,
                  }}>
                    {dayEvents.length}개
                  </span>
                )}
              </div>
              {dayEvents.map((event) => (
                <div key={event.id} style={{
                  backgroundColor: isToday_ ? "#dbeafe" : "#f8f7f4",
                  borderRadius: "6px",
                  padding: "8px 10px",
                  marginBottom: "4px",
                  fontSize: "12px",
                  fontWeight: 500,
                  color: "#1a1916",
                }}>
                  {event.summary}
                  {event.location && <span style={{ color: "#6b6860", marginLeft: "6px" }}>· {event.location}</span>}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ===== TASKS TAB ===== */
function TasksTab({ tasks, onToggle }: { tasks: Task[]; onToggle: (id: number) => void }) {
  const [filter, setFilter] = useState("all");

  const filtered = tasks.filter((t) => {
    if (filter === "urgent") return t.pr === "urgent" && !t.done;
    if (filter === "done") return t.done;
    if (filter === "pending") return !t.done;
    return true;
  });

  const coColors: Record<string, { bg: string; color: string }> = {
    eij: { bg: "#dcfce7", color: "#057a55" },
    penta: { bg: "#f3e8ff", color: "#7e3bda" },
    bf: { bg: "#fef3c7", color: "#b45309" },
    kr: { bg: "#f0ede6", color: "#6b6860" },
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {/* Filter Pills */}
      <div style={{ display: "flex", gap: "6px", overflowX: "auto", paddingBottom: "4px" }}>
        {[
          { key: "all", label: "전체" },
          { key: "urgent", label: "🔴 긴급" },
          { key: "pending", label: "대기중" },
          { key: "done", label: "완료" },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            style={{
              padding: "6px 14px",
              borderRadius: "99px",
              border: "none",
              backgroundColor: filter === f.key ? "#1a56db" : "#f2f0ec",
              color: filter === f.key ? "#ffffff" : "#6b6860",
              fontSize: "12px",
              fontWeight: 600,
              whiteSpace: "nowrap",
              cursor: "pointer",
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Task List */}
      {filtered.map((task) => (
        <div
          key={task.id}
          onClick={() => onToggle(task.id)}
          style={{
            backgroundColor: task.done ? "#f8f7f4" : "#ffffff",
            border: task.pr === "urgent" && !task.done ? "1px solid #fca5a5" : "1px solid #f2f0ec",
            borderRadius: "10px",
            padding: "12px 14px",
            display: "flex",
            alignItems: "flex-start",
            gap: "10px",
            opacity: task.done ? 0.5 : 1,
            cursor: "pointer",
            transition: "opacity 0.2s",
          }}
        >
          {/* Checkbox */}
          <div style={{
            width: "22px",
            height: "22px",
            borderRadius: "6px",
            border: task.done ? "none" : "2px solid #d1cec7",
            backgroundColor: task.done ? "#057a55" : "transparent",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            marginTop: "1px",
          }}>
            {task.done && <span style={{ color: "#fff", fontSize: "12px", fontWeight: 700 }}>✓</span>}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontWeight: 500,
              fontSize: "13px",
              textDecoration: task.done ? "line-through" : "none",
              color: task.done ? "#a8a59e" : "#1a1916",
              lineHeight: 1.4,
            }}>
              {task.text}
            </div>
            <div style={{ display: "flex", gap: "6px", marginTop: "6px" }}>
              <span style={{
                ...coColors[task.co],
                backgroundColor: coColors[task.co].bg,
                color: coColors[task.co].color,
                padding: "2px 8px",
                borderRadius: "99px",
                fontSize: "10px",
                fontWeight: 600,
              }}>
                {COMPANY_NAMES[task.co]}
              </span>
              {task.pr === "urgent" && !task.done && (
                <span style={{
                  backgroundColor: "#fee2e2",
                  color: "#c81e1e",
                  padding: "2px 8px",
                  borderRadius: "99px",
                  fontSize: "10px",
                  fontWeight: 600,
                }}>
                  긴급
                </span>
              )}
            </div>
          </div>
        </div>
      ))}

      {filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: "40px 0", color: "#a8a59e", fontSize: "14px" }}>
          해당하는 업무가 없습니다
        </div>
      )}

      {/* Add Button */}
      <button style={{
        padding: "14px",
        backgroundColor: "#1a56db",
        color: "#ffffff",
        border: "none",
        borderRadius: "10px",
        fontWeight: 600,
        fontSize: "14px",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "6px",
      }}>
        + 새 업무 추가
      </button>
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
      {/* Financial Metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
        {metrics.map((m) => (
          <div key={m.name} style={{
            backgroundColor: "#ffffff",
            border: "1px solid #f2f0ec",
            borderRadius: "10px",
            padding: "12px",
          }}>
            <div style={{ fontSize: "11px", color: "#6b6860", marginBottom: "4px" }}>{m.name}</div>
            <div style={{ fontSize: "18px", fontWeight: 700, color: m.color }}>{m.value}</div>
            <div style={{ fontSize: "10px", color: "#a8a59e" }}>{m.unit}</div>
          </div>
        ))}
      </div>

      {/* Transaction List (Card style for mobile) */}
      <div>
        <div style={{ fontWeight: 700, fontSize: "15px", marginBottom: "10px" }}>거래 내역</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {rows.map((r) => (
            <div key={r.name} style={{
              backgroundColor: "#ffffff",
              border: "1px solid #f2f0ec",
              borderRadius: "10px",
              padding: "12px 14px",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: "13px", color: "#1a1916" }}>{r.name}</div>
                  <div style={{ fontSize: "11px", color: "#6b6860", marginTop: "2px" }}>{r.co}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontWeight: 700, fontSize: "14px", color: "#1a1916" }}>{r.amount}</div>
                  <span style={{
                    backgroundColor: r.statusBg,
                    color: r.statusColor,
                    padding: "2px 8px",
                    borderRadius: "99px",
                    fontSize: "10px",
                    fontWeight: 600,
                    display: "inline-block",
                    marginTop: "4px",
                  }}>
                    {r.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: "flex", gap: "8px" }}>
        <button style={{
          flex: 1,
          padding: "12px",
          backgroundColor: "#1a56db",
          color: "#ffffff",
          border: "none",
          borderRadius: "10px",
          fontWeight: 600,
          fontSize: "13px",
          cursor: "pointer",
        }}>
          + 항목 추가
        </button>
        <button style={{
          flex: 1,
          padding: "12px",
          backgroundColor: "#ffffff",
          color: "#1a1916",
          border: "1px solid #f2f0ec",
          borderRadius: "10px",
          fontWeight: 600,
          fontSize: "13px",
          cursor: "pointer",
        }}>
          🤖 AI 분석
        </button>
      </div>
    </div>
  );
}

/* ===== HELPER COMPONENTS ===== */
function MetricCard({ title, value, bg, color }: { title: string; value: string; bg: string; color: string }) {
  return (
    <div style={{
      backgroundColor: bg,
      borderRadius: "10px",
      padding: "14px",
    }}>
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
