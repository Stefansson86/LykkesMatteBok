# Lykkes Mattebok 📚✨

En rolig och interaktiv mattespel för barn som gör matematikträning till ett spännande äventyr!

![Math Game](https://img.shields.io/badge/Math-Learning-blue)
![Language](https://img.shields.io/badge/Language-Swedish-yellow)
![Status](https://img.shields.io/badge/Status-Active-green)

## 🎮 Funktioner

- **Enkla mattetal**: Addition och subtraktion med tal mellan 1-10
- **2×2 svarsgrid**: Fyra alternativ att välja mellan
- **Streaksystem**: Räkna hur många rätt svar i rad du klarar!
- **Tre chanser**: Hjärtsystem som visar återstående försök
- **Uppmuntrande meddelanden**: Positiv feedback på svenska
- **Bästa rad**: Sparar ditt bästa resultat mellan sessioner
- **Barnvänlig design**: Färgglada knappar, roliga emojis och mjuka animationer
- **Responsiv**: Fungerar på dator, surfplatta och mobil

## 🚀 Kom igång

### Öppna direkt i webbläsare

1. Ladda ner eller klona detta repository
2. Öppna `index.html` i din webbläsare
3. Börja spela!

### Klona med Git

```bash
git clone https://github.com/YOUR_USERNAME/LykkesMatteBok.git
cd LykkesMatteBok
```

Öppna sedan `index.html` i din favoritwebbläsare.

## 🎯 Hur man spelar

1. **Läs uppgiften** - Ett mattetal visas högst upp (t.ex. "3 + 5")
2. **Välj rätt svar** - Klicka på en av de fyra rutorna med svar
3. **Bygg din rad** - Varje rätt svar ökar din streak!
4. **Undvik tre missar** - Du har tre hjärtan. Tre fel och du börjar om!
5. **Slå ditt rekord** - Försök att slå din bästa rad!

## 📁 Projektstruktur

```
LykkesMatteBok/
├── index.html              # Huvudfil med HTML-struktur
├── styles.css              # Stilar och animationer
├── script.js               # Spellogik och funktionalitet
├── README.md               # Denna fil
└── IMPLEMENTATION_PLAN.md  # Detaljerad implementationsguide
```

## 🛠️ Teknisk information

### Tekniker som används

- **HTML5** - Semantisk struktur
- **CSS3** - Gradients, animationer, flexbox och grid
- **Vanilla JavaScript** - Ingen frameworks, ren ES6+
- **LocalStorage API** - För att spara bästa streaken

### Webbläsarstöd

- Chrome/Edge (senaste versionen)
- Firefox (senaste versionen)
- Safari (senaste versionen)
- Opera (senaste versionen)

Fungerar på alla moderna webbläsare som stöder ES6+ JavaScript.

## 🌐 Deploya till GitHub Pages

### Steg 1: Skapa GitHub Repository

1. Gå till GitHub.com och logga in
2. Klicka på "New repository"
3. Namnge ditt repo (t.ex. "LykkesMatteBok")
4. Sätt som "Public"
5. Klicka "Create repository"

### Steg 2: Ladda upp dina filer

```bash
# I din projektmapp
git init
git add .
git commit -m "Initial commit: Lykkes Mattebok"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/LykkesMatteBok.git
git push -u origin main
```

### Steg 3: Aktivera GitHub Pages

1. Gå till ditt repository på GitHub
2. Klicka på "Settings"
3. Scrolla ner till "Pages" i sidomenyn
4. Under "Source", välj:
   - Branch: `main`
   - Folder: `/ (root)`
5. Klicka "Save"

### Steg 4: Besök din webbplats

Efter några minuter kommer din webbplats att vara live på:
```
https://YOUR_USERNAME.github.io/LykkesMatteBok/
```

## 🎨 Anpassning

### Ändra svårighetsgrad

I `script.js`, ändra sifferintervallet:

```javascript
// Nuvarande: 1-10
const num1 = randomNumber(1, 10);
const num2 = randomNumber(1, 10);

// För svårare: 1-20
const num1 = randomNumber(1, 20);
const num2 = randomNumber(1, 20);
```

### Lägg till fler operationer

I `generateNewProblem()` funktionen, lägg till multiplikation eller division:

```javascript
const operations = ['addition', 'subtraction', 'multiplication'];
const operation = operations[randomNumber(0, 2)];
```

### Ändra färger

I `styles.css`, modifiera gradient-färgerna:

```css
/* Bakgrund */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* Knappar */
background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
```

## 📱 Responsiv design

Spelet är optimerat för:
- **Desktop**: 1920×1080, 1366×768
- **Tablets**: 768×1024, 834×1194
- **Mobile**: 375×667, 414×896

Layouten anpassar sig automatiskt till skärmstorleken!

## 🐛 Felsökning

### Problem: Bästa streaken sparas inte

**Lösning**: Kontrollera att webbläsarens LocalStorage är aktiverat. Testa i en annan webbläsare.

### Problem: Knapparna fungerar inte

**Lösning**:
1. Kontrollera att JavaScript är aktiverat i webbläsaren
2. Öppna konsolen (F12) och leta efter felmeddelanden
3. Verifiera att `script.js` laddas korrekt

### Problem: Layouten ser trasig ut

**Lösning**:
1. Verifiera att `styles.css` laddas korrekt
2. Testa i en annan webbläsare
3. Rensa webbläsarens cache (Ctrl+Shift+Delete)

## 🔮 Framtida förbättringar

Idéer för vidareutveckling:

- [ ] Multiplikation och division
- [ ] Svårighetsgrader (Lätt, Medel, Svår)
- [ ] Ljudeffekter för feedback
- [ ] Tidtagarläge
- [ ] Prestationer och badges
- [ ] Statistik över framsteg
- [ ] Olika teman (Årstider, Djur, Rymden)
- [ ] Flerspelarläge

## 📄 Licens

Detta projekt är open source och fritt att använda för personligt och utbildningssyfte.

## 🙏 Tack till

- Emojis från Unicode Consortium
- Inspiration från klassiska matematikspel
- Utvecklat med kärlek för att göra matteinlärning roligare!

## 📞 Kontakt

Har du frågor eller feedback? Skapa gärna en Issue på GitHub!

---

**Lycka till med matteträningen!** 🎉📚✨

Gjord med ❤️ för att göra matematik roligt och tillgängligt för alla barn.
