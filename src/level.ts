import * as PIXI from 'pixi.js';
import * as PIXILayers from '@pixi/layers';

import {
  Entity,
  getTileAtPosition,
  getTilePosition,
  Map,
  updateEntityDrawable,
} from './map';
import { Minimap, updateMinimap } from './minimap';
import { Player, updatePlayerDrawable, updatePlayerState } from './player';

export interface Level {
  name: string;
  minimap: Minimap;
  map: Map;
  player: Player;
  currentFloor: number;
}

const handlePlayerDepth = (level: Level): number => {
  const { player } = level;
  const floor = level.map.floors[level.currentFloor];

  const roundedPosition = getTilePosition(player.position);
  const tileAtPosition = getTileAtPosition(player.position, floor);

  return (
    tileAtPosition.elevation + 0.1 + roundedPosition.x + roundedPosition.y + 1
  );
};

const handleEntityDepth = (level: Level, matchingEntity: Entity): number => {
  const { player } = level;
  const floor = level.map.floors[level.currentFloor];

  const topRight = {
    x: matchingEntity.position.x + matchingEntity.size.width,
    y: matchingEntity.position.y,
  };

  const bottomLeft = {
    x: matchingEntity.position.x,
    y: matchingEntity.position.y + matchingEntity.size.height,
  };

  const tile = getTileAtPosition(matchingEntity.position, floor);

  if (
    (player.position.y >= topRight.y && player.position.x >= topRight.x) ||
    (player.position.y >= bottomLeft.y && player.position.x >= bottomLeft.x)
  ) {
    return level.player.drawable.container.zOrder! - 0.1;
  } else {
    return tile.elevation + topRight.x + topRight.y + bottomLeft.y;
  }
};

const handleTileDepth = (level: Level, spriteName: string): number => {
  const floor = level.map.floors[level.currentFloor];
  const coordFull = spriteName.split('-')[1];
  const [xStr, yStr] = coordFull.split('x');
  // const spriteTile = getTileAtPosition({ x, y }, floor);
  const tilePosition = {
    x: parseInt(xStr),
    y: parseInt(yStr),
  };

  const tile = getTileAtPosition(tilePosition, floor);

  return tile.elevation + tilePosition.x + tilePosition.y;
};

const sortDepth = (level: Level): ((sprite: PIXI.DisplayObject) => void) => {
  return (sprite: PIXI.DisplayObject): void => {
    const floor = level.map.floors[level.currentFloor];

    if (sprite.name === 'player') {
      sprite.zOrder = handlePlayerDepth(level);
      return;
    }

    const matchingEntity = floor.entities.find(
      (entity: Entity): boolean =>
        entity.drawable.container.name === sprite.name,
    );

    if (matchingEntity !== undefined) {
      sprite.zOrder = handleEntityDepth(level, matchingEntity);
      return;
    }

    if (sprite.name?.startsWith('tile-')) {
      sprite.zOrder = handleTileDepth(level, sprite.name);
      return;
    }
  };
};

export const renderLevel = (
  stage: PIXI.Container,
  level: Level,
): PIXI.Container => {
  console.log('Rendering level', level.name);

  const depthGroup1 = new PIXILayers.Group(1, sortDepth(level));
  const depthGroup2 = new PIXILayers.Group(2, false);

  const { drawable: minimapDrawable } = level.minimap;
  const { drawable: playerDrawable } = level.player;

  const playerContainer = playerDrawable.container;
  const minimapContainer = minimapDrawable.container;

  const floor = level.map.floors[level.currentFloor];

  minimapContainer.x = 50;
  minimapContainer.y = 50;

  stage.sortableChildren = true;
  stage.addChild(new PIXILayers.Layer(depthGroup1));
  stage.addChild(new PIXILayers.Layer(depthGroup2));

  floor.ground.drawable.sprites.forEach((row: PIXI.Sprite[]) =>
    row.forEach((tileSprite: PIXI.Sprite) => {
      tileSprite.parentGroup = depthGroup1;
      stage.addChild(tileSprite);
    }),
  );

  floor.entities.forEach((entity: Entity) => {
    entity.drawable.container.parentGroup = depthGroup1;
    stage.addChild(entity.drawable.container);
  });

  playerDrawable.container.parentGroup = depthGroup1;
  minimapDrawable.container.parentGroup = depthGroup2;

  stage.addChild(playerContainer);
  stage.addChild(minimapContainer);

  return stage;
};

export const updateLevel = (level: Level, delta: number): void => {
  const floor = level.map.floors[level.currentFloor];
  const { player, minimap } = level;

  updateMinimap(minimap, floor, player);

  updatePlayerState(player, floor, delta);
  updatePlayerDrawable(
    player,
    getTileAtPosition(player.position, floor),
    { x: 500, y: 200 },
    floor.ground.tileMap.tiles.width,
  );

  floor.entities.forEach((entity: Entity) => {
    entity.boundingBox.position = entity.position;

    updateEntityDrawable(
      entity,
      getTileAtPosition(entity.position, floor),
      { x: 500, y: 200 },
      floor.ground.tileMap.tiles.width,
    );
  });
};
