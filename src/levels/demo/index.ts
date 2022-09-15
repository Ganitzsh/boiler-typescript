import * as PIXI from 'pixi.js';

import { EntityDrawable, Floor, loadGround, Map } from '../../map';
import { Level } from '../../level';
import { loadTileMap } from '../../tilemap';
import { loadMinimap, Minimap } from '../../minimap';
import { Direction } from '../../geometry';
import { newPlayerDrawable, Player } from '../../player';

import levelSpritesheetImage from '../../assets/world-spritesheet4.png';
import levelSpritesheetData from '../../assets/world-spritesheet4.json';
import characterSpritesheetImage from '../../assets/walking-char.png';
import characterSpritesheetData from '../../assets/walking-char.json';
import building1SpriteImage from '../../assets/building1.png';

const newBuilding1Drawable = (name?: string): EntityDrawable => {
  const container = new PIXI.Container();
  const sprite = PIXI.Sprite.from(building1SpriteImage);

  sprite.anchor.x = 0.5;
  sprite.anchor.y = 0.5;

  container.addChild(sprite);

  if (name !== undefined) {
    container.name = name;
  }

  return {
    container,
    sprites: [sprite],
  };
};

export const newFloor1 = (): Floor => {
  const tileMap = loadTileMap({
    tiles: {
      width: 100,
      height: 50,
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
  });

  const size = {
    width: 8,
    height: 8,
  };

  const layout = new Array(size.height)
    .fill(0)
    .map(() => new Array(size.width).fill(1));

  return {
    size,
    ground: {
      tileMap,
      layout,
      drawable: loadGround(tileMap, layout),
    },
    entities: [
      {
        name: 'building1-1',
        position: {
          x: 4,
          y: 4,
        },
        size: {
          width: 2.1,
          height: 3,
        },
        drawable: newBuilding1Drawable('building1-1'),
      },
      {
        name: 'building1-2',
        position: {
          x: 0,
          y: 4,
        },
        size: {
          width: 2.1,
          height: 3,
        },
        drawable: newBuilding1Drawable('building1-2'),
      },
    ],
  };
};

export default async (): Promise<Level> => {
  const map: Map = {
    size: {
      width: 100,
      height: 100,
    },
    floors: [newFloor1()],
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

  player.drawable.container.name = 'player';

  return {
    name: 'demo',
    map,
    minimap,
    player,
    currentFloor: 0,
  };
};
