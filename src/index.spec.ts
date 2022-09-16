import { checkCollision, newSquareBoundingBox } from './collision';

describe('dummy', () => {
  it('tests bounding box collisions', () => {
    const bb1 = newSquareBoundingBox(
      {
        x: 0,
        y: 0,
      },
      {
        width: 1,
        height: 1,
      },
    );
    const bb2 = newSquareBoundingBox(
      {
        x: 0.5,
        y: 0,
      },
      {
        width: 1,
        height: 1,
      },
    );

    expect(checkCollision(bb1, bb2)).toBe(true);

    bb2.position.x = 1;
    expect(checkCollision(bb1, bb2)).toBe(false);

    bb2.position.x = 0.9;
    bb2.position.x = 1.2;
    expect(checkCollision(bb1, bb2)).toBe(false);

    bb2.position.x = 0.9;
    bb2.position.x = 0.9;
    expect(checkCollision(bb1, bb2)).toBe(true);
  });
});
