# End-to-end Test Plan

### Application under Test (AUT)
[Games for the Brain - Checkers](https://www.gamesforthebrain.com/game/checkers/)

## Tools and Techniques
Tests will be written in Playwright for Node.js (TypeScript). This was chosen for its popularity in the testing domain and relatively painless setup process.

I also intend to follow the industry standard [Page Object Model](https://playwright.dev/docs/pom) (POM), which will help with abstracting and simplifying interactions with the Checkers board/pieces.

"Arrange, act, assert" or "given, when, then" are good mnemonic templates for structuring individual test cases within each spec. Whenever possible and feasible, the Single Responsibility Principle should be followed, along with linting and code style enforcement. [Remember](https://martinfowler.com/articles/practical-test-pyramid.html), test code is as important as production code.

If time allowed or this was a full project, I would also set up a GitHub Actions workflow using Playwright's provided testing containers, setting them to run on an appropriate cadence with some kind of reporting mechanism (e.g., DataDog or Slack integration).

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
  - "Make a move" message afterwards
* Cannot make invalid move
  - "Move diagonally only" message
  - "This is an invalid move"
    + Only when trying 3+ squares diagonally
* "Please wait" message
  - When clicking during opponent's turn
* Can't move piece backwards
* Can't move into occupied square
  - Applies to square containing either color
* Opponent captures a piece?
  - TODO: see how reliable 
* Capture an opponent's piece?
  - TODO: only possible if AI moves are deterministic

## Further Thoughts

### Test Reliability
In general, E2E automation often has a reputation for being flaky or unreliable. However, there are several strategies that can help mitigate this:
* First and foremost, if a test cannot be written in a way that's reliable, then it should not be automated.
* Page element locators must be chosen with careful regard to potential fragility. From most to least preferable, Playwright can locate UI elements via accessibility role and/or name, Test ID, label, CSS selectors, or visible text. Avoid the use of XPath or HTML tag names.
* Whenever possible, utilize dynamic rather than explicit waits by waiting for changes in the DOM. A slow test is a bad test; we want to fail fast, and get feedback as soon as possible.

### Black-box vs. White-box testing
TODO

### Test user actions *once*
This plan solely covers UI-based browser automation tests, as there is no backend or API layer in the AUT. However, if there were, I would implement action-based testing that bypasses the UI whenever appropriate, using Playwright's [request fixture](https://playwright.dev/docs/api-testing#writing-tests). This helps maintain a good balance between [DRY and DAMP](https://stackoverflow.com/questions/6453235/what-does-damp-not-dry-mean-when-talking-about-unit-tests) code, and would avoid slowdown and bloat caused by performing identical UI actions across multiple tests. Note that in cases where authentication is required, Playwright supports re-using [shared auth states](https://playwright.dev/docs/auth) via cookies and browser storage.
