"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  Play,
  CheckCircle2,
  TrendingUp,
  Heart,
  ThumbsUp,
  MessageCircle,
} from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useRouter } from "next/navigation";

/* ── Données ── */
const chartData = [
  { day: "Lun", facebook: 1200, whatsapp: 800, instagram: 540 },
  { day: "Mar", facebook: 1900, whatsapp: 1100, instagram: 780 },
  { day: "Mer", facebook: 1400, whatsapp: 950, instagram: 620 },
  { day: "Jeu", facebook: 2800, whatsapp: 1600, instagram: 1100 },
  { day: "Ven", facebook: 2100, whatsapp: 1300, instagram: 870 },
  { day: "Sam", facebook: 3400, whatsapp: 2200, instagram: 1540 },
  { day: "Dim", facebook: 2900, whatsapp: 1800, instagram: 1250 },
];

const chartConfig = {
  facebook: { label: "Facebook", color: "#1877F2" },
  whatsapp: { label: "WhatsApp", color: "#25D366" },
  instagram: { label: "Instagram", color: "#E1306C" },
};

const totalReach = chartData.reduce(
  (s, d) => s + d.facebook + d.whatsapp + d.instagram,
  0,
);
const bestDay = chartData.reduce(
  (best, d) => {
    const total = d.facebook + d.whatsapp + d.instagram;
    return total > best.total ? { day: d.day, total } : best;
  },
  { day: "", total: 0 },
);

/* ══════════════════════════════════════
   BUBBLE — Facebook
══════════════════════════════════════ */
const FacebookBubble = () => (
  <motion.div
    initial={{ opacity: 0, x: 30, y: -10, scale: 0.85 }}
    animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
    transition={{ delay: 0.9, type: "spring", stiffness: 160, damping: 18 }}
    className="absolute -top-6 right-2 sm:-top-6 sm:-right-4 z-20 w-[180px] sm:w-[210px]"
    style={{ willChange: "transform" }}
  >
    <motion.div
      animate={{ y: [0, -6, 0] }}
      transition={{
        duration: 3.5,
        repeat: Infinity,
        ease: "easeInOut",
        delay: 1.3,
      }}
      style={{ willChange: "transform", transform: "translateZ(0)" }}
    >
      {/* Bulle — utilise bg-card + border-border pour s'adapter au thème */}
      <div className="flex items-start gap-2 px-3 py-2.5 rounded-2xl bg-card border border-border shadow-lg">
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-xs shadow-sm"
          style={{ background: "linear-gradient(135deg,#1877F2,#42a5f5)" }}
        >
          f
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-0.5">
            <span
              className="text-[10px] font-bold uppercase tracking-wider"
              style={{ color: "#1877F2" }}
            >
              Facebook
            </span>
            <span className="text-[9px] text-muted-foreground ml-1">
              maintenant
            </span>
          </div>
          <p className="text-[11px] font-semibold text-foreground leading-tight">
            Post publié avec succès ✓
          </p>
          <div className="flex items-center gap-1.5 mt-1">
            <div className="flex -space-x-0.5">
              {[
                {
                  bg: "#1877F2",
                  icon: <ThumbsUp size={6} className="text-white" />,
                },
                {
                  bg: "#E1306C",
                  icon: <Heart size={6} className="text-white" />,
                },
              ].map(({ bg, icon }, i) => (
                <div
                  key={i}
                  className="w-3.5 h-3.5 rounded-full flex items-center justify-center"
                  style={{ background: bg, border: "1.5px solid var(--card)" }}
                >
                  {icon}
                </div>
              ))}
            </div>
            <span className="text-[9px] text-muted-foreground">124</span>
            <MessageCircle size={9} className="text-muted-foreground ml-0.5" />
            <span className="text-[9px] text-muted-foreground">18</span>
          </div>
        </div>
      </div>
      {/* Tail */}
      <div
        className="absolute -bottom-1.5 right-8 w-3 h-3 rotate-45 bg-card"
        style={{
          borderRight: "1px solid var(--border)",
          borderBottom: "1px solid var(--border)",
        }}
      />
    </motion.div>
  </motion.div>
);

/* ══════════════════════════════════════
   BUBBLE — WhatsApp
══════════════════════════════════════ */
const WhatsAppBubble = () => (
  <motion.span
    initial={{ opacity: 0, x: -30, y: 10, scale: 0.85 }}
    animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
    transition={{ delay: 1.2, type: "spring", stiffness: 160, damping: 18 }}
    className="absolute -bottom-6 left-2 sm:-bottom-6 sm:-left-4 z-20 w-[180px] sm:w-[210px]"
    style={{ willChange: "transform" }}
  >
    <motion.div
      animate={{ y: [0, -6, 0] }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut",
        delay: 1.5,
      }}
      style={{ willChange: "transform", transform: "translateZ(0)" }}
    >
      {/* Tail */}
      <div
        className="absolute -top-1.5 left-8 w-3 h-3 rotate-45 bg-card"
        style={{
          borderLeft: "1px solid var(--border)",
          borderTop: "1px solid var(--border)",
        }}
      />

      <div className="flex items-start gap-2 px-3 py-2.5 rounded-2xl bg-card border border-border shadow-lg">
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm"
          style={{ background: "linear-gradient(135deg,#25D366,#128C7E)" }}
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="white"
            aria-hidden="true"
          >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-0.5">
            <span
              className="text-[10px] font-bold uppercase tracking-wider"
              style={{ color: "#25D366" }}
            >
              WhatsApp
            </span>
            <span className="text-[9px] text-muted-foreground ml-1">1 min</span>
          </div>
          <p className="text-[11px] font-semibold text-foreground leading-tight">
            892 vues sur votre canal 👁️
          </p>
          <div className="flex items-center gap-1.5 mt-1">
            {["❤️", "🔥", "👏"].map((e, i) => (
              <span key={i} className="text-[10px]">
                {e}
              </span>
            ))}
            <span className="text-[9px] text-muted-foreground ml-0.5">
              47 réactions
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  </motion.span>
);

/* ══════════════════════════════════════
   HERO
══════════════════════════════════════ */
const Hero = () => {
  const router = useRouter();
  return (
    <section
      id="#"
      className="pt-24 sm:pt-32 pb-16 sm:pb-20 px-4 sm:px-6"
    >
      <div className="max-w-7xl h-max lg:h-[90vh] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 items-center">
        {/* ── LEFT ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center lg:text-left"
        >
          <h1 className="text-[clamp(36px,6.5vw,70px)] leading-[1.05] tracking-[-0.02em] font-bold text-foreground mb-5 sm:mb-6">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-chart-1">
              Penser, inspirer, imaginer et créer
            </span>
            <br />
            feosync gére le
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-chart-1">
              reste pour vous!
            </span>
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground max-w-lg mb-8 sm:mb-10 leading-relaxed mx-auto lg:mx-0">
            Vos réseaux sociaux méritent une présence constante. FeoSync
            automatise vos publications et met l'IA à votre service — pour que
            chaque post reflète vraiment votre vision.
          </p>

          <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 items-center lg:items-start justify-center lg:justify-start">
            <motion.button
              onClick={() => router.push("/login")}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
               className="w-full sm:w-auto h-12 sm:h-14 px-6 sm:px-8 rounded-[24px]
                          bg-primary text-primary-foreground
                          text-sm sm:text-base font-medium
                          flex items-center justify-center gap-2
                          hover:bg-primary/90
                          hover:shadow-lg hover:shadow-primary/20 transition-all"
            >
              Commencer gratuitement <ArrowRight size={18} />
            </motion.button>

            <motion.a
              href="#demo"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
               className="w-full sm:w-auto h-12 sm:h-14 px-6 sm:px-8 rounded-[24px]
                          border border-border text-primary
                          text-sm sm:text-base font-medium
                          flex items-center justify-center gap-2
                          hover:bg-secondary transition-all"
            >
              Voir la démo <Play size={16} className="fill-current" />
            </motion.a>
          </div>
        </motion.div>

        {/* ── RIGHT — Chart + bulles ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="relative mt-8 lg:mt-0 px-3 sm:px-6 pt-0 lg:pt-16 lg:pb-16 pb-8 min-h-[40vh] lg:min-h-0 flex justify-center items-center"
        >
          {/* Glows */}
          <div className="absolute -top-10 -right-10 w-52 sm:w-64 h-52 sm:h-64 bg-chart-1/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-52 sm:w-64 h-52 sm:h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

          <FacebookBubble />
          <WhatsAppBubble />

          <Card className="relative z-10 w-full shadow-xl border-border h-max">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[11px] text-primary font-medium">
                  <motion.div
                    animate={{ opacity: [1, 0.4, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="w-2 h-2 rounded-full bg-chart-1"
                  />
                  En direct
                </div>
              </div>
              <CardDescription className="text-[11px] sm:text-[12px] text-muted-foreground mt-1">
                Facebook, WhatsApp & Instagram · 7 derniers jours
              </CardDescription>
            </CardHeader>

            {/* Mini stats */}
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2 px-4 sm:px-6 mb-2">
              {[
                {
                  label: "Portée totale",
                  value: `${(totalReach / 1000).toFixed(0)}k`,
                  color: "text-primary",
                },
                {
                  label: "Meilleur jour",
                  value: bestDay.day,
                  color: "text-chart-1",
                },
                { label: "Posts publiés", value: "24", color: "text-chart-5" },
              ].map(({ label, value, color }) => (
                <div
                  key={label}
                  className="bg-muted/50 rounded-xl px-2 sm:px-3 py-2 sm:py-2.5 text-center"
                >
                  <p className="text-[9px] sm:text-[10px] text-muted-foreground mb-0.5 sm:mb-1 leading-tight">
                    {label}
                  </p>
                  <p
                    className={`text-[15px] sm:text-[18px] font-bold leading-none ${color}`}
                  >
                    {value}
                  </p>
                </div>
              ))}
            </div>

            <CardContent className="pt-2 px-3 sm:px-6">
              <ChartContainer
                config={chartConfig}
                className="h-[200px] sm:h-[250px] lg:h-[290px] w-full"
              >
                <AreaChart
                  data={chartData}
                  margin={{ top: 4, right: 4, left: -28, bottom: 0 }}
                >
                  <defs>
                    {Object.entries(chartConfig).map(([key, { color }]) => (
                      <linearGradient
                        key={key}
                        id={`fill-${key}`}
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                        <stop
                          offset="95%"
                          stopColor={color}
                          stopOpacity={0.0}
                        />
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid
                    vertical={false}
                    stroke="hsl(var(--border))"
                    strokeDasharray="3 3"
                  />
                  <XAxis
                    dataKey="day"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={6}
                    tick={{ fontSize: 10 }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 9 }}
                    tickFormatter={(v) => (v >= 1000 ? `${v / 1000}k` : v)}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="dot" />}
                  />
                  {Object.entries(chartConfig).map(([key, { color }]) => (
                    <Area
                      key={key}
                      type="monotone"
                      dataKey={key}
                      stroke={color}
                      strokeWidth={2}
                      fill={`url(#fill-${key})`}
                      dot={false}
                      activeDot={{ r: 4, strokeWidth: 0 }}
                    />
                  ))}
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
