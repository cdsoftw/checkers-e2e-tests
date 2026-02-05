# End-to-End Test Plan

### Application Under Test (AUT):
[Games for the Brain - Checkers](https://www.gamesforthebrain.com/game/checkers/)

## Tools and Techniques
Tests will be written in Playwright for Node.js and TypeScript. This was chosen for its popularity in the testing domain and relatively painless setup process.

I also intend to follow the industry standard [Page Object Model](https://playwright.dev/docs/pom) (POM), which will help with abstracting and simplifying interactions with the Checkers board/pieces.

"Arrange, act, assert" or "given, when, then" are good mnemonic templates for structuring individual test cases within each spec. Whenever possible and feasible, the Single Responsibility Principle should be followed, along with linting and code style enforcement. [Remember](https://martinfowler.com/articles/practical-test-pyramid.html), **test code is as important as production code.**

## Test Coverage and Goals
Ideally, all game rules, potential actions, and win/loss states would be covered, but this is of course unrealistic within our constraints.

For the purposes of this interview, I intend to focus on the simplest rules and actions of both the Checkers game and its webpage, including:
* Page load
  - Pieces in starting positions
  - Expected HTML elements present
* Clicking links
  - Restart
    + Returns game to initial state
  - Rules
    + Navigates to expected URL
* Cannot select opponent's (blue) piece
  - No change to image
* Make valid move; players alternate turns
  - Board state updates
  - Opponent moves automatically
  - "Please wait" message (clicking during opponent's turn)
  - "Make a move" afterwards
* Cannot make invalid move
  - "Move diagonally only" message
    + When trying to move vertically/horizontally
  - "This is an invalid move"
    + Only when trying 3+ squares diagonally
* Can't move piece backwards
* Can't move into occupied square
  - Applies to square containing either color
* Opponent captures a piece?
  - TODO: see how reliable 
* Capture an opponent's piece?
  - TODO: only possible if AI moves are deterministic

## Further Thoughts

### Black-box vs. White-box testing
In most cases, an SDET / Test Automation engineer has visibility and/or access to the AUT code, making white-box testing possible. If that were the case here, I would suggest implementing rudimentary state loading functionality via a string containing the current board state, similar to [Portable Game Notation](https://en.wikipedia.org/wiki/Portable_Game_Notation) in chess. This could then be [invoked via JavaScript](https://playwright.dev/docs/api/class-locator#locator-evaluate) within a test, opening up a variety of new possibilities for testing unique situations, actions, and win/loss conditions that would otherwise be too complex to set up. Some examples:
* Capture multiple pieces
  - Different combinations of left/right jumps
* Promote piece to king
  - Piece can then move both forwards + backwards
* Victory
  - Capture/block all opponent's pieces
* Defeat
  - No pieces left
  - No legal moves

### Continuous Integration
If time allowed or this was a full project, I would also set up a GitHub Actions workflow using Playwright's provided [testing containers](https://playwright.dev/docs/ci#via-containers), setting them to run on an appropriate cadence with some kind of reporting mechanism (e.g., DataDog/Slack integration, [publishing HTML report](https://playwright.dev/docs/ci-intro#publishing-report-on-the-web), etc.).

### Test Reliability
In general, E2E automation often has a reputation for being flaky or unreliable. However, there are several strategies that can help mitigate this:
* First and foremost, if a test cannot be written in a way that's reliable, then it should not be automated.
* Page element locators must be chosen with careful regard to potential fragility. From most to least preferable, Playwright can locate UI elements via accessibility role and name, Test ID, label, CSS selectors, or visible text. Avoid the use of XPath or HTML tag names.
* Whenever possible, utilize dynamic rather than explicit waits by waiting for changes in the DOM. A slow test is a bad test; we want to fail fast, and get feedback as quickly as possible.

### Test user actions *once*
This plan solely covers UI-based browser automation tests, as there is no backend or API to speak of in the AUT. However, if there were, I would implement action-based testing that bypasses the UI whenever appropriate, using Playwright's [request fixture](https://playwright.dev/docs/api-testing#writing-tests). This helps maintain a good balance between [DRY and DAMP](https://stackoverflow.com/questions/6453235/what-does-damp-not-dry-mean-when-talking-about-unit-tests) code, and would avoid slowdown and bloat caused by performing identical UI actions across multiple tests. Note that in cases where authentication is required, Playwright tests support loading [shared auth states](https://playwright.dev/docs/auth) via cookies and browser storage.

### Visual regression testing
While the implmentation is likely outside the scope of a technical interview, this particular AUT would be a great fit for Playwright's [visual comparison testing](https://playwright.dev/docs/test-snapshots), which uses screenshots and pixel matching to determine if there were any unexpected changes to the webpage or its behavior.
