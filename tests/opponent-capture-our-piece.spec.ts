import { test, expect } from './checkers-test';

test('opponent can capture our piece', async ({ checkersPage }) => {
  // arrange: move first piece to set up capture
  await checkersPage.makeValidMove({ col: 2, row: 2 }, { col: 3, row: 3 });
  await checkersPage.waitForOpponentMove();

  // act: move second piece into capture-able position,
  // and wait for opponent to perform capture
  await checkersPage.makeValidMove({ col: 0, row: 2 }, { col: 1, row: 3 });
  await checkersPage.waitForOpponentMove();

  // assert
  await checkersPage.waitForImageAtCoordinates(
    1,
    3,
    checkersPage.lightSquareImgSrc // empty after capture
  );

  await expect(
    checkersPage.getLocatorByImageSrc(checkersPage.orangePieceImgSrc)
  ).toHaveCount(11); // should be one less orange piece
});
