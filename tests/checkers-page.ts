import { expect, type Locator, type Page } from '@playwright/test';

export class CheckersPage {
  readonly relativeUrl: string = '/game/checkers';
  readonly page: Page;

  // constants
  readonly lightSquareImgSrc: string = 'gray.gif';
  readonly darkSquareImgSrc: string = 'black.gif';
  readonly orangePieceImgSrc: string = 'you1.gif';
  readonly selectedOrangePieceImgSrc: string = 'you2.gif';
  readonly bluePieceImgSrc: string = 'me1.gif';
  readonly selectedBluePieceImgSrc: string = 'me2.gif';

  // locators
  readonly checkersHeader: Locator;
  readonly messageElement: Locator;
  readonly restartLink: Locator;
  readonly rulesLink: Locator;
  readonly gameBoardElement: Locator;

  constructor(page: Page) {
    this.page = page;

    this.checkersHeader = page
      .getByRole('heading')
      .filter({ hasText: 'checkers' });

    this.messageElement = page.locator('#message');
    this.restartLink = page.getByRole('link', { name: 'restart' });
    this.rulesLink = page.getByRole('link', { name: 'rules' });
    this.gameBoardElement = page.locator('#board');
  }

  /** helper functions **/

  private async waitForImageAtCoordinates(
    col: number,
    row: number,
    expectedSrc: string
  ) {
    const squareLocator = this.gameBoardElement.locator(
      `css=[name="space${col}${row}"]`
    );

    await expect(squareLocator).toHaveAttribute('src', expectedSrc);
  }

  private getLocatorByImageSrc(imageSrc: string): Locator {
    return this.gameBoardElement.locator(`css=[src="${imageSrc}"]`);
  }

  private async waitForMessageText(expectedText: string) {
    await expect(this.messageElement).toBeVisible();
    await expect(this.messageElement).toContainText(expectedText, {
      ignoreCase: true,
    });
  }

  /**
   * Checks that all dark squares are empty (i.e., have the correct background
   * image). This is used to verify that no pieces are illegally placed.
   */
  private async expectAllDarkSquaresAreEmpty() {
    for (let row = 0; row < 8; row++) {
      // even row - dark squares in odd colums
      // odd row - dark squares in even columns
      const darkSquareCols: number[] =
        row % 2 === 0 ? [1, 3, 5, 7] : [0, 2, 4, 6];

      for (const col of darkSquareCols) {
        await this.waitForImageAtCoordinates(col, row, this.darkSquareImgSrc);
      }
    }
  }

  private async expectRowHasNoPieces(row: number) {
    // even row - light squares at even columns
    // odd row - light squares at odd columns
    const lightSquareCols: number[] =
      row % 2 === 0 ? [0, 2, 4, 6] : [1, 3, 5, 7];

    for (const col of lightSquareCols) {
      await this.waitForImageAtCoordinates(col, row, this.lightSquareImgSrc);
    }
  }

  private async clickSquareAtCoordinates(col: number, row: number) {
    const squareLocator = this.gameBoardElement.locator(
      `css=[name="space${col}${row}"]`
    );

    await squareLocator.click();
  }

  /** test methods **/

  async goto() {
    console.log('Navigating to Checkers page...');

    await this.page.goto(this.relativeUrl, {
      timeout: 15_000,
      waitUntil: 'domcontentloaded',
    });

    console.log(`Current URL: ${this.page.url()}`);
  }

  /**
   * Waits for the checkers page to load by verifying the presence of key
   * elements and the initial message text. This ensures that the page is fully
   * loaded and ready for interaction before proceeding with further tests.
   */
  async waitForPage() {
    console.log('Waiting for Checkers page to load...');

    // wait for static elements
    await expect(this.checkersHeader).toBeVisible();
    await expect(this.restartLink).toBeVisible();
    await expect(this.rulesLink).toBeVisible();

    // game board and piece counts
    await expect(this.gameBoardElement).toBeVisible();
    await expect(this.getLocatorByImageSrc(this.orangePieceImgSrc)).toHaveCount(
      12
    );
    await expect(this.getLocatorByImageSrc(this.bluePieceImgSrc)).toHaveCount(
      12
    );

    // wait for initial message
    await this.waitForMessageText('select an orange piece to move');

    console.log('Page loaded.');
  }

  /**
   * The board is an 8x8 grid. Upon game start, there are 12 orange pieces
   * (us) and 12 blue pieces (opponent) in a certain formation. Coordinates
   * consist of (col, row), with (0, 0) starting in the bottom right corner.
   * With this system in mind, the initial state consists of 4 orange pieces
   * in rows 0, 1, and 2; and 4 blue pieces in rows 5, 6, and 7. Each square
   * in a row alternates between light and dark, with (0, 0) and (7, 7) both
   * being light.
   *
   * This function verifies that the current board state matches the expected
   * initial state described above, and that no pieces are currently selected.
   */
  async waitForInitialBoardState() {
    console.log('Waiting for initial game board state...');
    await this.expectAllDarkSquaresAreEmpty();

    for (const row of [0, 1, 2]) {
      const lightSquareCols: number[] =
        row % 2 === 0 ? [0, 2, 4, 6] : [1, 3, 5, 7];

      for (const col of lightSquareCols) {
        await this.waitForImageAtCoordinates(col, row, this.orangePieceImgSrc);
      }
    }

    await this.expectRowHasNoPieces(3);
    await this.expectRowHasNoPieces(4);

    for (const row of [5, 6, 7]) {
      const lightSquareCols: number[] =
        row % 2 === 0 ? [0, 2, 4, 6] : [1, 3, 5, 7];

      for (const col of lightSquareCols) {
        await this.waitForImageAtCoordinates(col, row, this.bluePieceImgSrc);
      }
    }
  }

  async movePiece(
    startPos: { col: number; row: number },
    endPos: { col: number; row: number }
  ) {
    console.log(
      `Moving piece from space${startPos.col}${startPos.row} to ` +
        `space${endPos.col}${endPos.row})...`
    );

    // ensure starting square contains our piece
    await this.waitForImageAtCoordinates(
      startPos.col,
      startPos.row,
      this.orangePieceImgSrc
    );

    // and that ending square is empty
    await this.waitForImageAtCoordinates(
      endPos.col,
      endPos.row,
      this.lightSquareImgSrc
    );

    // click square and wait for piece to be selected
    await this.clickSquareAtCoordinates(startPos.col, startPos.row);
    await this.waitForImageAtCoordinates(
      startPos.col,
      startPos.row,
      this.selectedOrangePieceImgSrc
    );

    // click new square and wait for piece to move
    await this.clickSquareAtCoordinates(endPos.col, endPos.row);
    await this.waitForImageAtCoordinates(
      endPos.col,
      endPos.row,
      this.orangePieceImgSrc
    );

    // old square should now be empty
    await this.waitForImageAtCoordinates(
      startPos.col,
      startPos.row,
      this.lightSquareImgSrc
    );
  }
}
