const integrations = [
  'Facebook', 'WhatsApp', 'Cloudflare',
];

const IntegrationsMarquee = () => {
  const items = [...integrations, ...integrations];

  return (
    <section className="py-16 px-6 bg-google-bg-light overflow-hidden">
      <div className="max-w-7xl mx-auto text-center mb-10">
        <h2 className="font-display text-[clamp(28px,4vw,44px)] tracking-[-0.01em] text-google-dark">
          S'intègre parfaitement avec
        </h2>
      </div>
      <div className="relative">
        <div className="flex gap-6 animate-marquee w-max">
          {items.map((name, i) => (
            <div
              key={i}
              className="px-6 py-3 bg-card border border-google-border rounded-full font-ui text-sm text-google-gray-ui whitespace-nowrap"
            >
              {name}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default IntegrationsMarquee;
