import * as PIXI from 'pixi.js';
import * as PIXILayers from '@pixi/layers';

import { Map } from '../../map';
import { Level } from '../../level';
import { loadTileMap, TileIndex, TileMapConfig } from '../../tilemap';

import { loadMinimap, Minimap } from '../../minimap';
import { Direction } from '../../geometry';
import { newPlayerDrawable, Player } from '../../player';

import levelSpritesheetImage from '../../assets/world-spritesheet4.png';
import levelSpritesheetData from '../../assets/world-spritesheet4.json';
import characterSpritesheetImage from '../../assets/walking-char.png';
import characterSpritesheetData from '../../assets/walking-char.json';

const floor1Layout: TileIndex[][] = [
  [1, 1, 1, 1],
  [1, 0, 0, 1],
  [1, 0, 0, 1],
  [1, 1, 1, 1],
];

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

export default async (stage: PIXI.Container): Promise<Level> => {
  const tileMapFloor1 = loadTileMap(floor1TileMapConfig);

  const floor1Group = new PIXILayers.Group(0);
  const floor1Layer = new PIXILayers.Layer(floor1Group);
  const floor1Container = new PIXI.Container();

  const map: Map = {
    size: {
      width: 100,
      height: 100,
    },
    floors: [
      {
        size: {
          width: 4,
          height: 4,
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
        entities: [],
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
      playerElevation,
    ),
    speed: 0,
  };

  return {
    name: 'demo',
    map,
    minimap,
    player,
    container: stage,
    currentFloor: 0,
  };
};
