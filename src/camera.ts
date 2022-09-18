import { Level } from './level';

export let followPlayer = false;

export const triggerFollowPlayer = (): void => {
  followPlayer = !followPlayer;
  console.log('Follow player =', followPlayer);
};

export const centerMap = (level: Level): void => {
  const floor = level.map.floors[level.currentFloor];
  const mapContainer = floor.ground.drawable.container;

  if (mapContainer === undefined) {
    return;
  }

  const offset = {
    x: mapContainer.width / 2,
    y: mapContainer.height / 2,
  };

  const viewMiddle = {
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  };

  mapContainer.position.set(viewMiddle.x - offset.x, viewMiddle.y - offset.y);
};

export const centerPlayer = (level: Level): void => {
  const floor = level.map.floors[level.currentFloor];
  const mapContainer = floor.ground.drawable.container;

  if (mapContainer === undefined) {
    return;
  }

  const viewMiddle = {
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  };

  level.player.position = viewMiddle;

  const translateFromPlayer = {
    x: viewMiddle.x - level.player.drawable.container.position.x,
    y: viewMiddle.y - level.player.drawable.container.position.y,
  };

  floor.ground.drawable.sprites.forEach((row) =>
    row.forEach((sprite) => {
      sprite.x += translateFromPlayer.x;
      sprite.y += translateFromPlayer.y;
    }),
  );

  // mapContainer.x += translateFromPlayer.x;
  // mapContainer.y += translateFromPlayer.y;
};
