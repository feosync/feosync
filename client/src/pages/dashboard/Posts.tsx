import { useState } from "react";
import { MOCK_POSTS, MockPost } from "@/lib/mockData";
import { Plus, Search, Filter, MoreHorizontal, Eye, Pencil, Trash2, Sparkles, Send, Facebook, MessageCircle } from "lucide-react";

const STATUS_CONFIG: Record<string, { label: string; class: string }> = {
  published: { label: "Publié", class: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  scheduled: { label: "Programmé", class: "bg-accent/10 text-accent border-accent/20" },
  draft: { label: "Brouillon", class: "bg-muted text-muted-foreground border-border" },
};

export default function Posts() {
  const [posts, setPosts] = useState<MockPost[]>(MOCK_POSTS);
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [newCaption, setNewCaption] = useState("");
  const [newChannel, setNewChannel] = useState<string[]>(["facebook"]);

  const filtered = posts.filter(p => {
    if (filter !== "all" && p.status !== filter) return false;
    if (search && !p.caption.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleCreate = () => {
    if (!newCaption.trim()) return;
    const newPost: MockPost = {
      id: "p" + Date.now(),
      caption: newCaption,
      imageUrl: "/placeholder.svg",
      status: "draft",
      channels: newChannel as any[],
      pageName: "Le Grill d'Ivandry",
      publishAt: "",
      aiGenerated: false,
    };
    setPosts([newPost, ...posts]);
    setNewCaption("");
    setShowCreate(false);
  };

  const handleDelete = (id: string) => {
    setPosts(posts.filter(p => p.id !== id));
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="serif text-2xl md:text-3xl">Publications</h1>
          <p className="text-muted-foreground text-sm mt-1">{posts.length} publications au total</p>
        </div>
        <button onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all">
          <Plus size={16} /> Nouveau post
        </button>
      </div>

      {/* Create dialog */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowCreate(false)}>
          <div className="bg-popover border border-border rounded-2xl shadow-2xl w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
            <h3 className="serif text-xl mb-4">Créer une publication</h3>
            <textarea value={newCaption} onChange={e => setNewCaption(e.target.value)}
              className="w-full h-32 p-4 rounded-xl bg-input border border-border text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="Rédigez votre publication..." />
            <div className="flex gap-2 mt-3">
              {["facebook", "whatsapp"].map(ch => (
                <button key={ch} onClick={() => setNewChannel(prev => prev.includes(ch) ? prev.filter(c => c !== ch) : [...prev, ch])}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm transition-all ${newChannel.includes(ch) ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"}`}>
                  {ch === "facebook" ? <Facebook size={14} /> : <MessageCircle size={14} />}
                  {ch === "facebook" ? "Facebook" : "WhatsApp"}
                </button>
              ))}
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowCreate(false)} className="flex-1 py-2.5 rounded-xl border border-border text-foreground hover:bg-muted transition-all">Annuler</button>
              <button onClick={handleCreate} className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all">Créer</button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted/50 border border-border/50 flex-1 max-w-sm">
          <Search size={15} className="text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..."
            className="bg-transparent border-none outline-none text-sm flex-1 text-foreground placeholder:text-muted-foreground" />
        </div>
        <div className="flex gap-2">
          {[
            { key: "all", label: "Tous" },
            { key: "published", label: "Publiés" },
            { key: "scheduled", label: "Programmés" },
            { key: "draft", label: "Brouillons" },
          ].map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className={`px-4 py-2 rounded-lg text-sm transition-all ${filter === f.key ? "bg-primary/15 text-primary border border-primary/30 font-medium" : "bg-muted/30 text-muted-foreground border border-transparent hover:border-border"}`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Posts list */}
      <div className="space-y-3">
        {filtered.map(post => (
          <div key={post.id} className="glass-card p-4 hover:border-primary/20 transition-all group">
            <div className="flex gap-4">
              <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center flex-shrink-0 border border-border">
                <img src={post.imageUrl} alt="" className="w-full h-full object-cover rounded-xl" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm leading-relaxed line-clamp-2">{post.caption}</p>
                  <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center"><Eye size={14} className="text-muted-foreground" /></button>
                    <button className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center"><Pencil size={14} className="text-muted-foreground" /></button>
                    <button onClick={() => handleDelete(post.id)} className="w-8 h-8 rounded-lg hover:bg-destructive/10 flex items-center justify-center"><Trash2 size={14} className="text-destructive" /></button>
                  </div>
                </div>
                <div className="flex items-center flex-wrap gap-2 mt-2">
                  <span className={`text-[11px] px-2 py-0.5 rounded-full border font-medium ${STATUS_CONFIG[post.status].class}`}>
                    {STATUS_CONFIG[post.status].label}
                  </span>
                  {post.channels.map(ch => (
                    <span key={ch} className="text-[11px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
                      {ch === "facebook" ? "📘 Facebook" : "💬 WhatsApp"}
                    </span>
                  ))}
                  {post.aiGenerated && (
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center gap-1">
                      <Sparkles size={10} /> IA
                    </span>
                  )}
                  <span className="text-[11px] text-muted-foreground ml-auto">{post.pageName}</span>
                  {post.publishAt && (
                    <span className="text-[11px] text-muted-foreground">
                      {new Date(post.publishAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </span>
                  )}
                  {post.reach !== undefined && (
                    <span className="text-[11px] text-muted-foreground">Portée: {post.reach.toLocaleString()}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-lg">Aucune publication trouvée</p>
            <p className="text-sm mt-1">Modifiez vos filtres ou créez un nouveau post.</p>
          </div>
        )}
      </div>
    </div>
  );
}
