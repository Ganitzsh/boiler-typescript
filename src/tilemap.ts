import * as PIXI from 'pixi.js';

export type TileIndex = number;

export interface Tile {
  name: string;
  elevation: number;
  blockPlayer: boolean;
}

export interface TileMap {
  tiles: {
    width: number;
    height: number;
    index: Record<TileIndex, Tile>;
    defaultIndex: TileIndex;
  };
  spritesheet: {
    image: any;
    data: any;
    texture: PIXI.Texture;
    sheet: PIXI.Spritesheet;
  };
}

export interface TileMapConfig {
  tiles: {
    width: number;
    height: number;
    index: Record<TileIndex, Tile>;
    defaultIndex: TileIndex;
  };
  spritesheet: {
    image: any;
    data: any;
  };
}

export const loadTileMap = (tileMapConfig: TileMapConfig): TileMap => {
  const texture = PIXI.Texture.from(tileMapConfig.spritesheet.image);
  const spritesheet = new PIXI.Spritesheet(
    texture,
    tileMapConfig.spritesheet.data,
  );

  spritesheet.parse();

  return {
    ...tileMapConfig,
    spritesheet: {
      ...tileMapConfig.spritesheet,
      texture,
      sheet: spritesheet,
    },
  };
};
