import * as PIXI from 'pixi.js';

import levelSpritesheetImage from './assets/world-spritesheet4.png';
import levelSpritesheetData from './assets/world-spritesheet4.json';

import characterSpritesheetImage from './assets/walking-char.png';
import characterSpritesheetData from './assets/walking-char.json';

import { loadLevel } from './level';
import { newPlayerDrawable, Player, renderPlayer, startPlayer, stopPlayer, updatePlayer } from './player';
import { Direction } from './trigonometry';
import { renderWorld, setupWorld } from './world';
import { updateMinimap } from './minimap';

const main = async (): Promise<void> => {
  const app = new PIXI.Application({
    width: window.innerWidth,
    height: window.innerHeight,
    antialias: true,
  });

  const level = await loadLevel(levelSpritesheetImage, levelSpritesheetData);

  const player: Player = {
    position: {
      x: 8,
      y: 4,
    },
    direction: Direction.South,
    drawable: await newPlayerDrawable(characterSpritesheetImage, characterSpritesheetData),
    speed: 0,
  };

  stopPlayer(player);

  const viewport = setupWorld(app, {
    worldWidth: level.worldWidth,
    worldHeight: level.worldHeight,
  });

  const { minimap } = renderWorld(app, viewport, player, level);

  app.ticker.start();

  document.addEventListener('keydown', (event: KeyboardEvent) => {
    if (event.key === 'a') {
      if (player.speed === 0) {
        startPlayer(player);
      } else {
        stopPlayer(player);
      }
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      player.direction += event.key === 'ArrowLeft' ? 1 : -1;

      if (player.direction > Direction.SouthEast) {
        player.direction = Direction.East;
      }

      if ((player.direction as number) === -1) {
        player.direction = Direction.SouthEast;
      }

      const wasPlaying = player.drawable.animatedSprite.playing;

      player.drawable.animatedSprite.textures = player.drawable.animationTextures[player.direction];
      if (wasPlaying) {
        player.drawable.animatedSprite.play();
      } else {
        stopPlayer(player);
      }
    }
  });

  app.ticker.add(() => {
    renderPlayer(player, level);

    updatePlayer(player, level);
    updateMinimap(minimap);
  });
};

main();
