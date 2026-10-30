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

        const eventDuration = 400;
        this.timeLine = anime.timeline({
            easing: "linear",
            update: function () {
                this.$timeRange.val(this.timeLine.progress);
                const eventIndex = Math.min(
                    this.events.length - 1,
                    Math.floor(this.timeLine.progress / 100 * this.events.length)
                );
                if (eventIndex !== this.currentEventIndex) {
                    this.currentEventIndex = eventIndex;
                    this.showStep(this.events[eventIndex]);
                }
            }.bind(this),
            complete: function () {
                this.currentEventIndex = this.events.length - 1;
                this.showStep(this.events[this.currentEventIndex]);
            }.bind(this)
        });

        this.events.forEach(function (event, index) {
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
        this.showStep(this.events[0]);
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

    createBoard(size) {
        const board = document.createElement("div");
        board.className = "queen-board";
        board.setAttribute("role", "grid");
        board.setAttribute("aria-label", this.translate("queenBoard", {size: size}));
        board.style.setProperty("--board-size", size);

        this.boardSquares = [];
        for (let row = 0; row < size; row++) {
            for (let col = 0; col < size; col++) {
                const square = document.createElement("div");
                const name = this.getSquareName(row, col, size);
                square.className = "queen-square " + ((row + col) % 2 === 0 ? "is-light" : "is-dark");
                square.setAttribute("role", "gridcell");
                square.setAttribute("aria-label", this.translate("queenSquare", {square: name}));
                this.boardSquares.push(square);
                board.appendChild(square);
            }
        }

        const panel = document.createElement("section");
        panel.className = "queen-step-panel";
        panel.innerHTML = '<h2>' + this.translate("queenRow", {row: 1, size: size}) + '</h2><p></p>';

        this.$visulContainer
            .addClass("visul-container queen-visualization")
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
}
