import * as PIXI from 'pixi.js';

import { Level, computeIsometricCoordinates } from './level';
import { angleMap, Direction, headingMap } from './trigonometry';
import { generateGizmo, Position } from './world';

export interface PlayerDrawable {
  gizmo: PIXI.Graphics;
  spritesheet: PIXI.Spritesheet;
  anchorMap: Record<Direction, Position>;
  idleTextures: Record<Direction, PIXI.Texture>;
  animationTextures: Record<Direction, PIXI.Texture[]>;
  animatedSprite: PIXI.AnimatedSprite;
}

export interface Player {
  position: Position;
  direction: Direction;
  speed: number;
  drawable: PlayerDrawable;
}

export const renderPlayer = (
  container: PIXI.Container,
  player: Player,
): void => {
  const { x, y } = computeIsometricCoordinates(player.position, level);
  const { animatedSprite: sprite, gizmo } = player.drawable;

  const roundedPosition: Position = {
    x: Math.floor(player.position.x),
    y: Math.floor(player.position.y),
  };

  const tileValue = level.worldMap.data[roundedPosition.y][roundedPosition.x];
  const tile = level.tileMap.index[tileValue];

  const elevationOffset = tile.elevation * (level.tileMap.tileHeight / 8);

  sprite.setTransform(x, y - elevationOffset);

  gizmo.pivot = sprite.anchor;
  gizmo.position = sprite.position;
  gizmo.angle = angleMap[player.direction];
};

export const stopPlayer = (player: Player): void => {
  player.speed = 0;

  player.drawable.animatedSprite.stop();
  player.drawable.animatedSprite.texture =
    player.drawable.idleTextures[player.direction];
};

export const startPlayer = (player: Player): void => {
  player.speed = 1;

  player.drawable.animatedSprite.textures =
    player.drawable.animationTextures[player.direction];
  player.drawable.animatedSprite.play();
};

export const updatePlayer = (player: Player, level: Level): Player => {
  const { worldMap } = level;
  const heading = headingMap[player.direction];

  const prevX = player.position.x;
  const prevY = player.position.y;

  player.position.x += player.speed * 0.01 * heading.x;
  player.position.y += player.speed * 0.01 * -heading.y;

  const roundedPosition: Position = {
    x: Math.floor(player.position.x),
    y: Math.floor(player.position.y),
  };

  const tileValue = level.worldMap.data[roundedPosition.y][roundedPosition.x];
  const newTile = level.tileMap.index[tileValue];

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

export const newPlayerDrawable = async (
  spritesheetImage: any,
  spritesheetData: any,
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

  const anchorMap: Record<Direction, Position> = {
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

  return {
    anchorMap,
    animatedSprite,
    animationTextures,
    gizmo: generateGizmo(),
    idleTextures,
    spritesheet,
  };
};
