layui.use(['jquery', 'form', 'layer'], function () {

    layui.$(function () {

        layui.form.render()
        // Listen to the specified switch
        // Listen to mode switch
        layui.form.on('switch(mode)', function (data) {
            useComputer = this.checked;
        });
        // Listen to whether first move is selected
        layui.form.on('switch(first)', function (data) {
            isFirst = this.checked;
        });
        // Select computer difficulty level
        layui.form.on('select(level)', function (data) {
            theComputerLevel = +data.value;
        });
        // Click event handler for each cell (move point) on the board
        layui.$('#piece>div>img').click(function (event) {
            layui.layer.closeAll();
            if (!isStart || isOver)
                return layui.layer.msg("Please start the game first!", {
                    icon: 2
                });
            if (useComputer && currentMove === theComputer)
                return layui.layer.msg("It's not your turn yet!", {
                    icon: 2
                });
            let index = layui.$('#piece>div>img').index(event.target);
            let i = index % 11,
                j = Math.floor(index / 11);
            if (!makeMove(currentMove, i, j)) {
                return;
            }
            nextMove();
            if (showWinner(i, j))
                return;
            if (useComputer)
                notifyComputerMove();
        });
        // Click handler for the undo button
        layui.$('#undo').click(function (event) {
            if (isOver || MoveCount < 2)
                return layui.layer.msg("You can't undo now!", {
                    icon: 2
                });
            MoveCount -= 2;
            // Although it's an array, it's used like a stack here. On undo, reset the previously set values in Fld back to zero
            // Pop from stack
            Fld[History[MoveCount][1]][History[MoveCount][0]] = 0;
            Fld[History[MoveCount + 1][1]][History[MoveCount + 1][0]] = 0;
            updatePot(theComputerLevel);
            setTimeout(function () {
                showPot();
            }, 0);
            updateBoardFromHistory();
            total_steps.innerHTML = MoveCount;
            showHistory();
        });
        // Click handler for the start button
        layui.$('#start').click(function (event) {
            start();
        });
        // Click handler for the replay button
        layui.$('#replay').click(function (event) {
            start();
        });
        //
        layui.$('#about_button').click(function (event) {
            layui.layer.open({
                type: 1,
                title: 'Hex Game Description',
                content: layui.$("#about_info"),
                maxmin: true,
                skin: 'layui-layer-rim', // Add border
                area: ['1200px;', '95%'], // Width and height
                shade: 0.5,
                btn: ['OK', 'Cancel'],
                btn1: function (index, layero) {
                    layui.layer.msg("Thanks for reading!", {
                        icon: 1
                    });
                    layui.layer.close(index);
                },
                btn2: function (index, layero) {
                    layui.layer.close(index);
                },
                cancel: function (index, layero) {
                    layui.layer.close(index);
                }
            });
        });
    });
});
