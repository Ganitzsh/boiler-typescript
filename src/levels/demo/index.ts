import * as PIXI from 'pixi.js';
import * as PIXILayers from '@pixi/layers';

import { Map } from '../../map';
import { Level } from '../../level';
import { loadTileMap, TileMapConfig } from '../../tilemap';

import { loadMinimap, Minimap } from '../../minimap';
import { Direction } from '../../geometry';
import { newPlayerDrawable, Player } from '../../player';

import levelSpritesheetImage from '../../assets/world-spritesheet4.png';
import levelSpritesheetData from '../../assets/world-spritesheet4.json';
import characterSpritesheetImage from '../../assets/walking-char.png';
import characterSpritesheetData from '../../assets/walking-char.json';
import building1SpriteImage from '../../assets/building1-huge.png';

const floor1TileMapConfig: TileMapConfig = {
  tiles: {
    width: 99,
    height: 49,
    defaultIndex: 1,
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
  spritesheet: {
    image: levelSpritesheetImage,
    data: levelSpritesheetData,
  },
};

const newBuilding1Drawable = (): {
  sprite: PIXI.Sprite;
  container: PIXI.Container;
} => {
  const container = new PIXI.Container();
  const sprite = PIXI.Sprite.from(building1SpriteImage);

  sprite.anchor.x = 0.5;
  sprite.anchor.y = 0.5;

  container.addChild(sprite);

  return {
    container,
    sprite,
  };
};

export default async (): Promise<Level> => {
  const tileMapFloor1 = loadTileMap(floor1TileMapConfig);

  const floor1Size = {
    width: 50,
    height: 50,
  };
  const floor1Layout = new Array(floor1Size.height)
    .fill(0)
    .map(() => new Array(floor1Size.width).fill(1));
  const floor1Group = new PIXILayers.Group(0);
  const floor1Layer = new PIXILayers.Layer(floor1Group);
  const floor1Container = new PIXI.Container();

  const building1Drawable = newBuilding1Drawable();

  const map: Map = {
    size: {
      width: 100,
      height: 100,
    },
    floors: [
      {
        size: {
          width: floor1Size.width,
          height: floor1Size.height,
        },
        ground: {
          tileMap: tileMapFloor1,
          layout: floor1Layout,
          drawable: {
            group: floor1Group,
            layer: floor1Layer,
            container: floor1Container,
          },
        },
        entities: [
          {
            position: {
              x: 4,
              y: 4,
            },
            drawable: building1Drawable,
          },
        ],
      },
    ],
  };

  const minimap: Minimap = loadMinimap(100, 100);

  const playerElevation = 1;
  const player: Player = {
    position: {
      x: 1,
      y: 0,
    },
    elevation: playerElevation,
    direction: Direction.South,
    drawable: await newPlayerDrawable(
      characterSpritesheetImage,
      characterSpritesheetData,
    ),
    speed: 0,
  };

  return {
    name: 'demo',
    map,
    minimap,
    player,
    currentFloor: 0,
  };
};
