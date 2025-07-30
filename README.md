# AI for Hex board game

Developed by Davies, initial project here: https://github.com/DaviesGit/hex_board_game

Forked and adapted. Changes are:

- Translated UI to English, play it here: https://alcalyn.github.io/hex_board_game/
- AI now plays instantly (removed setTimeout)
- added typings for typescript
- made it reusable, can generate a move from a moves history
- made it available through npm
- handle `swap-pieces` and `pass` moves in moves history

Reusable part is in `src/` (and tests in `test/`).

## Install

``` bash
npm install davies-hex-ai
```

## Usage

- Calculate a single move from a position

``` js
import { getBestMove, WHO_RED, WHO_BLUE } from 'davies-hex-ai';

// Calculate red move, after d4 f6 (strongest level by default)
getBestMove(WHO_RED, ['d4', 'f6']); // output: "g6"

// Calculate blue move, after d4 f6 g6, at level 5 (min level: 1, max level: 10)
getBestMove(WHO_BLUE, ['d4', 'f6', 'g6'], 5); // output: "g5"
```

## License

[MIT License](LICENSE.txt)
