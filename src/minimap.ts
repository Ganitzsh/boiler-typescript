import * as PIXI from 'pixi.js';

import { Level } from './level';
import { Player } from './player';

const MINIMAP_WIDTH = 100;
const MINIMAP_HEIGHT = 100;

export interface Minimap {
  width: number;
  height: number;
  level: Level;
  drawable: {
    container: PIXI.Container;
    background: PIXI.Graphics;
    playerDot: PIXI.Graphics;
  };
}

export const updateMinimap = (minimap: Minimap): void => {
  const { drawable, player, level } = minimap;
  const { playerDot } = drawable;
  const { world } = level;

  const ratioX = player.position.x / worldMap.width;
  const ratioY = player.position.y / worldMap.height;

  const minimapPlayerX = MINIMAP_WIDTH * ratioX;
  const minimapPlayerY = MINIMAP_HEIGHT * ratioY;

  playerDot.position.x = minimapPlayerX;
  playerDot.position.y = minimapPlayerY;
};

export const loadMinimap = (
  width: number,
  height: number,
  player: Player,
  level: Level,
): Minimap => {
  const container = new PIXI.Container();

  const background = new PIXI.Graphics()
    .beginFill(0xff3300)
    .lineStyle(1, 0xffd900, 1)
    .moveTo(0, 0)
    .lineTo(0, 0)
    .lineTo(width, 0)
    .lineTo(width, height)
    .lineTo(0, height)
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
    width,
    height,
    player,
    level,
    drawable: {
      container,
      background,
      playerDot,
    },
  };
};
