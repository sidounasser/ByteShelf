# 📚 ByteShelf

> **La bibliothèque mondiale de programmation libre & open-source**  
> Explorez plus de **10 740 livres, cours, podcasts et tutoriels vérifiés** à travers **53 langues mondiales**.

[![Site en ligne sur Netlify](https://img.shields.io/badge/Netlify-byteshelf.netlify.app-00C7B7?style=for-the-badge&logo=netlify&logoColor=white)](https://byteshelf.netlify.app)
[![React 18](https://img.shields.io/badge/React-18.2.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.2-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Clerk](https://img.shields.io/badge/Clerk-Authentication-6C47FF?style=for-the-badge&logo=clerk&logoColor=white)](https://clerk.com/)
[![License: CC BY 4.0](https://img.shields.io/badge/License-CC_BY_4.0-lightgrey.svg?style=for-the-badge)](https://creativecommons.org/licenses/by/4.0/)

---

## 🌐 Démo en ligne
Le projet est déployé et accessible publiquement sur Netlify :  
👉 **[https://byteshelf.netlify.app](https://byteshelf.netlify.app)**

---

## ✨ Fonctionnalités clés

- 🌍 **Détection intelligente de langue multi-facteurs :**
  1. Préférence manuelle enregistrée dans `localStorage`
  2. Préférence linguistique du navigateur (`navigator.languages`)
  3. Géolocalisation IP respectueuse de la vie privée (aucune IP stockée ou exposée)
  4. Anglais par défaut
  - Détection automatique et basculement fluide en mode **RTL (Right-To-Left)** pour l'arabe, l'hébreu, le persan et l'ourdou.
- 📱 **Architecture 100 % Responsive multi-appareils :**
  - **Smartphones (iOS & Android) :** Barre de navigation adaptative sur 2 rangées, prévention du zoom automatique iOS Safari (`font-size: 16px`), accordéon mobile pour la barre latérale des filtres.
  - **Tablettes & PC Portables :** Grille auto-adaptative 2 à 3 colonnes.
  - **Écrans de bureau & Ultrawide :** Expérience éditoriale claire et moderne.
  - **Téléviseurs connectés (Smart TV 4K / 8K) :** Scaling typographique 10-foot UI et contour de focus haute visibilité (`:focus-visible`) pour navigation par télécommande (D-Pad).
- 🏷️ **Logos & Icônes technologiques par sujet :**
  - Plus de 60 logos et icônes technologiques dédiés (Python 🐍, JavaScript 🟨, React ⚛️, Rust 🦀, Go 🐹, C++ ⚙️, SQL 🗄️, etc.).
- 🔐 **Authentification & Verrouillage d'accès :**
  - Protection des leçons : redirection fluide vers la modale de connexion lorsqu'un utilisateur non connecté clique sur une leçon.
  - Déverrouillage et ouverture automatique de la ressource cible dès que la connexion réussit.
  - Intégration officielle **Clerk Auth** et solution de secours sécurisée (hachage, rate-limiting anti brute-force).
- 🤖 **Vérification de domaine Discord :**
  - Endpoint `/.well-known/discord` configuré et servi à la racine.

---

## 📚 Crédits & Remerciements / Credits & Attribution

Ce projet repose et s'appuie fièrement sur la formidable base de connaissances ouverte maintenue par **[EbookFoundation / free-programming-books](https://github.com/EbookFoundation/free-programming-books)**.

> **Attribution :**  
> Les listes de ressources, livres, cours et podcasts sont issues du projet open source **Free Programming Books** de l'[EbookFoundation](https://github.com/EbookFoundation), distribué sous licence [Creative Commons Attribution 4.0 International (CC BY 4.0)](https://creativecommons.org/licenses/by/4.0/).  
>  
> Un immense merci à tous les créateurs, contributeurs et mainteneurs de **free-programming-books** pour leur engagement exceptionnel en faveur de l'éducation et du partage libre des connaissances en informatique à l'échelle mondiale.  
> 
> 🔗 **Dépôt officiel EbookFoundation :** [https://github.com/EbookFoundation/free-programming-books](https://github.com/EbookFoundation/free-programming-books.git)

---

## 🛠️ Installation & Démarrage local

### Prérequis
- [Node.js](https://nodejs.org/) (v18+)
- `npm` ou `pnpm`

### Installation
```bash
# Cloner le dépôt
git clone https://github.com/sidounasser/ByteShelf.git
cd ByteShelf

# Installer les dépendances
npm install
```

### Lancer le serveur de développement
```bash
npm run dev
# L'application démarre sur http://localhost:5500
```

### Compiler pour la production
```bash
npm run build
```

---

## 📂 Structure du projet

```
ByteShelf/
├── .well-known/          # Vérification de domaine (Discord, etc.)
│   └── discord
├── public/               # Assets statiques publics
│   ├── data.js           # Dataset compilé
│   ├── resources.json    # Base de données complète des livres
│   └── hero-ebook.jpg    # Illustration vectorielle
├── src/                  # Composants modulaires React
│   ├── App.jsx           # Application principale
│   ├── constants/        # Métadonnées des 53 langues
│   └── utils/            # Détection de langue & icônes de catégories
├── styles.css            # Feuille de style responsive multi-appareils & RTL
├── index.html            # Point d'entrée de l'application
├── netlify.toml          # Configuration de déploiement Netlify
└── vite.config.js        # Configuration du bundler Vite
```

---

## 📄 Licence
- **Code source de ByteShelf :** Sous licence [MIT](LICENSE).
- **Contenu des ressources :** [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) - © [EbookFoundation](https://github.com/EbookFoundation/free-programming-books).
