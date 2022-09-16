import * as PIXI from 'pixi.js';
import * as PIXILayers from '@pixi/layers';

import {
  Entity,
  getTileAtPosition,
  getTilePosition,
  // getTilePosition,
  // getTileSpriteAtPosition,
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

export const renderLevel = (
  stage: PIXI.Container,
  level: Level,
): PIXI.Container => {
  console.log('Rendering level', level.name);

  const depthGroup1 = new PIXILayers.Group(1, (sprite) => {
    const floor = level.map.floors[level.currentFloor];
    const player = level.player;

    if (sprite.name === 'player') {
      const roundedPosition = getTilePosition(player.position);
      const tileAtPosition = getTileAtPosition(player.position, floor);

      sprite.zOrder =
        tileAtPosition.elevation + roundedPosition.x + roundedPosition.y + 1;
      return;
    }

    const matchingEntity = floor.entities.find(
      (entity: Entity): boolean =>
        entity.drawable.container.name === sprite.name,
    );

    if (matchingEntity !== undefined) {
      const topRight = {
        x: matchingEntity.position.x + matchingEntity.size.width,
        y: matchingEntity.position.y,
      };

      const bottomLeft = {
        x: matchingEntity.position.x,
        y: matchingEntity.position.y + matchingEntity.size.height,
      };

      if (
        (player.position.y >= topRight.y && player.position.x >= topRight.x) ||
        (player.position.y >= bottomLeft.y && player.position.x >= bottomLeft.x)
      ) {
        sprite.zOrder = 3 + matchingEntity.position.x;
      } else {
        sprite.zOrder = 0 + matchingEntity.position.x;
      }

      return;
    }

    if (sprite.name?.startsWith('tile-')) {
      const coordFull = sprite.name.split('-')[1];
      const [xStr, yStr] = coordFull.split('x');
      // const spriteTile = getTileAtPosition({ x, y }, floor);
      const tilePosition = {
        x: parseInt(xStr),
        y: parseInt(yStr),
      };

      const tile = getTileAtPosition(tilePosition, floor);

      sprite.zOrder = tile.elevation + tilePosition.x + tilePosition.y;

      return;
    }
  });
  const depthGroup2 = new PIXILayers.Group(2, false);

  stage.sortableChildren = true;
  stage.addChild(new PIXILayers.Layer(depthGroup1));
  stage.addChild(new PIXILayers.Layer(depthGroup2));

  const { drawable: minimapDrawable } = level.minimap;
  const { drawable: playerDrawable } = level.player;

  const playerContainer = playerDrawable.container;
  const minimapContainer = minimapDrawable.container;

  minimapContainer.x = 50;
  minimapContainer.y = 50;

  const floor = level.map.floors[level.currentFloor];

  floor.ground.drawable.sprites.forEach((row: PIXI.Sprite[]) =>
    row.forEach((tileSprite: PIXI.Sprite) => {
      tileSprite.parentGroup = depthGroup1;
      stage.addChild(tileSprite);
      console.log('add tile', tileSprite.name);
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
    // getTileSpriteAtPosition(player.position, floor),
    getTileAtPosition(player.position, floor),
    floor.ground.drawable.container.position,
    floor.ground.tileMap.tiles.width,
  );

  floor.entities.forEach((entity: Entity) => {
    entity.boundingBox.position = entity.position;

    updateEntityDrawable(
      entity,
      floor.ground.drawable.container,
      // getTileSpriteAtPosition(entity.position, floor),
      floor.ground.tileMap.tiles.height,
      floor.ground.tileMap.tiles.width,
    );
  });
};
