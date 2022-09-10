import * as PIXI from 'pixi.js';

import { Map, renderMap } from './map';
import { Minimap, renderMinimap, updateMinimap } from './minimap';
import {
  Player,
  renderPlayer,
  updatePlayerDrawable,
  updatePlayerState,
} from './player';

export interface Level {
  name: string;
  minimap: Minimap;
  map: Map;
  player: Player;
  currentFloor: number;
  container: PIXI.Container;
}

export const renderLevel = (
  stage: PIXI.Container,
  level: Level,
): PIXI.Container => {
  console.log('Rendering level', level.name);

  const minimapContainer = renderMinimap(level.minimap);
  const mapContainer = renderMap(level.map);
  const playerContainer = renderPlayer(level.player);

  minimapContainer.x = 50;
  minimapContainer.y = 50;

  mapContainer.addChild(playerContainer);

  mapContainer.children.forEach(
    (children) => (children.x += mapContainer.width / 2),
  );

  stage.addChild(mapContainer);
  stage.addChild(minimapContainer);

  mapContainer.x = window.innerWidth / 2 - mapContainer.width / 2;
  mapContainer.y = window.innerHeight / 2 - mapContainer.height / 2;

  return mapContainer;
};

export const updateLevel = (level: Level, delta: number): void => {
  const floor = level.map.floors[level.currentFloor];

  updateMinimap(level.minimap, floor, level.player);
  updatePlayerState(level.player, floor, delta);
  updatePlayerDrawable(
    level.player,
    floor.ground.tileMap.tiles.height,
    floor.ground.tileMap.tiles.width,
  );
};
