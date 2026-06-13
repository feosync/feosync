import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

import { useDarkMode } from "@/hooks/useDarkMode";
import { X, MapPin, Mail, Twitter, Github, Linkedin } from "lucide-react";

const teamMembers = [
  {
    name: "THE Audio Nandraina",
    role: "CEO & Co-founder",
    avatar: "TH",
    color: "#4285F4",
    delay: 0,
    location: "Tananarive, Madagascar",
    email: "theaudio@feosync.com",
    bio: "Visionnaire passionnée par l'IA et l'innovation produit.",
    skills: ["Stratégie", "Leadership", "Product"],
    social: {
      twitter: "@theaudiomartin",
      linkedin: "theaudiomartin",
      github: "theaudio",
    },
    joined: "Fondateur · 2026",
  },
  {
    name: "Anicet Jhoniah Randrianambinina",
    role: "CTO & Co-founder",
    avatar: "AJ",
    color: "#EA4335",
    delay: 0.1,
    location: "Tananarive, Madagascar",
    email: "anicet@feosync.com",
    bio: "Architecte logiciel full-stack avec une expertise en IA.",
    skills: ["Architecture", "Cloud", "Rust"],
    social: {
      twitter: "@anicetrandrianambinina",
      linkedin: "anicetrandrianambinina",
      github: "anicet",
    },
    joined: "Fondateur · 2026",
  },
];

const stats = [
  { value: "2", label: "Membres" },
  { value: "1", label: "Pays" },
  { value: "99%", label: "Satisfaction" },
  { value: "4ans", label: "Expérience" },
];

type TeamMember = (typeof teamMembers)[0];

const desktopPositions = [
  { left: "8%", top: "12%" },
  { left: "42%", top: "6%" },
  { left: "76%", top: "12%" },
  { left: "8%", top: "62%" },
  { left: "42%", top: "68%" },
  { left: "76%", top: "62%" },
];

// ── Profile Modal ────────────────────────────────────────────────────────────
const ProfileModal = ({
  member,
  onClose,
}: {
  member: TeamMember;
  onClose: () => void;
}) => {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = "" };
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/50 dark:bg-black/80 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="relative w-full sm:max-w-sm rounded-t-3xl sm:rounded-2xl overflow-hidden bg-card border border-border shadow-2xl max-h-[92dvh] overflow-y-auto"
        initial={{ scale: 0.95, y: 60, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.95, y: 40, opacity: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 22 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle (mobile) */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-muted-foreground/20" />
        </div>

        {/* Header banner */}
        <div
          className="relative h-28 overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${member.color}33, ${member.color}11)`,
          }}
        >
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 360 112"
            preserveAspectRatio="xMidYMid slice"
          >
            <circle cx="300" cy="56" r="80" fill="none" stroke={member.color} strokeWidth="0.8" strokeOpacity="0.25" />
            <circle cx="300" cy="56" r="130" fill="none" stroke={member.color} strokeWidth="0.5" strokeOpacity="0.12" />
            <circle cx="60" cy="90" r="50" fill="none" stroke={member.color} strokeWidth="0.6" strokeOpacity="0.18" />
          </svg>
          <button
            onClick={onClose}
            className="absolute top-3 right-3 rounded-full p-1.5 transition-colors bg-black/10 dark:bg-white/10 text-foreground hover:bg-black/20 dark:hover:bg-white/20"
          >
            <X size={14} />
          </button>
          <div
            className="absolute bottom-3 left-20 text-[10px] font-semibold px-2.5 py-1 rounded-full text-white"
            style={{ background: member.color }}
          >
            {member.role}
          </div>
        </div>

        {/* Avatar */}
        <div className="absolute top-16 left-5">
          <motion.div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-lg border-2 border-card shadow-lg"
            style={{
              background: `linear-gradient(135deg, ${member.color}, ${member.color}cc)`,
            }}
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
          >
            {member.avatar}
          </motion.div>
        </div>

        {/* Body */}
        <div className="px-5 pt-12 pb-6">
          <div className="mb-3">
            <h2 className="text-lg font-bold text-foreground leading-tight">
              {member.name}
            </h2>
            <div className="flex items-center gap-3 mt-1 flex-wrap text-muted-foreground">
              <span className="flex items-center gap-1 text-xs">
                <MapPin size={11} /> {member.location}
              </span>
              <span className="flex items-center gap-1 text-xs">
                <Mail size={11} /> {member.email}
              </span>
            </div>
            <p className="text-xs mt-0.5 text-muted-foreground">
              {member.joined}
            </p>
          </div>
          <div className="my-3 border-t border-border" />
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
            {member.bio}
          </p>
          <div className="flex flex-wrap gap-1.5 mb-4">
            {member.skills.map((s) => (
              <span
                key={s}
                className="text-xs px-2.5 py-1 rounded-full font-medium bg-muted text-muted-foreground"
              >
                {s}
              </span>
            ))}
          </div>
          <div className="my-3 border-t border-border" />
          <div className="flex items-center gap-2 flex-wrap">
            {[
              { icon: <Twitter size={14} />, label: member.social.twitter },
              { icon: <Linkedin size={14} />, label: member.social.linkedin },
              { icon: <Github size={14} />, label: `@${member.social.github}` },
            ].map(({ icon, label }) => (
              <motion.button
                key={label}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-muted text-muted-foreground"
                whileHover={{
                  scale: 1.05,
                  background: `${member.color}22`,
                  color: member.color,
                }}
                whileTap={{ scale: 0.97 }}
              >
                {icon}
                <span>{label}</span>
              </motion.button>
            ))}
          </div>
        </div>
        <div
          className="h-0.5 w-full"
          style={{ background: `linear-gradient(90deg, ${member.color}, transparent)` }}
        />
      </motion.div>
    </motion.div>
  );
};

// ── Mobile team card (grid item) ─────────────────────────────────────────────
const MobileTeamCard = ({
  member,
  onClick,
}: {
  member: TeamMember;
  onClick: () => void;
}) => {
  return (
    <motion.div
      className="flex flex-col items-center gap-2 rounded-2xl p-4 cursor-pointer text-center bg-card/95 border border-border/70 shadow-md"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: member.delay * 0.6, duration: 0.5, type: "spring" }}
      whileHover={{ y: -3, boxShadow: `0 12px 28px ${member.color}35` }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
    >
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-md"
        style={{ background: member.color }}
      >
        {member.avatar}
      </div>
      <div>
        <p className="text-xs font-semibold leading-tight text-foreground">
          {member.name}
        </p>
        <p className="text-[10px] mt-0.5 text-muted-foreground">
          {member.role}
        </p>
      </div>
      <motion.div
        className="w-1.5 h-1.5 rounded-full"
        style={{ background: member.color }}
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 2, repeat: Infinity, delay: member.delay }}
      />
    </motion.div>
  );
};

// ── Main ─────────────────────────────────────────────────────────────────────
const About = () => {
  const { dark } = useDarkMode();
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  const heroBg = dark
    ? "linear-gradient(135deg, #0f1117 0%, #141a2e 50%, #1e1218 100%)"
    : "linear-gradient(135deg, #f8f9ff 0%, #e8f0fe 50%, #fce8e6 100%)";

  return (
    <section
      id="about"
      className="min-h-screen bg-background text-foreground"
    >
      {/* ── HERO ── */}
      <div className="min-h-screen relative flex justify-center items-center flex-col overflow-hidden px-4 py-24 sm:py-0 sm:h-screen sm:px-0">
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-[clamp(28px,4vw,44px)] font-bold tracking-[-0.01em] text-foreground mb-4"
        >
          Notre équipe
        </motion.h2>
        {/* ── DESKTOP orbital card ── */}
        <div
          className="hidden md:block w-5/6 h-1/2 rounded-2xl mt-8 relative overflow-hidden"
          style={{ background: heroBg }}
        >
          {/* Noise */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='${dark ? "0.035" : "0.025"}'/%3E%3C/svg%3E")`,
              mixBlendMode: "overlay",
            }}
          />

          {/* Nucleus */}
          <motion.span
            className="absolute rounded-full flex items-center justify-center will-change-transform"
            style={{
              width: 72,
              height: 72,
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              background: "linear-gradient(135deg, #4285F4, #EA4335)",
              boxShadow: dark
                ? "0 0 0 8px rgba(66,133,244,0.15), 0 0 0 20px rgba(66,133,244,0.07), 0 0 40px rgba(66,133,244,0.3)"
                : "0 0 0 8px rgba(66,133,244,0.12), 0 0 0 16px rgba(66,133,244,0.06)",
            }}
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <span className="text-white font-bold text-xl will-change-auto">
              We
            </span>
          </motion.span>

          {/* Desktop floating team cards */}
          {teamMembers.map((member, i) => (
            <motion.div
              key={member.name}
              className="absolute flex items-center gap-2 rounded-xl px-3 py-2 cursor-pointer bg-card/85 border-border/60 backdrop-blur-md shadow-lg"
              style={{
                left: desktopPositions[i].left,
                top: desktopPositions[i].top,
              }}
              initial={{ opacity: 0, scale: 0.6, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{
                delay: 0.3 + member.delay,
                duration: 0.5,
                type: "spring",
                stiffness: 120,
              }}
              whileHover={{
                scale: 1.08,
                boxShadow: `0 8px 28px ${member.color}${dark ? "55" : "35"}`,
              }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setSelectedMember(member)}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                style={{
                  background: member.color,
                  boxShadow: dark ? `0 0 10px ${member.color}60` : "none",
                }}
              >
                {member.avatar}
              </div>
              <div>
                <p className="text-xs font-semibold leading-none text-foreground">
                  {member.name}
                </p>
                <p className="text-[10px] leading-tight mt-0.5 text-muted-foreground">
                  {member.role}
                </p>
              </div>
              <motion.div
                className="w-1.5 h-1.5 rounded-full ml-1"
                style={{ background: member.color }}
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: member.delay,
                }}
              />
            </motion.div>
          ))}

        </div>

        {/* ── MOBILE layout ── */}
        <div className="md:hidden w-full flex flex-col gap-6">
          {/* Mobile hero banner */}
          <motion.div
            className="relative rounded-2xl overflow-hidden mx-0 p-6 pb-0"
            style={{ background: heroBg }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Rings (smaller) */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox="0 0 400 200"
              preserveAspectRatio="xMidYMid meet"
            >
              <ellipse
                cx="200"
                cy="80"
                rx="160"
                ry="55"
                fill="none"
                stroke="#4285F4"
                strokeOpacity="0.25"
                strokeWidth="1.2"
                strokeDasharray="5 3"
              />
              <ellipse
                cx="200"
                cy="80"
                rx="100"
                ry="35"
                fill="none"
                stroke="#EA4335"
                strokeOpacity="0.2"
                strokeWidth="1"
                strokeDasharray="3 4"
              />
            </svg>

            {/* Top: nucleus + title */}
            <div className="relative flex items-center gap-4 mb-6">
              <motion.div
                className="rounded-full flex items-center justify-center shrink-0"
                style={{
                  width: 56,
                  height: 56,
                  background: "linear-gradient(135deg, #4285F4, #EA4335)",
                  boxShadow: dark
                    ? "0 0 0 6px rgba(66,133,244,0.15), 0 0 20px rgba(66,133,244,0.3)"
                    : "0 0 0 6px rgba(66,133,244,0.1)",
                }}
                animate={{ scale: [1, 1.06, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <span className="text-white font-bold text-base">We</span>
              </motion.div>
              <div>
                <h3 className="text-2xl font-ui font-black text-foreground leading-tight">
                  Notre équipe
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Des talents du monde entier
                </p>
              </div>
            </div>

            {/* Stats row */}
            <div className="relative grid grid-cols-4 gap-1 pb-5 border-t border-primary/15 pt-[14px]">
              {stats.map((s) => (
                <div key={s.label} className="text-center">
                  <p className="text-base font-bold leading-none text-primary">
                    {s.value}
                  </p>
                  <p className="text-[10px] mt-0.5 text-muted-foreground">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Mobile team grid */}
          <div className="grid grid-cols-3 gap-3 px-1">
            {teamMembers.map((member) => (
              <MobileTeamCard
                key={member.name}
                member={member}
                onClick={() => setSelectedMember(member)}
              />
            ))}
          </div>

          {/* Tap hint */}
          <motion.p
            className="text-center text-xs text-muted-foreground pb-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            Appuyez sur un profil pour en savoir plus
          </motion.p>
        </div>

        {/* ── Shared title + description (desktop only, mobile has it in banner) ── */}
        <motion.h3
          className="hidden md:block p-8 text-4xl font-ui font-bold text-foreground"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.6 }}
        >
          A propos de nous
        </motion.h3>

        <motion.p
          className="hidden md:block text-center w-2/3 lg:w-1/2 text-lg text-muted-foreground"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3, duration: 0.6 }}
        >
          Nous sommes partis d'un constat simple et révoltant : les personnes
          les plus créatives du digital passent la majorité de leur temps à
          faire des choses qui n'ont rien à voir avec la création. Programmer.
          Reformater. Republier. Adapter. Recommencer. FeoSync est né du refus
          que ça soit une fatalité. Nous sommes une équipe convaincue que la
          technologie doit travailler pour les créateurs — pas l'inverse. Alors
          nous avons construit une plateforme qui absorbe la complexité des
          réseaux sociaux, pour rendre aux community managers, aux entrepreneurs
          et aux marques ce qui leur appartient vraiment : leur énergie, leur
          intention, leur liberté. Ce n'est pas un outil de productivité. C'est
          une prise de position.
        </motion.p>

        {/* Mobile description */}
        <motion.p
          className="md:hidden text-center text-base text-muted-foreground px-6 pb-4 leading-relaxed"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          Une équipe diverse et passionnée, construisant le futur de FeoSync
          depuis 4 continents.
        </motion.p>
      </div>

      {/* Profile modal */}
      <AnimatePresence>
        {selectedMember && (
          <ProfileModal
            member={selectedMember}
            onClose={() => setSelectedMember(null)}
          />
        )}
      </AnimatePresence>
    </section>
  );
};

export default About;
