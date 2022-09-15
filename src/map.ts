import * as PIXI from 'pixi.js';

import { computeIsometricCoordinates, Vec2f } from './geometry';
import { Tile, TileIndex, TileMap } from './tilemap';

export interface EntityDrawable {
  container: PIXI.Container;
  sprites: PIXI.Sprite[];
}

export interface Entity {
  name: string;
  position: Vec2f;
  size: {
    width: number;
    height: number;
  };
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
  size: {
    width: number;
    height: number;
  };
  ground: Ground;
  entities: Entity[];
}

export interface Map {
  size: {
    width: number;
    height: number;
  };
  floors: Floor[];
}

export const getTileAtPosition = (position: Vec2f, floor: Floor): Tile => {
  const roundedPosition: Vec2f = {
    x: Math.floor(position.x),
    y: Math.floor(position.y),
  };

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

  const fullWidth = tileMap.tiles.width * layout[0].length;

  const baseX = fullWidth / 2;

  for (let y = 0; y < layout.length; y += 1) {
    const row = layout[y];
    const rowSprites = [];

    for (let x = 0; x < row.length; x += 1) {
      const value = row[x];
      const tile = tileMap.tiles.index[value];

      const sprite = new PIXI.Sprite(spritesheet.sheet.textures[tile.name]);

      const offsetX = tileWidth / 2;
      const offsetY = tileHeight;

      sprite.x = baseX + -offsetX + x * offsetX - y * offsetY;
      sprite.y = y * offsetY + x * (offsetY / 2) - y * (offsetY / 2);

      container.addChild(sprite);
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
  parentContainer: PIXI.Container,
  tileHeight: number,
  tileWidth: number,
): void => {
  const container = entity.drawable.container;
  const { x, y } = computeIsometricCoordinates(
    entity.position,
    tileHeight,
    tileWidth,
  );

  container.position.set(
    parentContainer.x + x + parentContainer.width / 2,
    parentContainer.y + y,
  );
};
