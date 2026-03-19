const aiPrompts = [
  'Sustainable farming reduces water usage by up to 40% while improving soil health and crop yields. Did you know? Companion planting increases productivity naturally! 🌱',
  'Organic agriculture supports biodiversity and creates healthier ecosystems. Our certified organic farm grows premium quality produce without synthetic chemicals. Learn more! 🌿',
  'Vertical farming uses 95% less water than traditional farming and can increase yields up to 30 times higher. Innovation meets sustainability! 🚀',
  'Crop rotation is an ancient technique that modern sustainable farms still use to prevent soil depletion and maintain nutrient balance. Nature knows best! 🌾',
  'Microgreens contain up to 40 times more nutrients than mature plants! Easy to grow at home, perfect for health-conscious living. 💪',
  'Rainwater harvesting systems can provide up to 50% of a farm\'s water needs. Every drop counts in sustainable agriculture! 💧',
  'Permaculture design creates self-sustaining ecosystems that require minimal input while producing abundant harvests year-round. 🌲',
  'Urban farming brings fresh produce to cities, reduces carbon footprint from transportation, and builds community connections. 🏙️',
  'Beekeeping supports pollinator populations and improves crop yields. Local honey from your community farm supports sustainable agriculture! 🐝',
  'Compost transforms kitchen waste into rich soil amendment, reducing landfill waste while improving farm productivity. Circular economy in action! ♻️',
];

class AIService {
  async generateContent(topic: string): Promise<string> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const randomIndex = Math.floor(Math.random() * aiPrompts.length);
        resolve(aiPrompts[randomIndex]);
      }, 1500);
    });
  }

  async generateCaption(template: string, topic: string): Promise<string> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const variations = [
          `${template} ${topic}`,
          `Learn about ${topic}. ${template}`,
          `${template} - ${topic}`,
          `Discover how ${topic} impacts sustainability. ${template}`,
          `${topic} matters! ${template}`,
        ];
        const randomIndex = Math.floor(Math.random() * variations.length);
        resolve(variations[randomIndex]);
      }, 1200);
    });
  }
}

export const aiService = new AIService();
