"use client";

import { useState, useEffect } from "react";
import { Menu, X, ChevronLeft, ChevronRight, Plus, Filter, Check } from "lucide-react";

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

const COMPANY_COLORS: Record<string, { bg: string; text: string; light: string }> = {
  eij: { bg: "bg-green-600", text: "text-white", light: "bg-green-100 text-green-700" },
  penta: { bg: "bg-purple-600", text: "text-white", light: "bg-purple-100 text-purple-700" },
  bf: { bg: "bg-amber-600", text: "text-white", light: "bg-amber-100 text-amber-700" },
  kr: { bg: "bg-gray-600", text: "text-white", light: "bg-gray-100 text-gray-700" },
};

const COMPANY_NAMES: Record<string, string> = {
  eij: "EIJ Construction",
  penta: "Pentahexagon",
  bf: "BeyondFleet",
  kr: "한국 인테리어",
};

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>("");
  const [events, setEvents] = useState<Event[]>([]);
  const [tasks, setTasks] = useState<Task[]>(SAMPLE_TASKS);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentWeek, setCurrentWeek] = useState<Date>(new Date());
  const [taskFilter, setTaskFilter] = useState({ company: "all", priority: "all", status: "all" });

  // Update clock
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      // Brisbane time is AEST (UTC+10)
      const brisbaneTime = new Date(now.toLocaleString("en-US", { timeZone: "Australia/Brisbane" }));
      setCurrentTime(brisbaneTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch calendar events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch("/api/calendar");
        const data = await response.json();
        setEvents(data);
      } catch (error) {
        console.error("Failed to fetch events:", error);
        // Use sample data on error
        setEvents(SAMPLE_EVENTS);
      }
    };

    fetchEvents();
    const interval = setInterval(fetchEvents, 5 * 60 * 1000); // Refresh every 5 minutes
    return () => clearInterval(interval);
  }, []);

  const toggleTask = (id: number) => {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  };

  const getWeekDays = (baseDate: Date) => {
    const week = [];
    const curr = new Date(baseDate);
    const first = curr.getDate() - curr.getDay();

    for (let i = 0; i < 7; i++) {
      const date = new Date(curr.setDate(first + i));
      week.push(new Date(date));
    }
    return week;
  };

  const weekDays = getWeekDays(currentWeek);
  const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const filteredTasks = tasks.filter((t) => {
    if (taskFilter.company !== "all" && t.co !== taskFilter.company) return false;
    if (taskFilter.priority !== "all" && t.pr !== taskFilter.priority) return false;
    if (taskFilter.status === "done" && !t.done) return false;
    if (taskFilter.status === "pending" && t.done) return false;
    return true;
  });

  return (
    <div className="flex h-screen bg-base">
      {/* Sidebar */}
      <div
        className={`fixed md:static w-64 h-screen bg-surface border-r border-surface2 flex flex-col p-6 transition-transform duration-300 z-50 md:z-auto ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Brand Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center">
              <span className="text-white font-bold text-lg">PK</span>
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight">Peter Kim</h1>
              <p className="text-xs text-secondary">Command Center</p>
            </div>
          </div>
          <div className="mt-4 p-4 bg-surface2 rounded-lg">
            <p className="text-xs text-tertiary mb-1">현재 시간</p>
            <p className="font-mono font-semibold text-text">{currentTime}</p>
            <p className="text-xs text-secondary mt-1">Brisbane (AEST)</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2">
          <NavItem icon="🔍" label="전체 현황" active={activeTab === "overview"} onClick={() => { setActiveTab("overview"); setSidebarOpen(false); }} />
          <NavItem icon="📅" label="스케줄" active={activeTab === "schedule"} onClick={() => { setActiveTab("schedule"); setSidebarOpen(false); }} />
          <NavItem icon="✓" label="업무 지시" active={activeTab === "tasks"} onClick={() => { setActiveTab("tasks"); setSidebarOpen(false); }} />
          <NavItem icon="💰" label="재무" active={activeTab === "finance"} onClick={() => { setActiveTab("finance"); setSidebarOpen(false); }} />
        </nav>

        {/* Footer */}
        <div className="text-xs text-tertiary border-t border-surface2 pt-4">
          <p>v1.0.0</p>
          <p className="mt-1 text-tertiary">© 2024 PK</p>
        </div>
      </div>

      {/* Close sidebar on desktop click */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 md:hidden z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-auto flex flex-col">
        {/* Header */}
        <header className="bg-surface border-b border-surface2 px-6 py-4 flex items-center justify-between sticky top-0 z-40">
          <h2 className="text-xl font-semibold">
            {activeTab === "overview" && "전체 현황"}
            {activeTab === "schedule" && "스케줄"}
            {activeTab === "tasks" && "업무 지시"}
            {activeTab === "finance" && "재무"}
          </h2>
          <button
            className="md:hidden p-2 hover:bg-surface2 rounded-lg transition"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto">
          <div className="p-6 space-y-6">
            {activeTab === "overview" && <OverviewTab events={events} />}
            {activeTab === "schedule" && <ScheduleTab weekDays={weekDays} dayLabels={dayLabels} currentWeek={currentWeek} setCurrentWeek={setCurrentWeek} events={events} />}
            {activeTab === "tasks" && <TasksTab tasks={filteredTasks} onToggle={toggleTask} filter={taskFilter} setFilter={setTaskFilter} />}
            {activeTab === "finance" && <FinanceTab />}
          </div>
        </main>
      </div>
    </div>
  );
}

function NavItem({ icon, label, active, onClick }: { icon: string; label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
        active
          ? "bg-blue-100 text-blue-600 font-semibold"
          : "text-secondary hover:bg-surface2"
      }`}
    >
      <span className="text-lg">{icon}</span>
      <span>{label}</span>
    </button>
  );
}

function OverviewTab({ events }: { events: Event[] }) {
  const upcomingFlights = events.filter((e) => e.type === "flight").slice(0, 2);

  return (
    <>
      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard title="활성 사업" value="4" color="blue" />
        <MetricCard title="미완료 업무" value="5" color="amber" />
        <MetricCard title="긴급 업무" value="2" color="red" />
        <MetricCard title="오늘 일정" value={events.filter((e) => isToday(e.start)).length.toString()} color="green" />
      </div>

      {/* Flight Alert */}
      {upcomingFlights.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <h3 className="font-semibold text-amber-900 mb-3">✈️ 예정된 항공편</h3>
          <div className="space-y-2">
            {upcomingFlights.map((flight) => (
              <div key={flight.id} className="flex justify-between items-center p-3 bg-white rounded border border-amber-100">
                <div>
                  <p className="font-medium text-text">{flight.summary}</p>
                  <p className="text-sm text-secondary">{flight.location}</p>
                </div>
                <p className="text-sm text-amber-700 font-semibold">{new Date(flight.start).toLocaleString("ko-KR")}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Company Status */}
      <div className="space-y-3">
        <h3 className="font-semibold text-lg">사업 진행 상황</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CompanyCard name="EIJ Construction" progress={65} color="green" />
          <CompanyCard name="Pentahexagon" progress={40} color="purple" />
          <CompanyCard name="BeyondFleet" progress={25} color="amber" />
          <CompanyCard name="한국 인테리어" progress={10} color="gray" />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-3">
        <h3 className="font-semibold text-lg">빠른 동작</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <ActionButton icon="📧" label="이메일" />
          <ActionButton icon="📞" label="연락처" />
          <ActionButton icon="📄" label="계약서" />
          <ActionButton icon="🤖" label="AI 분석" />
        </div>
      </div>
    </>
  );
}

function ScheduleTab({
  weekDays,
  dayLabels,
  currentWeek,
  setCurrentWeek,
  events,
}: {
  weekDays: Date[];
  dayLabels: string[];
  currentWeek: Date;
  setCurrentWeek: (date: Date) => void;
  events: Event[];
}) {
  const goToPreviousWeek = () => {
    const prev = new Date(currentWeek);
    prev.setDate(prev.getDate() - 7);
    setCurrentWeek(prev);
  };

  const goToNextWeek = () => {
    const next = new Date(currentWeek);
    next.setDate(next.getDate() + 7);
    setCurrentWeek(next);
  };

  const goToToday = () => {
    setCurrentWeek(new Date());
  };

  return (
    <>
      {/* Calendar Controls */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-2">
          <button onClick={goToPreviousWeek} className="p-2 hover:bg-surface2 rounded-lg transition">
            <ChevronLeft size={20} />
          </button>
          <button onClick={goToToday} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium">
            오늘
          </button>
          <button onClick={goToNextWeek} className="p-2 hover:bg-surface2 rounded-lg transition">
            <ChevronRight size={20} />
          </button>
        </div>
        <p className="text-secondary">
          {weekDays[0].toLocaleDateString("ko-KR")} ~ {weekDays[6].toLocaleDateString("ko-KR")}
        </p>
      </div>

      {/* Week Calendar */}
      <div className="bg-surface rounded-lg border border-surface2 overflow-hidden">
        <div className="grid grid-cols-7 gap-0 border-b border-surface2">
          {dayLabels.map((label, idx) => (
            <div key={label} className="p-4 text-center border-r border-surface2 last:border-r-0 bg-surface2">
              <p className="font-semibold text-sm text-secondary">{label}</p>
              <p className="text-lg font-bold text-text">{weekDays[idx].getDate()}</p>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-0 min-h-96">
          {weekDays.map((day, idx) => {
            const dayEvents = events.filter(
              (e) => new Date(e.start).toDateString() === day.toDateString()
            );
            return (
              <div
                key={idx}
                className="p-3 border-r border-surface2 last:border-r-0 border-b border-surface2 bg-white hover:bg-surface2 transition cursor-pointer"
              >
                <div className="space-y-2">
                  {dayEvents.map((event) => (
                    <div
                      key={event.id}
                      className="text-xs p-2 rounded bg-blue-100 text-blue-700 font-medium truncate hover:bg-blue-200 transition"
                      title={event.summary}
                    >
                      {event.summary}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

function TasksTab({
  tasks,
  onToggle,
  filter,
  setFilter,
}: {
  tasks: Task[];
  onToggle: (id: number) => void;
  filter: { company: string; priority: string; status: string };
  setFilter: (filter: any) => void;
}) {
  return (
    <>
      {/* Filters */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-secondary" />
          <select
            value={filter.company}
            onChange={(e) => setFilter({ ...filter, company: e.target.value })}
            className="px-3 py-2 rounded-lg border border-surface2 bg-surface text-sm"
          >
            <option value="all">모든 회사</option>
            <option value="eij">EIJ</option>
            <option value="penta">Pentahexagon</option>
            <option value="bf">BeyondFleet</option>
            <option value="kr">한국</option>
          </select>
        </div>

        <select
          value={filter.priority}
          onChange={(e) => setFilter({ ...filter, priority: e.target.value })}
          className="px-3 py-2 rounded-lg border border-surface2 bg-surface text-sm"
        >
          <option value="all">모든 우선순위</option>
          <option value="urgent">긴급</option>
          <option value="normal">일반</option>
        </select>

        <select
          value={filter.status}
          onChange={(e) => setFilter({ ...filter, status: e.target.value })}
          className="px-3 py-2 rounded-lg border border-surface2 bg-surface text-sm"
        >
          <option value="all">모든 상태</option>
          <option value="pending">대기중</option>
          <option value="done">완료</option>
        </select>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {tasks.map((task) => (
          <div
            key={task.id}
            className={`flex items-center gap-4 p-4 rounded-lg border transition ${
              task.done
                ? "bg-surface2 border-surface2 opacity-60"
                : "bg-surface border-surface2 hover:border-blue-300"
            }`}
          >
            <button
              onClick={() => onToggle(task.id)}
              className={`flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center transition ${
                task.done
                  ? "bg-green-600 border-green-600"
                  : "border-surface2 hover:border-blue-600"
              }`}
            >
              {task.done && <Check size={16} className="text-white" />}
            </button>

            <div className="flex-1">
              <p className={`font-medium ${task.done ? "line-through text-tertiary" : "text-text"}`}>
                {task.text}
              </p>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <span className={`badge ${COMPANY_COLORS[task.co].light}`}>
                {COMPANY_NAMES[task.co]}
              </span>
              <span className={`badge ${task.pr === "urgent" ? "badge-red" : "badge-amber"}`}>
                {task.pr === "urgent" ? "긴급" : "일반"}
              </span>
            </div>
          </div>
        ))}
      </div>

      {tasks.length === 0 && (
        <div className="text-center py-12">
          <p className="text-tertiary">해당하는 업무가 없습니다</p>
        </div>
      )}

      {/* Add Button */}
      <button className="mt-6 flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium">
        <Plus size={20} />
        새 업무 추가
      </button>
    </>
  );
}

function FinanceTab() {
  const [data, setData] = useState([
    { id: 1, name: "EIJ이번달", value: "12,500 AUD", type: "aud" },
    { id: 2, name: "Pentahexagon", value: "8,900,000 KRW", type: "krw" },
    { id: 3, name: "한국인테리어", value: "5,500,000 KRW", type: "krw" },
    { id: 4, name: "총지출", value: "28,450 AUD", type: "aud" },
  ]);

  return (
    <>
      {/* Financial Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {data.map((item) => (
          <div key={item.id} className="bg-surface rounded-lg border border-surface2 p-4">
            <p className="text-sm text-secondary mb-2">{item.name}</p>
            <p className="text-2xl font-bold text-text">{item.value}</p>
          </div>
        ))}
      </div>

      {/* Financial Rows */}
      <div className="bg-surface rounded-lg border border-surface2 overflow-hidden mb-6">
        <table className="w-full">
          <thead>
            <tr className="border-b border-surface2 bg-surface2">
              <th className="px-6 py-3 text-left font-semibold text-sm">항목</th>
              <th className="px-6 py-3 text-left font-semibold text-sm">회사</th>
              <th className="px-6 py-3 text-right font-semibold text-sm">금액</th>
              <th className="px-6 py-3 text-center font-semibold text-sm">상태</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-surface2 hover:bg-surface2 transition">
              <td className="px-6 py-4">Smile Sushi 디자인비</td>
              <td className="px-6 py-4"><span className="badge badge-green">EIJ</span></td>
              <td className="px-6 py-4 text-right font-medium">5,000 AUD</td>
              <td className="px-6 py-4 text-center"><span className="badge badge-green">입금</span></td>
            </tr>
            <tr className="border-b border-surface2 hover:bg-surface2 transition">
              <td className="px-6 py-4">Pentahexagon 개발비</td>
              <td className="px-6 py-4"><span className="badge badge-purple">Pentahexagon</span></td>
              <td className="px-6 py-4 text-right font-medium">3,500,000 KRW</td>
              <td className="px-6 py-4 text-center"><span className="badge badge-amber">대기중</span></td>
            </tr>
            <tr className="border-b border-surface2 hover:bg-surface2 transition">
              <td className="px-6 py-4">BeyondFleet 컨설팅</td>
              <td className="px-6 py-4"><span className="badge badge-amber">BeyondFleet</span></td>
              <td className="px-6 py-4 text-right font-medium">2,800 AUD</td>
              <td className="px-6 py-4 text-center"><span className="badge badge-red">미지급</span></td>
            </tr>
            <tr className="hover:bg-surface2 transition">
              <td className="px-6 py-4">한국 인테리어 상담료</td>
              <td className="px-6 py-4"><span className="badge badge-gray">한국</span></td>
              <td className="px-6 py-4 text-right font-medium">1,200,000 KRW</td>
              <td className="px-6 py-4 text-center"><span className="badge badge-blue">예정</span></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-3">
        <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium">
          <Plus size={20} />
          항목 추가
        </button>
        <button className="flex items-center gap-2 px-6 py-3 border border-surface2 rounded-lg hover:bg-surface2 transition font-medium">
          🤖 AI 분석
        </button>
      </div>
    </>
  );
}

function MetricCard({ title, value, color }: { title: string; value: string; color: string }) {
  const colors = {
    blue: "bg-blue-100 text-blue-700",
    green: "bg-green-100 text-green-700",
    amber: "bg-amber-100 text-amber-700",
    red: "bg-red-100 text-red-700",
  };

  return (
    <div className={`rounded-lg p-4 ${colors[color as keyof typeof colors]}`}>
      <p className="text-sm font-medium opacity-80">{title}</p>
      <p className="text-3xl font-bold mt-2">{value}</p>
    </div>
  );
}

function CompanyCard({ name, progress, color }: { name: string; progress: number; color: string }) {
  const colors = {
    green: "bg-green-600",
    purple: "bg-purple-600",
    amber: "bg-amber-600",
    gray: "bg-gray-600",
  };

  return (
    <div className="bg-surface rounded-lg border border-surface2 p-4">
      <div className="flex justify-between items-center mb-3">
        <h4 className="font-semibold text-text">{name}</h4>
        <p className="font-bold text-lg">{progress}%</p>
      </div>
      <div className="w-full bg-surface2 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all ${colors[color as keyof typeof colors]}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

function ActionButton({ icon, label }: { icon: string; label: string }) {
  return (
    <button className="bg-surface border border-surface2 rounded-lg p-4 hover:bg-surface2 transition text-center">
      <p className="text-2xl mb-2">{icon}</p>
      <p className="text-xs font-medium">{label}</p>
    </button>
  );
}

function isToday(dateString: string) {
  const date = new Date(dateString);
  const today = new Date();
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

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
