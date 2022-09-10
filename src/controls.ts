import { Level } from './level';
import * as camera from './camera';
import { rotatePlayer, Rotation, startPlayer, stopPlayer } from './player';

export enum SupportedKeys {
  KeyC = 'c',
  KeyA = 'a',
  KeyArrowLeft = 'ArrowLeft',
  KeyArrowRight = 'ArrowRight',
}

type KeyHandler = (level: Level) => void;

export const gameKeyboardControls: Record<SupportedKeys, KeyHandler> = {
  [SupportedKeys.KeyC]: (_: Level): void => camera.triggerFollowPlayer(),
  [SupportedKeys.KeyA]: (level: Level): void => {
    const { player } = level;

    if (player.speed === 0) {
      startPlayer(player);
    } else {
      stopPlayer(player);
    }
  },
  [SupportedKeys.KeyArrowLeft]: (level: Level): void =>
    rotatePlayer(level.player, Rotation.Clockwise),
  [SupportedKeys.KeyArrowRight]: (level: Level): void =>
    rotatePlayer(level.player, Rotation.Anticlockwise),
};
