# Race Track - Three.js Projekt

## Inhaltsverzeichnis

1. [Projektbeschreibung](#projektbeschreibung)
2. [Technologien](#technologien)
3. [Installation & Start](#installation--start)
4. [Projektstruktur](#projektstruktur)
5. [Architektur](#architektur)
6. [Szene & Kamera](#szene--kamera)
7. [Geometrien](#geometrien)
8. [Beleuchtung](#beleuchtung)
9. [Animationen](#animationen)
10. [Blender-Modell: Auto](#blender-modell-auto)
11. [Rennstrecke](#rennstrecke)
12. [Baeume](#baeume)
13. [Zuschauertribuene](#zuschauertribuene)
14. [Post-Processing](#post-processing)
15. [Render-Pipeline](#render-pipeline)
16. [Performance-Optimierungen](#performance-optimierungen)
17. [Verwendete Three.js-Features](#verwendete-threejs-features)
18. [Code-Beispiele](#code-beispiele)

---

## Projektbeschreibung

Dieses Projekt ist eine interaktive 3D-Rennstrecken-Szene. Die gesamte Umgebung wird prozedural generiert: Geometrien und Strukturen werden zur Laufzeit mittels JavaScript/TypeScript und der Three.js-Bibliothek erzeugt. Ein eigens in Blender erstelltes 3D-Modell (Auto) wird importiert und faehrt automatisch auf einer ovalen Rennstrecke.

### Motivation

Das Ziel ist es, die vielfaeltigen Moeglichkeiten von Three.js zu demonstrieren: prozedurale Geometrie-Erzeugung, realistisches Licht mit Schatten, den Import externer Blender-Modelle sowie physikalisch korrekte Animationen.

### Features im Ueberblick

- Ovale Asphalt-Rennstrecke mit weissen Randlinien und gelber Mittellinie
- Rot/weisse Randsteine (Curbing) entlang der gesamten Strecke
- Start-/Zielline mit Schachbrettmuster
- 7-reihige Zuschauertribuene mit Betonstufen, Sitzreihen, Dach und Werbebanden
- Prozedurale Tannenbaeume entlang der Strecke, im Infield und als Hintergrundwald
- Tageslicht-Beleuchtung (Sonne, Himmel, 4 Flutlichtmasten mit Spots)
- **Blender-Modell (`car.glb`) faehrt auf der Oval-Bahn mit physikalisch korrekter Radrotation**
- Automatische Erkennung und Ausblendung von Blender-Export-Planes unter dem Auto
- Bloom Post-Processing fuer leichten Sonnenglanz
- Freie Kamerasteuerung mit OrbitControls

---

## Technologien

| Technologie | Version | Zweck |
|---|---|---|
| **Three.js** | ^0.170.0 | 3D-Rendering-Engine (WebGL) |
| **TypeScript** | (devDependency) | Typsichere Hauptdatei (`main.ts`) |
| **Vite** | ^6.0.0 | Build-Tool und Development-Server |

### Warum TypeScript?

Das Projekt verwendet einen **hybriden Ansatz**: Die Hauptdatei `main.ts` ist in TypeScript, die Komponenten-Dateien bleiben JavaScript. Vite unterstuetzt diesen Mix nativ via `allowJs: true` in der `tsconfig.json`. TypeScript bietet Type-Assertions (`as HTMLCanvasElement`) und explizite Rueckgabetypen (`void`).

### Warum Three.js?

Three.js ist die meistverwendete JavaScript-Bibliothek fuer 3D-Grafik im Browser. Sie abstrahiert die WebGL-API und bietet:
- Ein Szenen-Graph-System fuer hierarchische 3D-Objekte
- PBR (Physically Based Rendering) Materialien
- Verschiedene Lichtquellen mit Shadow Mapping
- Post-Processing-Pipeline
- GLTFLoader fuer externe 3D-Modelle (Blender-Export)
- Umfangreiche Addon-Bibliothek (OrbitControls, EffectComposer, etc.)

### Warum Vite?

Vite ist ein modernes Build-Tool mit sofortigem Hot-Module-Replacement, nativer ES-Module-Unterstuetzung und schnellen Produktions-Builds via Rollup.

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

---

## Projektstruktur

```
Three.js 2.0 Projekt/
├── index.html              # HTML-Einstiegspunkt mit Canvas-Element
├── package.json            # Projektabhaengigkeiten und Scripts
├── vite.config.js          # Vite-Konfiguration
├── tsconfig.json           # TypeScript-Konfiguration (allowJs: true)
├── DOKUMENTATION.md        # Diese Dokumentation
├── public/
│   └── car.glb             # Blender-Modell: Low-Poly-Auto (GLTF Binary)
└── src/
    ├── main.ts             # Haupteinstiegspunkt (TypeScript), Init und Animationsloop
    ├── style.css           # Globale Styles (Fullscreen-Canvas)
    └── components/
        ├── scene.js        # Szene, Kamera, Renderer, OrbitControls
        ├── racetrack.js    # Rennstrecke: Oval, Curbing, Zielline, Tribunee
        ├── trees.js        # Prozedurale Tannenbaeume
        ├── raceLights.js   # Beleuchtung: Sonne, Hemisphaerenicht, Flutlichter
        ├── car.js          # Blender-Auto: GLTFLoader + Oval-Animation + Radrotation
        └── postprocessing.js # Bloom-Effekt (UnrealBloomPass)
```

---

## Architektur

Das Projekt folgt einem **modularen Komponentenansatz**. Jede Datei in `src/components/` ist fuer genau einen Aspekt der Szene verantwortlich und exportiert eine `create`-Funktion (und optional eine `update`-Funktion fuer Animationen).

### Entwurfsprinzipien

1. **Separation of Concerns:** Licht, Geometrie, Modell und Animation sind in eigenen Dateien.
2. **Factory Pattern:** `create`-Funktionen erzeugen Objekte, fuegen sie der Szene hinzu und liefern Referenzen zurueck.
3. **Animationsloop:** Alle zeitabhaengigen Updates laufen ueber den zentralen `animate()`-Loop in `main.ts`.

### Datenfluss

```
main.ts
  │
  ├── createScene()         → scene, camera, renderer, controls
  │     Skyblue-Hintergrund, Exponentialnebel, OrbitControls
  │
  ├── createRaceTrack()     → Asphalt-Oval, Randlinien, Curbing, Tribunee, Startlinie
  │
  ├── createTrees()         → Tannenbaeume aussen, infield, Hintergrundwald
  │
  ├── createRaceLights()    → Sonne, Hemisphaerenicht, Ambient, 4 Flutlichtmasten
  │
  ├── createCar()           → GLB-Modell laden, Raedern zuweisen, Platform ausblenden
  │
  ├── createPostProcessing() → EffectComposer mit minimalem Bloom
  │
  └── animate()              → Animationsloop (requestAnimationFrame)
        ├── updateCar()            Auto auf Oval-Bahn + Radrotation
        ├── controls.update()      OrbitControls
        └── composer.render()      Post-Processing rendern
```

---

## Szene & Kamera

**Datei:** `src/components/scene.js`

### Szenen-Konfiguration

| Eigenschaft | Wert | Beschreibung |
|---|---|---|
| Hintergrundfarbe | `#87ceeb` | Himmelblau |
| Nebel-Typ | `FogExp2` | Exponentieller Nebel fuer atmosphaerische Tiefe |
| Nebelfarbe | `#9dd5f0` | Hellblau passend zum Himmel |
| Nebeldichte | 0.006 | Sehr leichter Dunst in der Ferne |

### Kamera

| Eigenschaft | Wert | Beschreibung |
|---|---|---|
| Typ | `PerspectiveCamera` | Perspektivische Projektion |
| FOV | 60 Grad | Sichtfeld |
| Near Clipping | 0.1 | Nahe Clipping-Ebene |
| Far Clipping | 300 | Weit genug fuer die grosse Rennstrecken-Umgebung |
| Startposition | (0, 28, 48) | Ueberblick ueber die gesamte Strecke von schraeg oben |
| Look-At | (0, 0, 0) | Streckenmitte |

### Renderer

| Eigenschaft | Wert | Beschreibung |
|---|---|---|
| Antialiasing | `true` | Kantenglattung |
| Pixel Ratio | `min(devicePixelRatio, 2)` | Begrenzt auf 2x fuer HiDPI-Performance |
| Shadow Map | `PCFSoftShadowMap` | Weiche, realistische Schatten |
| Tone Mapping | `ACESFilmicToneMapping` | Filmisches Tonemapping nach ACES-Standard |
| Exposure | 1.2 | Tageslicht-gerechte Belichtung |

### OrbitControls

| Eigenschaft | Wert | Beschreibung |
|---|---|---|
| Damping | 0.05 | Traege Nachbewegung |
| Target | (0, 0, 0) | Streckenmitte als Rotationszentrum |
| Max Polar Angle | 82% von PI | Verhindert Kamera unter Boden |
| Min Distance | 5 | Minimaler Zoom |
| Max Distance | 90 | Maximaler Zoom (gesamte Strecke sichtbar) |

---

## Geometrien

Das Projekt erzeugt alle Umgebungs-Geometrien **prozedural zur Laufzeit**. Die wichtigsten verwendeten Typen:

### Rennstrecke (`racetrack.js`)

| Geometrie | Verwendung |
|---|---|
| `PlaneGeometry` (150x120) | Gruener Grasboden |
| `BufferGeometry` (custom) | Asphalt-Oval (120 Segmente, Inner/Outer Edge je Vertex) |
| `Line` + `BufferGeometry` | Weisse Randlinien, gelbe Mittellinie |
| `BoxGeometry` | Curbing-Segmente (rot/weiss alternierend) |
| `PlaneGeometry` | Start-/Zielline, Schachbrett-Checker |
| `BoxGeometry` | Betonstufen der Tribunee (7 Stueck) |
| `BoxGeometry` | Sitzreihen der Tribunee (farbig) |
| `CylinderGeometry` | 5 Stutzsaeulen der Tribunee |
| `BoxGeometry` | Ruckwand, Seitenwaende, Dach der Tribunee |

### Baeume (`trees.js`)

| Geometrie | Verwendung |
|---|---|
| `CylinderGeometry` | Baumstaemme (konisch, 7 Segmente) |
| `ConeGeometry` | Unterer Kegelaufsatz (Hauptkrone) |
| `ConeGeometry` | Oberer schmaler Kegelaufsatz (Spitze) |

### Flutlichtmasten (`raceLights.js`)

| Geometrie | Verwendung |
|---|---|
| `CylinderGeometry` | 4 Lichtmasten |
| `BoxGeometry` | Lampenkopf-Gehaeuse |
| `PlaneGeometry` | Leuchtende Lichtflaeche (emissiv) |

### Blender-Modell

| Objekt | Beschreibung |
|---|---|
| `car.glb` | Geladenes GLTF-Modell (Karosserie, Kabine, 4 Raeder) |

---

## Beleuchtung

**Datei:** `src/components/raceLights.js`

Die Szene verwendet Tageslicht-Beleuchtung mit vier Lichttypen:

### Uebersicht aller Lichtquellen

| Nr. | Typ | Farbe | Intensitaet | Schatten | Beschreibung |
|---|---|---|---|---|---|
| 1 | `DirectionalLight` | `#fff5e0` (Warm-Weiss) | 2.2 | Ja (2048x2048) | Sonne von schraeg oben |
| 2 | `HemisphereLight` | Himmel `#87ceeb` / Boden `#4a7c2f` | 0.9 | Nein | Natuerliches Himmel/Boden-Fuell-Licht |
| 3 | `AmbientLight` | `#c8e0ff` (Hellblau) | 0.4 | Nein | Globale Grundhelligkeit |
| 4-7 | `SpotLight` x4 | `#fff5cc` | 80 | Ja (512x512) | Flutlichter auf 4 Masten um die Strecke |

### Sonne (DirectionalLight)

Die Sonne beleuchtet die gesamte Szene von Position (40, 50, 30) aus. Die Shadow Camera umfasst einen Bereich von 140x120 Units, damit die gesamte Rennstrecke Schatten wirft und empfaengt.

```javascript
sun.shadow.camera.left   = -70;
sun.shadow.camera.right  =  70;
sun.shadow.camera.top    =  60;
sun.shadow.camera.bottom = -60;
sun.shadow.mapSize.set(2048, 2048);
```

### HemisphereLight

Simuliert das indirekte Streulicht des Himmels. Die obere Farbe (`#87ceeb`) faerbt Objekte leicht blau von oben, die untere (`#4a7c2f`) gibt einen gruenen Bodenpannen-Einfluss.

### Flutlichtmasten

Vier `SpotLight`-Quellen auf 16 m hohen Masten an den vier Diagonalseiten der Oval-Strecke. Jeder Spot zeigt auf den naechstgelegenen Streckenmittelpunkt. Die emissive Lichtflaeche am Lampenkopf erzeugt optischen Glow-Effekt.

| Eigenschaft | Wert |
|---|---|
| Hoehe der Masten | 16 Units |
| Oeffnungswinkel | PI/5 (36 Grad) |
| Penumbra | 0.4 (weiches Randlicht) |
| Reichweite | 60 Units |

---

## Animationen

**Datei:** `src/main.ts`, `src/components/car.js`

Alle Animationen sind **zeitbasiert** ueber `THREE.Clock`.

### Auto auf der Oval-Bahn

Das Auto faehrt auf einem mathematisch definierten Oval (Ellipse) mit den Halbachsen `TRACK_RX = 20` und `TRACK_RZ = 14`. Im Animationsloop wird die Position und Ausrichtung des Autos pro Frame neu berechnet.

**Position:**
```javascript
const t = elapsed * DRIVE_SPEED * Math.PI * 2;
model.position.x = Math.cos(t) * TRACK_RX;
model.position.z = Math.sin(t) * TRACK_RZ;
```

**Fahrtrichtung (Tangente des Ovals):**

Die Richtung des Autos ergibt sich aus der Tangente der Ellipse. Fuer einen Punkt auf der Ellipse bei Winkel `t` ist die Tangente:
- `dx/dt = -sin(t) * RX`
- `dz/dt =  cos(t) * RZ`

Der Y-Rotationswinkel des Modells wird via `atan2` aus dieser Tangente berechnet:
```javascript
model.rotation.y = Math.atan2(-Math.sin(t) * TRACK_RX, Math.cos(t) * TRACK_RZ) - Math.PI / 2;
```

---

## Blender-Modell: Auto

**Datei:** `src/components/car.js`, `public/car.glb`

### Modell-Beschreibung

Das Auto (`car.glb`) ist ein in **Blender** erstelltes Low-Poly-Fahrzeug, exportiert als **GLTF Binary (.glb)**. Es enthaelt folgende Objekte:

| Blender-Objekt | Beschreibung |
|---|---|
| `Karosserie` | Hauptkoerper des Autos |
| `Kabine` | Fahrzeugkabine |
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
  model.scale.setScalar(1.0);
  scene.add(model);
});
```

Das GLB liegt im `public/`-Verzeichnis, damit Vite es als statisches Asset unter `/car.glb` ausliefert.

### Automatische Platform-Erkennung

Blender exportiert manchmal eine unsichtbare Bodenplane (Shadow Catcher) zusammen mit dem Modell. Diese wird beim Laden automatisch erkannt und ausgeblendet, indem die Bounding Box jedes Meshes geprueft wird:

```javascript
model.updateMatrixWorld(true);
model.traverse((child) => {
  if (!child.isMesh) return;

  const box  = new THREE.Box3().setFromObject(child);
  const size = box.getSize(new THREE.Vector3());

  // Sehr flach (Y < 0.1) UND breit (X > 1.0) = Export-Plane
  if (size.y < 0.1 && size.x > 1.0) {
    child.visible = false;
    return;
  }

  child.castShadow = true;
  child.receiveShadow = true;
});
```

### Physikalisch korrekte Radrotation

Der Oval-Umfang wird mit der **Ramanujan-Naeherungsformel** fuer Ellipsen berechnet:

```javascript
const h = Math.pow((TRACK_RX - TRACK_RZ) / (TRACK_RX + TRACK_RZ), 2);
const C = Math.PI * (TRACK_RX + TRACK_RZ) * (1 + 3 * h / (10 + Math.sqrt(4 - 3 * h)));
// C ≈ 108 Units fuer RX=20, RZ=14
```

Daraus wird die Winkelgeschwindigkeit der Raeder abgeleitet:

```
Lineare Geschwindigkeit = DRIVE_SPEED * Umfang = 0.12 * 108 ≈ 12.96 Units/s
Radwinkelgeschwindigkeit = Lineare Geschwindigkeit / WHEEL_RADIUS
```

| Konstante | Wert | Beschreibung |
|---|---|---|
| `TRACK_RX` | 20 | Grosse Halbachse der Oval-Bahn (X) |
| `TRACK_RZ` | 14 | Kleine Halbachse der Oval-Bahn (Z) |
| `DRIVE_SPEED` | 0.12 | Umdrehungen pro Sekunde |
| `WHEEL_RADIUS` | 0.6 | Effektiver Radradius fuer Rotationsberechnung |

---

## Rennstrecke

**Datei:** `src/components/racetrack.js`

### Oval-Geometrie

Die Strecke ist eine **Ellipse** mit `TRACK_RX = 20` und `TRACK_RZ = 14` als Bahnmitte und `TRACK_WIDTH = 6` als Breite. Sie wird aus 120 Segmenten aufgebaut. Fuer jedes Segment werden Inner- und Outer-Edge berechnet:

```javascript
// Tangente am Punkt t auf der Ellipse
const tx_raw = -Math.sin(t) * TRACK_RX;
const tz_raw =  Math.cos(t) * TRACK_RZ;
const tLen = Math.sqrt(tx_raw ** 2 + tz_raw ** 2);

// Senkrechte (nach aussen)
const nx = tz_raw / tLen;
const nz = -tx_raw / tLen;

// Inner- und Outer-Punkte
inner = { x: cx - nx * TRACK_WIDTH/2,  z: cz - nz * TRACK_WIDTH/2 };
outer = { x: cx + nx * TRACK_WIDTH/2,  z: cz + nz * TRACK_WIDTH/2 };
```

Aus diesen Punkten wird eine `BufferGeometry` mit `(SEGMENTS+1) * 2` Vertices und entsprechenden Dreieck-Indices zusammengesetzt.

### Linien und Markierungen

- **Weisse Randlinien** (innen + aussen): `THREE.Line` entlang der Edge-Punkte
- **Gelbe Mittellinie**: `THREE.Line` entlang der Streckenmitte
- **Start-/Zielline**: Weisses Plane + 3 schwarze Checker-Streifen

### Curbing (Randsteine)

Rot/weiss alternierend wechselnde `BoxGeometry`-Segmente entlang beider Streckenkanten. Jedes Segment ist passend zur Streckenrichtung ausgerichtet (`Math.atan2`).

---

## Baeume

**Datei:** `src/components/trees.js`

Jeder Baum besteht aus drei Meshes: Stamm (konischer Zylinder) und zwei uebereinanderliegenden Kegel-Ebenen fuer eine natuerliche Tannenbaumform. Fuer jede Baumplatzierung werden Hoehe und Radius leicht variiert (via deterministischem Sinus-Rauschen, ohne `Math.random()` fuer reproduzierbare Ergebnisse).

### Platzierung

| Bereich | Anzahl | Beschreibung |
|---|---|---|
| Aussen (tracknahe) | ~60 | Entlang der Oval-Aussenseite, Abstand variiert |
| Infield | ~30 | Innenseite der Strecke, nur wenn weit genug weg |
| Tiefes Infield | 9 | Fixe Positionen im Streckenzentrum |
| Hintergrundwald | ~30 | Weit aussen als Kulisse, rund um die Strecke |

---

## Zuschauertribuene

**Datei:** `src/components/racetrack.js` → `addGrandstand()`

Die Tribunee liegt an der Start-/Ziel-Geraden, direkt ausserhalb der aeusseren Streckenkante (x ≈ 25.5).

### Aufbau

| Element | Beschreibung |
|---|---|
| **7 Betonstufen** | BoxGeometry, vom Boden bis zur Stufenhoehe gefuellt → ergibt Treppenprofil von der Seite |
| **7 Sitzreihen** | Farbige Boxes (blau/rot alternierend) auf jeder Betonstufe |
| **Ruckwand** | Senkrechte Betonwand hinter den Sitzreihen |
| **Seitenwaende** | Zwei Abschluswaende an den Enden der Tribunee |
| **Dach** | Flache Betonplatte ueber den Sitzreihen, leicht ueberstehend |
| **5 Stutzsaeulen** | Zylindrische Saeulen an der Vorderfront (Strecken-Seite) |
| **Werbebanden** | 7 bunte Panels entlang der Frontseite |

### Masse

| Eigenschaft | Wert |
|---|---|
| Laenge (entlang Z) | 28 Units |
| Stufentiefe | 1.8 Units pro Stufe |
| Stufenhoehe | 1.25 Units pro Stufe |
| Gesamthoehe Sitzreihen | 8.75 Units |
| Gesamttiefe | 12.6 Units |

---

## Post-Processing

**Datei:** `src/components/postprocessing.js`

```
Szene → RenderPass → UnrealBloomPass → OutputPass → Bildschirm
```

### UnrealBloomPass (Tageslicht-Einstellungen)

| Parameter | Wert | Beschreibung |
|---|---|---|
| Strength | 0.15 | Sehr schwacher Bloom fuer leichten Sonnenglanz |
| Radius | 0.3 | Enger Leuchtbereich |
| Threshold | 0.9 | Nur sehr helle Bereiche leuchten |

Der `OutputPass` sorgt fuer korrekte Farbraum-Konvertierung nach dem Tonemapping.

---

## Render-Pipeline

```
1. requestAnimationFrame()
2. clock.getElapsedTime()
3. Animationen updaten:
   └── updateCar()           ← Oval-Position + Fahrtrichtung + Radrotation
4. OrbitControls updaten
5. EffectComposer rendern (Bloom + OutputPass)
```

---

## Performance-Optimierungen

- **Geteilte Materialien:** Alle Baumstaemme teilen dasselbe `MeshLambertMaterial` (kein PBR → schneller)
- **MeshLambertMaterial statt MeshStandardMaterial** fuer Baeume und einfache Geometrien
- **Pixel Ratio Limit:** Max. 2x fuer HiDPI-Displays
- **Shadow Map Groesse:** 2048x2048 nur fuer Sonne, 512x512 fuer Spots
- **BufferGeometry fuer Asphalt:** Direkte Float32Array-Manipulation statt hoehere Abstraktionen
- **Shadow Bias -0.001/-0.002:** Verhindert Shadow Acne ohne Performance-Einbussen

---

## Verwendete Three.js-Features

### Rendering
- `WebGLRenderer` mit Antialiasing, PCFSoftShadowMap, ACESFilmicToneMapping
- `EffectComposer` mit `UnrealBloomPass` und `OutputPass`

### Materialien
- `MeshLambertMaterial` (Baeume, einfache Strukturen)
- `MeshStandardMaterial` (Emissive Lichtflaechen)
- `LineBasicMaterial` (Streckenlinien)

### Geometrien
`PlaneGeometry`, `BoxGeometry`, `CylinderGeometry`, `ConeGeometry`, `BufferGeometry` (custom), `Line`

### Beleuchtung
`DirectionalLight`, `SpotLight`, `HemisphereLight`, `AmbientLight`, `FogExp2`

### 3D-Modell-Import
- **`GLTFLoader`** (three/addons) fuer `car.glb` aus Blender

### Interaktion & Steuerung
- `OrbitControls` fuer freie Kamerasteuerung
- `THREE.Clock` fuer frameunabhaengige Zeitmessung
- `THREE.Box3` fuer Bounding-Box-basierte Platform-Erkennung

---

## Code-Beispiele

### Beispiel 1: Prozedurale Oval-Geometrie

```javascript
for (let i = 0; i <= SEGMENTS; i++) {
  const t = (i / SEGMENTS) * Math.PI * 2;

  // Mittelpunkt auf der Ellipse
  const cx = Math.cos(t) * TRACK_RX;
  const cz = Math.sin(t) * TRACK_RZ;

  // Tangente normalisieren
  const tx = -Math.sin(t) * TRACK_RX;
  const tz =  Math.cos(t) * TRACK_RZ;
  const len = Math.sqrt(tx * tx + tz * tz);

  // Senkrechte nach aussen
  const nx = tz / len;
  const nz = -tx / len;

  // Inner/Outer Edge-Punkte
  positions.push(cx - nx * TRACK_WIDTH/2, 0.01, cz - nz * TRACK_WIDTH/2);
  positions.push(cx + nx * TRACK_WIDTH/2, 0.01, cz + nz * TRACK_WIDTH/2);
}
```

### Beispiel 2: Auto auf Oval-Bahn mit korrekter Fahrtrichtung

```javascript
const t = elapsed * DRIVE_SPEED * Math.PI * 2;

// Position
model.position.x = Math.cos(t) * TRACK_RX;
model.position.z = Math.sin(t) * TRACK_RZ;

// Richtung: Tangente des Ovals via atan2
model.rotation.y = Math.atan2(
  -Math.sin(t) * TRACK_RX,
   Math.cos(t) * TRACK_RZ
) - Math.PI / 2;

// Radrotation (Ramanujan-Umfang)
const h = Math.pow((TRACK_RX - TRACK_RZ) / (TRACK_RX + TRACK_RZ), 2);
const C = Math.PI * (TRACK_RX + TRACK_RZ) * (1 + 3*h / (10 + Math.sqrt(4 - 3*h)));
const wheelAngle = elapsed * (DRIVE_SPEED * C) / WHEEL_RADIUS;
wheels.forEach(w => { w.rotation.x = wheelAngle; });
```

### Beispiel 3: Bounding-Box-Erkennung der Blender Export-Plane

```javascript
model.updateMatrixWorld(true);

model.traverse((child) => {
  if (!child.isMesh) return;

  const box  = new THREE.Box3().setFromObject(child);
  const size = box.getSize(new THREE.Vector3());

  // Flat-Plane-Heuristik: sehr flach UND breiter als 1 Unit
  if (size.y < 0.1 && size.x > 1.0) {
    child.visible = false; // Platform ausblenden
    return;
  }

  child.castShadow = true;
  child.receiveShadow = true;
});
```
