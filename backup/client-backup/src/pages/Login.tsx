import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("demo@feosync.mg");
  const [password, setPassword] = useState("demo1234");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) { setError("Veuillez remplir tous les champs."); return; }
    setLoading(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch {
      setError("Identifiants incorrects.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: "hsl(var(--fs-navy))" }}>
      {/* Left visual */}
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
            Synchronisez votre voix digitale. Automatisez vos publications Facebook & WhatsApp grâce à l'IA.
          </p>
          <div className="flex gap-6 justify-center mt-10">
            {[
              { val: "500+", label: "PME actives" },
              { val: "50k+", label: "Posts publiés" },
              { val: "98%", label: "Satisfaction" },
            ].map(s => (
              <div key={s.label} className="text-center">
                <div className="text-2xl font-bold text-primary">{s.val}</div>
                <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-10 justify-center">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <span className="serif text-lg font-bold text-primary-foreground">F</span>
            </div>
            <span className="serif text-2xl">Feo<span className="text-primary">Sync</span></span>
          </div>

          <h2 className="serif text-3xl mb-2">Bon retour 👋</h2>
          <p className="text-muted-foreground mb-8">Connectez-vous à votre tableau de bord.</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">
                {error}
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-foreground/80 mb-1.5 block">Email</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                className="w-full h-12 px-4 rounded-xl bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                placeholder="votre@email.mg"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground/80 mb-1.5 block">Mot de passe</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                  className="w-full h-12 px-4 pr-12 rounded-xl bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-border bg-input accent-primary" />
                <span className="text-muted-foreground">Se souvenir de moi</span>
              </label>
              <a href="#" className="text-primary hover:underline">Mot de passe oublié ?</a>
            </div>

            <button type="submit" disabled={loading}
              className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
              {loading ? <Loader2 size={18} className="animate-spin" /> : null}
              {loading ? "Connexion..." : "Se connecter"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <span className="text-muted-foreground text-sm">Pas encore de compte ? </span>
            <Link to="/register" className="text-primary font-medium hover:underline text-sm">S'inscrire gratuitement</Link>
          </div>

          <div className="mt-8 pt-6 border-t border-border/50 text-center text-xs text-muted-foreground">
            En vous connectant, vous acceptez nos <a href="#" className="text-primary hover:underline">CGU</a> et notre <a href="#" className="text-primary hover:underline">politique de confidentialité</a>.
          </div>
        </div>
      </div>
    </div>
  );
}
