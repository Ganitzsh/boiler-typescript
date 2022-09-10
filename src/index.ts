import * as PIXI from 'pixi.js';
import * as PIXILayers from '@pixi/layers';

import { startPlayer, stopPlayer } from './player';
import { Direction } from './geometry';
import { renderLevel, updateLevel } from './level';

import loadDemoLevel from './levels/demo';

const main = async (): Promise<void> => {
  PIXILayers.applyRendererMixin(PIXI.Renderer);

  const app = new PIXI.Application({
    width: window.innerWidth,
    height: window.innerHeight,
    antialias: true,
    backgroundColor: 0x1099bb,
  });

  document.body.appendChild(app.view);

  app.stage = new PIXILayers.Stage();

  const level = await loadDemoLevel(app.stage);
  const { player } = level;

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

      player.drawable.animatedSprite.textures =
        player.drawable.animationTextures[player.direction];
      if (wasPlaying) {
        player.drawable.animatedSprite.play();
      } else {
        stopPlayer(player);
      }
    }
  });

  renderLevel(app.stage, level);

  stopPlayer(player);

  app.ticker.start();
  app.ticker.add((delta: number) => {
    updateLevel(level, delta);
  });
};

main();
