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
    index: Record<number, Tile>;
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

export const renderTileMap = (
  parent: PIXI.Container,
  tileMap: TileMap,
  map: TileIndex[][],
): PIXI.Container => {
  const { height: tileHeight, width: tileWidth } = tileMap.tiles;

  const mapContainer = new PIXI.Container();
  const { spritesheet } = tileMap;

  parent.addChild(mapContainer);

  for (let y = 0; y < map.length; y += 1) {
    const row = map[y];

    for (let x = 0; x < row.length; x += 1) {
      const value = row[x];
      const tile = tileMap.tiles.index[value];

      const sprite = mapContainer.addChild(
        new PIXI.Sprite(spritesheet.sheet.textures[tile.name]),
      );

      const offsetX = tileWidth / 2;
      const offsetY = tileHeight;

      const baseX = parent.width / 2 - offsetX;
      const baseY = parent.height / 2 - (parent.height * tileHeight) / 2;

      sprite.x = baseX + x * offsetX - y * offsetY;
      sprite.y =
        baseY +
        y * offsetY +
        x * (offsetY / 2) -
        y * (offsetY / 2) -
        tile.elevation * (tileHeight / 8);

      parent.addChild(sprite);
    }
  }

  return mapContainer;
};
