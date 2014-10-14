window.onload = start_game;

var items = {
    0: "X",
    1: "O"
};

var user_interface = {
    game: null,
    player: 0,
    score1: 0,
    score2: 0,
    moves: 0,
    gameOver: false,
    cells: [],
    players: [],
    debug: null,
    new_game: null,
    reset_scores: null,
    score1element: null,
    score2element: null,
    finisher_color: 'orange',
    ai_check: null,
    ai_player: 1,
    ai_delay: 100,
    is_ai: true
};

function start_game() {
    user_interface.player = 0;
    user_interface.gameOver = false;
    user_interface.moves = 0;

    /* Generate Grid */
    user_interface.game = document.getElementById("game");
    user_interface.game.innerHTML = generate_game_area() + generate_GUI();

    user_interface.cells = document.getElementsByClassName('cell');
    user_interface.players = document.getElementsByClassName("player");
    user_interface.debug = document.getElementById("debug");
    user_interface.new_game = document.getElementById('new_game');
    user_interface.reset_scores = document.getElementById('reset_scores');
    user_interface.score1element = document.getElementById("score1");
    user_interface.score2element = document.getElementById("score2");
    user_interface.ai_check = document.getElementById("ai_check");
    

    /* Assign Functionality to play */
    add_listener(user_interface.cells, 'click', move);
    add_listener([user_interface.new_game], 'click', new_game);
    add_listener([user_interface.reset_scores], 'click', reset_scores);
    add_listener([user_interface.ai_check], 'change', check_ai);
    
    /* Set Params */
    if(!user_interface.is_ai) {
        user_interface.ai_check.checked = undefined;
    } else {
        if(user_interface.ai_player == 0) {
            ai_move();
        }
    }

    update_score();
    debug_message("Debug");
}

function generate_game_area() {
    var gameHTML = "<div id=\"options\"><input type=\"checkbox\" id=\"ai_check\" checked=\"checked\" /><label for=\"ai\">Player 2 is Computer</label></div><div class=\"instance\">";
    for (var i = 1; i < 10; i++) {
        var filler = "?";
        if (user_interface.debug) {
            filler = (i - 1);
        }
        gameHTML += "<span class=\"cell\">" + filler + "</span>";
    }
    gameHTML += "</div>";
    return gameHTML;
}

function generate_GUI() {
    guiHTML = "<table class=\"scoreboard\"><tr><th class=\"player\" id=\"control\">Player 1</th><th class=\"player\">Player 2</th></tr><tr><td id=\"score1\">Score 1</td><td id=\"score2\">Score 2</td></tr><tr><td id=\"new_game\" colspan=\"2\">New Game</td></tr><tr><td id=\"reset_scores\" colspan=\"2\">Reset Scores</td></tr></table>";
    return guiHTML;
}

function end_game(winner) {
    var players = user_interface.players;
    var winner_debug = "";
    if (winner > 1) {
        for (var i = 0; i < players.length; i++) {
            players[i].id = "draw";
        }
        winner_debug = "Match Draw";
    } else {
        winner_debug = "PLAYER " + (++winner) + " WINS";
        players[((winner) % 2)].id = "loser";
        players[winner - 1].id = "winner";
        user_interface["score" + (winner).toString()]++;
        update_score();
    }
    if (winner_debug == "") {
        winner_debug = "&nbsp;";
    }
    debug_message(winner_debug);
    user_interface.gameOver = true;
    user_interface.new_game.id = "control";
    user_interface.moves = 0;
}

function update_score() {
    user_interface.score1element.innerHTML = user_interface.score1;
    user_interface.score2element.innerHTML = user_interface.score2;
}

function new_game() {
    user_interface.is_ai = (user_interface.ai_check.checked) ? true : false;
    user_interface.game.innerHTML = "";
    start_game();
}

function reset_scores() {
    user_interface.score1 = user_interface.score2 = 0;
    new_game();
}

function move() {
    if (!user_interface.gameOver) {
        var value = this.innerHTML;
        if (value != "X" && value != "O") {
            this.innerHTML = items[user_interface.player];
            var control = document.getElementById("control");
            if (control.nextSibling != null) {
                control.id = "";
                control.nextSibling.id = "control";
            } else if (control.previousSibling != null) {
                control.id = "";
                control.previousSibling.id = "control";
            }
            user_interface.moves++;
            if (check(Array.prototype.indexOf.call(this.parentNode.childNodes, this))) {
                end_game(user_interface.player);
                update_score();
            } else {
                if (user_interface.moves > 8) {
                    end_game(2);
                } else {
                    user_interface.player++;
                    user_interface.player %= 2;
                    if(user_interface.ai_check.checked && ((user_interface.moves % 2) == user_interface.ai_player)) {
                        setTimeout(ai_move , user_interface.ai_delay);
                    }
                }
            }
        }
    }
}

function check_ai() {
    user_interface.ai_player = ((user_interface.moves + 1) % 2);
}

function ai_move() {
    var ai_options = [];
    for(var i=0; i<user_interface.cells.length; i++) {
        var value = user_interface.cells[i].innerHTML;
        if (value != "X" && value != "O") {
            ai_options.push(i);
        }
    }
    user_interface.cells[ai_options[pick_move(ai_options)]].click();
}

function pick_move(ai_options) {
    return Math.floor(Math.random() * ai_options.length);
}

function check(cell) {
    var cell_groups = [get_row_group((Math.floor(cell / 3) + 1)), get_column_group((cell % 3) + 1)];
    if (cell % 2 == 0) {
        if (cell % 4 == 0) {
            cell_groups.push([0, 4, 8]);
        }
        if (cell > 0 && cell < 8) {
            cell_groups.push([2, 4, 6]);
        }
    }
    return check_cell_groups(cell_groups);
}

function check_cell_groups(cell_groups) {
    var line_complete = false;
    var group_count = 0;
    while (!line_complete && (group_count < cell_groups.length)) {
        line_complete = check_cells(cell_groups[group_count]);
        if(line_complete) {
            color(cell_groups[group_count]);
        }
        group_count++;
    };
    return line_complete;
}

function check_cells(cells) {
    var isComplete = false;
    var count_x = 1;
    var count_o = 1;
    for (var i = 0; i < cells.length; i++) {
        if (user_interface.cells[cells[i]].innerHTML == items[0]) {
            count_o++;
        } else if (user_interface.cells[cells[i]].innerHTML == items[1]) {
            count_x++;
        }
    }
    if (count_o == 4 || count_x == 4) {
        isComplete = true;
    }
    return isComplete;
}

function get_row_group(row) {
    var row_cells = [];
    for (var i = 0; i < user_interface.cells.length; i++) {
        if (((row - 1) * 3) <= i && i < (row * 3)) {
            row_cells.push(i);
        }
    }
    return row_cells;
}

function get_column_group(column) {
    var column_cells = [];
    for (var i = 0; i < user_interface.cells.length; i++) {
        if (i % 3 == (column - 1)) {
            column_cells.push(i);
        }
    }
    return column_cells;
}

function color(dependent_cells) {
    for (var i = 0; i < user_interface.cells.length; i++) {
        if (dependent_cells.indexOf(i) >= 0) {
            user_interface.cells[i].style.backgroundColor = user_interface.finisher_color;
        }
    }
}

function debug_message(message) {
    if (user_interface.debug) {
        user_interface.debug.innerHTML = message;
    }
}

function add_listener(elements, eventName, handler) {
    for (var i = 0; i < elements.length; i++) {
        x = elements[i];
        if (x.addEventListener) {
            x.addEventListener(eventName, handler, false);
        } else if (x.attachEvent) {
            x.attachEvent('on' + eventName, handler);
        } else {
            x['on' + eventName] = handler;
        }
    }
}