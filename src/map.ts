import * as PIXI from 'pixi.js';
import * as PIXILayers from '@pixi/layers';

import { computeIsometricCoordinates, Vec2f } from './geometry';
import { TileIndex, TileMap } from './tilemap';

interface Entity {
  position: Vec2f;
  drawable: {
    container: PIXI.Container;
    sprite: PIXI.Sprite;
  };
}

export interface Ground {
  tileMap: TileMap;
  layout: TileIndex[][];
  drawable: {
    container: PIXI.Container;
    layer: PIXILayers.Layer;
    group: PIXILayers.Group;
  };
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

const renderGround = (
  ground: Ground,
  floorNumber: number,
  base?: Vec2f,
): PIXI.Container => {
  const { tileMap, layout } = ground;
  const { spritesheet, tiles } = tileMap;
  const { height: tileHeight, width: tileWidth } = tiles;

  console.log(floorNumber);

  const groundContainer = new PIXI.Container();

  for (let y = 0; y < layout.length; y += 1) {
    const row = layout[y];

    for (let x = 0; x < row.length; x += 1) {
      const value = row[x];
      const tile = tileMap.tiles.index[value];

      const sprite = new PIXI.Sprite(spritesheet.sheet.textures[tile.name]);

      const offsetX = tileWidth / 2;
      const offsetY = tileHeight;

      sprite.x = (base?.x ?? 0) - offsetX + x * offsetX - y * offsetY;
      sprite.y =
        (base?.y ?? 0) + y * offsetY + x * (offsetY / 2) - y * (offsetY / 2);

      groundContainer.addChild(sprite);
    }
  }

  return groundContainer;
};

const renderEntities = (entities: Entity[], ground: Ground): PIXI.Container => {
  const container = new PIXI.Container();

  const { tileMap } = ground;
  const { tiles } = tileMap;
  const { height: tileHeight, width: tileWidth } = tiles;

  for (const entity of entities) {
    const { x, y } = computeIsometricCoordinates(
      entity.position,
      tileHeight,
      tileWidth,
    );

    entity.drawable.sprite.setTransform(x, y);

    container.addChild(entity.drawable.container);
  }

  console.log('Render entities', entities);

  return container;
};

const renderFloor = (
  floor: Floor,
  floorNumber: number,
  base?: Vec2f,
): PIXI.Container => {
  const container = new PIXI.Container();

  container.addChild(renderGround(floor.ground, floorNumber, base));
  container.addChild(renderEntities(floor.entities, floor.ground));

  return container;
};

export const renderMap = (map: Map, base?: Vec2f): PIXI.Container => {
  const container = new PIXI.Container();

  for (let floorNumber = 0; floorNumber < map.floors.length; floorNumber += 1) {
    container.addChild(renderFloor(map.floors[floorNumber], floorNumber, base));
  }

  return container;
};
