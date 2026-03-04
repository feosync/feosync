import { useAuth } from "@/contexts/AuthContext";
import { MOCK_STATS, MOCK_POSTS, MOCK_PAGES, NOTIFICATIONS } from "@/lib/mockData";
import { TrendingUp, TrendingDown, FileText, Eye, Heart, Sparkles, Users, Star, ArrowRight, Clock } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { ANALYTICS_DAILY } from "@/lib/mockData";

const StatCard = ({ label, value, trend, icon: Icon, suffix = "" }: { label: string; value: string | number; trend: number; icon: any; suffix?: string }) => (
  <div className="glass-card p-5 hover:border-primary/30 transition-all group">
    <div className="flex items-start justify-between mb-3">
      <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
        <Icon size={18} className="text-primary" />
      </div>
      <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${trend >= 0 ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
        {trend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
        {trend >= 0 ? "+" : ""}{trend}%
      </div>
    </div>
    <div className="text-2xl font-bold">{typeof value === "number" ? value.toLocaleString() : value}{suffix}</div>
    <div className="text-sm text-muted-foreground mt-1">{label}</div>
  </div>
);

export default function Overview() {
  const { user } = useAuth();
  const recentPosts = MOCK_POSTS.filter(p => p.status === "published").slice(0, 3);
  const scheduledPosts = MOCK_POSTS.filter(p => p.status === "scheduled").slice(0, 3);

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="serif text-2xl md:text-3xl">
          Bonjour, <span className="text-primary">{user?.name.split(" ")[0]}</span> 👋
        </h1>
        <p className="text-muted-foreground mt-1">Voici un aperçu de vos performances aujourd'hui.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Posts ce mois" value={MOCK_STATS.postsThisMonth} trend={MOCK_STATS.postsTrend} icon={FileText} />
        <StatCard label="Portée totale" value="23.4k" trend={MOCK_STATS.reachTrend} icon={Eye} />
        <StatCard label="Engagement" value={MOCK_STATS.engagementRate} trend={MOCK_STATS.engagementTrend} icon={Heart} suffix="%" />
        <StatCard label="Générations IA" value={MOCK_STATS.aiGenerations} trend={MOCK_STATS.aiTrend} icon={Sparkles} />
      </div>

      {/* Chart */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-semibold text-lg">Portée & Engagement</h3>
            <p className="text-sm text-muted-foreground">30 derniers jours</p>
          </div>
          <div className="flex gap-4 text-xs">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-primary" /> Portée</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-accent" /> Engagement</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={ANALYTICS_DAILY}>
            <defs>
              <linearGradient id="gReach" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(174, 100%, 35%)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="hsl(174, 100%, 35%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gEng" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(38, 80%, 52%)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="hsl(38, 80%, 52%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "hsl(215, 20%, 60%)", fontSize: 11 }} interval={4} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: "hsl(215, 20%, 60%)", fontSize: 11 }} width={40} />
            <Tooltip contentStyle={{ background: "hsl(220, 30%, 13%)", border: "1px solid hsl(220, 20%, 20%)", borderRadius: 12, fontSize: 12 }} />
            <Area type="monotone" dataKey="reach" stroke="hsl(174, 100%, 35%)" fill="url(#gReach)" strokeWidth={2} />
            <Area type="monotone" dataKey="engagement" stroke="hsl(38, 80%, 52%)" fill="url(#gEng)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Recent published */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Publications récentes</h3>
            <a href="/dashboard/posts" className="text-xs text-primary hover:underline flex items-center gap-1">Voir tout <ArrowRight size={12} /></a>
          </div>
          <div className="space-y-3">
            {recentPosts.map(post => (
              <div key={post.id} className="flex items-start gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                  <FileText size={16} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{post.caption.slice(0, 60)}...</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span>{post.pageName}</span>
                    <span>•</span>
                    <span>Portée: {post.reach?.toLocaleString()}</span>
                    <span>•</span>
                    <span>{post.engagement}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scheduled */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Prochaines publications</h3>
            <a href="/dashboard/calendar" className="text-xs text-primary hover:underline flex items-center gap-1">Calendrier <ArrowRight size={12} /></a>
          </div>
          <div className="space-y-3">
            {scheduledPosts.map(post => (
              <div key={post.id} className="flex items-start gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0">
                  <Clock size={16} className="text-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{post.caption.slice(0, 60)}...</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span>{post.pageName}</span>
                    <span>•</span>
                    <span>{new Date(post.publishAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                </div>
                {post.aiGenerated && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium flex-shrink-0">IA</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pages summary */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Pages connectées</h3>
          <a href="/dashboard/pages" className="text-xs text-primary hover:underline flex items-center gap-1">Gérer <ArrowRight size={12} /></a>
        </div>
        <div className="grid md:grid-cols-3 gap-3">
          {MOCK_PAGES.map(page => (
            <div key={page.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${page.isActive ? "bg-primary/15 border border-primary/25" : "bg-muted border border-border"}`}>
                <Users size={16} className={page.isActive ? "text-primary" : "text-muted-foreground"} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{page.name}</div>
                <div className="text-xs text-muted-foreground">{page.followers.toLocaleString()} abonnés</div>
              </div>
              <div className={`w-2 h-2 rounded-full ${page.isActive ? "bg-emerald-400" : "bg-muted-foreground"}`} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
