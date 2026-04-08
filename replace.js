const fs = require('fs');

const files = ['App.tsx', 'components/MetricCard.tsx', 'components/LayerDisplay.tsx'];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/text-gray-800/g, 'text-[#0F3B2E]');
  content = content.replace(/text-gray-700/g, 'text-[#0F3B2E]/90');
  content = content.replace(/text-gray-600/g, 'text-[#0F3B2E]/80');
  content = content.replace(/text-gray-500/g, 'text-[#0F3B2E]/70');
  content = content.replace(/text-gray-400/g, 'text-[#0F3B2E]/60');
  content = content.replace(/text-gray-300/g, 'text-[#0F3B2E]/50');
  content = content.replace(/text-gray-200/g, 'text-[#0F3B2E]/40');
  content = content.replace(/text-gray-100/g, 'text-[#0F3B2E]/30');
  content = content.replace(/text-black/g, 'text-[#0F3B2E]');
  content = content.replace(/text-gold/g, 'text-[#0F3B2E]');
  content = content.replace(/border-gold/g, 'border-[#0F3B2E]');
  content = content.replace(/bg-luxury-dark/g, 'bg-[#0F3B2E]');
  content = content.replace(/font-serif/g, '');
  fs.writeFileSync(file, content);
});
console.log('Done');
