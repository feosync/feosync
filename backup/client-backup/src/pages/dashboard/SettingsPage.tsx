import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Save, User, Building, Palette, Bell, Shield, CreditCard, Check } from "lucide-react";

export default function SettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const tabs = [
    { id: "profile", label: "Profil", icon: User },
    { id: "org", label: "Organisation", icon: Building },
    { id: "brand", label: "Marque & IA", icon: Palette },
    { id: "notifs", label: "Notifications", icon: Bell },
    { id: "security", label: "Sécurité", icon: Shield },
    { id: "billing", label: "Abonnement", icon: CreditCard },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="serif text-2xl md:text-3xl">Paramètres</h1>
        <p className="text-muted-foreground text-sm mt-1">Gérez votre compte et votre organisation.</p>
      </div>

      <div className="flex gap-2 flex-wrap border-b border-border pb-1">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm transition-all ${activeTab === tab.id ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:text-foreground hover:bg-muted/30"}`}>
            <tab.icon size={15} /> {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "profile" && (
        <div className="glass-card p-6 space-y-5">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center text-xl font-bold text-primary-foreground">
              {user?.name.split(" ").map(n => n[0]).join("")}
            </div>
            <div>
              <div className="font-semibold text-lg">{user?.name}</div>
              <div className="text-sm text-muted-foreground">{user?.email}</div>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-primary/10 text-primary mt-1 inline-block">Plan {user?.plan}</span>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Nom complet</label>
              <input defaultValue={user?.name} className="w-full h-11 px-4 rounded-xl bg-input border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Email</label>
              <input defaultValue={user?.email} className="w-full h-11 px-4 rounded-xl bg-input border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
          </div>
          <button onClick={handleSave}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all">
            {saved ? <Check size={16} /> : <Save size={16} />}
            {saved ? "Enregistré !" : "Enregistrer"}
          </button>
        </div>
      )}

      {activeTab === "org" && (
        <div className="glass-card p-6 space-y-5">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Nom de l'entreprise</label>
              <input defaultValue={user?.orgName} className="w-full h-11 px-4 rounded-xl bg-input border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Secteur</label>
              <input defaultValue="Restaurant / Hôtellerie" className="w-full h-11 px-4 rounded-xl bg-input border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Profil éditorial (contexte IA)</label>
            <textarea defaultValue="Restaurant gastronomique malgache situé à Ivandry, Antananarivo. Cuisine traditionnelle revisitée avec des produits locaux. Ambiance chaleureuse et familiale. Ton professionnel mais accessible."
              className="w-full h-24 p-4 rounded-xl bg-input border border-border text-foreground text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50" />
          </div>
          <button onClick={handleSave}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all">
            {saved ? <Check size={16} /> : <Save size={16} />}
            {saved ? "Enregistré !" : "Enregistrer"}
          </button>
        </div>
      )}

      {activeTab === "brand" && (
        <div className="glass-card p-6 space-y-5">
          <div>
            <label className="text-sm font-medium mb-3 block">Couleurs de marque</label>
            <div className="flex gap-3">
              {["#0B1D3A", "#00B4A2", "#E8A020", "#E53E3E"].map((c, i) => (
                <div key={i} className="w-12 h-12 rounded-xl border-2 border-border cursor-pointer hover:scale-110 transition-transform" style={{ background: c }} />
              ))}
              <div className="w-12 h-12 rounded-xl border-2 border-dashed border-border flex items-center justify-center cursor-pointer text-muted-foreground hover:border-primary">+</div>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Ton IA par défaut</label>
            <select className="w-full h-11 px-4 rounded-xl bg-input border border-border text-foreground text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-primary/50">
              <option>Professionnel</option>
              <option>Décontracté</option>
              <option>Humoristique</option>
              <option>Inspirant</option>
            </select>
          </div>
          <button onClick={handleSave}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all">
            {saved ? <Check size={16} /> : <Save size={16} />}
            {saved ? "Enregistré !" : "Enregistrer"}
          </button>
        </div>
      )}

      {activeTab === "notifs" && (
        <div className="glass-card p-6 space-y-4">
          {[
            { label: "Rapports hebdomadaires par email", desc: "Recevez un résumé chaque lundi matin", default: true },
            { label: "Alertes publication échouée", desc: "Notification immédiate en cas d'erreur", default: true },
            { label: "Nouveaux avis clients", desc: "Soyez notifié des nouveaux avis 4★ et 5★", default: true },
            { label: "Notifications WebSocket temps réel", desc: "Mises à jour en direct dans le dashboard", default: true },
            { label: "Emails marketing FeoSync", desc: "Nouveautés, tutoriels et conseils", default: false },
          ].map((n, i) => (
            <div key={i} className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
              <div>
                <div className="text-sm font-medium">{n.label}</div>
                <div className="text-xs text-muted-foreground">{n.desc}</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked={n.default} className="sr-only peer" />
                <div className="w-11 h-6 bg-muted peer-focus:ring-2 peer-focus:ring-primary/30 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-foreground after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          ))}
        </div>
      )}

      {activeTab === "security" && (
        <div className="glass-card p-6 space-y-5">
          <div>
            <label className="text-sm font-medium mb-1.5 block">Mot de passe actuel</label>
            <input type="password" placeholder="••••••••" className="w-full h-11 px-4 rounded-xl bg-input border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Nouveau mot de passe</label>
              <input type="password" placeholder="Min. 8 caractères" className="w-full h-11 px-4 rounded-xl bg-input border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Confirmer</label>
              <input type="password" placeholder="Confirmez" className="w-full h-11 px-4 rounded-xl bg-input border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
          </div>
          <button onClick={handleSave}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all">
            Mettre à jour le mot de passe
          </button>
        </div>
      )}

      {activeTab === "billing" && (
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-lg">Plan Business</h3>
              <p className="text-sm text-muted-foreground">59 149 Ar/mois · Renouvellement le 1er avril 2026</p>
            </div>
            <button className="px-4 py-2 rounded-xl border border-primary/30 text-primary text-sm font-medium hover:bg-primary/10 transition-all">
              Changer de plan
            </button>
          </div>
          <div className="grid md:grid-cols-3 gap-3">
            {[
              { label: "Pages Facebook", used: "3/5", pct: 60 },
              { label: "Posts ce mois", used: "47/100", pct: 47 },
              { label: "Générations IA", used: "32/50", pct: 64 },
            ].map(u => (
              <div key={u.label} className="p-3 rounded-xl bg-muted/30">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-muted-foreground">{u.label}</span>
                  <span className="font-medium">{u.used}</span>
                </div>
                <div className="w-full h-2 rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${u.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
