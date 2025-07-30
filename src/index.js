import { State } from './createState.js';
import { moveToString, WHO_RED, WHO_BLUE } from './utils.js';

export {
    State,
    WHO_RED,
    WHO_BLUE,
};

/**
 * @param {Number} who Color of player on which get best move, use WHO_RED or WHO_BLUE from utils.js
 * @param {String[]} movesHistory Moves history played so far, like ['a1', 'swap-pieces', 'pass', ...]
 * @param {Number} level AI level from 1 to 10 (Defaults to 10)
 *
 * @returns {String} Best move as string, like "d4"
 */
export const getBestMove = (who, movesHistory, level) => {
    if (!level) {
        level = 10;
    }

    if (who !== WHO_RED && who !== WHO_BLUE) {
        throw new Error('redOrBlue must be either WHO_RED or WHO_BLUE');
    }

    const state = new State(level);

    if (Array.isArray(movesHistory)) {
        state.replayMovesHistory(movesHistory);
    }

    const bestMove = state.getBestMove(who, level);

    return moveToString(bestMove);
};
