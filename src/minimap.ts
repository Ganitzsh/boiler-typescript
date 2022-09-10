import * as PIXI from 'pixi.js';

import { Vec2f } from './geometry';
import { Floor } from './map';
import { Player } from './player';

export interface Minimap {
  position: Vec2f;
  size: {
    width: number;
    height: number;
  };
  drawable: {
    background: PIXI.Graphics;
    playerDot: PIXI.Graphics;
  };
}

export const updateMinimap = (
  minimap: Minimap,
  floor: Floor,
  player: Player,
): void => {
  const { drawable } = minimap;
  const { playerDot } = drawable;

  const ratioX = player.position.x / floor.size.width;
  const ratioY = player.position.y / floor.size.height;

  const minimapPlayerX = minimap.size.width * ratioX;
  const minimapPlayerY = minimap.size.height * ratioY;

  playerDot.position.x = minimapPlayerX;
  playerDot.position.y = minimapPlayerY;
};

export const loadMinimap = (width: number, height: number): Minimap => {
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

  background.alpha = 0.5;

  const playerDot = new PIXI.Graphics()
    .lineStyle(0)
    .beginFill(0x87ceeb, 1)
    .drawCircle(0, 0, 5)
    .endFill();

  return {
    position: {
      x: 0,
      y: 0,
    },
    size: {
      width,
      height,
    },
    drawable: {
      background,
      playerDot,
    },
  };
};

export const renderMinimap = (minimap: Minimap): PIXI.Container => {
  const container = new PIXI.Container();

  container.addChild(minimap.drawable.background);
  container.addChild(minimap.drawable.playerDot);

  return container;
};
