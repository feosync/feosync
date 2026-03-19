import { ANALYTICS_DAILY, MOCK_STATS } from "@/lib/mockData";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, Eye, Heart, FileText, Users } from "lucide-react";

const PIE_DATA = [
  { name: "IA Mode A", value: 65, color: "hsl(174, 100%, 35%)" },
  { name: "IA Mode B", value: 20, color: "hsl(38, 80%, 52%)" },
  { name: "Manuel", value: 15, color: "hsl(215, 20%, 50%)" },
];

const BEST_HOURS = [
  { hour: "8h", engagement: 5.2 }, { hour: "9h", engagement: 8.4 }, { hour: "10h", engagement: 7.1 },
  { hour: "11h", engagement: 6.3 }, { hour: "12h", engagement: 9.8 }, { hour: "13h", engagement: 7.5 },
  { hour: "14h", engagement: 5.9 }, { hour: "15h", engagement: 4.8 }, { hour: "16h", engagement: 6.2 },
  { hour: "17h", engagement: 8.9 }, { hour: "18h", engagement: 11.2 }, { hour: "19h", engagement: 9.4 },
  { hour: "20h", engagement: 7.8 }, { hour: "21h", engagement: 5.1 },
];

export default function Analytics() {
  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="serif text-2xl md:text-3xl">Analytics</h1>
        <p className="text-muted-foreground text-sm mt-1">Performances de vos publications sur les 30 derniers jours.</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: "Portée totale", value: "23.4k", trend: "+34%", icon: Eye },
          { label: "Impressions", value: "48.2k", trend: "+28%", icon: TrendingUp },
          { label: "Engagement", value: "8.2%", trend: "+5%", icon: Heart },
          { label: "Publications", value: "47", trend: "+12%", icon: FileText },
          { label: "Abonnés", value: "4,850", trend: "+8%", icon: Users },
        ].map(s => (
          <div key={s.label} className="glass-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <s.icon size={14} className="text-primary" />
              <span className="text-xs text-muted-foreground">{s.label}</span>
            </div>
            <div className="text-xl font-bold">{s.value}</div>
            <span className="text-xs text-emerald-400">{s.trend}</span>
          </div>
        ))}
      </div>

      {/* Reach over time */}
      <div className="glass-card p-6">
        <h3 className="font-semibold mb-4">Portée & impressions</h3>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={ANALYTICS_DAILY}>
            <defs>
              <linearGradient id="gR2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(174, 100%, 35%)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="hsl(174, 100%, 35%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gI2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(220, 70%, 55%)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="hsl(220, 70%, 55%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "hsl(215, 20%, 60%)", fontSize: 11 }} interval={4} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: "hsl(215, 20%, 60%)", fontSize: 11 }} width={45} />
            <Tooltip contentStyle={{ background: "hsl(220, 30%, 13%)", border: "1px solid hsl(220, 20%, 20%)", borderRadius: 12, fontSize: 12 }} />
            <Area type="monotone" dataKey="impressions" stroke="hsl(220, 70%, 55%)" fill="url(#gI2)" strokeWidth={2} />
            <Area type="monotone" dataKey="reach" stroke="hsl(174, 100%, 35%)" fill="url(#gR2)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Best hours */}
        <div className="glass-card p-6">
          <h3 className="font-semibold mb-4">Meilleures heures de publication</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={BEST_HOURS}>
              <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fill: "hsl(215, 20%, 60%)", fontSize: 11 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "hsl(215, 20%, 60%)", fontSize: 11 }} width={30} />
              <Tooltip contentStyle={{ background: "hsl(220, 30%, 13%)", border: "1px solid hsl(220, 20%, 20%)", borderRadius: 12, fontSize: 12 }} />
              <Bar dataKey="engagement" radius={[6, 6, 0, 0]}>
                {BEST_HOURS.map((_, i) => (
                  <Cell key={i} fill={BEST_HOURS[i].engagement > 8 ? "hsl(174, 100%, 35%)" : "hsl(220, 25%, 25%)"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Content types */}
        <div className="glass-card p-6">
          <h3 className="font-semibold mb-4">Types de contenu</h3>
          <div className="flex items-center justify-center gap-8">
            <ResponsiveContainer width={180} height={180}>
              <PieChart>
                <Pie data={PIE_DATA} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={4} dataKey="value">
                  {PIE_DATA.map((entry, i) => (
                    <Cell key={i} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-3">
              {PIE_DATA.map(d => (
                <div key={d.name} className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ background: d.color }} />
                  <div>
                    <div className="text-sm font-medium">{d.name}</div>
                    <div className="text-xs text-muted-foreground">{d.value}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
