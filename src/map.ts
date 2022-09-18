import * as PIXI from 'pixi.js';

import { computeIsometricCoordinates, Size, Vec2f } from './geometry';
import { Tile, TileIndex, TileMap } from './tilemap';
import { SquareBoundingBox } from './collision';

export interface EntityDrawable {
  container: PIXI.Container;
  sprites: PIXI.Sprite[];
}

export interface Entity {
  name: string;
  position: Vec2f;
  size: Size;
  boundingBox: SquareBoundingBox;
  drawable: EntityDrawable;
}

export interface GroundDrawable {
  container: PIXI.Container;
  sprites: PIXI.Sprite[][];
}

export interface Ground {
  tileMap: TileMap;
  layout: TileIndex[][];
  drawable: GroundDrawable;
}

export interface Floor {
  size: Size;
  ground: Ground;
  entities: Entity[];
}

export interface Map {
  size: Size;
  floors: Floor[];
}

export const getTilePosition = (position: Vec2f): Vec2f => ({
  x: Math.floor(position.x),
  y: Math.floor(position.y),
});

export const getTileSpriteAtPosition = (
  position: Vec2f,
  floor: Floor,
): PIXI.Sprite => {
  const roundedPosition: Vec2f = getTilePosition(position);

  return floor.ground.drawable.sprites[roundedPosition.y][roundedPosition.x];
};

export const getTileAtPosition = (position: Vec2f, floor: Floor): Tile => {
  const roundedPosition: Vec2f = getTilePosition(position);

  const tileValue = floor.ground.layout[roundedPosition.y][roundedPosition.x];

  return floor.ground.tileMap.tiles.index[tileValue];
};

export const loadGround = (
  tileMap: TileMap,
  layout: TileIndex[][],
): GroundDrawable => {
  const { spritesheet, tiles } = tileMap;
  const { height: tileHeight, width: tileWidth } = tiles;

  const container = new PIXI.Container();
  const sprites: PIXI.Sprite[][] = [];

  for (let y = 0; y < layout.length; y += 1) {
    const row = layout[y];
    const rowSprites = [];

    for (let x = 0; x < row.length; x += 1) {
      const value = row[x];
      const tile = tileMap.tiles.index[value];
      const sprite = new PIXI.Sprite(spritesheet.sheet.textures[tile.name]);

      sprite.scale.set(0.5, 0.5);
      sprite.name = `tile-${x}x${y}`;
      const isoPos = computeIsometricCoordinates(
        {
          x,
          y,
        },
        tileHeight,
        tileWidth,
      );

      sprite.position.set(
        500 + isoPos.x,
        200 + isoPos.y - (sprite.height - tileHeight),
      );

      // container.addChild(sprite);
      rowSprites.push(sprite);
    }

    sprites.push(rowSprites);
  }

  return {
    container,
    sprites,
  };
};

export const updateEntityDrawable = (
  entity: Entity,
  groundTile: Tile,
  // tileSprite: PIXI.Sprite,
  origin: Vec2f,
  tileWidth: number,
): void => {
  const container = entity.drawable.container;
  const tileHeight = tileWidth / 2;

  const { x, y } = computeIsometricCoordinates(
    entity.position,
    tileHeight,
    tileWidth,
  );

  container.position.set(
    origin.x + x + tileHeight,
    origin.y + y - groundTile.elevation * tileHeight,
  );
};
