import * as PIXI from 'pixi.js';
import { Viewport } from 'pixi-viewport';

import { renderTileMap } from './map';

const MINIMAP_WIDTH = 50;
const MINIMAP_HEIGHT = 50;

const VIEWPORT_MIN_ZOOM = 100; // In %
const VIEWPORT_MAX_ZOOM = 300; // In %

export interface World {
  width: number;
  height: number;
  viewport: Viewport;
}

export const setupWorld = (
  app: PIXI.Application,
  {
    width,
    height,
  }: {
    width: number;
    height: number;
  },
): World => {
  const viewport = new Viewport({
    screenWidth: window.innerWidth,
    screenHeight: window.innerHeight,
    worldWidth: width,
    worldHeight: height,
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
      maxHeight: height + height * (VIEWPORT_MIN_ZOOM / 100),
      maxWidth: width + width * (VIEWPORT_MIN_ZOOM / 100),
      minHeight: height * (VIEWPORT_MAX_ZOOM / 1000),
      minWidth: width * (VIEWPORT_MAX_ZOOM / 1000),
    })
    .moveCenter(width / 2, height / 2);

  app.stage.addChild(viewport);

  return {
    width,
    height,
    viewport,
  };
};

export const generateGizmo = (): PIXI.Graphics => {
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

export const renderWorld = (
  app: PIXI.Application,
  viewport: Viewport,
  player: Player,
  level: Level,
): {
  levelContainer: PIXI.Container;
  minimap: Minimap;
} => {
  const { tileMap, worldMap } = level.map;

  const levelContainer = renderTileMap(viewport, tileMap, worldMap);

  const minimap = loadMinimap(MINIMAP_WIDTH, MINIMAP_HEIGHT, player, level);

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
