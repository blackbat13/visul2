class DynamicAlgorithms extends Animation {
    constructor() {
        super();
        this.$firstInput = $("#lcs-first-input");
        this.$secondInput = $("#lcs-second-input");
        this.$searchResult = $("#search-result");
        this.cellSize = 38;
        this.cellGap = 3;
    }

    prepareLongestCommonSubsequence(firstSequence, secondSequence) {
        const firstCharacters = Array.from(firstSequence || "");
        const secondCharacters = Array.from(secondSequence || "");
        const maxLength = 12;

        if (!firstCharacters.length || !secondCharacters.length) {
            this.showLcsInputError(this.translate("invalidLcsInput"));
            return;
        }
        if (firstCharacters.length > maxLength || secondCharacters.length > maxLength) {
            this.showLcsInputError(this.translate("lcsInputTooLong", {maxLength: maxLength}));
            return;
        }

        const rowCount = firstCharacters.length + 1;
        const columnCount = secondCharacters.length + 1;
        const table = Array.from({length: rowCount}, function () {
            return new Array(columnCount).fill(0);
        });
        for (let row = 1; row < rowCount; row++) {
            for (let column = 1; column < columnCount; column++) {
                if (firstCharacters[row - 1] === secondCharacters[column - 1]) {
                    table[row][column] = table[row - 1][column - 1] + 1;
                } else {
                    table[row][column] = Math.max(table[row - 1][column], table[row][column - 1]);
                }
            }
        }

        const subsequenceCoordinates = [];
        let row = firstCharacters.length;
        let column = secondCharacters.length;
        while (row > 0 && column > 0) {
            if (firstCharacters[row - 1] === secondCharacters[column - 1]) {
                subsequenceCoordinates.push([row, column]);
                row--;
                column--;
            } else if (table[row - 1][column] >= table[row][column - 1]) {
                row--;
            } else {
                column--;
            }
        }
        subsequenceCoordinates.reverse();
        const subsequence = subsequenceCoordinates.map(function (coordinate) {
            return firstCharacters[coordinate[0] - 1];
        }).join("");

        const cellPitch = this.cellSize + this.cellGap;
        const rowHeaderWidth = 84;
        const tableWidth = rowHeaderWidth + columnCount * cellPitch;
        const stageWidth = this.$visulContainer.parent().width();
        const containerWidth = Math.max(stageWidth, tableWidth + 48);
        const tableLeft = Math.floor((containerWidth - tableWidth) / 2);
        const $table = $("<table></table>")
            .attr("id", "lcs-table")
            .attr("aria-label", this.translate("lcsTableLabel", {
                first: firstSequence,
                second: secondSequence
            }))
            .addClass("lcs-table")
            .css({left: tableLeft + "px", transform: "none"});
        $table.append(
            $("<caption></caption>")
                .addClass("lcs-table-caption")
                .text(this.translate("lcsTableCaption", {
                    first: firstSequence,
                    second: secondSequence
                }))
        );
        const $head = $("<thead></thead>");
        const $headerRow = $("<tr></tr>");
        $headerRow.append(
            $("<th></th>")
                .attr("scope", "col")
                .addClass("lcs-corner")
                .text(this.translate("lcsTableCorner"))
        );
        const columnHeaders = [];
        const rowHeaders = [];
        const valueCells = [];
        const $emptyColumnHeader = $("<th></th>")
            .attr("scope", "col")
            .addClass("lcs-column-header lcs-empty-header")
            .text("ε");
        $headerRow.append($emptyColumnHeader);
        secondCharacters.forEach(function (character, index) {
            const $header = $("<th></th>")
                .attr("scope", "col")
                .addClass("lcs-column-header")
                .text(character);
            columnHeaders.push($header[0]);
            $headerRow.append($header);
        });
        $head.append($headerRow);
        $table.append($head);

        const $body = $("<tbody></tbody>");
        const $zeroRow = $("<tr></tr>");
        $zeroRow.append(
            $("<th></th>")
                .attr("scope", "row")
                .addClass("lcs-row-header lcs-empty-header")
                .text("ε")
        );
        for (let column = 0; column < columnCount; column++) {
            $zeroRow.append(
                $("<td></td>")
                    .addClass("lcs-base-cell")
                    .attr("aria-label", this.translate("lcsBaseCell", {row: 0, column: column}))
                    .text("0")
            );
        }
        $body.append($zeroRow);

        for (let currentRow = 1; currentRow < rowCount; currentRow++) {
            const $row = $("<tr></tr>");
            const $rowHeader = $("<th></th>")
                .attr("scope", "row")
                .addClass("lcs-row-header")
                .text(firstCharacters[currentRow - 1]);
            rowHeaders.push($rowHeader[0]);
            $row.append($rowHeader);
            const rowCells = [];
            $row.append(
                $("<td></td>")
                    .addClass("lcs-base-cell")
                    .attr("aria-label", this.translate("lcsBaseCell", {row: currentRow, column: 0}))
                    .text("0")
            );
            for (let currentColumn = 1; currentColumn < columnCount; currentColumn++) {
                const $cell = $("<td></td>")
                    .attr("id", "lcs-cell-" + currentRow + "-" + currentColumn)
                    .attr("aria-label", this.translate("lcsCellLabel", {
                        row: currentRow,
                        column: currentColumn,
                        value: table[currentRow][currentColumn]
                    }));
                const $value = $("<span></span>")
                    .text(table[currentRow][currentColumn].toString())
                    .css("opacity", 0);
                $cell.append($value);
                rowCells.push($cell[0]);
                $row.append($cell);
            }
            valueCells.push(rowCells);
            $body.append($row);
        }
        $table.append($body);

        this.$visulContainer.empty().css({width: containerWidth + "px", height: "690px"});
        this.$visulContainer.append($table);
        this.$timeRange.val(0);
        this.$searchResult.text(this.translate("lcsInProgress", {
            first: firstSequence,
            second: secondSequence
        }));

        this.timeLine = anime.timeline({
            easing: "easeInOutQuad",
            duration: 400,
            update: function () {
                this.$timeRange.val(this.timeLine.progress);
            }.bind(this)
        });

        let previousDependencies = [];
        for (let currentRow = 1; currentRow < rowCount; currentRow++) {
            for (let currentColumn = 1; currentColumn < columnCount; currentColumn++) {
                const isMatch = firstCharacters[currentRow - 1] === secondCharacters[currentColumn - 1];
                const cell = valueCells[currentRow - 1][currentColumn - 1];
                const dependencies = isMatch
                    ? [valueCells[currentRow - 2]?.[currentColumn - 2]]
                    : [
                        valueCells[currentRow - 2]?.[currentColumn - 1],
                        valueCells[currentRow - 1][currentColumn - 2]
                    ];
                const currentDependencies = dependencies.filter(Boolean);
                if (previousDependencies.length) {
                    this.timeLine.add({
                        targets: previousDependencies,
                        backgroundColor: "#ffffff",
                        duration: 1
                    });
                }

                this.timeLine.add({
                    targets: [rowHeaders[currentRow - 1], columnHeaders[currentColumn - 1]],
                    backgroundColor: isMatch ? this.colors.first : this.colors.second,
                    duration: 1
                });
                if (currentDependencies.length) {
                    this.timeLine.add({
                        targets: currentDependencies,
                        backgroundColor: this.colors.first,
                        duration: 1
                    });
                }
                this.timeLine.add({
                    targets: cell,
                    backgroundColor: this.colors.sorted,
                    duration: 1
                });
                this.timeLine.add({
                    targets: cell.firstElementChild,
                    opacity: 1,
                    duration: 250
                });
                this.timeLine.add({
                    duration: 1,
                    complete: function () {
                        this.$searchResult.text(this.translate(
                            isMatch ? "lcsMatchStep" : "lcsMismatchStep",
                            {
                                row: currentRow,
                                column: currentColumn,
                                value: table[currentRow][currentColumn],
                                dependency: table[currentRow - 1][currentColumn - 1],
                                top: table[currentRow - 1][currentColumn],
                                left: table[currentRow][currentColumn - 1]
                            }
                        ));
                    }.bind(this)
                });
                previousDependencies = currentDependencies;
            }
        }

        if (previousDependencies.length) {
            this.timeLine.add({
                targets: previousDependencies,
                backgroundColor: "#ffffff",
                duration: 1
            });
        }

        const lcsCells = subsequenceCoordinates.map(function (coordinate) {
            return valueCells[coordinate[0] - 1][coordinate[1] - 1];
        });
        if (lcsCells.length) {
            this.timeLine.add({
                targets: lcsCells,
                backgroundColor: this.colors.sorted,
                duration: 300
            });
        }
        this.timeLine.add({
            duration: 1,
            complete: function () {
                this.$searchResult.text(this.translate("lcsResult", {
                    sequence: subsequence || this.translate("lcsEmptySequence"),
                    length: subsequence.length
                }));
            }.bind(this)
        });

        this.timeLine.restart();
        this.timeLine.pause();
    }

    showLcsInputError(message) {
        if (this.timeLine) {
            this.timeLine.pause();
        }
        this.$visulContainer.empty().css({width: "100%", height: ""});
        this.$timeRange.val(0);
        this.$searchResult.text(message);
        this.timeLine = anime.timeline();
    }
}
