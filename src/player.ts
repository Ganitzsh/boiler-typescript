import * as PIXI from 'pixi.js';
import * as PIXILayers from '@pixi/layers';

import {
  angleMap,
  computeIsometricCoordinates,
  Direction,
  headingMap,
  Vec2f,
} from './geometry';
import { Floor } from './map';
import { generateGizmo } from './debug';

export interface PlayerDrawable {
  gizmo: PIXI.Graphics;
  spritesheet: PIXI.Spritesheet;
  anchorMap: Record<Direction, Vec2f>;
  idleTextures: Record<Direction, PIXI.Texture>;
  animationTextures: Record<Direction, PIXI.Texture[]>;
  animatedSprite: PIXI.AnimatedSprite;
  layer: PIXILayers.Layer;
  group: PIXILayers.Group;
  container: PIXI.Container;
}

export interface Player {
  position: Vec2f;
  direction: Direction;
  speed: number;
  elevation: number;
  drawable: PlayerDrawable;
}

export const renderPlayer = (player: Player, base?: Vec2f): PIXI.Container => {
  const container = new PIXI.Container();

  player.drawable.container.position.x = base?.x ?? 0;
  player.drawable.container.position.y = base?.y ?? 0;

  container.addChild(player.drawable.container);

  return container;
};

export const updatePlayerDrawable = (
  player: Player,
  tileHeight: number,
  tileWidth: number,
): void => {
  const { x, y } = computeIsometricCoordinates(
    player.position,
    tileHeight,
    tileWidth,
  );
  const { animatedSprite: sprite, gizmo } = player.drawable;

  // const roundedPosition: Vec2f = {
  //   x: Math.floor(player.position.x),
  //   y: Math.floor(player.position.y),
  // };
  //
  // const tileValue = level.worldMap.data[roundedPosition.y][roundedPosition.x];
  // const tile = level.tileMap.index[tileValue];
  //
  // const elevationOffset = tile.elevation * (level.tileMap.tileHeight / 8);
  //
  // sprite.setTransform(x, y - elevationOffset);

  sprite.setTransform(x, y);

  gizmo.pivot = sprite.anchor;
  gizmo.position = sprite.position;
  gizmo.angle = angleMap[player.direction];
};

export const stopPlayer = (player: Player): void => {
  console.log('Stop player');
  player.speed = 0;

  player.drawable.animatedSprite.stop();
  player.drawable.animatedSprite.texture =
    player.drawable.idleTextures[player.direction];
};

export const startPlayer = (player: Player): void => {
  player.speed = 0.02;

  player.drawable.animatedSprite.textures =
    player.drawable.animationTextures[player.direction];
  player.drawable.animatedSprite.play();
};

export const updatePlayerState = (
  player: Player,
  floor: Floor,
  delta: number,
): Player => {
  const heading = headingMap[player.direction];

  const prevX = player.position.x;
  const prevY = player.position.y;

  player.position.x += player.speed * delta * heading.x;
  player.position.y += player.speed * delta * -heading.y;

  if (player.position.x < 0) {
    player.position.x = 0;
    stopPlayer(player);
  }

  if (player.position.x > floor.size.width) {
    player.position.x = floor.size.width;
    stopPlayer(player);
  }

  if (player.position.y < 0) {
    player.position.y = 0;
    stopPlayer(player);
  }

  if (player.position.y > floor.size.height) {
    player.position.y = floor.size.height - 0.1;
    stopPlayer(player);
  }

  const roundedPosition: Vec2f = {
    x: Math.floor(player.position.x),
    y: Math.floor(player.position.y),
  };

  const tileValue = floor.ground.layout[roundedPosition.y][roundedPosition.x];
  const newTile = floor.ground.tileMap.tiles.index[tileValue];

  if (newTile === undefined || newTile.blockPlayer === true) {
    console.log('newTile undefined');
    player.position.x = prevX;
    player.position.y = prevY;
    stopPlayer(player);
  }

  return player;
};

export const newPlayerDrawable = async (
  spritesheetImage: any,
  spritesheetData: any,
  zIndex: number,
): Promise<PlayerDrawable> => {
  const spritesheetTexture = PIXI.Texture.from(spritesheetImage);
  const spritesheet = new PIXI.Spritesheet(spritesheetTexture, spritesheetData);

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

  const anchorMap: Record<Direction, Vec2f> = {
    [Direction.East]: { x: 0.62, y: 0.56 },
    [Direction.NorthEast]: { x: 0.68, y: 0.5 },
    [Direction.North]: { x: 0.63, y: 0.4 },
    [Direction.NorthWest]: { x: 0.5, y: 0.4 },
    [Direction.West]: { x: 0.37, y: 0.43 },
    [Direction.SouthWest]: { x: 0.29, y: 0.47 },
    [Direction.South]: { x: 0.35, y: 0.56 },
    [Direction.SouthEast]: { x: 0, y: 0 },
  };

  const animationTextures: Record<Direction, PIXI.Texture[]> = {
    [Direction.East]: spritesheet.animations['char-e'],
    [Direction.NorthEast]: spritesheet.animations['char-ne'],
    [Direction.North]: spritesheet.animations['char-n'],
    [Direction.NorthWest]: spritesheet.animations['char-nw'],
    [Direction.West]: spritesheet.animations['char-w'],
    [Direction.SouthWest]: spritesheet.animations['char-sw'],
    [Direction.South]: spritesheet.animations['char-s'],
    [Direction.SouthEast]: spritesheet.animations['char-se'],
  };

  const animatedSprite = new PIXI.AnimatedSprite(
    animationTextures[Direction.North],
  );
  animatedSprite.animationSpeed = 0.16;
  animatedSprite.anchor.y = 0.85;
  animatedSprite.pivot.y = 0.85;

  const gizmo = generateGizmo();
  const group = new PIXILayers.Group(zIndex);
  const layer = new PIXILayers.Layer(group);
  const container = new PIXI.Container();

  container.addChild(animatedSprite);
  container.addChild(gizmo);

  return {
    anchorMap,
    animatedSprite,
    animationTextures,
    gizmo,
    idleTextures,
    spritesheet,
    group,
    layer,
    container,
  };
};
