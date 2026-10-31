class TextSearching extends Animation {
    constructor() {
        super();
        this.$textInput = $("#text-input");
        this.$patternInput = $("#pattern-input");
        this.$searchResult = $("#search-result");
        this.cellWidth = 46;
        this.cellSize = 42;
    }

    prepareNaiveStringSearch(text, pattern) {
        const textCharacters = Array.from(text || "");
        const patternCharacters = Array.from(pattern || "");
        if (!textCharacters.length || !patternCharacters.length) {
            this.showInputError(this.translate("invalidTextSearchInput"));
            return;
        }
        if (patternCharacters.length > textCharacters.length) {
            this.showInputError(this.translate("patternLongerThanText"));
            return;
        }

        const stageWidth = this.$visulContainer.parent().width();
        const textWidth = textCharacters.length * this.cellWidth;
        const containerWidth = Math.max(stageWidth, textWidth + 48);
        const textLeft = Math.floor((containerWidth - textWidth) / 2);
        const patternLeft = textLeft;
        const patternTop = 248;
        const normalColor = "#ffffff";

        this.$visulContainer.empty().css("width", containerWidth + "px");
        this.$searchResult.text(this.translate("textSearchRunning", {pattern: pattern}));
        this.$timeRange.val(0);

        this.addRowLabel(this.translate("textLabel"), textLeft, 112);
        this.addRowLabel(this.translate("patternLabel"), textLeft, 216);
        this.addTextCharacters(textCharacters, textLeft);

        const $patternRow = $("<div></div>")
            .attr("id", "naive-pattern-row")
            .addClass("text-search-row")
            .attr("aria-label", this.translate("patternLabel"))
            .css({left: patternLeft + "px", top: patternTop + "px"});
        const patternCells = [];
        patternCharacters.forEach(function (character, index) {
            const $cell = this.createCharacterCell(character, "pattern", index);
            patternCells.push($cell[0]);
            $patternRow.append($cell);
        }.bind(this));
        this.$visulContainer.append($patternRow);

        this.timeLine = anime.timeline({
            easing: "easeInOutQuad",
            duration: 500,
            update: function () {
                this.$timeRange.val(this.timeLine.progress);
            }.bind(this)
        });

        let foundIndex = -1;
        let previousPair = null;
        for (let shift = 0; shift <= textCharacters.length - patternCharacters.length; shift++) {
            if (shift > 0) {
                this.timeLine.add({
                    targets: "#naive-pattern-row",
                    left: patternLeft + shift * this.cellWidth
                });
            }

            let matched = true;
            for (let j = 0; j < patternCharacters.length; j++) {
                const textCell = this.$visulContainer.find("#text-search-text-" + (shift + j))[0];
                const patternCell = patternCells[j];
                const isEqual = textCharacters[shift + j] === patternCharacters[j];
                const pair = [textCell, patternCell];

                if (previousPair) {
                    this.timeLine.add({
                        targets: previousPair,
                        backgroundColor: normalColor
                    });
                }
                this.timeLine.add({
                    targets: pair,
                    backgroundColor: isEqual ? this.colors.first : this.colors.second
                }, "-=500");

                previousPair = pair;
                if (!isEqual) {
                    matched = false;
                    break;
                }
            }

            if (matched) {
                foundIndex = shift;
                if (previousPair) {
                    this.timeLine.add({
                        targets: previousPair,
                        backgroundColor: normalColor
                    });
                }
                const matchedTextCells = textCharacters.slice(shift, shift + patternCharacters.length)
                    .map(function (_, index) {
                        return this.$visulContainer.find("#text-search-text-" + (shift + index))[0];
                    }.bind(this));
                this.timeLine.add({
                    targets: matchedTextCells.concat(patternCells),
                    backgroundColor: this.colors.sorted
                }, "-=500");
                break;
            }
        }

        if (foundIndex === -1 && previousPair) {
            this.timeLine.add({
                targets: previousPair,
                backgroundColor: normalColor
            });
        }

        this.timeLine.add({
            duration: 1,
            complete: function () {
                const resultKey = foundIndex === -1 ? "textPatternNotFound" : "textPatternFound";
                const values = foundIndex === -1 ? {pattern: pattern} : {pattern: pattern, position: foundIndex + 1};
                this.$searchResult.text(this.translate(resultKey, values));
            }.bind(this)
        });

        this.timeLine.restart();
        this.timeLine.pause();
    }

    prepareRabinKarp(text, pattern) {
        const textCharacters = Array.from(text || "");
        const patternCharacters = Array.from(pattern || "");
        if (!textCharacters.length || !patternCharacters.length) {
            this.showInputError(this.translate("invalidTextSearchInput"));
            return;
        }
        if (patternCharacters.length > textCharacters.length) {
            this.showInputError(this.translate("patternLongerThanText"));
            return;
        }

        const base = 256;
        const modulus = 101;
        const windowCount = textCharacters.length - patternCharacters.length + 1;
        let highestPower = 1;
        for (let index = 1; index < patternCharacters.length; index++) {
            highestPower = (highestPower * base) % modulus;
        }

        const characterValue = function (character) {
            return character.codePointAt(0);
        };
        let patternHash = 0;
        let windowHash = 0;
        for (let index = 0; index < patternCharacters.length; index++) {
            patternHash = (base * patternHash + characterValue(patternCharacters[index])) % modulus;
            windowHash = (base * windowHash + characterValue(textCharacters[index])) % modulus;
        }
        const windowHashes = [windowHash];
        for (let shift = 1; shift < windowCount; shift++) {
            const outgoingValue = characterValue(textCharacters[shift - 1]);
            const incomingValue = characterValue(textCharacters[shift + patternCharacters.length - 1]);
            windowHash = (
                base * (windowHash - outgoingValue * highestPower) + incomingValue
            ) % modulus;
            windowHash = (windowHash + modulus) % modulus;
            windowHashes.push(windowHash);
        }

        const stageWidth = this.$visulContainer.parent().width();
        const textWidth = textCharacters.length * this.cellWidth;
        const containerWidth = Math.max(stageWidth, textWidth + 48);
        const textLeft = Math.floor((containerWidth - textWidth) / 2);
        const patternCells = [];
        const textHashCells = [];

        this.$visulContainer.empty().css("width", containerWidth + "px");
        this.$searchResult.text(this.translate("rabinKarpInProgress", {pattern: pattern}));
        this.$timeRange.val(0);

        this.addRowLabel(this.translate("textLabel"), textLeft, 112);
        this.addTextCharacters(textCharacters, textLeft);

        const $patternRow = $("<div></div>")
            .attr("id", "rabin-karp-pattern-row")
            .addClass("text-search-row")
            .attr("aria-label", this.translate("patternLabel"))
            .css({left: textLeft + "px", top: "248px"});
        patternCharacters.forEach(function (character, index) {
            const $cell = this.createCharacterCell(character, "rabin-karp-pattern", index);
            patternCells.push($cell[0]);
            $patternRow.append($cell);
        }.bind(this));
        this.$visulContainer.append($patternRow);

        this.addRowLabel(this.translate("patternHashLabel"), textLeft, 300);
        const $patternHashCell = this.createCharacterCell("–", "rabin-karp-pattern-hash", 0)
            .css({left: textLeft + "px", top: "326px"});
        const $patternHashValue = $("<span></span>")
            .text(patternHash.toString())
            .css("opacity", 0);
        $patternHashCell.empty().append($patternHashValue);
        this.$visulContainer.append($patternHashCell);

        this.addRowLabel(this.translate("windowHashesLabel"), textLeft, 384);
        windowHashes.forEach(function (_, index) {
            const left = textLeft + index * this.cellWidth;
            const $cell = this.createCharacterCell("–", "rabin-karp-window-hash", index)
                .css({left: left + "px", top: "410px", fontSize: "12px"});
            textHashCells.push($cell[0]);
            const $hashValue = $("<span></span>")
                .text(windowHashes[index].toString())
                .css("opacity", 0);
            $cell.empty().append($hashValue);
            this.$visulContainer.append($cell);
            const $index = $("<span></span>")
                .addClass("text-search-index")
                .text(index.toString())
                .css({left: left + "px", top: "456px"});
            this.$visulContainer.append($index);
        }.bind(this));

        this.timeLine = anime.timeline({
            easing: "easeInOutQuad",
            duration: 500,
            update: function () {
                this.$timeRange.val(this.timeLine.progress);
            }.bind(this)
        });

        this.timeLine.add({
            targets: $patternHashCell[0],
            backgroundColor: this.colors.sorted,
            duration: 1
        });
        this.timeLine.add({
            targets: $patternHashValue[0],
            opacity: 1,
            duration: 300
        });
        windowHashes.forEach(function (_, index) {
            this.timeLine.add({
                targets: textHashCells[index],
                backgroundColor: this.colors.sorted
            });
            this.timeLine.add({
                targets: textHashCells[index].firstElementChild,
                opacity: 1,
                duration: 300
            });
        }.bind(this));

        let foundIndex = -1;
        let previousPair = null;
        let previousHashPair = null;
        for (let shift = 0; shift < windowCount; shift++) {
            const currentShift = shift;
            const currentWindowHash = windowHashes[currentShift];
            const hashMatches = currentWindowHash === patternHash;
            const hashPair = [textHashCells[currentShift], $patternHashCell[0]];

            if (previousPair) {
                this.timeLine.add({
                    targets: previousPair,
                    backgroundColor: "#ffffff",
                    duration: 1
                });
            }
            if (previousHashPair) {
                this.timeLine.add({
                    targets: previousHashPair,
                    backgroundColor: this.colors.sorted,
                    duration: 1
                });
            }
            this.timeLine.add({
                targets: "#rabin-karp-pattern-row",
                left: textLeft + currentShift * this.cellWidth
            });
            this.timeLine.add({
                targets: hashPair,
                backgroundColor: hashMatches ? this.colors.first : this.colors.second
            });
            this.timeLine.add({
                duration: 1,
                complete: function () {
                    this.$searchResult.text(this.translate(
                        hashMatches ? "rabinKarpHashMatch" : "rabinKarpHashMismatch",
                        {
                            position: currentShift + 1,
                            patternHash: patternHash,
                            windowHash: currentWindowHash
                        }
                    ));
                }.bind(this)
            });
            previousHashPair = hashPair;
            previousPair = null;

            if (!hashMatches) {
                continue;
            }

            let verified = true;
            for (let index = 0; index < patternCharacters.length; index++) {
                const textCell = this.$visulContainer.find("#text-search-text-" + (currentShift + index))[0];
                const patternCell = patternCells[index];
                const pair = [textCell, patternCell];
                const isEqual = textCharacters[currentShift + index] === patternCharacters[index];
                if (previousPair) {
                    this.timeLine.add({
                        targets: previousPair,
                        backgroundColor: "#ffffff",
                        duration: 1
                    });
                }
                this.timeLine.add({
                    targets: pair,
                    backgroundColor: isEqual ? this.colors.first : this.colors.second
                });
                this.timeLine.add({
                    duration: 1,
                    complete: function () {
                        this.$searchResult.text(this.translate("rabinKarpCharacterCompare", {
                            textPosition: currentShift + index + 1,
                            patternPosition: index + 1
                        }));
                    }.bind(this)
                });
                previousPair = pair;
                if (!isEqual) {
                    verified = false;
                    break;
                }
            }

            if (verified) {
                foundIndex = currentShift;
                const matchedTextCells = textCharacters.slice(currentShift, currentShift + patternCharacters.length)
                    .map(function (_, index) {
                        return this.$visulContainer.find("#text-search-text-" + (currentShift + index))[0];
                    }.bind(this));
                this.timeLine.add({
                    targets: matchedTextCells.concat(patternCells),
                    backgroundColor: this.colors.sorted
                });
                break;
            }
            this.timeLine.add({
                duration: 1,
                complete: function () {
                    this.$searchResult.text(this.translate("rabinKarpCollision", {
                        position: currentShift + 1,
                        hash: currentWindowHash
                    }));
                }.bind(this)
            });
        }

        if (foundIndex === -1 && previousPair) {
            this.timeLine.add({
                targets: previousPair,
                backgroundColor: "#ffffff",
                duration: 1
            });
        }
        if (previousHashPair) {
            this.timeLine.add({
                targets: previousHashPair,
                backgroundColor: this.colors.sorted,
                duration: 1
            });
        }
        this.timeLine.add({
            duration: 1,
            complete: function () {
                const resultKey = foundIndex === -1 ? "textPatternNotFound" : "textPatternFound";
                const values = foundIndex === -1
                    ? {pattern: pattern}
                    : {pattern: pattern, position: foundIndex + 1};
                this.$searchResult.text(this.translate(resultKey, values));
            }.bind(this)
        });

        this.timeLine.restart();
        this.timeLine.pause();
    }

    prepareBoyerMoore(text, pattern) {
        const textCharacters = Array.from(text || "");
        const patternCharacters = Array.from(pattern || "");
        if (!textCharacters.length || !patternCharacters.length) {
            this.showInputError(this.translate("invalidTextSearchInput"));
            return;
        }
        if (patternCharacters.length > textCharacters.length) {
            this.showInputError(this.translate("patternLongerThanText"));
            return;
        }

        const stageWidth = this.$visulContainer.parent().width();
        const textWidth = textCharacters.length * this.cellWidth;
        const containerWidth = Math.max(stageWidth, textWidth + 48);
        const textLeft = Math.floor((containerWidth - textWidth) / 2);
        const patternTop = 248;
        const badCharacterTop = 326;
        const goodSuffixTop = 410;
        const lastOccurrence = new Map();
        const patternCells = [];
        const badCharacterCells = [];
        const goodSuffixCells = [];
        patternCharacters.forEach(function (character, index) {
            lastOccurrence.set(character, index);
        });
        const goodSuffixShifts = this.buildBoyerMooreGoodSuffixShifts(patternCharacters);

        this.$visulContainer.empty().css("width", containerWidth + "px");
        this.$searchResult.text(this.translate("boyerMooreInProgress", {pattern: pattern}));
        this.$timeRange.val(0);

        this.addRowLabel(this.translate("textLabel"), textLeft, 112);
        this.addTextCharacters(textCharacters, textLeft);

        const $patternRow = $("<div></div>")
            .attr("id", "boyer-moore-pattern-row")
            .addClass("text-search-row")
            .attr("aria-label", this.translate("patternLabel"))
            .css({left: textLeft + "px", top: patternTop + "px"});
        patternCharacters.forEach(function (character, index) {
            const $cell = this.createCharacterCell(character, "boyer-moore-pattern", index);
            patternCells.push($cell[0]);
            $patternRow.append($cell);
        }.bind(this));
        this.$visulContainer.append($patternRow);

        this.addRowLabel(this.translate("badCharacterTableLabel"), textLeft, 300);
        const $badCharacterRow = $("<div></div>")
            .attr("id", "boyer-moore-bad-character-table")
            .addClass("text-search-row")
            .attr("aria-label", this.translate("badCharacterTableLabel"))
            .css({left: textLeft + "px", top: badCharacterTop + "px"});
        patternCharacters.forEach(function (_, index) {
            const $cell = this.createCharacterCell("–", "boyer-moore-bad-character", index);
            badCharacterCells.push($cell[0]);
            $badCharacterRow.append($cell);
        }.bind(this));
        this.$visulContainer.append($badCharacterRow);

        this.addRowLabel(this.translate("goodSuffixTableLabel"), textLeft, 384);
        const $goodSuffixRow = $("<div></div>")
            .attr("id", "boyer-moore-good-suffix-table")
            .addClass("text-search-row")
            .attr("aria-label", this.translate("goodSuffixTableLabel"))
            .css({left: textLeft + "px", top: goodSuffixTop + "px"});
        patternCharacters.forEach(function (_, index) {
            const $cell = this.createCharacterCell("–", "boyer-moore-good-suffix", index);
            goodSuffixCells.push($cell[0]);
            $goodSuffixRow.append($cell);
            const $index = $("<span></span>")
                .addClass("text-search-index")
                .text(index.toString())
                .css({left: textLeft + index * this.cellWidth + "px", top: (goodSuffixTop + 46) + "px"});
            this.$visulContainer.append($index);
        }.bind(this));
        this.$visulContainer.append($goodSuffixRow);

        this.timeLine = anime.timeline({
            easing: "easeInOutQuad",
            duration: 500,
            update: function () {
                this.$timeRange.val(this.timeLine.progress);
            }.bind(this)
        });

        patternCharacters.forEach(function (character, index) {
            this.timeLine.add({
                targets: badCharacterCells[index],
                backgroundColor: this.colors.sorted
            });
            this.timeLine.add({
                duration: 1,
                complete: function () {
                    badCharacterCells[index].textContent = lastOccurrence.get(character).toString();
                }
            });
            this.timeLine.add({
                targets: goodSuffixCells[index],
                backgroundColor: this.colors.sorted
            });
            this.timeLine.add({
                duration: 1,
                complete: function () {
                    goodSuffixCells[index].textContent = goodSuffixShifts[index + 1].toString();
                }
            });
        }.bind(this));

        let shift = 0;
        let foundIndex = -1;
        let previousPair = null;
        while (shift <= textCharacters.length - patternCharacters.length) {
            let patternIndex = patternCharacters.length - 1;
            while (patternIndex >= 0 && patternCharacters[patternIndex] === textCharacters[shift + patternIndex]) {
                const comparedPatternIndex = patternIndex;
                const comparedTextIndex = shift + comparedPatternIndex;
                const pair = [
                    this.$visulContainer.find("#text-search-text-" + comparedTextIndex)[0],
                    patternCells[comparedPatternIndex]
                ];
                if (previousPair) {
                    this.timeLine.add({
                        targets: previousPair,
                        backgroundColor: "#ffffff",
                        duration: 1
                    });
                }
                this.timeLine.add({targets: pair, backgroundColor: this.colors.first});
                this.timeLine.add({
                    duration: 1,
                    complete: function () {
                        this.$searchResult.text(this.translate("boyerMooreCompare", {
                            textPosition: comparedTextIndex + 1,
                            patternPosition: comparedPatternIndex + 1
                        }));
                    }.bind(this)
                });
                previousPair = pair;
                patternIndex--;
            }

            if (patternIndex < 0) {
                foundIndex = shift;
                const matchedCells = textCharacters.slice(shift, shift + patternCharacters.length)
                    .map(function (_, index) {
                        return this.$visulContainer.find("#text-search-text-" + (shift + index))[0];
                    }.bind(this));
                this.timeLine.add({
                    targets: matchedCells.concat(patternCells),
                    backgroundColor: this.colors.sorted
                });
                break;
            }

            const comparedPatternIndex = patternIndex;
            const comparedTextIndex = shift + patternIndex;
            const mismatchPair = [
                this.$visulContainer.find("#text-search-text-" + comparedTextIndex)[0],
                patternCells[comparedPatternIndex]
            ];
            if (previousPair) {
                this.timeLine.add({
                    targets: previousPair,
                    backgroundColor: "#ffffff",
                    duration: 1
                });
            }
            this.timeLine.add({targets: mismatchPair, backgroundColor: this.colors.second});
            const badCharacterShift = Math.max(
                1,
                comparedPatternIndex - (lastOccurrence.get(textCharacters[comparedTextIndex]) ?? -1)
            );
            const goodSuffixShift = goodSuffixShifts[comparedPatternIndex + 1];
            const nextShift = Math.max(badCharacterShift, goodSuffixShift);
            this.timeLine.add({
                duration: 1,
                complete: function () {
                    this.$searchResult.text(this.translate("boyerMooreMismatch", {
                        textPosition: comparedTextIndex + 1,
                        patternPosition: comparedPatternIndex + 1,
                        badCharacterShift: badCharacterShift,
                        goodSuffixShift: goodSuffixShift,
                        shift: nextShift
                    }));
                }.bind(this)
            });
            previousPair = mismatchPair;
            shift += nextShift;
            if (shift <= textCharacters.length - patternCharacters.length) {
                this.timeLine.add({
                    targets: "#boyer-moore-pattern-row",
                    left: textLeft + shift * this.cellWidth
                });
            }
        }

        if (foundIndex === -1 && previousPair) {
            this.timeLine.add({
                targets: previousPair,
                backgroundColor: "#ffffff",
                duration: 1
            });
        }
        this.timeLine.add({
            duration: 1,
            complete: function () {
                const resultKey = foundIndex === -1 ? "textPatternNotFound" : "textPatternFound";
                const values = foundIndex === -1
                    ? {pattern: pattern}
                    : {pattern: pattern, position: foundIndex + 1};
                this.$searchResult.text(this.translate(resultKey, values));
            }.bind(this)
        });

        this.timeLine.restart();
        this.timeLine.pause();
    }

    buildBoyerMooreGoodSuffixShifts(pattern) {
        const length = pattern.length;
        const shifts = new Array(length + 1).fill(0);
        const borders = new Array(length + 1).fill(0);
        let i = length;
        let j = length + 1;
        borders[i] = j;

        while (i > 0) {
            while (j <= length && pattern[i - 1] !== pattern[j - 1]) {
                if (shifts[j] === 0) {
                    shifts[j] = j - i;
                }
                j = borders[j];
            }
            i--;
            j--;
            borders[i] = j;
        }

        j = borders[0];
        for (i = 0; i <= length; i++) {
            if (shifts[i] === 0) {
                shifts[i] = j;
            }
            if (i === j) {
                j = borders[j];
            }
        }
        return shifts;
    }

    prepareKnuthMorrisPratt(text, pattern) {
        const textCharacters = Array.from(text || "");
        const patternCharacters = Array.from(pattern || "");
        if (!textCharacters.length || !patternCharacters.length) {
            this.showInputError(this.translate("invalidTextSearchInput"));
            return;
        }
        if (patternCharacters.length > textCharacters.length) {
            this.showInputError(this.translate("patternLongerThanText"));
            return;
        }

        const stageWidth = this.$visulContainer.parent().width();
        const textWidth = textCharacters.length * this.cellWidth;
        const containerWidth = Math.max(stageWidth, textWidth + 48);
        const textLeft = Math.floor((containerWidth - textWidth) / 2);
        const patternLeft = textLeft;
        const patternTop = 248;
        const lpsTop = 324;
        const lps = new Array(patternCharacters.length).fill(0);
        const patternCells = [];
        const lpsCells = [];

        this.$visulContainer.empty().css("width", containerWidth + "px");
        this.$searchResult.text(this.translate("kmpInProgress", {pattern: pattern}));
        this.$timeRange.val(0);

        this.addRowLabel(this.translate("textLabel"), textLeft, 112);
        this.addTextCharacters(textCharacters, textLeft);

        const $patternRow = $("<div></div>")
            .attr("id", "kmp-pattern-row")
            .addClass("text-search-row")
            .attr("aria-label", this.translate("patternLabel"))
            .css({left: patternLeft + "px", top: patternTop + "px"});
        patternCharacters.forEach(function (character, index) {
            const $cell = this.createCharacterCell(character, "kmp-pattern", index);
            patternCells.push($cell[0]);
            $patternRow.append($cell);
        }.bind(this));
        this.$visulContainer.append($patternRow);

        this.addRowLabel(this.translate("lpsArrayLabel"), textLeft, 298);
        const $lpsRow = $("<div></div>")
            .attr("id", "kmp-lps-array")
            .addClass("text-search-row")
            .attr("aria-label", this.translate("lpsArrayLabel"))
            .css({left: textLeft + "px", top: lpsTop + "px"});
        patternCharacters.forEach(function (_, index) {
            const $cell = this.createCharacterCell("–", "kmp-lps", index);
            lpsCells.push($cell[0]);
            $lpsRow.append($cell);
            const $index = $("<span></span>")
                .addClass("text-search-index")
                .text(index.toString())
                .css({left: textLeft + index * this.cellWidth + "px", top: (lpsTop + 46) + "px"});
            this.$visulContainer.append($index);
        }.bind(this));
        this.$visulContainer.append($lpsRow);

        this.timeLine = anime.timeline({
            easing: "easeInOutQuad",
            duration: 500,
            update: function () {
                this.$timeRange.val(this.timeLine.progress);
            }.bind(this)
        });

        this.timeLine.add({
            targets: lpsCells[0],
            backgroundColor: this.colors.sorted,
            duration: 1
        });
        this.timeLine.add({
            duration: 1,
            complete: function () {
                lpsCells[0].textContent = "0";
            }
        });

        let previousPair = null;
        let length = 0;
        let prefixIndex = 1;
        while (prefixIndex < patternCharacters.length) {
            const suffixIndex = prefixIndex;
            const comparedPrefixIndex = length;
            const pair = [patternCells[comparedPrefixIndex], patternCells[suffixIndex]];
            const isEqual = patternCharacters[comparedPrefixIndex] === patternCharacters[suffixIndex];

            if (previousPair) {
                this.timeLine.add({
                    targets: previousPair,
                    backgroundColor: "#ffffff",
                    duration: 1
                });
            }
            this.timeLine.add({
                targets: pair,
                backgroundColor: isEqual ? this.colors.first : this.colors.second
            });
            this.timeLine.add({
                duration: 1,
                complete: function () {
                    this.$searchResult.text(this.translate("lpsCompare", {
                        prefixPosition: comparedPrefixIndex + 1,
                        suffixPosition: suffixIndex + 1
                    }));
                }.bind(this)
            });
            previousPair = pair;

            if (isEqual) {
                length++;
                lps[suffixIndex] = length;
                this.timeLine.add({
                    targets: lpsCells[suffixIndex],
                    backgroundColor: this.colors.sorted
                });
                this.timeLine.add({
                    duration: 1,
                    complete: function () {
                        lpsCells[suffixIndex].textContent = lps[suffixIndex].toString();
                    }.bind(this)
                });
                prefixIndex++;
            } else if (length !== 0) {
                length = lps[length - 1];
                const fallbackLength = length;
                this.timeLine.add({
                    duration: 1,
                    complete: function () {
                        this.$searchResult.text(this.translate("lpsFallback", {length: fallbackLength}));
                    }.bind(this)
                });
            } else {
                this.timeLine.add({
                    targets: lpsCells[suffixIndex],
                    backgroundColor: this.colors.sorted
                });
                this.timeLine.add({
                    duration: 1,
                    complete: function () {
                        lpsCells[suffixIndex].textContent = "0";
                    }
                });
                prefixIndex++;
            }
        }

        if (previousPair) {
            this.timeLine.add({
                targets: previousPair,
                backgroundColor: "#ffffff",
                duration: 1
            });
        }

        let textIndex = 0;
        let patternIndex = 0;
        let foundIndex = -1;
        let previousSearchPair = null;
        while (textIndex < textCharacters.length) {
            const shift = textIndex - patternIndex;
            const comparedTextIndex = textIndex;
            const comparedPatternIndex = patternIndex;
            const textCell = this.$visulContainer.find("#text-search-text-" + comparedTextIndex)[0];
            const patternCell = patternCells[comparedPatternIndex];
            const pair = [textCell, patternCell];
            const isEqual = textCharacters[comparedTextIndex] === patternCharacters[comparedPatternIndex];

            this.timeLine.add({
                targets: "#kmp-pattern-row",
                left: patternLeft + shift * this.cellWidth,
                duration: 1
            });
            if (previousSearchPair) {
                this.timeLine.add({
                    targets: previousSearchPair,
                    backgroundColor: "#ffffff",
                    duration: 1
                });
            }
            this.timeLine.add({
                targets: pair,
                backgroundColor: isEqual ? this.colors.first : this.colors.second
            });
            this.timeLine.add({
                duration: 1,
                complete: function () {
                    this.$searchResult.text(this.translate("kmpCompare", {
                        textPosition: comparedTextIndex + 1,
                        patternPosition: comparedPatternIndex + 1
                    }));
                }.bind(this)
            });
            previousSearchPair = pair;

            if (isEqual) {
                textIndex++;
                patternIndex++;
                if (patternIndex === patternCharacters.length) {
                    foundIndex = textIndex - patternIndex;
                    const matchedCells = textCharacters.slice(foundIndex, foundIndex + patternCharacters.length)
                        .map(function (_, index) {
                            return this.$visulContainer.find("#text-search-text-" + (foundIndex + index))[0];
                        }.bind(this));
                    this.timeLine.add({
                        targets: matchedCells.concat(patternCells),
                        backgroundColor: this.colors.sorted
                    });
                    break;
                }
            } else if (patternIndex !== 0) {
                patternIndex = lps[patternIndex - 1];
                const fallbackLength = patternIndex;
                this.timeLine.add({
                    duration: 1,
                    complete: function () {
                        this.$searchResult.text(this.translate("kmpFallback", {length: fallbackLength}));
                    }.bind(this)
                });
            } else {
                textIndex++;
            }
        }

        if (foundIndex === -1 && previousSearchPair) {
            this.timeLine.add({
                targets: previousSearchPair,
                backgroundColor: "#ffffff",
                duration: 1
            });
        }
        this.timeLine.add({
            duration: 1,
            complete: function () {
                const resultKey = foundIndex === -1 ? "textPatternNotFound" : "textPatternFound";
                const values = foundIndex === -1
                    ? {pattern: pattern}
                    : {pattern: pattern, position: foundIndex + 1};
                this.$searchResult.text(this.translate(resultKey, values));
            }.bind(this)
        });

        this.timeLine.restart();
        this.timeLine.pause();
    }

    prepareLongestPrefixSuffix(text) {
        const characters = Array.from(text || "");
        if (!characters.length) {
            this.showInputError(this.translate("invalidTextSearchInput"));
            return;
        }

        const stageWidth = this.$visulContainer.parent().width();
        const textWidth = characters.length * this.cellWidth;
        const containerWidth = Math.max(stageWidth, textWidth + 48);
        const textLeft = Math.floor((containerWidth - textWidth) / 2);
        const lps = new Array(characters.length).fill(0);
        const lpsCells = [];

        this.$visulContainer.empty().css("width", containerWidth + "px");
        this.$searchResult.text(this.translate("lpsInProgress", {text: text}));
        this.$timeRange.val(0);

        this.addRowLabel(this.translate("textLabel"), textLeft, 112);
        this.addTextCharacters(characters, textLeft);
        this.addRowLabel(this.translate("lpsArrayLabel"), textLeft, 230);

        const $lpsRow = $("<div></div>")
            .attr("id", "lps-array")
            .addClass("text-search-row")
            .attr("aria-label", this.translate("lpsArrayLabel"))
            .css({left: textLeft + "px", top: "262px"});
        characters.forEach(function (_, index) {
            const $cell = this.createCharacterCell(lps[index].toString(), "lps", index);
            lpsCells.push($cell[0]);
            $lpsRow.append($cell);
        }.bind(this));
        this.$visulContainer.append($lpsRow);

        this.timeLine = anime.timeline({
            easing: "easeInOutQuad",
            duration: 500,
            update: function () {
                this.$timeRange.val(this.timeLine.progress);
            }.bind(this)
        });

        const firstCell = lpsCells[0];
        this.timeLine.add({
            targets: firstCell,
            backgroundColor: this.colors.sorted,
            duration: 1
        });

        let previousPair = null;
        let length = 0;
        let i = 1;
        while (i < characters.length) {
            const prefixIndex = length;
            const suffixIndex = i;
            const prefixCell = this.$visulContainer.find("#text-search-text-" + prefixIndex)[0];
            const suffixCell = this.$visulContainer.find("#text-search-text-" + suffixIndex)[0];
            const pair = [prefixCell, suffixCell];
            const isEqual = characters[prefixIndex] === characters[suffixIndex];

            if (previousPair) {
                this.timeLine.add({
                    targets: previousPair,
                    backgroundColor: "#ffffff",
                    duration: 1
                });
            }
            this.timeLine.add({
                targets: pair,
                backgroundColor: isEqual ? this.colors.first : this.colors.second
            });
            this.timeLine.add({
                duration: 1,
                complete: function () {
                    this.$searchResult.text(this.translate("lpsCompare", {
                        prefixPosition: prefixIndex + 1,
                        suffixPosition: suffixIndex + 1
                    }));
                }.bind(this)
            });
            previousPair = pair;

            if (isEqual) {
                length++;
                lps[suffixIndex] = length;
                this.timeLine.add({
                    targets: lpsCells[suffixIndex],
                    backgroundColor: this.colors.sorted
                });
                this.timeLine.add({
                    duration: 1,
                    complete: function () {
                        lpsCells[suffixIndex].textContent = lps[suffixIndex].toString();
                    }.bind(this)
                });
                i++;
            } else if (length !== 0) {
                length = lps[length - 1];
                const fallbackLength = length;
                this.timeLine.add({
                    duration: 1,
                    complete: function () {
                        this.$searchResult.text(this.translate("lpsFallback", {length: fallbackLength}));
                    }.bind(this)
                });
            } else {
                lps[suffixIndex] = 0;
                this.timeLine.add({
                    targets: lpsCells[suffixIndex],
                    backgroundColor: this.colors.sorted
                });
                this.timeLine.add({
                    duration: 1,
                    complete: function () {
                        lpsCells[suffixIndex].textContent = "0";
                    }.bind(this)
                });
                i++;
            }
        }

        if (previousPair) {
            this.timeLine.add({
                targets: previousPair,
                backgroundColor: "#ffffff",
                duration: 1
            });
        }
        if (length > 0) {
            const matchedCells = [];
            for (let index = 0; index < length; index++) {
                matchedCells.push(
                    this.$visulContainer.find("#text-search-text-" + index)[0],
                    this.$visulContainer.find("#text-search-text-" + (characters.length - length + index))[0]
                );
            }
            this.timeLine.add({
                targets: matchedCells,
                backgroundColor: this.colors.sorted
            });
        }
        this.timeLine.add({
            duration: 1,
            complete: function () {
                this.$searchResult.text(this.translate("lpsResult", {values: lps.join(", ")}));
            }.bind(this)
        });

        this.timeLine.restart();
        this.timeLine.pause();
    }

    showInputError(message) {
        if (this.timeLine) {
            this.timeLine.pause();
        }
        this.$visulContainer.empty().css("width", "100%");
        this.$timeRange.val(0);
        this.$searchResult.text(message);
        this.timeLine = anime.timeline();
    }

    addRowLabel(text, left, top) {
        const $label = $("<div></div>").addClass("text-search-row-label").text(text);
        $label.css({left: left + "px", top: top + "px"});
        this.$visulContainer.append($label);
    }

    addTextCharacters(characters, left) {
        characters.forEach(function (character, index) {
            const $cell = this.createCharacterCell(character, "text", index);
            $cell.css({left: left + index * this.cellWidth + "px", top: "144px"});
            this.$visulContainer.append($cell);
            const $index = $("<span></span>")
                .addClass("text-search-index")
                .text(index.toString())
                .css({left: left + index * this.cellWidth + "px", top: "190px"});
            this.$visulContainer.append($index);
        }.bind(this));
    }

    createCharacterCell(character, row, index) {
        return $("<div></div>")
            .attr("id", "text-search-" + row + "-" + index)
            .addClass("text-search-cell")
            .css("width", this.cellSize + "px")
            .text(character);
    }
}
