import * as PIXI from 'pixi.js';
import { Viewport } from 'pixi-viewport';

import TileSheetImage from './assets/world-spritesheet4.png';
import tileSheetData from './assets/world-spritesheet4.json';

import CharacterSpriteSheetImage from './assets/walking-char.png';
import characterSpriteSheetData from './assets/walking-char.json';

enum Direction {
  East = 0,
  NorthEast = 1,
  North = 2,
  NorthWest = 3,
  West = 4,
  SouthWest = 5,
  South = 6,
  SouthEast = 7,
}

const angleMap: Record<Direction, number> = {
  [Direction.East]: 27,
  [Direction.NorthEast]: 0,
  [Direction.North]: 333,
  [Direction.NorthWest]: 270,
  [Direction.West]: 205,
  [Direction.SouthWest]: 180,
  [Direction.South]: 153,
  [Direction.SouthEast]: 90,
};

const headingMap: Record<Direction, Vec2f> = {
  [Direction.East]: { x: 1, y: 0 },
  [Direction.NorthEast]: { x: 1, y: 1 },
  [Direction.North]: { x: 0, y: 1 },
  [Direction.NorthWest]: { x: -1, y: 1 },
  [Direction.West]: { x: -1, y: 0 },
  [Direction.SouthWest]: { x: -1, y: -1 },
  [Direction.South]: { x: 0, y: -1 },
  [Direction.SouthEast]: { x: 1, y: -1 },
};

interface Tile {
  name: string;
  elevation: number;
  blockPlayer: boolean;
}

interface TileMap {
  tileWidth: number;
  tileHeight: number;
  tileSheet: PIXI.Spritesheet;
  index: Record<number, Tile>;
}

interface WorldMap {
  data: number[][];
  width: number;
  height: number;
}

interface Level {
  name: string;
  worldWidth: number;
  worldHeight: number;
  worldMap: WorldMap;
  tileSheet: PIXI.Spritesheet;
  tileMap: TileMap;
}

const loadLevel = async (): Promise<Level> => {
  const tileSheetTexture = PIXI.Texture.from(TileSheetImage);
  const tileSheet = new PIXI.Spritesheet(tileSheetTexture, tileSheetData);

  await tileSheet.parse();

  const mapData = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [0, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1],
    [0, 1, 1, 1, 1, 1, 1, 1, 2, 2, 1, 1],
    [0, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1],
    [0, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1],
    [0, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1],
    [0, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  ];

  return {
    name: 'Playground',
    tileSheet,
    worldMap: {
      data: mapData,
      width: mapData[0].length,
      height: mapData.length, 
    },
    tileMap: {
      tileHeight: 50,
      tileWidth: 100,
      tileSheet,
      index: {
        0: {
          name: 'water.png',
          elevation: 0,
          blockPlayer: true,
        },
        1: {
          name: 'grass.png',
          elevation: 1,
          blockPlayer: false,
        },
        2: {
          name: 'lot.png',
          elevation: 2,
          blockPlayer: false,
        },
      },
    },
    worldWidth: 2000,
    worldHeight: 1000,
  };
};

const renderTileMap = (
  viewport: Viewport,
  tileMap: TileMap,
  worldMap: WorldMap,
): PIXI.Container => {
  const container = new PIXI.Container();

  viewport.addChild(container);

  for (let y = 0; y < worldMap.height; y += 1) {
    const row = worldMap.data[y];

    for (let x = 0; x < row.length; x += 1) {
      const value = row[x];
      const tile = tileMap.index[value];

      const sprite = container.addChild(
        new PIXI.Sprite(tileMap.tileSheet.textures[tile.name]),
      );

      const offsetX = tileMap.tileWidth / 2;
      const offsetY = tileMap.tileHeight;

      const baseX = viewport.worldWidth / 2 - offsetX;
      const baseY =
        viewport.worldHeight / 2 - (worldMap.height * tileMap.tileHeight) / 2;

      sprite.x = baseX + x * offsetX - y * offsetY;
      sprite.y = baseY + y * offsetY + x * (offsetY / 2) - y * (offsetY / 2) - (tile.elevation * (tileMap.tileHeight / 8));

      viewport.addChild(sprite);
    }
  }

  return container;
};

const setupWorld = (
  app: PIXI.Application,
  {
    worldWidth,
    worldHeight,
  }: {
    worldWidth: number;
    worldHeight: number;
  },
): Viewport => {
  const viewport = new Viewport({
    screenWidth: window.innerWidth,
    screenHeight: window.innerHeight,
    worldWidth,
    worldHeight,
    interaction: app.renderer.plugins.interaction,
  });

  viewport
    .drag()
    .decelerate()
    .wheel()
    .clamp({
      left: true,
      right: true,
      top: true,
      bottom: true,
      direction: 'all',
      underflow: 'none',
    })
    .clampZoom({
      maxHeight: 2000,
      maxWidth: 2000,
      minHeight: 100,
      minWidth: 100,
    })
    .moveCenter(worldWidth / 2, worldHeight / 2);

  app.stage.addChild(viewport);

  document.body.appendChild(app.view);

  return viewport;
};

interface Position {
  x: number;
  y: number;
}

interface Vec2f {
  x: number;
  y: number;
}

interface PlayerDrawable {
    gizmo: PIXI.Graphics;
    spritesheet: PIXI.Spritesheet;
    anchorMap: Record<Direction, Position>;
    idleTextures: Record<Direction, PIXI.Texture>;
    animationTextures: Record<Direction, PIXI.Texture[]>;
    animatedSprite: PIXI.AnimatedSprite;
}

interface Player {
  position: Position;
  direction: Direction;
  speed: number;
  drawable: PlayerDrawable;
}

// const headings: Direction[] = [
//   Direction.East,
//   Direction.NorthEast,
//   Direction.North,
//   Direction.NorthWest,
//   Direction.West,
//   Direction.SouthWest,
//   Direction.South,
//   Direction.SouthEast,
// ];

// const getCardinalDirection = (vector: Vec2f): Direction => {
//   const angle = Math.atan2(vector.y, vector.x);
//   const octant = Math.round((8 * angle) / (2 * Math.PI) + 8) % 8;
//
//   return headings[octant];
// };

const computeIsometricCoordinates = (position: Vec2f, level: Level): Vec2f => {
  const { tileMap, worldWidth, worldHeight, worldMap } = level;

  const baseX = worldWidth / 2;
  const baseY = worldHeight / 2 - (worldMap.height * tileMap.tileHeight) / 2;

  const isoX =
    baseX + (position.x - position.y) * (level.tileMap.tileWidth / 2);
  const isoY =
    baseY + (position.x + position.y) * (level.tileMap.tileHeight / 2);

  return {
    x: isoX,
    y: isoY,
  };
};

const renderPlayer = (player: Player, level: Level): void => {
  const { x, y } = computeIsometricCoordinates(player.position, level);
  const { animatedSprite: sprite, gizmo } = player.drawable;
  
  const roundedPosition: Position = {
    x: Math.floor(player.position.x),
    y: Math.floor(player.position.y),
  }

  const tileValue = level.worldMap.data[roundedPosition.y][roundedPosition.x];
  const tile = level.tileMap.index[tileValue]

  const elevationOffset = (tile.elevation * (level.tileMap.tileHeight / 8))

  sprite.setTransform(x, y - elevationOffset);

  gizmo.pivot = sprite.anchor;
  gizmo.position = sprite.position;
  gizmo.angle = angleMap[player.direction];
};

const stopPlayer = (player: Player): void => {
  player.speed = 0;

  player.drawable.animatedSprite.stop();
  player.drawable.animatedSprite.texture = player.drawable.idleTextures[player.direction];
}

const startPlayer = (player: Player): void => {
  player.speed = 1;

  player.drawable.animatedSprite.textures = player.drawable.animationTextures[player.direction];
  player.drawable.animatedSprite.play();
}

const updatePlayer = (player: Player, level: Level): Player => {
  const { worldMap } = level;
  const heading = headingMap[player.direction];

  // const isInterval = [
  //   Direction.NorthEast,
  //   Direction.NorthWest,
  //   Direction.SouthEast,
  //   Direction.SouthWest,
  // ].includes(player.direction);
  //
  // const speedFactor = isInterval ? 0.5 : 1;

  const prevX = player.position.x;
  const prevY = player.position.y;

  player.position.x += player.speed * 0.01 * heading.x;
  player.position.y += player.speed * 0.01 * -heading.y;

  const roundedPosition: Position = {
    x: Math.floor(player.position.x),
    y: Math.floor(player.position.y),
  }

  const tileValue = level.worldMap.data[roundedPosition.y][roundedPosition.x];
  const newTile = level.tileMap.index[tileValue]

  if (newTile === undefined || newTile.blockPlayer === true) {
    player.position.x = prevX;
    player.position.y = prevY;
    stopPlayer(player);
  }

  if (player.position.x < 0) {
    player.position.x = 0;
    stopPlayer(player);
  }

  if (player.position.x > worldMap.width) {
    player.position.x = worldMap.width;
    stopPlayer(player);
  }

  if (player.position.y < 0) {
    player.position.y = 0;
    stopPlayer(player);
  }

  if (player.position.y > worldMap.height) {
    player.position.y = worldMap.height;
    stopPlayer(player);
  }

  return player;
};

// function generateRandomInteger(min: number, max: number) {
//   return Math.floor(min + Math.random() * (max - min + 1));
// }
//
// const randomVector = (): Vec2f => ({
//   x: Math.round(generateRandomInteger(-1, 1)),
//   y: Math.round(generateRandomInteger(-1, 1)),
// });

const generateGizmo = (): PIXI.Graphics => {
  const graphics = new PIXI.Graphics();

  graphics
    .beginFill(0xff3300)
    .lineStyle(1, 0xffd900, 1)
    .moveTo(0, 0)
    .lineTo(0, 0)
    .lineTo(100, 0)
    .closePath()
    .endFill();

  return graphics;
};

const newPlayerDrawable = async (): Promise<PlayerDrawable> => {
  const spritesheetTexture = PIXI.Texture.from(CharacterSpriteSheetImage);
  const spritesheet = new PIXI.Spritesheet(
    spritesheetTexture,
    characterSpriteSheetData,
  );

  await spritesheet.parse();

  const idleTextures: Record<Direction, PIXI.Texture> = {
    [Direction.East]: spritesheet.textures['char-e-01.png'],
    [Direction.NorthEast]: spritesheet.textures['char-ne-01.png'],
    [Direction.North]: spritesheet.textures['char-n-01.png'],
    [Direction.NorthWest]: spritesheet.textures['char-nw-01.png'],
    [Direction.West]: spritesheet.textures['char-w-01.png'],
    [Direction.SouthWest]: spritesheet.textures['char-sw-01.png'],
    [Direction.South]: spritesheet.textures['char-s-01.png'],
    [Direction.SouthEast]: spritesheet.textures['char-se-01.png'],
  };

  const anchorMap: Record<Direction, Position> = {
    [Direction.East]: {x: 0.62, y: 0.56},
    [Direction.NorthEast]: {x: 0.68, y: 0.50},
    [Direction.North]: {x: 0.63, y: 0.40},
    [Direction.NorthWest]: {x: 0.50, y: 0.40},
    [Direction.West]: {x: 0.37, y: 0.43},
    [Direction.SouthWest]: {x: 0.29, y: 0.47},
    [Direction.South]: {x: 0.35, y: 0.56},
    [Direction.SouthEast]: {x: 0, y: 0},
  };

  const animationTextures: Record<Direction, PIXI.Texture[]> = {
    [Direction.East]: spritesheet.animations["char-e"],
    [Direction.NorthEast]: spritesheet.animations["char-ne"],
    [Direction.North]: spritesheet.animations["char-n"],
    [Direction.NorthWest]: spritesheet.animations["char-nw"],
    [Direction.West]: spritesheet.animations["char-w"],
    [Direction.SouthWest]: spritesheet.animations["char-sw"],
    [Direction.South]: spritesheet.animations["char-s"],
    [Direction.SouthEast]: spritesheet.animations["char-se"],
  };

  const animatedSprite = new PIXI.AnimatedSprite(animationTextures[Direction.North]);
  animatedSprite.animationSpeed = 0.16;
  animatedSprite.anchor.y = 0.85;
  animatedSprite.pivot.y = 0.85;

  return {
    anchorMap,
    animatedSprite,
    animationTextures,
    gizmo: generateGizmo(),
    idleTextures,
    spritesheet,
  };
};

const MINIMAP_WIDTH = 100;
const MINIMAP_HEIGHT = 100;

const updateMinimap = (
  minimap: Minimap,
): void => {
  const { drawable, player, level } = minimap;
  const { playerDot} = drawable;
  const { worldMap} = level;

  const ratioX = player.position.x / worldMap.width;
  const ratioY = player.position.y / worldMap.height;

  const minimapPlayerX = MINIMAP_WIDTH * ratioX;
  const minimapPlayerY = MINIMAP_HEIGHT * ratioY;


  playerDot.position.x = minimapPlayerX;
  playerDot.position.y = minimapPlayerY;
};

interface Minimap {
  level: Level;
  player: Player;
  drawable: {
    container: PIXI.Container;
    background: PIXI.Graphics;
    playerDot: PIXI.Graphics;
  };
}

const loadMinimap = (player: Player, level: Level): Minimap => {
  const container = new PIXI.Container();

  const background = new PIXI.Graphics()
    .beginFill(0xff3300)
    .lineStyle(1, 0xffd900, 1)
    .moveTo(0, 0)
    .lineTo(0, 0)
    .lineTo(MINIMAP_WIDTH, 0)
    .lineTo(MINIMAP_WIDTH, MINIMAP_HEIGHT)
    .lineTo(0, MINIMAP_HEIGHT)
    .closePath()
    .endFill();

  const playerDot = new PIXI.Graphics()
    .lineStyle(0)
    .beginFill(0xde3249, 1)
    .drawCircle(0, 0, 5)
    .endFill();

  container.addChild(background);
  container.addChild(playerDot);

  return {
    player,
    level,
    drawable: {
      container,
      background,
      playerDot,
    },
  };
};

const renderWorld = (
  app: PIXI.Application,
  viewport: Viewport,
  player: Player,
  level: Level,
): {
  levelContainer: PIXI.Container;
  minimap: Minimap;
} => {
  const {tileMap, worldMap } = level;

  const levelContainer = renderTileMap(viewport, tileMap, worldMap);

  const minimap = loadMinimap(player, level);

  minimap.drawable.container.position.x = 100;
  minimap.drawable.container.position.y = 100;

  viewport.addChild(player.drawable.animatedSprite);
  viewport.addChild(player.drawable.gizmo);

  app.stage.addChild(minimap.drawable.container);

  return {
    levelContainer,
    minimap,
  };
};

const main = async (): Promise<void> => {
  const app = new PIXI.Application({
    width: window.innerWidth,
    height: window.innerHeight,
    antialias: true,
  });

  const level = await loadLevel();

  const player: Player = {
    position: {
      x: 8,
      y: 4,
    },
    direction: Direction.South,
    drawable: await newPlayerDrawable(),
    speed: 0,
  };

  stopPlayer(player);

  const viewport = setupWorld(app, {
    worldWidth: level.worldWidth,
    worldHeight: level.worldHeight,
  });

  const { minimap } = renderWorld(app, viewport, player, level);

  app.ticker.start();

  document.addEventListener('keydown', (event: KeyboardEvent) => {
    if (event.key === 'a') {
      if (player.speed === 0) {
        startPlayer(player);
      } else {
        stopPlayer(player);
      }
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      player.direction += event.key === 'ArrowLeft' ? 1 : -1;

      if (player.direction > Direction.SouthEast) {
        player.direction = Direction.East;
      }

      if ((player.direction as number) === -1) {
        player.direction = Direction.SouthEast;
      }

      const wasPlaying = player.drawable.animatedSprite.playing;

      player.drawable.animatedSprite.textures = player.drawable.animationTextures[player.direction];
      if (wasPlaying) {
        player.drawable.animatedSprite.play();
      } else {
        stopPlayer(player);
      }
    }
  });

  app.ticker.add(() => {
    renderPlayer(player, level);

    updatePlayer(player, level);
    updateMinimap(minimap);
  });
};

main();
