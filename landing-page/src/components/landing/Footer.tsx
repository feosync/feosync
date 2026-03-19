import { Zap } from 'lucide-react';

const footerCols = [
  { title: 'Produit', links: ['Fonctionnalités', 'Tarifs', 'Intégrations', 'Changelog'] },
  { title: 'Ressources', links: ['Documentation', 'Blog', 'Tutoriels', 'API'] },
  { title: 'Entreprise', links: ['À propos', 'Carrières', 'Contact', 'Partenaires'] },
  { title: 'Légal', links: ['Confidentialité', 'CGU', 'Cookies', 'RGPD'] },
];

const Footer = () => {
  return (
    <footer className="bg-card border-t border-google-border pt-20 pb-10 px-6" id='contact'>
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-6 gap-12 mb-16">
        <div className="col-span-2">
          <div className="flex items-center gap-2 mb-6">
            <Zap className="text-google-blue" size={20} />
            <span className="font-ui font-bold text-xl text-google-dark">AutoPost Pro</span>
          </div>
          <p className="text-google-gray-ui text-sm max-w-xs leading-relaxed">
            La plateforme d'automatisation marketing n°1 à Madagascar, propulsée par l'IA de Google.
          </p>
        </div>
        {footerCols.map((col) => (
          <div key={col.title}>
            <h4 className="font-ui font-medium text-sm text-google-dark mb-6">{col.title}</h4>
            <ul className="space-y-3 text-sm text-google-gray-ui">
              {col.links.map((link) => (
                <li key={link}>
                  <a href="#" className="hover:text-google-blue transition-colors">{link}</a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="max-w-7xl mx-auto pt-8 border-t border-google-bg-light flex flex-col md:flex-row justify-between items-center gap-4 text-[13px] text-google-gray-mid">
        <p>© 2025 AutoPost Pro · Made with ❤️ in Madagascar 🇲🇬</p>
        <div className="flex gap-8">
          <a href="#" className="hover:text-google-blue transition-colors">Confidentialité</a>
          <a href="#" className="hover:text-google-blue transition-colors">Conditions</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
