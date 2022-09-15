import * as PIXI from 'pixi.js';
import * as PIXILayers from '@pixi/layers';

import * as camera from './camera';
import { stopPlayer } from './player';
import { renderLevel, updateLevel } from './level';
import { gameKeyboardControls, SupportedKeys } from './controls';

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

  const level = await loadDemoLevel();

  const { player } = level;

  document.addEventListener('keydown', (event: KeyboardEvent) => {
    const keyboardInputHandler =
      gameKeyboardControls[event.key as SupportedKeys];
    if (keyboardInputHandler === undefined) {
      return;
    }

    keyboardInputHandler(level);
  });

  renderLevel(app.stage, level);

  camera.centerMap(level);
  stopPlayer(player);

  app.ticker.start();
  app.ticker.add((delta: number) => {
    updateLevel(level, delta);

    if (camera.followPlayer === true) {
      camera.centerPlayer(level);
    }
  });
};

main();
