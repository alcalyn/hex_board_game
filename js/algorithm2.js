const PIECE_EMPTY = 'asset/piece_empty.png';
const PIECE_RED = 'asset/piece_red.png';
const PIECE_BLUE = 'asset/piece_blue.png';

const WHO_NONE = 0;
const WHO_RED = 1;
const WHO_BLUE = 2;

let currentMove = WHO_RED;
let theComputer = WHO_RED;
let theComputerLevel = 8;
let useComputer = true;
let isFirst = true;

let isStart = false;
let isOver = false;

let red_time = 0,
    blue_time = 0;

let red_time_start = 0,
    blue_time_start = 0;

// Timing functions
// Red player time start
function startRedTimeCount() {
    red_time_start = +new Date();
}
// Red player time end
function endRedTimeCount() {
    red_time += (+new Date()) - red_time_start;
}
// Blue player time start
function startBlueTimeCount() {
    blue_time_start = +new Date();
}
// Blue player time end
function endBlueTimeCount() {
    blue_time += (+new Date()) - blue_time_start;
}

let timeCountId = -1;
// Use moment.js for formatting time
// Start the timer
function startTimeCount() {
    stopTimeCount();
    // Displayed time = red/blue accumulated time + (now - turn start)
    // Update every 0.1 second
    timeCountId = setInterval(function () {
        red_time_span.innerHTML = moment.utc(WHO_RED === currentMove ? red_time + (+new Date()) - red_time_start : red_time).format('HH:mm:ss.S');
        blue_time_span.innerHTML = moment.utc(WHO_BLUE === currentMove ? blue_time + (+new Date()) - blue_time_start : blue_time).format('HH:mm:ss.S');
    }, 100);
}

// Stop timer and reset both times
function stopTimeCount() {
    if (timeCountId >= 0)
        clearInterval(timeCountId);
    red_time = 0;
    blue_time = 0;
}

const PIECES = [PIECE_EMPTY, PIECE_RED, PIECE_BLUE];

// Normalize helper function
function standardize(val) {
    val < 0 && (val = 0)
    val = Math.log10(val / 512 + 1) / Math.log10(4);
    return val > 1 ? 1 : val;
}

// Convert AI value to hex color
function to_hex(vv) {
    var hh = "0123456789ABCDEF";
    var nn = Math.floor(standardize(vv) * 255);
    nn = 255 - nn;
    return hh.charAt(Math.floor(nn / 16)) + hh.charAt(nn % 16);
}

layui.use(['jquery', 'layer'], function () {

    // Update piece on the board
    function change_piece(i, j, type) {
        layui.$('#piece>div>img').get(j * 11 + i).src = type;
    }

    window.change_piece = change_piece;

    // Update AI cell value
    function change_pot(selector, i, j, value) {
        let ele = layui.$('#' + selector + '>div>.pot').eq(j * 11 + i);
        ele.attr('title', value);
        layui.$('.hexagon', ele).css('filter', 'brightness(' + (1 - standardize(value)) + ')');
        layui.$('.val', ele).text(to_hex(value));
    }
    window.change_pot = change_pot;

    // Update move history on UI
    function showHistory() {
        let red_flag = false;
        let history = layui.$('.history');
        history.html('');
        for (let i = 0; i < MoveCount; ++i) {
            let ii = History[i][0];
            let jj = History[i][1];
            if (red_flag = !red_flag) {
                history.append(layui.$('<div><span style="padding-left: 15px; color: red;">Red:</span><span>' + 'ABCDEFGHIJK'.charAt(ii) + (jj + 1) + '</span></div>'));
            } else {
                history.append(layui.$('<div><span style="padding-left: 15px; color: blue;">Blue:</span><span>' + 'ABCDEFGHIJK'.charAt(ii) + (jj + 1) + '</span></div>'));
            }
        }
        history.get(0).scrollTop = history.get(0).scrollHeight;
    }
    window.showHistory = showHistory;

    // Reconstruct board state from move history
    function updateBoardFromHistory() {
        let imgs = layui.$('#piece>div>img');
        imgs.attr('src', PIECE_EMPTY);

        let red_flag = false;
        for (let i = 0; i < MoveCount; ++i) {
            let ii = History[i][0];
            let jj = History[i][1];
            if (red_flag = !red_flag) {
                layui.$('#piece>div>img').get(jj * 11 + ii).src = PIECE_RED;
            } else {
                layui.$('#piece>div>img').get(jj * 11 + ii).src = PIECE_BLUE;
            }
        }
    }
    window.updateBoardFromHistory = updateBoardFromHistory;

});

// AI algorithm to find the best next move
function getBestMove(who, theLevel) {
    let theCol = WHO_NONE === who ? 0 : WHO_RED === who ? -1 : 1;
    // WHO_RED === who ? -1 : 1 — Is it red now? If yes, return -1, else return 1
    // WHO_NONE === who
    // theCol < 0 means red, theCol > 0 means blue
    var ii, jj, kk, ii_b, jj_b, ff = 0,
        ii_q = 0,
        jj_q = 0,
        cc, pp0, pp1;
    vv = new Array();
    // When the game starts and the first piece is placed, ff equals 190 / (number of moves squared)
    if (MoveCount > 0) ff = 190 / (MoveCount * MoveCount);
    mm = 20000; // weight value
    // Traverse the entire board
    // Initially, each Fld[][] is 0, so if it is not zero, this position is occupied
    for (ii = 0; ii < Size; ii++) {
        for (jj = 0; jj < Size; jj++) {
            // If a piece is placed; ii starts from zero, so row count adds one, jj does not
            if (Fld[ii][jj] != 0) {
                ii_q += 2 * ii + 1 - Size; // For example, 6th piece on 7th row, ii=6, jj=6, ii_q=2
                jj_q += 2 * jj + 1 - Size; // jj_q=2
            } // Due to looping, all placed pieces are summed using the above formula during traversal
            // But if ii or jj <= 5, ii_q or jj_q value will decrease or stay zero
        }
    }
    // Convert ii_q and jj_q to <0 -1, >0 1
    // The total size=11, when <=5 values decrease or stay, >5 values increase
    // Then pass to sign function to convert ii_q to -1 or 1
    // c: Determines if more pieces are in upper half or lower half
    // Same for left and right halves
    ii_q = sign(ii_q);
    jj_q = sign(jj_q);
    // Traverse the board again
    for (ii = 0; ii < Size; ii++) {
        for (jj = 0; jj < Size; jj++) {
            // If this place is not occupied
            if (Fld[ii][jj] == 0) {
                // Generate a helper number that affects future moves.
                // If level 10 is selected, mmp is exact, future moves will be optimal
                // For other levels, mmp will have errors to lower difficulty
                mmp = Math.random() * (10 - theLevel) / 10 * 50; // Level 10 means 0
                // mmp = 0;
                // Math.abs takes absolute value
                // mmp adds deviation from center multiplied by move count weight (190 / move count squared; more moves mean smaller ff)
                mmp += (Math.abs(ii - 5) + Math.abs(jj - 5)) * ff;
                // mmp further adds 8 * (upper half / lower half difference * deviation from center (up/down + left/right) / (move count + 1))
                // Positioning to quarter sections
                mmp += 8 * (ii_q * (ii - 5) + jj_q * (jj - 5)) / (MoveCount + 1);
                // If chosen level is greater than 6
                if (theLevel > 6) {
                    // Traverse
                    for (kk = 0; kk < 4; kk++)
                        // bridge 11*11*4
                        mmp -= Bridge[ii][jj][kk];
                }
                // pot[][][0] from 0 to 10 corresponds to weight values from bottom row to top row on interface
                // pot[][][1] from 0 to 10 corresponds to weight values from first row to last row on interface
                // pot[][][3] is the weight of the corresponding position
                // pot[][][2] is the weight of the corresponding position on the flipped board
                pp0 = Pot[ii][jj][0] + Pot[ii][jj][1]; // Distance from middle line, sum of weights [0] + [1] are the same for each position
                pp1 = Pot[ii][jj][2] + Pot[ii][jj][3]; // After placing a piece, [][][3] changes from the position to the next smaller number
                mmp += pp0 + pp1;
                if ((pp0 <= 268) || (pp1 <= 268)) mmp -= 400; // 140+128 // Means on the very edge row
                vv[ii * Size + jj] = mmp;
                if (mmp < mm) {
                    mm = mmp;
                    ii_b = ii;
                    jj_b = jj;
                }
            }
        }
    }
    if (theLevel > 4) {
        mm += 108;
        for (ii = 0; ii < Size; ii++) {
            for (jj = 0; jj < Size; jj++) {
                if (vv[ii * Size + jj] < mm) {
                    if (theCol < 0) //red
                    {
                        if ((ii > 3) && (ii < Size - 1) && (jj > 0) && (jj < 3)) {
                            if (Fld[ii - 1][jj + 2] == -theCol) {
                                cc = CanConnectFarBorder(ii - 1, jj + 2, -theCol);
                                if (cc < 2) {
                                    ii_b = ii;
                                    if (cc < -1) {
                                        ii_b--;
                                        cc++;
                                    }
                                    jj_b = jj - cc;
                                    mm = vv[ii * Size + jj];
                                }
                            }
                        }
                        if ((ii > 0) && (ii < Size - 1) && (jj == 0)) {
                            if ((Fld[ii - 1][jj + 2] == -theCol) &&
                                (Fld[ii - 1][jj] == 0) && (Fld[ii - 1][jj + 1] == 0) && (Fld[ii][jj + 1] == 0) && (Fld[ii + 1][jj] == 0)) {
                                ii_b = ii;
                                jj_b = jj;
                                mm = vv[ii * Size + jj];
                            }
                        }
                        if ((ii > 0) && (ii < Size - 4) && (jj < Size - 1) && (jj > Size - 4)) {
                            if (Fld[ii + 1][jj - 2] == -theCol) {
                                cc = CanConnectFarBorder(ii + 1, jj - 2, -theCol);
                                if (cc < 2) {
                                    ii_b = ii;
                                    if (cc < -1) {
                                        ii_b++;
                                        cc++;
                                    }
                                    jj_b = jj + cc;
                                    mm = vv[ii * Size + jj];
                                }
                            }
                        }
                        if ((ii > 0) && (ii < Size - 1) && (jj == Size - 1)) {
                            if ((Fld[ii + 1][jj - 2] == -theCol) &&
                                (Fld[ii + 1][jj] == 0) && (Fld[ii + 1][jj - 1] == 0) && (Fld[ii][jj - 1] == 0) && (Fld[ii - 1][jj] == 0)) {
                                ii_b = ii;
                                jj_b = jj;
                                mm = vv[ii * Size + jj];
                            }
                        }
                    } else { //blue
                        if ((jj > 3) && (jj < Size - 1) && (ii > 0) && (ii < 3)) {
                            if (Fld[ii + 2][jj - 1] == -theCol) {
                                cc = CanConnectFarBorder(ii + 2, jj - 1, -theCol);
                                if (cc < 2) {
                                    jj_b = jj;
                                    if (cc < -1) {
                                        jj_b--;
                                        cc++;
                                    }
                                    ii_b = ii - cc;
                                    mm = vv[ii * Size + jj];
                                }
                            }
                        }
                        if ((jj > 0) && (jj < Size - 1) && (ii == 0)) {
                            if ((Fld[ii + 2][jj - 1] == -theCol) &&
                                (Fld[ii][jj - 1] == 0) && (Fld[ii + 1][jj - 1] == 0) && (Fld[ii + 1][jj] == 0) && (Fld[ii][jj + 1] == 0)) {
                                ii_b = ii;
                                jj_b = jj;
                                mm = vv[ii * Size + jj];
                            }
                        }
                        if ((jj > 0) && (jj < Size - 4) && (ii < Size - 1) && (ii > Size - 4)) {
                            if (Fld[ii - 2][jj + 1] == -theCol) {
                                cc = CanConnectFarBorder(ii - 2, jj + 1, -theCol);
                                if (cc < 2) {
                                    jj_b = jj;
                                    if (cc < -1) {
                                        jj_b++;
                                        cc++;
                                    }
                                    ii_b = ii + cc;
                                    mm = vv[ii * Size + jj];
                                }
                            }
                        }
                        if ((jj > 0) && (jj < Size - 1) && (ii == Size - 1)) {
                            if ((Fld[ii - 2][jj + 1] == -theCol) &&
                                (Fld[ii][jj + 1] == 0) && (Fld[ii - 1][jj + 1] == 0) && (Fld[ii - 1][jj] == 0) && (Fld[ii][jj - 1] == 0)) {
                                ii_b = ii;
                                jj_b = jj;
                                mm = vv[ii * Size + jj];
                            }
                        }
                    }
                }
            }
        }
    }
    return [jj_b, ii_b];
    //    MakeMove(ii_b, jj_b, false);
    //    IsRunning = false;
    //    if (theCol < 0) {
    //        if ((Pot[ii_b][jj_b][2] > 140) || (Pot[ii_b][jj_b][3] > 140)) {
    //            GetPot(0);
    //            WritePot(false);
    //            return;
    //        }
    //        window.document.OptionsForm.Msg.value = " Red has won !";
    //        Blink(-2);
    //    } else {
    //        if ((Pot[ii_b][jj_b][0] > 140) || (Pot[ii_b][jj_b][1] > 140)) {
    //            GetPot(0);
    //            WritePot(false);
    //            return;
    //        }
    //        window.document.OptionsForm.Msg.value = " Blue has won !";
    //        Blink(-2);
    //    }
    //    IsOver = true;
}
//点击了之后移动的一些逻辑处理
function makeMove(who, ii, jj) {
    var iis = jj,
        jjs = ii;
    if (Fld[iis][jjs])
        return false;
    //    if (MoveCount == 1) {
    //        if (Fld[ii][jj] != 0) {
    //            Fld[ii][jj] = 0;
    //            //            RefreshPic(ii, jj);
    //            iis = jj;
    //            jjs = ii;
    //            IsSwap = 1;
    //        } else IsSwap = 0;
    //    }
    //    let ccol = ((MoveCount + 1 + Start0) % 2) * 2 - 1;
    //    Fld[iis][jjs] = ccol;
    Fld[iis][jjs] = WHO_NONE === who ? 0 : WHO_RED === who ? -1 : 1;
    //    RefreshPic(iis, jjs);
    //更新总移动步数
    if (History[MoveCount][0] != ii) {
        History[MoveCount][0] = ii;
        MaxMoveCount = MoveCount + 1;
    }
    if (History[MoveCount][1] != jj) {
        History[MoveCount][1] = jj;
        MaxMoveCount = MoveCount + 1;
    }
    MoveCount++;
    if (MaxMoveCount < MoveCount)
        MaxMoveCount = MoveCount;
    change_piece(ii, jj, PIECES[who]); //显示棋子图片
    updatePot(theComputerLevel); //getpot 获得棋子位置
    setTimeout(function () {
        showPot();
    }, 0);
    return MoveCount;
}



let graph;
function updatePot(level) {

    var map={};

    for (ii = 0; ii < Size; ii++) {
        map[''+Fld[ii][0]]={};
        for (jj = 0; jj < Size; jj++) {
            if (Fld[ii][0] == 0) map[''+Fld[ii][0]][''+Fld[jj][0]]=128; //blue border
            else {
                if (Fld[ii][0] > 0) map[''+Fld[ii][0]][''+Fld[jj][0]]=0; // If it is own piece, set its path length to 0
            }
        }
    }
    graph=new dijkstra(map);

    for (ii = 0; ii < Size; ii++) {
        for (jj = 0; jj < Size; jj++) {
            Pot[ii][jj][0]=graph.findShortestPath(''+Fld[ii][0],''+Fld[jj][0]);
        }
    }

    return GetPot(level);
}


// Display AI status map
function showPot() {
    for (ii = 0; ii < Size; ii++) {
        for (jj = 0; jj < Size; jj++) {
            // The last parameter of change_pot input is the value on the interface
            //red;
            change_pot('piece_pot0', jj, ii, Pot[ii][jj][2]);
            change_pot('piece_pot1', jj, ii, Pot[ii][jj][3]);
            change_pot('piece_pot2', jj, ii, (Pot[ii][jj][2] + Pot[ii][jj][3]) / 2);
            //blue;
            change_pot('piece_pot3', jj, ii, Pot[ii][jj][0]);
            change_pot('piece_pot4', jj, ii, Pot[ii][jj][1]);
            change_pot('piece_pot5', jj, ii, (Pot[ii][jj][0] + Pot[ii][jj][1]) / 2);
        }
    }
}
// Determine which color wins
function whoWin(jj, ii) {
    if ((Pot[ii][jj][2] <= 0) && (Pot[ii][jj][3] <= 0)) {
        return WHO_RED; //red;
    } else if ((Pot[ii][jj][0] <= 0) && (Pot[ii][jj][1] <= 0)) {
        return WHO_BLUE; //blue;
    }
    return WHO_NONE; //none;
}


// Dijkstra algorithm
var dijkstra = (function (undefined) {

	var extractKeys = function (obj) {
		var keys = [], key;
		for (key in obj) {
		    Object.prototype.hasOwnProperty.call(obj,key) && keys.push(key);
		}
		return keys;
	}

	var sorter = function (a, b) {
		return parseFloat (a) - parseFloat (b);
	}

	var findPaths = function (map, start, end, infinity) {
		infinity = infinity || Infinity;

		var costs = {},
		    open = {'0': [start]},
		    predecessors = {},
		    keys;

		var addToOpen = function (cost, vertex) {
			var key = "" + cost;
			if (!open[key]) open[key] = [];
			open[key].push(vertex);
		}

		costs[start] = 0;

		while (open) {
			if(!(keys = extractKeys(open)).length) break;

			keys.sort(sorter);

			var key = keys[0],
			    bucket = open[key],
			    node = bucket.shift(),
			    currentCost = parseFloat(key),
			    adjacentNodes = map[node] || {};

			if (!bucket.length) delete open[key];

			for (var vertex in adjacentNodes) {
			    if (Object.prototype.hasOwnProperty.call(adjacentNodes, vertex)) {
					var cost = adjacentNodes[vertex],
					    totalCost = cost + currentCost,
					    vertexCost = costs[vertex];

					if ((vertexCost === undefined) || (vertexCost > totalCost)) {
						costs[vertex] = totalCost;
						addToOpen(totalCost, vertex);
						predecessors[vertex] = node;
					}
				}
			}
		}

		if (costs[end] === undefined) {
			return null;
		} else {
			return predecessors;
		}

	}

	var extractShortest = function (predecessors, end) {
		var nodes = [],
		    u = end;

		while (u !== undefined) {
			nodes.push(u);
			u = predecessors[u];
		}

		nodes.reverse();
		return nodes;
	}

	var findShortestPath = function (map, nodes) {
		var start = nodes.shift(),
		    end,
		    predecessors,
		    path = [],
		    shortest;

		while (nodes.length) {
			end = nodes.shift();
			predecessors = findPaths(map, start, end);

			if (predecessors) {
				shortest = extractShortest(predecessors, end);
				if (nodes.length) {
					path.push.apply(path, shortest.slice(0, -1));
				} else {
					return path.concat(shortest);
				}
			} else {
				return null;
			}

			start = end;
		}
	}

	var toArray = function (list, offset) {
		try {
			return Array.prototype.slice.call(list, offset);
		} catch (e) {
			var a = [];
			for (var i = offset || 0, l = list.length; i < l; ++i) {
				a.push(list[i]);
			}
			return a;
		}
	}

	var dijkstra = function (map) {
		this.map = map;
	}

	dijkstra.prototype.findShortestPath = function (start, end) {
		if (Object.prototype.toString.call(start) === '[object Array]') {
			return findShortestPath(this.map, start);
		} else if (arguments.length === 2) {
			return findShortestPath(this.map, [start, end]);
		} else {
			return findShortestPath(this.map, toArray(arguments));
		}
	}

	dijkstra.findShortestPath = function (map, start, end) {
		if (Object.prototype.toString.call(start) === '[object Array]') {
			return findShortestPath(map, start);
		} else if (arguments.length === 3) {
			return findShortestPath(map, [start, end]);
		} else {
			return findShortestPath(map, toArray(arguments, 1));
		}
	}

	return dijkstra;

})();



// Behavior for the next move
function nextMove() {
    // Stop the timer of the previous move, start the timer for the next one
    if (WHO_RED === currentMove) {
        endRedTimeCount();
        startBlueTimeCount();
    }
    if (WHO_BLUE === currentMove) {
        endBlueTimeCount();
        startRedTimeCount();
    }
    total_steps.innerHTML = MoveCount;
    currentMove = WHO_RED === currentMove ? WHO_BLUE : WHO_RED;
    who.innerHTML = WHO_RED === currentMove ? 'Red' : 'Blue';
    showHistory();
}

//轮到电脑下棋的回合
function notifyComputerMove() {
    if (currentMove !== theComputer)
        return false;
    let point = getBestMove(theComputer, theComputerLevel); // Return two numbers
    makeMove(currentMove, point[0], point[1]); //makeMove(who, ii, jj)
    nextMove();
    showWinner(point[0], point[1]);
}

// End game popup
function showWinner(i, j) {
    let win = whoWin(i, j);
    if (WHO_NONE === win)
        return false;
    isOver = true;

    blink();
    if (useComputer) {
        let index = layer.confirm(win === theComputer ? 'Haha, you lost!!' : 'Wow, impressive!!', {
            btn: [win === theComputer ? 'Rematch' : 'Haha', win === theComputer ? 'Okay' : 'Nice'] // buttons
        }, function () {
            layer.msg(win === theComputer ? 'Come back stronger!' : 'Congratulations!', {
                icon: 1
            });
            layer.close(index);
        }, function () {
            layer.msg(win === theComputer ? 'Keep going!' : 'Good job!', {
                icon: 1
            });
            layer.close(index);
        });
    } else {
        let index = layer.confirm(WHO_RED === win ? 'Red Wins!' : 'Blue Wins!', {
            btn: ['OK', 'Cancel']
        }, function () {
            layer.close(index);
        }, function () {
            layer.close(index);
        });
    }

    stopTimeCount();
    return true;
}

function blink() {
    for (ii = 0; ii < Size; ii++)
        for (jj = 0; jj < Size; jj++)
            if ((Pot[ii][jj][0] + Pot[ii][jj][1] <= 0) || (Pot[ii][jj][2] + Pot[ii][jj][3] <= 0)) {
                let index = ii * 11 + jj;
                layui.$('#piece>div>img').eq(index).addClass('blink');
            }
}

// Initialize the entire game
function init() {
    var ii, jj;
    for (ii = 0; ii < Size; ii++) {
        for (jj = 0; jj < Size; jj++)
            Fld[ii][jj] = 0;
    }
    updatePot(theComputerLevel);
    // Display AI status map
    setTimeout(function () {
        showPot();
    }, 0);

    isStart = false;
    isOver = false;

    Start0 = true;
    MoveCount = 0;
    MaxMoveCount = 0;

    who.innerHTML = 'Not started';
    total_steps.innerHTML = 0;

    red_time_span.innerHTML = 0;
    blue_time_span.innerHTML = 0;

    layui.$('.history').html('');

    currentMove = WHO_RED;
    //    computerLevel = 8;
    red_time = 0;
    blue_time = 0;

    layui.$('#piece>div>img.blink').removeClass('blink');

    updateBoardFromHistory();
}

// Start game
function start() {
    init();
    isStart = true;
    theComputer = isFirst ? WHO_BLUE : WHO_RED;
    if (!isFirst && useComputer)
        notifyComputerMove();
    // Start full timing
    startRedTimeCount();
    startBlueTimeCount();
    startTimeCount();
}
