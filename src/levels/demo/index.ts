import * as PIXI from 'pixi.js';

import { EntityDrawable, Floor, loadGround, Map } from '../../map';
import { Level } from '../../level';
import { loadTileMap, TileIndex } from '../../tilemap';
import { loadMinimap, Minimap } from '../../minimap';
import { Direction } from '../../geometry';
import { newPlayerDrawable, Player } from '../../player';

import levelSpritesheetImage from '../../assets/world-spritesheet9.png';
import levelSpritesheetData from '../../assets/world-spritesheet9.json';
import characterSpritesheetImage from '../../assets/walking-char.png';
import characterSpritesheetData from '../../assets/walking-char.json';
import building1SpriteImage from '../../assets/building1.png';
import { newSquareBoundingBox } from '../../collision';

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
  const tileWidth = 114;

  const tileMap = loadTileMap({
    tiles: {
      width: tileWidth,
      height: tileWidth / 2,
      defaultIndex: 1,
      index: {
        0: {
          name: 'water_center_N.png',
          elevation: 1,
          blockPlayer: false,
        },
        1: {
          name: 'dirt_center_N.png',
          elevation: 1,
          blockPlayer: false,
        },
        2: {
          name: 'dirt_low_N.png',
          elevation: 0.75,
          blockPlayer: false,
        },
      },
    },
    spritesheet: {
      image: levelSpritesheetImage,
      data: levelSpritesheetData as any,
    },
  });

  const layout: TileIndex[][] = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 1, 1, 1, 1, 1, 1, 0],
    [0, 1, 1, 1, 1, 1, 1, 0],
    [0, 1, 1, 1, 1, 1, 1, 0],
    [0, 1, 2, 2, 2, 1, 1, 0],
    [0, 1, 2, 2, 2, 1, 1, 0],
    [0, 1, 1, 1, 1, 1, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
  ];
  console.log(newBuilding1Drawable());

  const size = {
    width: layout[0].length,
    height: layout.length,
  };

  return {
    size,
    ground: {
      tileMap,
      layout,
      drawable: loadGround(tileMap, layout),
    },
    entities: [
      // {
      //   name: 'building1-1',
      //   position: {
      //     x: 4,
      //     y: 4,
      //   },
      //   size: building1Size,
      //   boundingBox: newSquareBoundingBox(
      //     {
      //       x: 4,
      //       y: 4,
      //     },
      //     building1Size,
      //   ),
      //   drawable: newBuilding1Drawable('building1-1'),
      // },
      // {
      //   name: 'building1-2',
      //   position: {
      //     x: 0,
      //     y: 4,
      //   },
      //   size: building1Size,
      //   boundingBox: newSquareBoundingBox(
      //     {
      //       x: 0,
      //       y: 4,
      //     },
      //     building1Size,
      //   ),
      //   drawable: newBuilding1Drawable('building1-2'),
      // },
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
    boundingBox: newSquareBoundingBox(
      {
        x: 1,
        y: 0,
      },
      {
        width: 0.1,
        height: 0.1,
      },
    ),
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
