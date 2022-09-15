import { Level } from './level';
import * as camera from './camera';
import { rotatePlayer, Rotation, startPlayer, stopPlayer } from './player';

export enum SupportedKeys {
  KeyA = 'a',
  KeyC = 'c',
  KeyD = 'd',
  KeyF = 'f',
  KeyArrowLeft = 'ArrowLeft',
  KeyArrowRight = 'ArrowRight',
}

type KeyHandler = (level: Level) => void;

export const gameKeyboardControls: Record<SupportedKeys, KeyHandler> = {
  [SupportedKeys.KeyA]: (level: Level): void => {
    const { player } = level;

    if (player.speed === 0) {
      startPlayer(player);
    } else {
      stopPlayer(player);
    }
  },
  [SupportedKeys.KeyC]: (level: Level): void => camera.centerPlayer(level),
  [SupportedKeys.KeyD]: (level: Level): void => {
    const floor = level.map.floors[level.currentFloor];

    console.log(
      'Map position =',
      floor.ground.drawable.container.position,
      ', Player sprite position =',
      level.player.drawable.animatedSprite.position,
      ', Player container position =',
      level.player.drawable.container.position,
    );
  },
  [SupportedKeys.KeyF]: (): void => camera.triggerFollowPlayer(),
  [SupportedKeys.KeyArrowLeft]: (level: Level): void =>
    rotatePlayer(level.player, Rotation.Clockwise),
  [SupportedKeys.KeyArrowRight]: (level: Level): void =>
    rotatePlayer(level.player, Rotation.Anticlockwise),
};
