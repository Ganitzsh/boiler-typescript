import { Level } from './level';

export let followPlayer = true;

export const triggerFollowPlayer = (): void => {
  followPlayer = !followPlayer;
  console.log(followPlayer);
};

export const centerPlayer = (level: Level): void => {
  const mapContainer = level.drawable?.mapContainer;
  const player = level.player;

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

  // const base = {
  //   x: viewMiddle.x - offset.x,
  //   y: viewMiddle.y - offset.y,
  // };

  mapContainer.setTransform(
    viewMiddle.x - player.drawable.animatedSprite.x - offset.x,
    viewMiddle.y - player.drawable.animatedSprite.y,
  );

  player.drawable.container.setTransform(mapContainer.x, mapContainer.y);
};
