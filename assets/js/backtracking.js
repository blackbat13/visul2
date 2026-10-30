class Backtracking extends Animation {
    constructor() {
        super();
        this.queensCount = 4;
        this.boardSquares = [];
        this.currentEventIndex = -1;
    }

    prepareNQueens(size) {
        if (this.timeLine) {
            this.timeLine.pause();
        }

        this.queensCount = size;
        this.events = this.createSearchEvents(size);
        this.createBoard(size);
        this.currentEventIndex = -1;

        this.prepareEventTimeline(this.events, size, 400, this.showStep.bind(this));
    }

    prepareKnightsTour() {
        if (this.timeLine) {
            this.timeLine.pause();
        }

        const size = 5;
        this.queensCount = size;
        this.events = this.createKnightsTourEvents(size);
        this.createBoard(size, "knight");
        this.currentEventIndex = -1;
        this.prepareEventTimeline(this.events, size, 180, this.showKnightStep.bind(this));
    }

    prepareEventTimeline(events, size, eventDuration, showEvent) {
        this.timeLine = anime.timeline({
            easing: "linear",
            update: function () {
                this.$timeRange.val(this.timeLine.progress);
                const eventIndex = Math.min(
                    events.length - 1,
                    Math.floor(this.timeLine.progress / 100 * events.length)
                );
                if (eventIndex !== this.currentEventIndex) {
                    this.currentEventIndex = eventIndex;
                    showEvent(events[eventIndex]);
                }
            }.bind(this),
            complete: function () {
                this.currentEventIndex = events.length - 1;
                showEvent(events[this.currentEventIndex]);
            }.bind(this)
        });

        events.forEach(function (event, index) {
            const square = this.boardSquares[event.row * size + event.col];
            this.timeLine.add({
                targets: square,
                scale: [0.92, 1],
                duration: eventDuration,
                easing: "easeOutQuad",
            }, index * eventDuration);
        }.bind(this));

        this.timeLine.restart();
        this.timeLine.pause();
        this.currentEventIndex = 0;
        showEvent(events[0]);
    }

    createSearchEvents(size) {
        const placements = new Array(size).fill(-1);
        const events = [{type: "start", row: 0, col: 0, queens: placements.slice()}];

        const isSafe = function (row, col) {
            for (let previousRow = 0; previousRow < row; previousRow++) {
                const previousCol = placements[previousRow];
                if (previousCol === col || Math.abs(previousCol - col) === row - previousRow) {
                    return false;
                }
            }
            return true;
        };

        const search = function (row) {
            if (row === size) {
                events.push({
                    type: "solution",
                    row: size - 1,
                    col: placements[size - 1],
                    queens: placements.slice()
                });
                return true;
            }

            for (let col = 0; col < size; col++) {
                const safe = isSafe(row, col);
                events.push({
                    type: "check",
                    row: row,
                    col: col,
                    safe: safe,
                    queens: placements.slice()
                });

                if (!safe) {
                    continue;
                }

                placements[row] = col;
                events.push({
                    type: "place",
                    row: row,
                    col: col,
                    queens: placements.slice()
                });

                if (search(row + 1)) {
                    return true;
                }

                placements[row] = -1;
                events.push({
                    type: "backtrack",
                    row: row,
                    col: col,
                    queens: placements.slice()
                });
            }

            return false;
        };

        if (!search(0)) {
            events.push({type: "noSolution", row: 0, col: 0, queens: placements.slice()});
        }

        return events;
    }

    createKnightsTourEvents(size) {
        const moves = [[2, -1], [2, 1], [1, 2], [-1, 2], [-2, 1], [-2, -1], [-1, -2], [1, -2]];
        const path = [{row: 0, col: 0}];
        const visited = new Set(["0,0"]);
        const events = [{type: "start", row: 0, col: 0, path: path.slice()}];

        const search = function () {
            if (path.length === size * size) {
                const lastSquare = path[path.length - 1];
                events.push({
                    type: "solution",
                    row: lastSquare.row,
                    col: lastSquare.col,
                    path: path.slice()
                });
                return true;
            }

            const current = path[path.length - 1];
            for (const [rowOffset, colOffset] of moves) {
                const next = {row: current.row + rowOffset, col: current.col + colOffset};
                const key = next.row + "," + next.col;
                if (next.row < 0 || next.col < 0 || next.row >= size || next.col >= size || visited.has(key)) {
                    continue;
                }

                events.push({
                    type: "check",
                    row: next.row,
                    col: next.col,
                    path: path.slice()
                });
                path.push(next);
                visited.add(key);
                events.push({
                    type: "move",
                    row: next.row,
                    col: next.col,
                    path: path.slice()
                });

                if (search()) {
                    return true;
                }

                path.pop();
                visited.delete(key);
                events.push({
                    type: "backtrack",
                    row: next.row,
                    col: next.col,
                    path: path.slice()
                });
            }

            return false;
        };

        if (!search()) {
            events.push({type: "noSolution", row: 0, col: 0, path: path.slice()});
        }

        return events;
    }

    createBoard(size, piece = "queen") {
        const board = document.createElement("div");
        board.className = "chess-board";
        board.setAttribute("role", "grid");
        board.setAttribute("aria-label", this.translate(piece === "knight" ? "knightBoard" : "queenBoard", {size: size}));
        board.style.setProperty("--board-size", size);

        this.boardSquares = [];
        for (let row = 0; row < size; row++) {
            for (let col = 0; col < size; col++) {
                const square = document.createElement("div");
                const name = this.getSquareName(row, col, size);
                square.className = "chess-square " + ((row + col) % 2 === 0 ? "is-light" : "is-dark");
                square.setAttribute("role", "gridcell");
                square.setAttribute("aria-label", this.translate(piece === "knight" ? "knightSquare" : "queenSquare", {square: name}));
                this.boardSquares.push(square);
                board.appendChild(square);
            }
        }

        const panel = document.createElement("section");
        panel.className = "chess-step-panel";
        const heading = piece === "knight"
            ? this.translate("knightMove", {move: 1, total: size * size})
            : this.translate("queenRow", {row: 1, size: size});
        panel.innerHTML = "<h2></h2><p></p>";
        panel.querySelector("h2").textContent = heading;

        this.$visulContainer
            .addClass("visul-container chess-visualization")
            .empty()
            .append(board, panel);
        this.$stepHeading = $(panel).find("h2");
        this.$stepDescription = $(panel).find("p");
    }

    showStep(event) {
        const queen = "♛";
        this.boardSquares.forEach(function (square) {
            $(square).removeClass("has-queen is-current is-rejected is-solution").text("");
        });

        event.queens.forEach(function (col, row) {
            if (col >= 0) {
                $(this.boardSquares[row * this.queensCount + col]).addClass("has-queen").text(queen);
            }
        }.bind(this));

        if (event.type !== "start" && event.type !== "noSolution") {
            const currentSquare = this.boardSquares[event.row * this.queensCount + event.col];
            $(currentSquare).addClass("is-current");

            if (event.type === "check" && !event.safe) {
                $(currentSquare).addClass("is-rejected");
            } else if (event.type === "solution") {
                this.boardSquares.forEach(function (square) {
                    if ($(square).hasClass("has-queen")) {
                        $(square).addClass("is-solution");
                    }
                });
            }
        }

        this.$stepHeading.text(this.translate("queenRow", {
            row: Math.min(event.row + 1, this.queensCount),
            size: this.queensCount
        }));
        this.$stepDescription.text(this.getEventDescription(event));
    }

    showKnightStep(event) {
        const knight = "♞";
        this.boardSquares.forEach(function (square) {
            $(square).removeClass("has-queen has-knight is-current is-rejected is-solution").text("");
        });

        event.path.forEach(function (position, index) {
            const square = this.boardSquares[position.row * this.queensCount + position.col];
            $(square).addClass("has-knight").text(index === event.path.length - 1 ? knight : String(index + 1));
        }.bind(this));

        if (event.type !== "start" && event.type !== "noSolution") {
            const currentSquare = this.boardSquares[event.row * this.queensCount + event.col];
            $(currentSquare).addClass("is-current");

            if (event.type === "backtrack") {
                $(currentSquare).addClass("is-rejected");
            } else if (event.type === "solution") {
                this.boardSquares.forEach(function (square) {
                    if ($(square).hasClass("has-knight")) {
                        $(square).addClass("is-solution");
                    }
                });
            }
        }

        this.$stepHeading.text(this.translate("knightMove", {
            move: Math.min(event.path.length, this.queensCount * this.queensCount),
            total: this.queensCount * this.queensCount
        }));
        this.$stepDescription.text(this.getKnightEventDescription(event));
    }

    getEventDescription(event) {
        if (event.type === "start") {
            return this.translate("queenStart");
        }
        if (event.type === "solution") {
            return this.translate("queenSolution");
        }
        if (event.type === "noSolution") {
            return this.translate("queenNoSolution");
        }

        const square = this.getSquareName(event.row, event.col, this.queensCount);
        if (event.type === "check") {
            return this.translate(event.safe ? "queenCheckSafe" : "queenCheckUnsafe", {square: square});
        }
        if (event.type === "place") {
            return this.translate("queenPlaced", {square: square});
        }
        return this.translate("queenBacktrack", {square: square});
    }

    getSquareName(row, col, size) {
        return String.fromCharCode(97 + col) + (size - row);
    }

    getKnightEventDescription(event) {
        if (event.type === "start") {
            return this.translate("knightStart", {square: this.getSquareName(event.row, event.col, this.queensCount)});
        }
        if (event.type === "solution") {
            return this.translate("knightSolution", {total: this.queensCount * this.queensCount});
        }
        if (event.type === "noSolution") {
            return this.translate("knightNoSolution");
        }

        const square = this.getSquareName(event.row, event.col, this.queensCount);
        if (event.type === "check") {
            return this.translate("knightCheck", {square: square});
        }
        if (event.type === "move") {
            return this.translate("knightMoveTo", {square: square});
        }
        return this.translate("knightBacktrack", {square: square});
    }
}
