import { MOCK_PAGES } from "@/lib/mockData";
import { Globe, Plus, RefreshCw, MoreHorizontal, Users, FileText, Activity } from "lucide-react";

export default function PagesPage() {
  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="serif text-2xl md:text-3xl">Pages Facebook</h1>
          <p className="text-muted-foreground text-sm mt-1">Gérez vos pages connectées via OAuth Meta.</p>
        </div>
        <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all">
          <Plus size={16} /> Connecter une page
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {MOCK_PAGES.map(page => (
          <div key={page.id} className="glass-card p-5 hover:border-primary/20 transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${page.isActive ? "bg-blue-500/10 border border-blue-500/25" : "bg-muted border border-border"}`}>
                  <Globe size={20} className={page.isActive ? "text-blue-400" : "text-muted-foreground"} />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">{page.name}</h3>
                  <span className={`text-[11px] px-2 py-0.5 rounded-full ${page.isActive ? "bg-emerald-500/10 text-emerald-400" : "bg-muted text-muted-foreground"}`}>
                    {page.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
              <button className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center">
                <MoreHorizontal size={16} className="text-muted-foreground" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="text-center p-2 rounded-lg bg-muted/30">
                <Users size={14} className="text-muted-foreground mx-auto mb-1" />
                <div className="text-sm font-bold">{page.followers.toLocaleString()}</div>
                <div className="text-[10px] text-muted-foreground">Abonnés</div>
              </div>
              <div className="text-center p-2 rounded-lg bg-muted/30">
                <FileText size={14} className="text-muted-foreground mx-auto mb-1" />
                <div className="text-sm font-bold">{page.postsThisMonth}</div>
                <div className="text-[10px] text-muted-foreground">Posts/mois</div>
              </div>
              <div className="text-center p-2 rounded-lg bg-muted/30">
                <Activity size={14} className="text-muted-foreground mx-auto mb-1" />
                <div className="text-sm font-bold">8.2%</div>
                <div className="text-[10px] text-muted-foreground">Engage.</div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border/50">
              <span>Dernière sync: {new Date(page.lastSync).toLocaleDateString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
              <button className="flex items-center gap-1 text-primary hover:underline">
                <RefreshCw size={12} /> Sync
              </button>
            </div>
          </div>
        ))}

        {/* Add page card */}
        <div className="border-2 border-dashed border-border rounded-2xl p-5 flex flex-col items-center justify-center text-center min-h-[220px] hover:border-primary/30 transition-all cursor-pointer group">
          <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-3 group-hover:bg-primary/10 transition-colors">
            <Plus size={20} className="text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
          <h3 className="font-medium text-sm mb-1">Connecter une nouvelle page</h3>
          <p className="text-xs text-muted-foreground">Via OAuth Meta sécurisé</p>
        </div>
      </div>
    </div>
  );
}
