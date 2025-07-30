import assert from 'assert';
import { convertMovesHistoryToCells, mirrorMove } from '../src/utils.js';

describe('utils', () => {
    describe('convertMovesHistoryToCells', () => {
        it('returns two arrays of red and blue move', () => {
            const cells = convertMovesHistoryToCells(['a2', 'b3', 'd4']);

            assert.deepStrictEqual(cells, [
                ['a2', 'd4'],
                ['b3'],
            ])
        });

        it('handles swap-pieces', () => {
            const cells = convertMovesHistoryToCells(['a2', 'swap-pieces', 'd4']);

            assert.deepStrictEqual(cells, [
                ['d4'],
                ['b1'],
            ])
        });

        it('handles pass', () => {
            const cells = convertMovesHistoryToCells(['a2', 'pass', 'd4']);

            assert.deepStrictEqual(cells, [
                ['a2', 'd4'],
                [],
            ])
        });

        it('does not break when trying to swap a pass move', () => {
            const cells = convertMovesHistoryToCells(['pass', 'swap-pieces', 'd4']);

            assert.deepStrictEqual(cells, [
                ['d4'],
                [],
            ])
        });
    });

    describe('mirrorMove', () => {
        it('mirror a move following swap pieces mirroring rule', () => {
            assert.strictEqual(mirrorMove('b1'), 'a2');
        });
    });
});
