import { Size, Vec2f } from './geometry';

export interface SquareBoundingBoxVertices {
  topLeft: Vec2f;
  topRight: Vec2f;
  bottomRight: Vec2f;
  bottomLeft: Vec2f;
}

export interface SquareBoundingBox {
  position: Vec2f;
  size: Size;
  vertices: SquareBoundingBoxVertices;
}

export const newSquareBoundingBox = (
  position: Vec2f,
  size: Size,
): SquareBoundingBox => ({
  position,
  size,
  vertices: {
    topLeft: {
      x: position.x,
      y: position.y,
    },
    topRight: {
      x: position.x + size.width,
      y: position.y,
    },
    bottomRight: {
      x: position.x + size.width,
      y: position.y + size.height,
    },
    bottomLeft: {
      x: position.x,
      y: position.y,
    },
  },
});

export const checkCollision = (
  firstBox: SquareBoundingBox,
  secondBox: SquareBoundingBox,
): boolean => {
  return (
    firstBox.position.x < secondBox.position.x + secondBox.size.width &&
    firstBox.position.x + firstBox.size.width > secondBox.position.x &&
    firstBox.position.y < secondBox.position.y + secondBox.size.height &&
    firstBox.size.height + firstBox.position.y > secondBox.position.y
  );
};
