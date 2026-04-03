"use client";

import { Zap } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useTheme } from "next-themes";
import { useDarkMode } from "@/hooks/useDarkMode";

const footerCols = [
  {
    title: "Produit",
    links: [
      { label: "Fonctionnalités", href: "#features" },
      { label: "Tarifs", href: "#pricing" },
      { label: "Intégrations", href: "#integrations" },
      { label: "Comment ça marche", href: "#how-it-works" },
    ],
  },
  {
    title: "Légal",
    links: [
      { label: "Confidentialité", href: "#" },
      { label: "CGU", href: "#" },
      { label: "Cookies", href: "#" },
      { label: "RGPD", href: "#" },
    ],
  },
  {
    title: "Canaux",
    links: [
      { label: "Facebook", href: "#" },
      { label: "WhatsApp", href: "#" },
      { label: "Instagram", href: "#" },
      { label: "LinkedIn", href: "#" },
    ],
  },
  {
    title: "Entreprise",
    links: [
      { label: "À propos", href: "#about" },
      { label: "Valeurs", href: "#values" },
      { label: "Contact", href: "#contact" },
      { label: "Partenaires", href: "#" },
    ],
  },
];

const Footer = () => {
  const router = useRouter();
  const { dark, toggle } = useDarkMode()   // ← destructure les deux

  return (
    <footer
      className="bg-card border-t border-google-border pt-20 pb-10 px-6"
      id="contact"
    >
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-6 gap-12 mb-16">
        {/* Brand */}
        <div className="col-span-2">
          <div className="w-56 h-16 relative mb-8">
            <Image
              src={
                dark
                  ? "/images/dark/feosync_logo.png"
                  : "/images/light/feosync_logo.png"
              }
              alt="FeoSync"
              width={32}
              height={32}
              className="w-full h-full"
            />
          </div>

          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xs leading-relaxed mb-6">
            La plateforme d'automatisation marketing n°1 à Madagascar, propulsée
            par l'Intéligence Artificielle.
          </p>

          {/* CTA */}
          {/* <button
            onClick={() => router.push('/login')}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-full transition-colors shadow-sm"
          >
            Démarrer gratuitement
          </button> */}
        </div>

        {/* Colonnes liens */}
        {footerCols.map((col) => (
          <div key={col.title}>
            <h4 className="font-medium text-sm text-slate-900 dark:text-white mb-5">
              {col.title}
            </h4>
            <ul className="space-y-3">
              {col.links.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div className="max-w-7xl mx-auto pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-[13px] text-slate-400 dark:text-slate-500">
        <p>© 2025 FeoSync · Made with ❤️ in Madagascar 🇲🇬</p>
        <div className="flex gap-6">
          <a
            href="#confidentialite"
            className="hover:text-blue-600 transition-colors"
          >
            Confidentialité
          </a>
          <a href="#cgu" className="hover:text-blue-600 transition-colors">
            Conditions
          </a>
          <a href="#cookies" className="hover:text-blue-600 transition-colors">
            Cookies
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
