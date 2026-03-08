# Medieval Dungeon - Three.js Projekt

## Inhaltsverzeichnis

1. [Projektbeschreibung](#projektbeschreibung)
2. [Technologien](#technologien)
3. [Installation & Start](#installation--start)
4. [Projektstruktur](#projektstruktur)
5. [Architektur](#architektur)
6. [Szene & Kamera](#szene--kamera)
7. [Geometrien](#geometrien)
8. [Materialien & Texturen](#materialien--texturen)
9. [Prozedurale Textur-Generierung im Detail](#prozedurale-textur-generierung-im-detail)
10. [Beleuchtung](#beleuchtung)
11. [Animationen](#animationen)
12. [Blender-Modell: Auto](#blender-modell-auto)
13. [Partikelsystem](#partikelsystem)
14. [Post-Processing](#post-processing)
15. [Dekorative Elemente](#dekorative-elemente)
16. [GUI-Steuerung](#gui-steuerung)
17. [Render-Pipeline](#render-pipeline)
18. [Performance-Optimierungen](#performance-optimierungen)
19. [Verwendete Three.js-Features](#verwendete-threejs-features)
20. [Code-Beispiele](#code-beispiele)

---

## Projektbeschreibung

Dieses Projekt ist eine interaktive 3D-Szene, die einen mittelalterlichen Dungeon (Kerker) darstellt. Die meisten Objekte werden prozedural generiert - Geometrien, Texturen und Effekte werden zur Laufzeit mittels JavaScript/TypeScript und der Three.js-Bibliothek erzeugt. Zusaetzlich wird ein eigenes, in Blender erstelltes 3D-Modell (Auto) in die Szene eingebunden und animiert.

### Motivation

Das Ziel des Projekts ist es, die vielfaeltigen Moeglichkeiten von Three.js zu demonstrieren: Von prozeduralen Texturen ueber physikbasierte Materialien bis hin zu komplexen Animationen, Post-Processing-Effekten und dem Import externer Blender-Modelle.

### Features im Ueberblick

Die Szene umfasst:
- Einen steinernen Kerkerraum mit Boden, Waenden und Decke
- Vier Steinsaeulen mit Kapitellen und Basisringen
- Drei Wandfackeln mit animiertem Flammeneffekt und Glow-Sprites
- Einen schwebenden, leuchtenden Kristall mit 6 orbitierenden Splittern
- Eine Schatztruhe mit animiertem Deckel, Goldmuenzen und drehendem Kelch
- Holzfaesser mit Metallbaendern und eine Holzkiste
- Haengende Ketten an der Decke und Spinnweben in den Ecken
- **Ein Blender-Modell (Auto, `car.glb`), das im Kreis durch den Dungeon faehrt**
- 300 Staubpartikel mit individuellen Farben, Groessen und Geschwindigkeiten
- Bloom Post-Processing fuer leuchtende Objekte
- Ein vollstaendiges GUI zur Echtzeit-Steuerung aller Parameter
- Prozedurale CubeMap-Reflektionen auf metallischen Oberflaechen
- 7 verschiedene Lichtquellen mit realistischem Flackern
- Exponentieller Nebel fuer atmosphaerische Tiefe

---

## Technologien

| Technologie | Version | Zweck |
|---|---|---|
| **Three.js** | ^0.170.0 | 3D-Rendering-Engine (WebGL) |
| **TypeScript** | (devDependency) | Typsichere Hauptdatei (`main.ts`) |
| **lil-gui** | ^0.20.0 | GUI-Bibliothek fuer Echtzeit-Parametersteuerung |
| **Vite** | ^6.0.0 | Build-Tool und Development-Server |

### Warum TypeScript?

Das Projekt verwendet einen **hybriden Ansatz**: Die Hauptdatei `main.ts` ist in TypeScript geschrieben, die Komponenten-Dateien bleiben JavaScript. Vite unterstuetzt diesen Mix nativ via `allowJs: true` in der `tsconfig.json`.

TypeScript bietet in `main.ts`:
- Typsichere Interfaces fuer die GUI-Parameter (`SceneParams`)
- Explizit typisierte Arrays (`THREE.Object3D[]` fuer Licht-Helpers)
- Rueckgabe-Typen fuer Funktionen (`void`, `number`)
- Type-Assertions (`as HTMLCanvasElement`)

### Warum Three.js?

Three.js ist die meistverwendete JavaScript-Bibliothek fuer 3D-Grafik im Browser. Sie abstrahiert die WebGL-API und bietet:
- Ein Szenen-Graph-System fuer hierarchische 3D-Objekte
- PBR (Physically Based Rendering) Materialien
- Verschiedene Lichtquellen mit Shadow Mapping
- Post-Processing-Pipeline
- GLTFLoader fuer externe 3D-Modelle (Blender-Export)
- Umfangreiche Addon-Bibliothek (OrbitControls, EffectComposer, etc.)

### Warum Vite?

Vite ist ein modernes Build-Tool, das:
- Sofortige Hot-Module-Replacement (HMR) Entwicklung bietet
- ES-Module nativ unterstuetzt (kein Bundling im Dev-Modus)
- TypeScript und JavaScript gemischt verarbeiten kann
- Schnelle Produktions-Builds mit Rollup erzeugt
- Minimale Konfiguration benoetigt

---

## Installation & Start

### Voraussetzungen
- Node.js (Version 18 oder hoeher)
- npm
- Ein moderner Browser mit WebGL-Unterstuetzung (Chrome, Firefox, Edge, Safari)

### Schritte

```bash
# Repository klonen
git clone https://github.com/Ben-nfl/Three.js-2.0-Projekt.git
cd Three.js-2.0-Projekt

# Abhaengigkeiten installieren
npm install

# Development-Server starten
npm run dev
```

Die Anwendung ist dann unter `http://localhost:5173` erreichbar.

### Weitere Befehle

```bash
# Produktions-Build erstellen
npm run build

# Build-Vorschau starten
npm run preview
```

### Steuerung im Browser

| Eingabe | Aktion |
|---|---|
| Linke Maustaste + Ziehen | Kamera um das Zentrum rotieren |
| Rechte Maustaste + Ziehen | Kamera verschieben (Pan) |
| Scrollrad | Zoom (rein/raus) |
| GUI Panel (oben rechts) | Parameter in Echtzeit aendern |

---

## Projektstruktur

```
Three.js 2.0 Projekt/
├── index.html              # HTML-Einstiegspunkt mit Canvas-Element
├── package.json            # Projektabhaengigkeiten und Scripts
├── vite.config.js          # Vite-Konfiguration
├── tsconfig.json           # TypeScript-Konfiguration (allowJs: true)
├── .gitignore              # Git-Ausnahmen
├── DOKUMENTATION.md        # Diese Dokumentation
├── public/
│   └── car.glb             # Blender-Modell: Low-Poly-Auto (GLTF Binary)
└── src/
    ├── main.ts             # Haupteinstiegspunkt (TypeScript), Initialisierung und Animationsloop
    ├── style.css           # Globale Styles (Fullscreen-Canvas)
    └── components/
        ├── scene.js        # Szene, Kamera, Renderer, OrbitControls
        ├── dungeon.js      # Raumgeometrie (Boden, Waende, Decke)
        ├── pillars.js      # Steinsaeulen mit Kapitellringen
        ├── torches.js      # Wandfackeln mit Flammen und Glow-Sprites
        ├── treasure.js     # Schatztruhe, Goldmuenzen, Kelch
        ├── barrels.js      # Holzfaesser und Holzkiste
        ├── crystal.js      # Schwebender Kristall mit Orbit-Splittern
        ├── car.js          # Blender-Auto: GLTFLoader + Kreis-Animation + Radrotation
        ├── decorations.js  # Ketten und Spinnweben
        ├── lights.js       # Alle Lichtquellen (7 Stueck)
        ├── particles.js    # Staubpartikel-System (300 Partikel)
        ├── materials.js    # 9 verschiedene PBR-Materialien
        ├── textures.js     # 4 prozedurale Texturen (Canvas 2D)
        ├── envmap.js       # Prozedurale CubeMap fuer Reflektionen
        ├── postprocessing.js # Bloom-Effekt (UnrealBloomPass)
        └── gui.js          # lil-gui Steuerungspanel mit 6 Kategorien
```

---

## Architektur

Das Projekt folgt einem **modularen Komponentenansatz**. Jede Datei in `src/components/` ist fuer genau einen Aspekt der Szene verantwortlich und exportiert eine `create`-Funktion (und optional eine `update`-Funktion fuer Animationen).

### TypeScript in main.ts

Die Hauptdatei `main.ts` definiert ein zentrales Interface fuer die GUI-Parameter:

```typescript
interface SceneParams {
  animSpeed: number;
  dustEnabled: boolean;
  _helperCallback?: (show: boolean) => void;
  [key: string]: unknown;
}
```

Explizite Typen sorgen fuer Fehlerfreiheit beim Umgang mit der Licht-Helper-Liste und den Animationsparametern.

### Entwurfsprinzipien

1. **Separation of Concerns:** Jede Komponente (Licht, Material, Geometrie, Animation) ist in einer eigenen Datei gekapselt.
2. **Factory Pattern:** Alle `create`-Funktionen erzeugen Objekte und fuegen sie der Szene hinzu. Sie geben Referenzen zurueck, die fuer Animationen benoetigt werden.
3. **Dependency Injection:** Materialien werden zentral in `materials.js` erstellt und an alle Komponenten weitergereicht, die sie benoetigen.
4. **Animationsloop:** Alle zeitabhaengigen Updates werden ueber den zentralen `animate()`-Loop in `main.ts` gesteuert.

### Datenfluss

```
main.ts
  │
  ├── createScene()         → scene, camera, renderer, controls
  │     Erzeugt die Grundstruktur: Szene mit Nebel, Kamera,
  │     WebGL-Renderer mit Schatten und Tonemapping, OrbitControls
  │
  ├── createMaterials()      → materials (9 Stueck)
  │     Erstellt alle PBR-Materialien mit prozeduralen Texturen
  │
  ├── createEnvMap()         → cubeTexture fuer Reflektionen
  │     Prozedurale CubeMap, wird auf Gold/Metal/Crystal angewendet
  │
  ├── createDungeon()        → Raum-Meshes (Boden, 4 Waende, Decke)
  ├── createPillars()        → 4 Steinsaeulen mit je 2 Ringen
  ├── createTorches()        → 3 Fackeln (Griff + Flamme + Glow)
  ├── createTreasure()       → Truhe + Deckel + Muenzen + Kelch
  ├── createBarrels()        → 2 Faesser + 1 Kiste + Metallbaender
  ├── createCrystal()        → TorusKnot + Kern + 6 Splitter + Glow
  ├── createLights()         → 7 Lichtquellen
  ├── createParticles()      → 300 Staubpartikel
  ├── createDecorations()    → 4 Ketten + 6 Spinnweben
  ├── createCar()            → GLB-Modell laden, Raedern zuweisen
  │
  ├── createPostProcessing() → EffectComposer mit Bloom
  ├── createGUI()            → Steuerungspanel
  │
  └── animate()              → Animationsloop (requestAnimationFrame)
        ├── updateTorchFlicker()   Flammen skalieren + Glow pulsieren
        ├── updateLights()         Lichtintensitaeten flackern
        ├── updateCrystal()        Schweben + Rotation + Orbit
        ├── updateTreasure()       Deckel oeffnen + Kelch drehen
        ├── updateParticles()      300 Partikel bewegen + pulsieren
        ├── updateCar()            Auto auf Kreisbahn + Radrotation
        └── composer.render()      Post-Processing rendern
```

---

## Szene & Kamera

**Datei:** `src/components/scene.js`

### Szenen-Konfiguration

| Eigenschaft | Wert | Beschreibung |
|---|---|---|
| Hintergrundfarbe | `#050404` | Sehr dunkles Braun-Schwarz, passend zur Kerker-Atmosphaere |
| Nebel-Typ | `FogExp2` | Exponentieller Nebel (Dichte nimmt mit Entfernung quadratisch zu) |
| Nebeldichte | 0.04 | Sichtbare Tiefenwirkung ohne zu stark zu verdecken |

### Kamera

| Eigenschaft | Wert | Beschreibung |
|---|---|---|
| Typ | `PerspectiveCamera` | Perspektivische Projektion (natuerliche Tiefenwahrnehmung) |
| FOV | 60 Grad | Sichtfeld - realistisch fuer Innenraum |
| Near Clipping | 0.1 | Nahe Clipping-Ebene |
| Far Clipping | 100 | Ferne Clipping-Ebene |
| Startposition | (0, 3, 8) | Leicht erhoehter Blick von vorne auf die Szene |
| Look-At | (0, 1, 0) | Blickziel in der Raummitte |

### Renderer

| Eigenschaft | Wert | Beschreibung |
|---|---|---|
| Antialiasing | `true` | Kantenglattung fuer bessere Bildqualitaet |
| Pixel Ratio | `min(devicePixelRatio, 2)` | Begrenzt auf 2x fuer Performance auf HiDPI-Displays |
| Shadow Map | `PCFSoftShadowMap` | Percentage-Closer Soft Shadows - weiche, realistische Schatten |
| Tone Mapping | `ACESFilmicToneMapping` | Filmisches Tonemapping nach ACES-Standard |
| Exposure | 2.0 | Erhoehte Belichtung fuer gute Sichtbarkeit im Dungeon |

Der **ACES Filmic Tone Mapping** ist ein Industriestandard aus der Filmindustrie. Er bildet den HDR-Farbraum der Szene auf den darstellbaren Bereich des Monitors ab, wobei Highlights sanft abfallen und dunkle Bereiche erhalten bleiben.

### OrbitControls

| Eigenschaft | Wert | Beschreibung |
|---|---|---|
| Damping | 0.05 | Traege Nachbewegung fuer fluessiges Gefuehl |
| Target | (0, 1.5, 0) | Rotationszentrum in Raumhoehe |
| Max Polar Angle | 85% von PI | Verhindert, dass die Kamera unter den Boden geht |
| Min Distance | 2 | Minimaler Zoom-Abstand |
| Max Distance | 15 | Maximaler Zoom-Abstand |

---

## Geometrien

Das Projekt verwendet **14 verschiedene Three.js-Geometrietypen** plus zusaetzliche Hilfsgeometrien:

### Hauptgeometrien

| Nr. | Geometrie | Parameter | Verwendung | Datei |
|---|---|---|---|---|
| 1 | `PlaneGeometry` | 12x12, 128x128 Segmente | Boden (viele Segmente fuer Displacement) | `dungeon.js` |
| 2 | `PlaneGeometry` | 12x6, 64x64 Segmente | 4 Waende + Decke | `dungeon.js` |
| 3 | `CylinderGeometry` | r=0.35, h=5.5, 12 Segmente | 4 Steinsaeulen (leicht konisch) | `pillars.js` |
| 4 | `TorusGeometry` | r=0.455, tube=0.08 | 8 Kapitell- und Basisringe der Saeulen | `pillars.js` |
| 5 | `BoxGeometry` | 1.2 x 0.6 x 0.7 | Schatztruhen-Koerper | `treasure.js` |
| 6 | `CylinderGeometry` | r=0.1, h=0.02, 16 Segmente | 8 Goldmuenzen (flache Scheiben) | `treasure.js` |
| 7 | `LatheGeometry` | 9 Profilpunkte, 24 Segmente | Goldkelch (Drehkoerper aus Profil) | `treasure.js` |
| 8 | `CylinderGeometry` | r=0.4/0.35, h=1.0, 16 Segmente | 2 Holzfaesser (leicht konisch) | `barrels.js` |
| 9 | `BoxGeometry` | 0.8 x 0.8 x 0.8 | Holzkiste | `barrels.js` |
| 10 | `ConeGeometry` | r=0.12, h=0.35, 8 Segmente | 3 Fackel-Flammen | `torches.js` |
| 11 | `CylinderGeometry` | r=0.04/0.06, h=0.6, 8 Segmente | 3 Fackelgriffe | `torches.js` |
| 12 | `TorusKnotGeometry` | r=0.8, tube=0.08, p=2, q=3 | Kristall aeusserer Ring (Trefoil-Knoten) | `crystal.js` |
| 13 | `IcosahedronGeometry` | r=0.35, detail=1 | Kristall innerer Kern (20-Flaechner) | `crystal.js` |
| 14 | `OctahedronGeometry` | r=0.08, detail=0 | 6 Kristall Orbit-Splitter (Diamantform) | `crystal.js` |

### Zusaetzliche Geometrien

| Geometrie | Verwendung | Datei |
|---|---|---|
| `SphereGeometry` (r=0.6) | Transparente Glow-Kugel um den Kristall | `crystal.js` |
| `TorusGeometry` (r=0.38, tube=0.02) | Metallbaender auf den Faessern | `barrels.js` |
| `TorusGeometry` (r=0.06, tube=0.015) | Einzelne Kettenglieder (alternierend rotiert) | `decorations.js` |
| `ShapeGeometry` | Dreieckige Spinnweben-Flaeche | `decorations.js` |
| `BufferGeometry` + Line | Spinnweben-Faeden (radial + konzentrisch) | `decorations.js` |
| `BufferGeometry` + Points | 300 Staubpartikel | `particles.js` |
| **GLTF-Modell** | **Low-Poly-Auto aus Blender (car.glb)** | **`car.js`** |

---

## Materialien & Texturen

**Datei:** `src/components/materials.js`, `src/components/textures.js`

### PBR-Material-System

Three.js verwendet ein **Physically Based Rendering (PBR)** Material-System basierend auf dem Metalness/Roughness-Workflow:

- **Roughness** (0-1): Wie rau die Oberflaeche ist. 0 = perfekt spiegelnd, 1 = komplett diffus
- **Metalness** (0-1): Ob die Oberflaeche metallisch ist. 0 = Dielektrikum (Stein, Holz), 1 = Metall

### 9 Materialien

| Nr. | Name | Typ | Roughness | Metalness | Besonderheiten |
|---|---|---|---|---|---|
| 1 | `stone` | `MeshStandardMaterial` | 0.9 | 0.05 | Color-Map + Normal-Map, UV-Repeat 2x2 |
| 2 | `stoneFloor` | `MeshStandardMaterial` | 0.95 | 0.02 | Displacement-Map (Scale 0.3), UV-Repeat 3x3 |
| 3 | `wood` | `MeshStandardMaterial` | 0.75 | 0.0 | Prozedurale Holzmaserung-Textur |
| 4 | `metal` | `MeshStandardMaterial` | 0.3 | 0.9 | Environment-Map (Intensity 0.4) |
| 5 | `gold` | `MeshStandardMaterial` | 0.2 | 1.0 | Environment-Map (Intensity 0.6), Farbe #FFD700 |
| 6 | `crystal` | `MeshPhysicalMaterial` | 0.05 | 0.1 | Transmission 0.6, Emissive, Environment-Map |
| 7 | `torchFire` | `MeshStandardMaterial` | 0.8 | 0.0 | Emissive Intensity 2.0, transparent |
| 8 | `barrelWood` | `MeshStandardMaterial` | 0.85 | 0.0 | Dunklere Holzfarbe #6B3A20 |
| 9 | `ceiling` | `MeshStandardMaterial` | 0.95 | 0.02 | Sehr dunkle Farbe #333333, Normal-Map |

### 4 Prozedurale Texturen

| Textur | Groesse | Technik | Verwendung |
|---|---|---|---|
| **Height Map** | 512x512 | Multi-Oktav-Sinuswellen + Cobblestone-Grid | Displacement des Bodens |
| **Normal Map** | 512x512 | Backstein-Muster mit Fugen-Normalen | Oberflaechendetails der Waende |
| **Wood Texture** | 256x256 | Bezier-Kurven fuer Maserung + Rauschen | Holzoberflaechen |
| **Stone Color** | 512x512 | Block-Variation + Moos-Tint + Pixel-Rauschen | Farbvariation der Steinoberflaechen |

---

## Prozedurale Textur-Generierung im Detail

**Datei:** `src/components/textures.js`

### Height Map (Boden-Displacement)

Die Height Map kombiniert zwei Techniken:

**1. Multi-Oktav-Sinuswellen** fuer organische Unebenheiten:
```javascript
height += Math.sin(x * 0.05) * Math.sin(y * 0.05) * 30;
height += Math.sin(x * 0.12) * Math.sin(y * 0.09) * 15;
height += Math.sin(x * 0.25) * Math.cos(y * 0.22) * 8;
```

**2. Cobblestone-Grid** fuer Pflastersteine:
- Ein 32x32 Pixel grosses Raster teilt die Textur in einzelne "Steine"
- Pseudo-zufaellige Hoehe per Stein via Seed-Funktion

### Normal Map (Steinwand-Oberflaechendetails)

- Backstein-Layout: 64x32 Pixel pro Stein, jede zweite Reihe um die Haelfte versetzt
- Fugen-Normalen an den Kanten, Surface Noise fuer rauhe Steinoberflaeche

### Environment Map

Eine prozedurale CubeMap (6 Faces, je 128x128 px) simuliert Fackellicht-Reflexionen auf Gold, Metall und Kristall.

---

## Beleuchtung

**Datei:** `src/components/lights.js`

Die Beleuchtung wurde gegenueber dem urspruenglichen Entwurf deutlich aufgehellt, um gute Sichtbarkeit aller Objekte - insbesondere des fahrenden Autos - zu gewaehrleisten.

### Uebersicht aller Lichtquellen

| Nr. | Typ | Farbe | Intensitaet | Schatten | Beschreibung |
|---|---|---|---|---|---|
| 1 | `AmbientLight` | `#1a1a3a` (Dunkelblau) | 1.2 | Nein | Grundhelligkeit der gesamten Szene |
| 2 | `PointLight` | `#FF8833` (Warm-Orange) | 4.0 | Ja (512x512) | Fackellicht an der linken Wand |
| 3 | `PointLight` | `#FF8833` (Warm-Orange) | 4.0 | Ja (512x512) | Fackellicht an der rechten Wand |
| 4 | `PointLight` | `#CC6622` (Dunkel-Orange) | 3.5 | Ja (512x512) | Fackellicht an der hinteren Wand |
| 5 | `PointLight` | `#00FFAA` (Cyan-Gruen) | 1.0 | Nein | Kristalllicht (folgt der Kristall-Position) |
| 6 | `SpotLight` | `#FFEECC` (Warm-Weiss) | 4.0 | Ja (512x512) | Gerichteter Lichtstrahl von der Decke |
| 7 | `HemisphereLight` | `#222244` / `#111100` | 0.7 | Nein | Subtiler Farbverlauf (blau oben, braun unten) |

Die Exposure des Renderers betraegt **2.0** (gegenueber urspruenglichen 0.8), was den Gesamteindruck deutlich aufhellt.

### Shadow Mapping

Vier Lichtquellen werfen Schatten (`castShadow: true`):
- 3x PointLight (Fackeln) mit 512x512 Shadow Maps und Radius 4 (weiches Blur)
- 1x SpotLight (Deckenstrahl) mit 512x512 Shadow Map

---

## Animationen

**Datei:** `src/main.ts`, `src/components/torches.js`, `src/components/lights.js`, `src/components/crystal.js`, `src/components/treasure.js`, `src/components/car.js`

Alle Animationen laufen im `requestAnimationFrame`-Loop und sind **zeitbasiert** ueber `THREE.Clock`.

### Fackelflackern

Ueberlagerte Sinuswellen bei vier verschiedenen Frequenzen (8, 13.7, 23.1, 47 Hz) mit irrationalen Verhaeltnissen, sodass sich das Muster nie exakt wiederholt. Jede Fackel hat einen eigenen Offset.

### Kristall-Animation

| Effekt | Technik |
|---|---|
| Schweben | `sin(time * pulseSpeed) * floatHeight` |
| Ring-Rotation | Dual-Achsen-Rotation (Y + X) |
| Kern-Rotation | Gegenlaefig auf Y + Z |
| Splitter-Orbit | Kreisbahn pro Splitter mit eigenem Radius/Speed/Y-Offset |
| Glow-Pulsieren | Skalierung + Opacity-Modulation |

### Schatztruhe

- **Deckel:** Oeffnet/schliesst sich via Sinus-Zyklus mit `lidPivot`-Group als Scharnier-Drehpunkt
- **Kelch:** Kontinuierliche Y-Rotation (`time * 0.5`)

---

## Blender-Modell: Auto

**Datei:** `src/components/car.js`, `public/car.glb`

### Modell-Beschreibung

Das Auto (`car.glb`) ist ein eigens in **Blender** erstelltes Low-Poly-Fahrzeug. Es wurde als **GLTF Binary (.glb)** exportiert und enthaelt folgende Objekte:

| Blender-Objekt | Beschreibung |
|---|---|
| `Kabine` | Fahrzeugkabine |
| `Karosserie` | Hauptkoerper des Autos |
| `Boden` | Fahrzeugboden |
| `Rad_VL` | Vorderrad Links |
| `Rad_VR` | Vorderrad Rechts |
| `Rad_HL` | Hinterrad Links |
| `Rad_HR` | Hinterrad Rechts |

### Laden mit GLTFLoader

```javascript
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const loader = new GLTFLoader();
loader.load('/car.glb', (gltf) => {
  const model = gltf.scene;
  model.scale.setScalar(0.5);
  scene.add(model);
});
```

Das GLB liegt im `public/`-Verzeichnis, damit Vite es als statisches Asset unter `/car.glb` ausliefert.

### Kreisfahrt-Animation

Das Auto faehrt auf einer **Kreisbahn** mit Radius 3.5 Units durch den Dungeon:

```javascript
const angle = elapsed * DRIVE_SPEED * Math.PI * 2;
model.position.x = Math.cos(angle) * DRIVE_RADIUS;
model.position.z = Math.sin(angle) * DRIVE_RADIUS;

// Fahrtrichtung (Tangente des Kreises)
model.rotation.y = -(angle + Math.PI / 2);
```

### Physikalisch korrekte Radrotation

Die Radgeschwindigkeit wird aus der tatsaechlichen Fahrgeschwindigkeit abgeleitet:

```
Kreisumfang         = 2 * PI * DRIVE_RADIUS = 21.99 Einheiten/Umlauf
Fahrgeschwindigkeit = DRIVE_SPEED * Umfang  = 8.8 Einheiten/Sekunde
Radwinkelgeschw.    = Fahrgeschwindigkeit / WHEEL_RADIUS
```

Die vier Raeder (`Rad_VL`, `Rad_VR`, `Rad_HL`, `Rad_HR`) werden direkt beim Namen aus der GLTF-Hierarchie gelesen und drehen sich um ihre lokale X-Achse (Achsrichtung nach Blender-GLTF-Export).

| Konstante | Wert | Beschreibung |
|---|---|---|
| `DRIVE_RADIUS` | 3.5 | Kreisradius der Fahrbahn in World-Units |
| `DRIVE_SPEED` | 0.4 | Umdrehungen pro Sekunde |
| `WHEEL_RADIUS` | 0.6 | Effektiver Radradius fuer Rotationsberechnung |

---

## Partikelsystem

**Datei:** `src/components/particles.js`

### Konfiguration

| Eigenschaft | Wert | Beschreibung |
|---|---|---|
| Anzahl | 300 | Partikelanzahl |
| Groessen | 0.02 - 0.08 | Individuelle Groesse pro Partikel |
| Farben | Warm-Orange bis Blassgelb | Individuelle Farbe pro Partikel (Vertex Colors) |
| Blending | `AdditiveBlending` | Partikel addieren ihre Helligkeit |
| Depth Write | `false` | Partikel verdecken sich nicht gegenseitig |

Jeder Partikel hat eine individuelle Geschwindigkeit und eine Sinuswellen-Drift fuer organisches Schweben. Partikel werden am Boden respawnt, wenn sie die Deckenhoehe erreichen.

---

## Post-Processing

**Datei:** `src/components/postprocessing.js`

```
Szene → RenderPass → UnrealBloomPass → OutputPass → Bildschirm
```

### UnrealBloomPass

| Parameter | Wert | Beschreibung |
|---|---|---|
| Strength | 0.6 | Staerke des Leuchtens |
| Radius | 0.4 | Wie weit das Leuchten streut |
| Threshold | 0.85 | Ab welcher Helligkeit der Effekt einsetzt |

---

## Dekorative Elemente

**Datei:** `src/components/decorations.js`

### Ketten

4 Ketten an der Decke aus `TorusGeometry`-Gliedern, alternierend um 90 Grad rotiert.

### Spinnweben

6 Spinnweben aus: dreieckiger `ShapeGeometry` (Opacity 0.08), 5 radialen Linienfaeden und 3 konzentrischen Boegen.

---

## GUI-Steuerung

**Datei:** `src/components/gui.js`

### Atmosphere

| Parameter | Standardwert | Beschreibung |
|---|---|---|
| Fog Density | 0.04 | Nebeldichte |
| Ambient | 1.2 | Grundhelligkeit |
| Exposure | 2.0 | Belichtung |
| Bloom | 0.6 | Bloom-Staerke |

### Torches

| Parameter | Standardwert | Beschreibung |
|---|---|---|
| Intensity | 4.0 | Helligkeit der Fackel-Lichter |
| Flicker Speed | 1.0 | Flacker-Geschwindigkeit |
| Flicker Amount | 1.0 | Flacker-Staerke |

### Crystal, Materials, Objects, Animation, Debug

Wie gehabt - vollstaendige Echtzeit-Kontrolle ueber Kristall-Parameter, Material-Farben, Objekt-Positionen, Animationsgeschwindigkeit und Debug-Ansichten.

---

## Render-Pipeline

```
1. requestAnimationFrame()
2. clock.getElapsedTime() * animSpeed
3. Animationen updaten:
   ├── updateTorchFlicker()
   ├── updateLights()
   ├── updateCrystal()
   ├── updateTreasure()
   ├── updateParticles()
   └── updateCar()          ← Blender-Auto: Kreisbahn + Radrotation
4. Light Helpers updaten
5. OrbitControls updaten
6. EffectComposer rendern (Bloom + OutputPass)
```

---

## Performance-Optimierungen

- **Shared Geometries:** Fackeln teilen dieselben Geometrie-Instanzen
- **Pixel Ratio Limit:** Max. 2x fuer HiDPI-Displays
- **Shadow Map 512x512:** Kompromiss Qualitaet/Performance
- **BufferGeometry fuer Partikel:** Direkte Float32Array-Manipulation
- **AdditiveBlending + depthWrite: false:** Vermeidet Partikel-Sortierung

---

## Verwendete Three.js-Features

### Rendering
- `WebGLRenderer` mit Antialiasing, Shadow Maps, ACESFilmicToneMapping
- `EffectComposer` mit `UnrealBloomPass`

### Materialien
- `MeshStandardMaterial`, `MeshPhysicalMaterial`, `MeshBasicMaterial`, `SpriteMaterial`, `PointsMaterial`, `LineBasicMaterial`

### Texturen
- `CanvasTexture`, `CubeTexture`, Displacement/Normal/Color Mapping

### Geometrien
`PlaneGeometry`, `BoxGeometry`, `CylinderGeometry`, `ConeGeometry`, `TorusGeometry`, `TorusKnotGeometry`, `IcosahedronGeometry`, `OctahedronGeometry`, `LatheGeometry`, `SphereGeometry`, `ShapeGeometry`, `BufferGeometry`

### Beleuchtung
`AmbientLight`, `PointLight`, `SpotLight`, `HemisphereLight`, `FogExp2`

### 3D-Modell-Import
- **`GLTFLoader`** (three/addons) fuer den Import des Blender-Modells `car.glb`

### Interaktion & Steuerung
- `OrbitControls` fuer Kamerasteuerung
- `lil-gui` fuer Parameter-Manipulation
- `THREE.Clock` fuer frameunabhaengige Zeitmessung

---

## Code-Beispiele

### Beispiel 1: Blender-Modell laden und animieren

```javascript
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const loader = new GLTFLoader();
loader.load('/car.glb', (gltf) => {
  const model = gltf.scene;

  // Schatten fuer alle Meshes aktivieren
  model.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
    // Raeder nach Blender-Namen suchen
    if (['Rad_VL', 'Rad_VR', 'Rad_HL', 'Rad_HR'].includes(child.name)) {
      wheels[child.name] = child;
    }
  });

  model.scale.setScalar(0.5);
  scene.add(model);
});

// Im Animationsloop: Kreisfahrt + Radrotation
function updateCar(elapsed) {
  const angle = elapsed * DRIVE_SPEED * Math.PI * 2;
  model.position.x = Math.cos(angle) * DRIVE_RADIUS;
  model.position.z = Math.sin(angle) * DRIVE_RADIUS;
  model.rotation.y = -(angle + Math.PI / 2);

  // Physikalisch korrekte Radgeschwindigkeit
  const wheelAngle = elapsed * (CAR_LINEAR_SPEED / WHEEL_RADIUS);
  Object.values(wheels).forEach(w => { w.rotation.x = wheelAngle; });
}
```

### Beispiel 2: TypeScript Interface fuer Szenenparameter

```typescript
interface SceneParams {
  animSpeed: number;
  dustEnabled: boolean;
  _helperCallback?: (show: boolean) => void;
  [key: string]: unknown;
}

const params: SceneParams = getDefaultParams();
const helpers: THREE.Object3D[] = [];

function toggleHelpers(show: boolean): void {
  if (show) {
    lights.torchLights.forEach((l: THREE.PointLight) => {
      const h = new THREE.PointLightHelper(l, 0.3);
      scene.add(h);
      helpers.push(h);
    });
  }
}
```

### Beispiel 3: Partikelsystem mit BufferGeometry

```javascript
const count = 300;
const positions = new Float32Array(count * 3);
const colors = new Float32Array(count * 3);

const geometry = new THREE.BufferGeometry();
geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

const material = new THREE.PointsMaterial({
  size: 0.05,
  vertexColors: true,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
});

const particles = new THREE.Points(geometry, material);
scene.add(particles);
```
