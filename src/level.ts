import * as PIXI from 'pixi.js';
import * as PIXILayers from '@pixi/layers';

import { Entity, Map, updateEntityDrawable } from './map';
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

  const depthGroup0 = new PIXILayers.Group(0, false);
  const depthGroup1 = new PIXILayers.Group(1, (sprite) => {
    if (sprite.name === 'player') {
      sprite.zOrder = level.player.position.x;
      return;
    }

    const floor = level.map.floors[level.currentFloor];
    const player = level.player;
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
        (player.position.y > topRight.y && player.position.x > topRight.x) ||
        (player.position.y > bottomLeft.y && player.position.x > bottomLeft.x)
      ) {
        sprite.zOrder = bottomLeft.x;
      } else {
        sprite.zOrder = topRight.x;
      }
    }
  });
  const depthGroup2 = new PIXILayers.Group(2, false);

  stage.sortableChildren = true;
  stage.addChild(new PIXILayers.Layer(depthGroup0));
  stage.addChild(new PIXILayers.Layer(depthGroup1));
  stage.addChild(new PIXILayers.Layer(depthGroup2));

  const { drawable: minimapDrawable } = level.minimap;
  const { drawable: playerDrawable } = level.player;

  const playerContainer = playerDrawable.container;
  const minimapContainer = minimapDrawable.container;

  minimapContainer.x = 50;
  minimapContainer.y = 50;

  const floor = level.map.floors[level.currentFloor];

  floor.ground.drawable.container.parentGroup = depthGroup0;
  floor.entities.forEach((entity: Entity) => {
    entity.drawable.container.parentGroup = depthGroup1;
    stage.addChild(entity.drawable.container);
  });

  playerDrawable.container.parentGroup = depthGroup1;
  minimapDrawable.container.parentGroup = depthGroup2;

  stage.addChild(playerContainer);
  stage.addChild(floor.ground.drawable.container);
  stage.addChild(minimapContainer);

  return stage;
};

export const updateLevel = (level: Level, delta: number): void => {
  const floor = level.map.floors[level.currentFloor];

  updateMinimap(level.minimap, floor, level.player);

  updatePlayerState(level.player, floor, delta);
  updatePlayerDrawable(
    level.player,
    floor.ground.drawable.container,
    floor.ground.tileMap.tiles.height,
    floor.ground.tileMap.tiles.width,
  );
  floor.entities.forEach((entity: Entity) =>
    updateEntityDrawable(
      entity,
      floor.ground.drawable.container,
      floor.ground.tileMap.tiles.height,
      floor.ground.tileMap.tiles.width,
    ),
  );
};
