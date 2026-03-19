import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Eye, EyeOff, Loader2, ChevronDown } from "lucide-react";

const SECTORS = [
  { value: "restaurant", label: "🍽️ Restaurant / Hôtellerie" },
  { value: "commerce", label: "🛍️ Commerce / Boutique" },
  { value: "agence", label: "📢 Agence de communication" },
  { value: "sante", label: "🏥 Santé / Bien-être" },
  { value: "education", label: "📚 Éducation / Formation" },
  { value: "tech", label: "💻 Technologie / IT" },
  { value: "autre", label: "🏢 Autre" },
];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", orgName: "", sector: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1);

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) { setError("Remplissez tous les champs."); return; }
    if (form.password.length < 6) { setError("Le mot de passe doit contenir au moins 6 caractères."); return; }
    setError("");
    setStep(2);
  };

  const handleStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.orgName || !form.sector) { setError("Remplissez tous les champs."); return; }
    setError("");
    setLoading(true);
    try {
      await register(form);
      navigate("/dashboard");
    } catch {
      setError("Erreur lors de l'inscription.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: "hsl(var(--fs-navy))" }}>
      <div className="hidden lg:flex flex-1 items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0" style={{
          background: "radial-gradient(ellipse 80% 60% at 30% 40%, hsl(var(--primary) / 0.15), transparent), radial-gradient(ellipse 60% 60% at 70% 70%, hsl(var(--accent) / 0.08), transparent)"
        }} />
        <div className="relative z-10 text-center px-12 max-w-lg">
          <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-8 shadow-lg shadow-primary/30">
            <span className="serif text-3xl font-bold text-primary-foreground">F</span>
          </div>
          <h1 className="serif text-5xl mb-4">Feo<span className="text-primary">Sync</span></h1>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Créez votre compte et commencez à automatiser vos publications en moins de 10 minutes.
          </p>
          <div className="mt-10 space-y-4 text-left mx-auto max-w-xs">
            {[
              "✓ 14 jours d'essai gratuit",
              "✓ Sans carte bancaire",
              "✓ Annulation à tout moment",
              "✓ Support en malgache & français",
            ].map(t => (
              <div key={t} className="text-sm text-muted-foreground flex items-center gap-2">
                <span className="text-primary">{t.slice(0, 1)}</span> {t.slice(2)}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-10 justify-center">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <span className="serif text-lg font-bold text-primary-foreground">F</span>
            </div>
            <span className="serif text-2xl">Feo<span className="text-primary">Sync</span></span>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-3 mb-8">
            {[1, 2].map(s => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${s <= step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                  {s}
                </div>
                <span className={`text-sm ${s <= step ? "text-foreground" : "text-muted-foreground"}`}>
                  {s === 1 ? "Compte" : "Organisation"}
                </span>
                {s === 1 && <div className="w-8 h-px bg-border mx-1" />}
              </div>
            ))}
          </div>

          <h2 className="serif text-3xl mb-2">
            {step === 1 ? "Créez votre compte" : "Votre entreprise"}
          </h2>
          <p className="text-muted-foreground mb-8">
            {step === 1 ? "Commencez votre essai gratuit de 14 jours." : "Quelques infos pour personnaliser votre expérience."}
          </p>

          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm mb-5">
              {error}
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleStep1} className="space-y-5">
              <div>
                <label className="text-sm font-medium text-foreground/80 mb-1.5 block">Nom complet</label>
                <input value={form.name} onChange={e => set("name", e.target.value)}
                  className="w-full h-12 px-4 rounded-xl bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="Hanta Rakoto" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground/80 mb-1.5 block">Email</label>
                <input type="email" value={form.email} onChange={e => set("email", e.target.value)}
                  className="w-full h-12 px-4 rounded-xl bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="votre@email.mg" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground/80 mb-1.5 block">Mot de passe</label>
                <div className="relative">
                  <input type={showPw ? "text" : "password"} value={form.password} onChange={e => set("password", e.target.value)}
                    className="w-full h-12 px-4 pr-12 rounded-xl bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="Min. 6 caractères" />
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <button type="submit"
                className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all">
                Continuer →
              </button>
            </form>
          ) : (
            <form onSubmit={handleStep2} className="space-y-5">
              <div>
                <label className="text-sm font-medium text-foreground/80 mb-1.5 block">Nom de l'entreprise</label>
                <input value={form.orgName} onChange={e => set("orgName", e.target.value)}
                  className="w-full h-12 px-4 rounded-xl bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="Le Grill d'Ivandry" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground/80 mb-1.5 block">Secteur d'activité</label>
                <div className="relative">
                  <select value={form.sector} onChange={e => set("sector", e.target.value)}
                    className="w-full h-12 px-4 rounded-xl bg-input border border-border text-foreground appearance-none focus:outline-none focus:ring-2 focus:ring-primary/50">
                    <option value="">Sélectionnez...</option>
                    {SECTORS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                  <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                </div>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(1)}
                  className="flex-1 h-12 rounded-xl border border-border text-foreground font-medium hover:bg-muted transition-all">
                  ← Retour
                </button>
                <button type="submit" disabled={loading}
                  className="flex-1 h-12 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                  {loading ? <Loader2 size={18} className="animate-spin" /> : null}
                  {loading ? "Création..." : "Créer mon compte"}
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 text-center">
            <span className="text-muted-foreground text-sm">Déjà un compte ? </span>
            <Link to="/login" className="text-primary font-medium hover:underline text-sm">Se connecter</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
