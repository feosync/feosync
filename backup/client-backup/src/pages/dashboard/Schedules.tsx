import { useState } from "react";
import { MOCK_SCHEDULES, MockSchedule } from "@/lib/mockData";
import { Clock, Plus, Play, Pause, MoreHorizontal, Zap, RefreshCw, Calendar } from "lucide-react";

export default function Schedules() {
  const [schedules, setSchedules] = useState<MockSchedule[]>(MOCK_SCHEDULES);

  const toggleActive = (id: string) => {
    setSchedules(prev => prev.map(s => s.id === id ? { ...s, active: !s.active } : s));
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="serif text-2xl md:text-3xl">Automatisation</h1>
          <p className="text-muted-foreground text-sm mt-1">Règles de publication automatique via Celery Beat.</p>
        </div>
        <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all">
          <Plus size={16} /> Nouvelle règle
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-primary">{schedules.filter(s => s.active).length}</div>
          <div className="text-xs text-muted-foreground mt-1">Règles actives</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold">{schedules.length}</div>
          <div className="text-xs text-muted-foreground mt-1">Total règles</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-accent">127</div>
          <div className="text-xs text-muted-foreground mt-1">Exécutions ce mois</div>
        </div>
      </div>

      <div className="space-y-3">
        {schedules.map(schedule => (
          <div key={schedule.id} className="glass-card p-5 hover:border-primary/20 transition-all">
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${schedule.active ? "bg-primary/10 border border-primary/25" : "bg-muted border border-border"}`}>
                <Zap size={20} className={schedule.active ? "text-primary" : "text-muted-foreground"} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-semibold text-sm">{schedule.name}</h3>
                  <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${schedule.active ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-muted text-muted-foreground border border-border"}`}>
                    {schedule.active ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="flex items-center flex-wrap gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Clock size={12} /> Cron: <code className="px-1.5 py-0.5 rounded bg-muted text-foreground">{schedule.cronExpr}</code></span>
                  <span className="flex items-center gap-1"><Calendar size={12} /> Type: {schedule.ruleType}</span>
                </div>
                <div className="flex items-center flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
                  <span>Dernière exec: {new Date(schedule.lastRun).toLocaleDateString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                  {schedule.nextRun && <span>Prochaine: {new Date(schedule.nextRun).toLocaleDateString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>}
                  <span>Pages: {schedule.pages.join(", ")}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={() => toggleActive(schedule.id)}
                  className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${schedule.active ? "bg-emerald-500/10 hover:bg-emerald-500/20" : "bg-muted hover:bg-muted/80"}`}>
                  {schedule.active ? <Pause size={14} className="text-emerald-400" /> : <Play size={14} className="text-muted-foreground" />}
                </button>
                <button className="w-9 h-9 rounded-lg hover:bg-muted flex items-center justify-center">
                  <RefreshCw size={14} className="text-muted-foreground" />
                </button>
                <button className="w-9 h-9 rounded-lg hover:bg-muted flex items-center justify-center">
                  <MoreHorizontal size={14} className="text-muted-foreground" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
