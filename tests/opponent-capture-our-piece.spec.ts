import { test, expect } from './checkers-test';

test('opponent can capture our piece', async ({ checkersPage }) => {
  const firstPieceStartPos = { col: 2, row: 2 };
  const firstPieceEndPos = { col: 3, row: 3 };
  const secondPieceStartPos = { col: 0, row: 2 };
  const secondPieceEndPos = { col: 1, row: 3 };

  // arrange: move first piece to set up capture
  await checkersPage.makeValidMove(firstPieceStartPos, firstPieceEndPos);
  await checkersPage.waitForOpponentMove();

  // act: move second piece into capture-able position,
  // and wait for opponent to perform capture
  await checkersPage.makeValidMove(secondPieceStartPos, secondPieceEndPos);
  await checkersPage.waitForOpponentMove();

  // assert
  await checkersPage.waitForImageAtCoordinates(
    secondPieceEndPos.col,
    secondPieceEndPos.row,
    checkersPage.lightSquareImgSrc // empty after capture
  );

  // should be one less orange piece
  await expect(
    checkersPage.getLocatorByImageSrc(checkersPage.orangePieceImgSrc)
  ).toHaveCount(checkersPage.initialPieceCount - 1);
});
