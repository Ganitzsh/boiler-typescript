import * as PIXI from 'pixi.js';

export const generateGizmo = (): PIXI.Graphics => {
  const graphics = new PIXI.Graphics();

  graphics
    .beginFill(0xff3300)
    .lineStyle(1, 0xffd900, 1)
    .moveTo(0, 0)
    .lineTo(0, 0)
    .lineTo(100, 0)
    .closePath()
    .endFill();

  return graphics;
};
