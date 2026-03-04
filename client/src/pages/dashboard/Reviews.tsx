import { useState } from "react";
import { MOCK_REVIEWS, MockReview } from "@/lib/mockData";
import { Star, ExternalLink, Send, Filter } from "lucide-react";

export default function Reviews() {
  const [reviews, setReviews] = useState<MockReview[]>(MOCK_REVIEWS);
  const [filterSource, setFilterSource] = useState<string>("all");
  const [filterRating, setFilterRating] = useState<number>(0);

  const filtered = reviews.filter(r => {
    if (filterSource !== "all" && r.source !== filterSource) return false;
    if (filterRating > 0 && r.rating < filterRating) return false;
    return true;
  });

  const avgRating = (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1);
  const fiveStarPct = Math.round((reviews.filter(r => r.rating === 5).length / reviews.length) * 100);

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="serif text-2xl md:text-3xl">Avis clients</h1>
        <p className="text-muted-foreground text-sm mt-1">Suivez et publiez automatiquement vos meilleurs avis.</p>
      </div>

      {/* Summary */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="glass-card p-5 text-center">
          <div className="text-3xl font-bold text-accent">{avgRating}</div>
          <div className="flex justify-center gap-0.5 mt-1">
            {Array(5).fill(0).map((_, i) => (
              <Star key={i} size={14} className={i < Math.round(Number(avgRating)) ? "text-accent fill-accent" : "text-muted-foreground"} />
            ))}
          </div>
          <div className="text-xs text-muted-foreground mt-2">Note moyenne</div>
        </div>
        <div className="glass-card p-5 text-center">
          <div className="text-3xl font-bold">{reviews.length}</div>
          <div className="text-xs text-muted-foreground mt-2">Total avis</div>
        </div>
        <div className="glass-card p-5 text-center">
          <div className="text-3xl font-bold text-emerald-400">{fiveStarPct}%</div>
          <div className="text-xs text-muted-foreground mt-2">Avis 5 étoiles</div>
        </div>
        <div className="glass-card p-5 text-center">
          <div className="text-3xl font-bold text-primary">{reviews.filter(r => !r.handled).length}</div>
          <div className="text-xs text-muted-foreground mt-2">Non traités</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {["all", "google", "facebook"].map(s => (
          <button key={s} onClick={() => setFilterSource(s)}
            className={`px-4 py-2 rounded-lg text-sm transition-all ${filterSource === s ? "bg-primary/15 text-primary border border-primary/30" : "bg-muted/30 text-muted-foreground border border-transparent hover:border-border"}`}>
            {s === "all" ? "Toutes sources" : s === "google" ? "Google" : "Facebook"}
          </button>
        ))}
        <div className="w-px bg-border mx-1" />
        {[0, 5, 4, 3].map(r => (
          <button key={r} onClick={() => setFilterRating(r)}
            className={`px-3 py-2 rounded-lg text-sm transition-all ${filterRating === r ? "bg-accent/15 text-accent border border-accent/30" : "bg-muted/30 text-muted-foreground border border-transparent hover:border-border"}`}>
            {r === 0 ? "Toutes notes" : `${r}★+`}
          </button>
        ))}
      </div>

      {/* Reviews list */}
      <div className="space-y-3">
        {filtered.map(review => (
          <div key={review.id} className="glass-card p-5 hover:border-primary/20 transition-all">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm font-bold">
                    {review.reviewerName.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div>
                    <div className="font-medium text-sm">{review.reviewerName}</div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${review.source === "google" ? "bg-blue-500/10 text-blue-400" : "bg-blue-700/10 text-blue-300"}`}>
                        {review.source === "google" ? "Google" : "Facebook"}
                      </span>
                      <span>{new Date(review.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-0.5 mb-2">
                  {Array(5).fill(0).map((_, i) => (
                    <Star key={i} size={13} className={i < review.rating ? "text-accent fill-accent" : "text-muted-foreground"} />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">"{review.text}"</p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                {review.rating >= 4 && (
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-all">
                    <Send size={12} /> Publier
                  </button>
                )}
                <span className={`text-[11px] px-2 py-1 rounded-full ${review.handled ? "bg-emerald-500/10 text-emerald-400" : "bg-accent/10 text-accent"}`}>
                  {review.handled ? "Traité" : "Nouveau"}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
