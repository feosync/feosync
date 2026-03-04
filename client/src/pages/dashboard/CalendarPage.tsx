import { useState } from "react";
import { MOCK_POSTS } from "@/lib/mockData";
import { ChevronLeft, ChevronRight } from "lucide-react";

const DAYS_FR = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const MONTHS_FR = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 2, 1)); // March 2026
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startOffset = (firstDay.getDay() + 6) % 7; // Monday-based
  const daysInMonth = lastDay.getDate();

  const postsMap = new Map<string, typeof MOCK_POSTS>();
  MOCK_POSTS.forEach(p => {
    if (!p.publishAt) return;
    const d = new Date(p.publishAt);
    if (d.getMonth() === month && d.getFullYear() === year) {
      const key = d.getDate().toString();
      postsMap.set(key, [...(postsMap.get(key) || []), p]);
    }
  });

  const prev = () => setCurrentDate(new Date(year, month - 1, 1));
  const next = () => setCurrentDate(new Date(year, month + 1, 1));
  const today = new Date();

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="serif text-2xl md:text-3xl">Calendrier éditorial</h1>
        <p className="text-muted-foreground text-sm mt-1">Visualisez et planifiez vos publications.</p>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <button onClick={prev} className="w-9 h-9 rounded-lg hover:bg-muted flex items-center justify-center"><ChevronLeft size={18} /></button>
          <h2 className="serif text-xl">{MONTHS_FR[month]} {year}</h2>
          <button onClick={next} className="w-9 h-9 rounded-lg hover:bg-muted flex items-center justify-center"><ChevronRight size={18} /></button>
        </div>

        <div className="grid grid-cols-7">
          {DAYS_FR.map(d => (
            <div key={d} className="py-3 text-center text-xs font-semibold text-muted-foreground border-b border-border">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {Array.from({ length: startOffset }).map((_, i) => (
            <div key={`empty-${i}`} className="min-h-[100px] border-b border-r border-border/30 bg-muted/10" />
          ))}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const dayPosts = postsMap.get(day.toString()) || [];
            const isToday = today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;

            return (
              <div key={day} className={`min-h-[100px] border-b border-r border-border/30 p-2 hover:bg-muted/20 transition-colors ${isToday ? "bg-primary/5" : ""}`}>
                <div className={`text-sm font-medium mb-1 w-7 h-7 rounded-full flex items-center justify-center ${isToday ? "bg-primary text-primary-foreground" : "text-foreground"}`}>
                  {day}
                </div>
                <div className="space-y-1">
                  {dayPosts.slice(0, 2).map(p => (
                    <div key={p.id} className={`text-[10px] px-1.5 py-0.5 rounded truncate cursor-pointer ${p.status === "published" ? "bg-emerald-500/15 text-emerald-400" : p.status === "scheduled" ? "bg-accent/15 text-accent" : "bg-muted text-muted-foreground"}`}>
                      {new Date(p.publishAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })} {p.pageName.split(" ")[0]}
                    </div>
                  ))}
                  {dayPosts.length > 2 && (
                    <div className="text-[10px] text-muted-foreground text-center">+{dayPosts.length - 2} autres</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
