# 🃏 Solitaire

Un juego de Solitario (Klondike) desarrollado con **TypeScript** y **Phaser 4**, siguiendo principios de arquitectura limpia.

## ✨ Características

### Jugabilidad
- **🎴 Solitario Klondike** - El clásico juego de cartas
- **🖱️ Drag & Drop** - Arrastra cartas entre pilas
- **👆 Doble Clic** - Envía cartas automáticamente a las foundations
- **↩️ Deshacer** - Revierte el último movimiento (hasta 50 movimientos)
- **💡 Pistas** - Sistema de sugerencias para el siguiente movimiento
- **🔄 Reciclaje de Mazo** - Recicla las cartas del waste pile
- **🎯 Detección Automática** - Detecta victoria y fin de juego

### Visual
- **🎨 Spritesheets** - Carga eficiente de cartas desde spritesheets
- **🔲 Bordes Redondeados** - Cartas con esquinas redondeadas configurables
- **🎭 Fondos Aleatorios** - El dorso de las cartas cambia en cada partida
- **✨ Animaciones** - Animaciones suaves al mover y voltear cartas

### Sistema
- **📊 Puntuación** - Sistema de puntos con bonificaciones
- **⏱️ Cronómetro** - Tiempo de juego registrado
- **📈 Movimientos** - Contador de movimientos

## 🚀 Comandos Disponibles

### Desarrollo
```bash
# Iniciar servidor de desarrollo con hot reload
npm run dev

# Desarrollo sin logs
npm run dev-nolog
```

### Producción
```bash
# Construir para producción
npm run build

# Build sin logs
npm run build-nolog
```

### Testing
```bash
# Ejecutar tests
npm test

# Tests en modo watch
npm run test:watch
```

### 🖥️ Escritorio (Electron)
```bash
# Modo desarrollo con hot-reload (recomendado para desarrollo)
npm run electron:dev

# Vista previa de producción (compila y ejecuta)
npm run electron:preview

# Compilar ejecutable para Windows (.exe)
npm run electron:build

# Compilar para todas las plataformas (Windows, Mac, Linux)
npm run electron:build:all
```

**Diferencia entre modos:**
- `electron:dev` - Usa el servidor de Vite con hot-reload. Los cambios en el código se reflejan automáticamente. Incluye DevTools abierto.
- `electron:preview` - Compila primero y luego ejecuta. Simula el comportamiento de producción.

Los ejecutables se generan en la carpeta `release/`:
- **Windows**: `Solitaire Setup x.x.x.exe` (instalador) y `Solitaire x.x.x.exe` (portable)
- **Mac**: `Solitaire-x.x.x.dmg`
- **Linux**: `Solitaire-x.x.x.AppImage` y `.deb`

## 📁 Estructura del Proyecto

El proyecto sigue una arquitectura limpia con separación entre lógica de negocio y presentación:

```
Solitaire/
├── src/
│   ├── main/                       # 🧠 Lógica del dominio (arquitectura limpia)
│   │   ├── entities/               # Entidades del juego
│   │   │   ├── Card.ts            # Carta individual
│   │   │   ├── Deck.ts            # Mazo de cartas (stock)
│   │   │   ├── Foundation.ts      # Pila de foundation (As → Rey)
│   │   │   ├── Tableau.ts         # Pila del tableau
│   │   │   └── WastePile.ts       # Pila de descarte
│   │   ├── interfaces/            # Contratos e interfaces
│   │   │   ├── ICard.ts
│   │   │   ├── IDeck.ts
│   │   │   ├── IFoundation.ts
│   │   │   ├── ITableau.ts
│   │   │   ├── IWastePile.ts
│   │   │   ├── IGameController.ts
│   │   │   └── IScoreManager.ts
│   │   ├── services/              # Servicios del juego
│   │   │   ├── GameController.ts  # Controlador principal
│   │   │   ├── GameManager.ts     # Gestor de estado del juego
│   │   │   ├── DealerService.ts   # Servicio de reparto
│   │   │   ├── ScoreManager.ts    # Gestor de puntuación
│   │   │   └── MoveHistory.ts     # Historial para deshacer
│   │   └── types/                 # Tipos y configuraciones
│   │       ├── CardConfig.ts      # Configuración de cartas
│   │       ├── CardValue.ts       # Valores de cartas
│   │       ├── Suit.ts            # Palos de cartas
│   │       └── DifficultyType.ts  # Niveles de dificultad
│   │
│   ├── game/                       # 🎮 Capa de presentación (Phaser)
│   │   ├── main.ts                # Configuración de Phaser
│   │   ├── config/
│   │   │   └── GameConfig.ts      # Configuración visual del juego
│   │   ├── components/
│   │   │   └── CardSprite.ts      # Componente visual de carta
│   │   └── scenes/
│   │       ├── Boot.ts            # Escena de inicialización
│   │       ├── Preloader.ts       # Carga de assets
│   │       └── Main.ts            # Escena principal del juego
│   │
│   └── index.ts                   # Punto de entrada
│
├── assets/                        # 🖼️ Recursos gráficos
│   └── cards/
│       ├── @playing-cards-01.png  # Spritesheet de cartas
│       └── @back-cards-01.png     # Spritesheet de dorsos
│
├── electron/                      # 🖥️ Configuración de Electron
│   ├── main.js                   # Proceso principal de Electron
│   └── preload.js                # Script de precarga
│
├── tests/                         # 🧪 Tests unitarios
├── vite/                          # ⚙️ Configuración de Vite
├── index.html                     # Página HTML principal
└── package.json                   # Dependencias y scripts
```

## 🎮 Cómo Jugar

### Objetivo
Mover todas las cartas a las 4 pilas de foundation, ordenadas por palo del As al Rey.

### Controles
- **Clic en el mazo**: Roba cartas del stock
- **Arrastrar**: Mueve cartas entre pilas
- **Doble clic**: Envía la carta a la foundation automáticamente
- **Botón Deshacer (↩️)**: Revierte el último movimiento
- **Botón Pista (💡)**: Muestra un movimiento sugerido
- **Botón Nuevo (🔄)**: Inicia una nueva partida

### Reglas
- Las cartas en el tableau se apilan en orden descendente y colores alternados
- Solo los Reyes pueden colocarse en espacios vacíos del tableau
- Las foundations se construyen en orden ascendente por palo (As → Rey)

## 🛠️ Tecnologías Utilizadas

- **Phaser 4.0.0-rc.5** - Motor de juegos 2D
- **TypeScript 4.0.0** - Tipado estático
- **Vite 7.1.4** - Build tool y dev server
- **Electron 33.0.0** - Aplicación de escritorio
- **Bun** - Runtime y test runner

## 📝 Instalación

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/tuusuario/solitaire.git
   cd solitaire
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Iniciar desarrollo:**
   ```bash
   npm run dev
   ```

4. **Abrir navegador:**
   El juego se ejecutará en `http://localhost:3000`

## ⚙️ Configuración

### Dimensiones de Cartas
Las dimensiones se configuran en `src/main/types/CardConfig.ts`:

```typescript
export const DEFAULT_CARD_CONFIG: CardConfig = {
    frameWidth: 71,        // Ancho del frame en el spritesheet
    frameHeight: 95,       // Alto del frame en el spritesheet
    borderRadius: 8,       // Radio del borde redondeado
    backgroundColor: 0xFFFFFF,  // Color de fondo de la carta
    // ...
};
```

### Configuración Visual
La configuración visual del juego está en `src/game/config/GameConfig.ts`:

```typescript
export const DEFAULT_VISUAL_CONFIG = {
    topRowY: 20,                    // Posición Y de la fila superior
    tableauY: 180,                  // Posición Y del tableau
    cardStackOffsetVisible: 30,     // Offset entre cartas visibles
    cardStackOffsetHidden: 10,      // Offset entre cartas ocultas
    // ...
};
```

## 📊 Sistema de Puntuación

| Acción | Puntos |
|--------|--------|
| Waste → Tableau | +5 |
| Waste → Foundation | +10 |
| Tableau → Foundation | +10 |
| Voltear carta del tableau | +5 |
| Foundation → Tableau | -15 |
| Reciclar waste (modo 1 carta) | -100 |

**Bonus por tiempo**: 700,000 / tiempo_en_segundos (si tiempo > 30s)

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.
