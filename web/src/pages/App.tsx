import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { listTasks, completeTask, extendTask, flushQueue } from "../lib/api";
import { Task } from "../types/task";
import { computeStatus } from "../lib/status";
import { TaskModal } from "../components/TaskModal";
import { format, differenceInCalendarDays } from "date-fns";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, PieChart, Pie, Cell } from "recharts";
import { CheckCircle, Clock, Timer, AlertTriangle, CirclePlus } from "lucide-react";

const colors = ["#22d3ee", "#7c3aed", "#06b6d4", "#67e8f9", "#38bdf8"];

export default function App() {
  const queryClient = useQueryClient();
  const tasksQuery = useQuery({ queryKey: ["tasks"], queryFn: () => listTasks() });
  const [hourlyTick, setHourlyTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setHourlyTick((x) => x + 1), 1000 * 60 * 60);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    flushQueue();
    queryClient.invalidateQueries({ queryKey: ["tasks"] });
  }, [hourlyTick, queryClient]);

  const tasks = useMemo(() => {
    return (tasksQuery.data || []).map((t) => ({ ...t, status: computeStatus(t) }));
  }, [tasksQuery.data]);

  const stats = useMemo(() => {
    const total = tasks.length;
    const onTrack = tasks.filter((t) => t.status === "On Track").length;
    const delayed = tasks.filter((t) => t.status === "Delayed").length;
    const completedOnTime = tasks.filter((t) => t.status === "Completed On Time").length;
    const completedLate = tasks.filter((t) => t.status === "Completed Late").length;
    return { total, onTrack, delayed, completedOnTime, completedLate };
  }, [tasks]);

  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {};
    tasks.forEach((t) => {
      counts[t.category] = (counts[t.category] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [tasks]);

  const throughput = useMemo(() => {
    const counts: Record<string, number> = {};
    tasks
      .filter((t) => t.completedAt)
      .forEach((t) => {
        const key = format(new Date(t.completedAt!), "MMM d");
        counts[key] = (counts[key] || 0) + 1;
      });
    return Object.entries(counts).map(([day, count]) => ({ day, count }));
  }, [tasks]);

  const SLA = useMemo(() => {
    const completed = stats.completedLate + stats.completedOnTime;
    if (completed === 0) return 100;
    return Math.round((stats.completedOnTime / completed) * 100);
  }, [stats]);

  const handleComplete = async (task: Task) => {
    await completeTask(task.id);
    queryClient.invalidateQueries({ queryKey: ["tasks"] });
  };

  const handleExtend = async (task: Task) => {
    await extendTask(task.id, 1);
    queryClient.invalidateQueries({ queryKey: ["tasks"] });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 pb-24">
      <header className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs text-slate-400">Voice powered productivity</p>
          <h1 className="text-2xl font-bold">Task Dashboard</h1>
        </div>
        <div className="text-xs bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full">Offline sync ready</div>
      </header>

      <section className="grid md:grid-cols-5 gap-4 mb-6">
        <StatCard label="Total Tasks" value={stats.total} icon={<CirclePlus className="w-5 h-5" />} />
        <StatCard label="On Track" value={stats.onTrack} icon={<CheckCircle className="w-5 h-5" />} />
        <StatCard label="Delayed" value={stats.delayed} icon={<AlertTriangle className="w-5 h-5" />} />
        <StatCard label="Completed On Time" value={stats.completedOnTime} icon={<Clock className="w-5 h-5" />} />
        <StatCard label="Completed Late" value={stats.completedLate} icon={<Timer className="w-5 h-5" />} />
      </section>

      <section className="grid md:grid-cols-3 gap-4 mb-6">
        <div className="card p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold">Category breakdown</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryData} dataKey="value" nameKey="name" fill="#8884d8" label>
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold">Throughput</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={throughput}>
                <XAxis dataKey="day" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip />
                <Bar dataKey="count" fill="#22d3ee" radius={6} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-4 flex flex-col justify-between">
          <div>
            <h3 className="font-semibold mb-2">SLA</h3>
            <p className="text-4xl font-bold">{SLA}%</p>
            <p className="text-sm text-slate-400">Completed within promised timeline</p>
          </div>
          <div className="text-xs text-slate-400">Auto recomputes hourly.</div>
        </div>
      </section>

      <section className="card p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Tasks</h3>
          <div className="text-xs text-slate-400">Statuses refresh on reload and hourly.</div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-slate-400">
              <tr>
                <th className="py-2">Title</th>
                <th>Category</th>
                <th>Priority</th>
                <th>Start</th>
                <th>Due</th>
                <th>Status</th>
                <th>Aging</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={task.id} className="border-t border-slate-800">
                  <td className="py-2">{task.title}</td>
                  <td>{task.category}</td>
                  <td>{task.priority}</td>
                  <td>{format(new Date(task.startAt), "PP")}</td>
                  <td>{format(new Date(task.dueAt), "PP")}</td>
                  <td>
                    <span className="px-2 py-1 rounded-full text-xs bg-slate-800 border border-slate-700">
                      {task.status}
                    </span>
                  </td>
                  <td>{differenceInCalendarDays(new Date(), new Date(task.startAt))}d</td>
                  <td className="space-x-2">
                    <button className="text-emerald-300 text-xs" onClick={() => handleComplete(task)}>
                      Done
                    </button>
                    <button className="text-cyan-300 text-xs" onClick={() => handleExtend(task)}>
                      +1 day
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <TaskModal onCreated={() => queryClient.invalidateQueries({ queryKey: ["tasks"] })} />
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: JSX.Element }) {
  return (
    <div className="card p-4 flex flex-col gap-2">
      <div className="text-slate-400 text-xs">{label}</div>
      <div className="flex items-center gap-2">
        <div className="p-2 bg-slate-800 rounded-lg">{icon}</div>
        <div className="text-2xl font-bold">{value}</div>
      </div>
    </div>
  );
}
