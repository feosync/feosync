"use client";

import { Logo } from "@/components/ui/Logo";

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
  return (
    <footer
      className="bg-card border-t border-border pt-20 pb-10 px-6"
      id="contact"
    >
      <div className="max-w-7xl xl:max-w-5/6 mx-auto grid grid-cols-2 md:grid-cols-6 gap-12 mb-16">
        {/* Brand */}
        <div className="col-span-2">
          <Logo logoClassName="h-10 md:h-24 mb-8" />

          <p className="text-muted-foreground text-sm max-w-xs leading-relaxed mb-6">
            La plateforme d'automatisation marketing n°1 à Madagascar, propulsée
            par l'Intéligence Artificielle.
          </p>
        </div>

        {/* Colonnes liens */}
        {footerCols.map((col) => (
          <div key={col.title}>
            <h4 className="font-medium text-sm text-foreground mb-5">
              {col.title}
            </h4>
            <ul className="space-y-3">
              {col.links.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
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
      <div className="max-w-7xl xl:max-w-5/6 mx-auto pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4 text-[13px] text-muted-foreground">
        <p>© 2025 FeoSync · Made with ❤️ in Madagascar 🇲🇬</p>
        <div className="flex gap-6">
          <a
            href="#confidentialite"
            className="hover:text-primary transition-colors"
          >
            Confidentialité
          </a>
          <a href="#cgu" className="hover:text-primary transition-colors">
            Conditions
          </a>
          <a href="#cookies" className="hover:text-primary transition-colors">
            Cookies
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
