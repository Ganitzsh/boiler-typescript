import { Viewport } from 'pixi-viewport';

import { Level } from './level';
import { Player } from './player';

export interface Game {
  level: Level;
  player: Player;
  viewport: Viewport;
}
