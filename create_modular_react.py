import os

os.makedirs('src/components', exist_ok=True)
os.makedirs('src/constants', exist_ok=True)

# 1. src/constants/languages.js
with open('src/constants/languages.js', 'w', encoding='utf-8') as f:
    f.write('''export const LANGUAGES_META = {
  all:   { fr: "Toutes les langues", native: "All Languages", flag: "🌍" },
  fr:    { fr: "Français", native: "Français", flag: "🇫🇷" },
  en:    { fr: "Anglais", native: "English", flag: "🇬🇧" },
  es:    { fr: "Espagnol", native: "Español", flag: "🇪🇸" },
  pt_BR: { fr: "Portugais (Brésil)", native: "Português (BR)", flag: "🇧🇷" },
  de:    { fr: "Allemand", native: "Deutsch", flag: "🇩🇪" },
  ar:    { fr: "Arabe", native: "العربية", flag: "🇸🇦", rtl: true },
  zh:    { fr: "Chinois (Simplifié)", native: "简体中文", flag: "🇨🇳" },
  ru:    { fr: "Russe", native: "Русский", flag: "🇷🇺" },
  ja:    { fr: "Japonais", native: "日本語", flag: "🇯🇵" },
  it:    { fr: "Italien", native: "Italiano", flag: "🇮🇹" },
  ko:    { fr: "Coréen", native: "한국어", flag: "🇰🇷" },
  hi:    { fr: "Hindi", native: "हिन्दी", flag: "🇮🇳" },
  vi:    { fr: "Vietnamien", native: "Tiếng Việt", flag: "🇻🇳" },
  id:    { fr: "Indonésien", native: "Bahasa Indonesia", flag: "🇮🇩" },
  pl:    { fr: "Polonais", native: "Polski", flag: "🇵🇱" },
  tr:    { fr: "Turc", native: "Türkçe", flag: "🇹🇷" },
  bn:    { fr: "Bengali", native: "বাংলা", flag: "🇧🇩" },
  ta:    { fr: "Tamoul", native: "தமிழ்", flag: "🇮🇳" },
  te:    { fr: "Télougou", native: "తెలుగు", flag: "🇮🇳" },
  fa_IR: { fr: "Persan", native: "فارسی", flag: "🇮🇷", rtl: true },
  ml:    { fr: "Malayalam", native: "മലയാളം", flag: "🇮🇳" },
  cs:    { fr: "Tchèque", native: "Čeština", flag: "🇨🇿" },
  th:    { fr: "Thaï", native: "ไทย", flag: "🇹🇭" },
  hu:    { fr: "Hongrois", native: "Magyar", flag: "🇭🇺" },
  fi:    { fr: "Finnois", native: "Suomi", flag: "🇫🇮" },
  si:    { fr: "Cingalais", native: "සිංහල", flag: "🇱🇰" },
  el:    { fr: "Grec", native: "Ελληνικά", flag: "🇬🇷" },
  ur:    { fr: "Ourdou", native: "اردو", flag: "🇵🇰", rtl: true },
  mr:    { fr: "Marathi", native: "मराठी", flag: "🇮🇳" },
  uk:    { fr: "Ukrainien", native: "Українська", flag: "🇺🇦" },
  my:    { fr: "Birman", native: "မြန်မာဘာသာ", flag: "🇲🇲" },
  sv:    { fr: "Suédois", native: "Svenska", flag: "🇸🇪" },
  he:    { fr: "Hébreu", native: "עברית", flag: "🇮🇱", rtl: true },
  ne:    { fr: "Népalais", native: "नेपाली", flag: "🇳🇵" },
  bg:    { fr: "Bulgare", native: "Български", flag: "🇧🇬" },
  et:    { fr: "Estonien", native: "Eesti", flag: "🇪🇪" },
  nl:    { fr: "Néerlandais", native: "Nederlands", flag: "🇳🇱" },
  pt_PT: { fr: "Portugais (Portugal)", native: "Português (PT)", flag: "🇵🇹" },
  ro:    { fr: "Roumain", native: "Română", flag: "🇷🇴" },
  km:    { fr: "Khmer", native: "ភាសាខ្មែរ", flag: "🇰🇭" },
  sr:    { fr: "Serbe", native: "Српски", flag: "🇷🇸" },
  kn:    { fr: "Kannada", native: "ಕನ್ನಡ", flag: "🇮🇳" },
  da:    { fr: "Danois", native: "Dansk", flag: "🇩🇰" },
  sk:    { fr: "Slovaque", native: "Slovenčina", flag: "🇸🇰" },
  kk:    { fr: "Kazakh", native: "Қазақша", flag: "🇰🇿" },
  no:    { fr: "Norvégien", native: "Norsk", flag: "🇳🇴" },
  az:    { fr: "Azéri", native: "Azərbaycanca", flag: "🇦🇿" },
  lv:    { fr: "Letton", native: "Latviešu", flag: "🇱🇻" },
  ca:    { fr: "Catalan", native: "Català", flag: "🇪🇸" },
  zh_TW: { fr: "Chinois (Traditionnel)", native: "繁體中文", flag: "🇹🇼" },
  uz:    { fr: "Ouzbek", native: "Oʻzbekcha", flag: "🇺🇿" },
  pa:    { fr: "Pendjabi", native: "ਪੰਜਾਬੀ", flag: "🇮🇳" },
  sl:    { fr: "Slovène", native: "Slovenščina", flag: "🇸🇮" },
  hy:    { fr: "Arménien", native: "Հայերեն", flag: "🇦🇲" }
};

export const getLangMeta = (code) => {
  return LANGUAGES_META[code] || { fr: code.toUpperCase(), native: code, flag: "🌐" };
};
''')

# 2. package.json
with open('package.json', 'w', encoding='utf-8') as f:
    f.write('''{
  "name": "free-programming-books-ui",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.1",
    "vite": "^5.2.0"
  }
}
''')

# 3. vite.config.js
with open('vite.config.js', 'w', encoding='utf-8') as f:
    f.write('''import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true
  }
});
''')

print("Modular React structure initialized in src/")
