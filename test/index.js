import assert from 'assert';
import { getBestMove, State } from '../src/index.js';
import { convertMovesHistoryToCells, moveToString, WHO_BLUE, WHO_RED } from '../src/utils.js';

describe('getBestMove', () => {
    it('should return the move that wins faster at level 10 in a position where the path is almost visible', () => {
        const bestMove = getBestMove(WHO_RED, [
            'd8', 'e6',
            'g6', 'g5',
            'i4', 'j1',
            'j2', 'h5',
            'i5', 'k1',
            'h2', 'i2',
            'h3', 'h7',
            'h6', 'f8',
            'e7', 'c11',
            'c10',
        ], 10);

        assert.strictEqual(bestMove, 'b11');
    });

    it('should return a move in a game having swap and pass', () => {
        const bestMove = getBestMove(WHO_RED, [
            'd8', 'swap-pieces',
            'g6', 'pass',
            'a1', 'a2',
        ], 5);

        assert.ok(bestMove.match(/^[a-k]\d{1,2}$/));
    });

    it('should return, with new State() and resetBoard(), the move that wins faster at level 10 in a position where the path is almost visible', () => {
        const state = new State(10);

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
            'c10',
        ]));

        const bestMove = moveToString(state.getBestMove(WHO_RED));

        assert.strictEqual(bestMove, 'b11');
    });

    it('should return b9 or b11: one of the winning moves at level 10', () => {
        const bestMove = getBestMove(WHO_BLUE, [
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

        assert.ok(bestMove.match(/^(b6|b9)$/));
    });

    it('should return any valid move at level 1', () => {
        const bestMove = getBestMove(WHO_BLUE, [
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

        assert.ok(bestMove.match(/^[a-k]\d{1,2}$/));
    });
});
