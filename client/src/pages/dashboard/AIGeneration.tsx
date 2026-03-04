import { useState } from "react";
import { Sparkles, Loader2, Copy, Check, RefreshCw, Wand2, ImageIcon } from "lucide-react";

const TONES = ["Professionnel", "Décontracté", "Humoristique", "Inspirant", "Urgent"];
const SECTORS = ["Restaurant", "Commerce", "Hôtellerie", "Agence", "Autre"];

const MOCK_VARIANTS = [
  "🔥 Notre plat signature est de retour ! Le Ravitoto croustillant, préparé avec amour chaque matin. Réservez votre table et vivez une expérience culinaire unique à Ivandry. #FoodTana #Ravitoto #CuisineMalgache",
  "📍 Envie d'une pause gourmande ? Notre Ravitoto croustillant vous attend au Grill d'Ivandry ! Ingrédients frais, recette traditionnelle, goût incomparable. 🇲🇬 #PlainDuJour #Ivandry #GastronomieLocale",
  "✨ Le secret de notre Ravitoto ? Un savoir-faire transmis depuis 3 générations. Venez découvrir ce classique revisité au cœur d'Ivandry. Service midi & soir. #Heritage #MadagascarFood #LeGrill",
];

export default function AIGeneration() {
  const [content, setContent] = useState("Ravitoto croustillant au porc, servi avec riz blanc et rougail. Prix: 18 000 Ar. Disponible midi et soir.");
  const [tone, setTone] = useState("Professionnel");
  const [mode, setMode] = useState<"A" | "B">("A");
  const [generating, setGenerating] = useState(false);
  const [variants, setVariants] = useState<string[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [imageGenerated, setImageGenerated] = useState(false);

  const handleGenerate = async () => {
    setGenerating(true);
    setVariants([]);
    setSelectedVariant(null);
    setImageGenerated(false);
    await new Promise(r => setTimeout(r, 2000));
    setVariants(MOCK_VARIANTS);
    setSelectedVariant(0);
    setImageGenerated(true);
    setGenerating(false);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="serif text-2xl md:text-3xl flex items-center gap-3">
          <Sparkles className="text-primary" size={28} />
          Génération IA
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Générez des légendes et visuels professionnels avec Gemini 2.0 Flash.</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Input */}
        <div className="lg:col-span-2 space-y-4">
          <div className="glass-card p-5 space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Mode de génération</label>
              <div className="flex gap-2">
                {(["A", "B"] as const).map(m => (
                  <button key={m} onClick={() => setMode(m)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${mode === m ? "bg-primary/15 text-primary border border-primary/30" : "bg-muted/30 text-muted-foreground border border-transparent hover:border-border"}`}>
                    Mode {m} — {m === "A" ? "Auto" : "Prompt libre"}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">
                {mode === "A" ? "Contenu source" : "Votre prompt"}
              </label>
              <textarea value={content} onChange={e => setContent(e.target.value)}
                className="w-full h-28 p-3 rounded-xl bg-input border border-border text-foreground text-sm placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder={mode === "A" ? "Décrivez le contenu à publier..." : "Rédigez votre prompt personnalisé..."} />
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">Ton</label>
              <div className="flex flex-wrap gap-2">
                {TONES.map(t => (
                  <button key={t} onClick={() => setTone(t)}
                    className={`px-3 py-1.5 rounded-lg text-xs transition-all ${tone === t ? "bg-primary/15 text-primary border border-primary/30" : "bg-muted/30 text-muted-foreground border border-transparent hover:border-border"}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <button onClick={handleGenerate} disabled={generating || !content.trim()}
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
              {generating ? <Loader2 size={18} className="animate-spin" /> : <Wand2 size={18} />}
              {generating ? "Génération en cours..." : "Générer avec Gemini 2.0"}
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-3 space-y-4">
          {variants.length === 0 && !generating ? (
            <div className="glass-card p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
                <Sparkles size={28} className="text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Prêt à générer</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                Décrivez votre contenu, choisissez le ton, et laissez l'IA créer 3 variantes de légende + un visuel professionnel.
              </p>
            </div>
          ) : generating ? (
            <div className="glass-card p-12 text-center">
              <Loader2 size={40} className="text-primary animate-spin mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">Gemini 2.0 Flash en action...</h3>
              <p className="text-sm text-muted-foreground">Génération de 3 variantes de légende + visuel 1080×1080</p>
            </div>
          ) : (
            <>
              {/* Image preview */}
              {imageGenerated && (
                <div className="glass-card p-4 flex items-center gap-4">
                  <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 flex items-center justify-center flex-shrink-0">
                    <ImageIcon size={28} className="text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">Visuel 1080×1080 généré</div>
                    <div className="text-xs text-muted-foreground mt-1">Image + overlay template + logo · JPEG · 245 KB</div>
                  </div>
                  <button className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-all">
                    Télécharger
                  </button>
                </div>
              )}

              {/* Variants */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">3 variantes de légende</h3>
                  <button onClick={handleGenerate} className="flex items-center gap-1.5 text-xs text-primary hover:underline">
                    <RefreshCw size={12} /> Regénérer
                  </button>
                </div>
                {variants.map((v, i) => (
                  <div key={i} onClick={() => setSelectedVariant(i)}
                    className={`glass-card p-4 cursor-pointer transition-all ${selectedVariant === i ? "border-primary/50 bg-primary/5" : "hover:border-border"}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${selectedVariant === i ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                          {i + 1}
                        </span>
                        <span className="text-xs text-muted-foreground">Variante {i + 1}</span>
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); handleCopy(v); }}
                        className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center flex-shrink-0">
                        {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} className="text-muted-foreground" />}
                      </button>
                    </div>
                    <p className="text-sm leading-relaxed">{v}</p>
                  </div>
                ))}
              </div>

              {selectedVariant !== null && (
                <button className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all">
                  Utiliser la variante {selectedVariant + 1} → Créer le post
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
