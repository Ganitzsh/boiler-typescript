import { Vec2f } from './geometry';
import { TileIndex, TileMap } from './tilemap';

interface Entity {
  position: Vec2f;
}

export interface Map {
  tileMap: TileMap;
  entities: Entity[];
  tiles: TileIndex[];
}

export interface Level {
  name: string;
  map: Map[];
}
