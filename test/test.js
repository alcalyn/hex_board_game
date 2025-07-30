import { getBestMove, State } from '../src/index.js';
import { convertMovesHistoryToCells, mirrorMove, moveToString, WHO_BLUE, WHO_RED } from '../src/utils.js';

console.log('XX', getBestMove(WHO_BLUE, ['d4', 'f6', 'g6'], 5));

let bestMove;
let state;

/*
 * Best move should be b11, level 10
 */

console.time('b11-lv10');
bestMove = getBestMove(WHO_RED, [
    'd8', 'e6',
    'g6', 'g5',
    'i4', 'j1',
    'j2', 'h5',
    'i5', 'k1',
    'h2', 'i2',
    'h3', 'h7',
    'h6', 'f8',
    'e7', 'c11',
    'c10'
], 10);

console.log(bestMove, 'Should be b11'); // should be "b11"
console.timeEnd('b11-lv10');

/*
 * Best move should be b11, level 10
 * Board position set with resetBoard()
 */

console.time('b11-lv10-reset');
state = new State(10);
state.resetBoard(convertMovesHistoryToCells([
    'd8', 'e6',
    'g6', 'g5',
    'i4', 'j1',
    'j2', 'h5',
    'i5', 'k1',
    'h2', 'i2',
    'h3', 'h7',
    'h6', 'f8',
    'e7', 'c11',
    'c10'
]));
bestMove = moveToString(state.getBestMove(WHO_RED));

console.log(bestMove, 'Should be b11, again'); // should be "b11"
console.timeEnd('b11-lv10-reset');

/*
 * Best move should be b9 or b6, level 10
 */

console.time('b9-lv10');
bestMove = getBestMove(WHO_BLUE, [
    'd8', 'e6',
    'f6', 'f5',
    'i4', 'j1',
    'h5', 'c7',
    'e7', 'i3',
    'j3', 'k1',
    'j2', 'i2',
    'g4', 'h2',
    'f3', 'g1',
    'g2', 'h1',
    'e2', 'g5',
    'h4', 'g3',
    'f4', 'f2',
    'e3', 'g6',
    'h7', 'h6',
    'j6', 'j5',
    'a8'
], 10);

console.log(bestMove, 'Should be b6 or b9'); // winning moves: "b6" or "b9"
console.timeEnd('b9-lv10');

/*
 * At level 1, move is more variable
 */

console.time('lv1');
bestMove = getBestMove(WHO_BLUE, [
    'd8', 'e6',
    'f6', 'f5',
    'i4', 'j1',
    'h5', 'c7',
    'e7', 'i3',
    'j3', 'k1',
    'j2', 'i2',
    'g4', 'h2',
    'f3', 'g1',
    'g2', 'h1',
    'e2', 'g5',
    'h4', 'g3',
    'f4', 'f2',
    'e3', 'g6',
    'h7', 'h6',
    'j6', 'j5',
    'a8'
], 1);

console.log(bestMove, 'Should vary a lot at low level');
console.timeEnd('lv1');

/*
 * Mirror a move (for swap-pieces)
 */

console.log(mirrorMove('b1'), 'Must equals a2');
