import * as PIXI from 'pixi.js';

import {
  angleMap,
  computeIsometricCoordinates,
  Direction,
  headingMap,
  Vec2f,
} from './geometry';
import { Entity, Floor, getTileAtPosition } from './map';
import { generateGizmo } from './debug';
import { checkCollision, SquareBoundingBox } from './collision';
import { Tile } from './tilemap';

export interface PlayerDrawable {
  gizmo: PIXI.Graphics;
  spritesheet: PIXI.Spritesheet;
  idleTextures: Record<Direction, PIXI.Texture>;
  animationTextures: Record<Direction, PIXI.Texture[]>;
  animatedSprite: PIXI.AnimatedSprite;
  container: PIXI.Container;
}

export interface Player {
  position: Vec2f;
  boundingBox: SquareBoundingBox;
  direction: Direction;
  speed: number;
  elevation: number;
  drawable: PlayerDrawable;
}

export const updatePlayerDrawable = (
  player: Player,
  groundTile: Tile,
  origin: Vec2f,
  tileWidth: number,
): void => {
  const { container, animatedSprite: sprite, gizmo } = player.drawable;
  const tileHeight = tileWidth / 2;

  const { x, y } = computeIsometricCoordinates(
    player.position,
    tileHeight,
    tileWidth,
  );

  container.position.set(
    origin.x + x + tileHeight,
    origin.y + y - groundTile.elevation * tileHeight,
  );

  gizmo.pivot = sprite.anchor;
  gizmo.position = sprite.position;
  gizmo.angle = angleMap[player.direction];
};

export enum Rotation {
  Clockwise,
  Anticlockwise,
}

export const rotatePlayer = (player: Player, rotation: Rotation): void => {
  player.direction += rotation === Rotation.Clockwise ? 1 : -1;

  if (player.direction > Direction.SouthEast) {
    player.direction = Direction.East;
  }

  if ((player.direction as number) === -1) {
    player.direction = Direction.SouthEast;
  }

  const wasPlaying = player.drawable.animatedSprite.playing;

  player.drawable.animatedSprite.textures =
    player.drawable.animationTextures[player.direction];
  if (wasPlaying) {
    player.drawable.animatedSprite.play();
  } else {
    stopPlayer(player);
  }
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
  player.boundingBox.position = player.position;

  const collidingEntity = floor.entities.find((entity: Entity) =>
    checkCollision(entity.boundingBox, player.boundingBox),
  );

  if (collidingEntity !== undefined) {
    console.log('Player colliding with', collidingEntity.name);

    player.position.x = prevX;
    player.position.y = prevY;

    stopPlayer(player);
    return player;
  }

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

  const newTile = getTileAtPosition(player.position, floor);

  if (newTile === undefined || newTile.blockPlayer === true) {
    player.position.x = prevX;
    player.position.y = prevY;

    stopPlayer(player);
  }

  return player;
};

export const newPlayerDrawable = async (
  spritesheetImage: string,
  spritesheetData: PIXI.ISpritesheetData,
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
  const container = new PIXI.Container();

  container.addChild(animatedSprite);
  container.addChild(gizmo);

  return {
    animatedSprite,
    animationTextures,
    gizmo,
    idleTextures,
    spritesheet,
    container,
  };
};
