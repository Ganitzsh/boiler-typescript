import { Level } from '../level';
import { TileMap } from '../tilemap';

import levelSpritesheetImage from '../assets/world-spritesheet4.png';
import levelSpritesheetData from '../assets/world-spritesheet4.json';
import characterSpritesheetImage from '../assets/walking-char.png';
import characterSpritesheetData from '../assets/walking-char.json';

const WORLD_WIDTH = 2000;
const WORLD_HEIGHT = 2000;

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

const world: World = {
  width: WORLD_WIDTH,
  height: WORLD_HEIGHT,
};

const tileMap: TileMap = {
  tileHeight: 50,
  tileWidth: 100,
  spritesheet: {
    image: levelSpritesheetImage,
    data: levelSpritesheetData,
  },
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
};

const level: Level = {
  name: 'Playground',
};

export default level;
