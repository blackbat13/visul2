class Searching extends Animation {
    constructor() {
        super();
        this.pointerCurrentId = "searching-pointer-current";
        this.pointerBestId = "searching-pointer-best";
        this.pointerLeftId = "searching-pointer-left";
        this.pointerRightId = "searching-pointer-right";
        this.pointerMiddleId = "searching-pointer-middle";
        this.$searchTarget = $("#search-target");
        this.$searchResult = $("#search-result");
        this.barHeadroom = 160;
        this.barBottom = 80;
    }

    createPointer(id, label, directionClass) {
        let $pointer = $("<div></div>");
        $pointer.addClass("searching-pointer " + directionClass);
        $pointer.attr("id", id);

        let $label = $("<span></span>");
        $label.addClass("searching-pointer-label");
        $label.text(label);

        let $arrow = $("<span></span>");
        $arrow.addClass("searching-pointer-arrow");

        $pointer.append($label);
        $pointer.append($arrow);
        return $pointer;
    }

    preparePointers(bestLabel) {
        this.$visulContainer.find(".searching-pointer").remove();
        this.$visulContainer.append(this.createPointer(this.pointerCurrentId, this.translate("current"), "searching-pointer-top"));
        this.$visulContainer.append(this.createPointer(this.pointerBestId, bestLabel, "searching-pointer-bottom"));
    }

    getBlockCenter(index) {
        return this.firstLeft + index * this.blockWidth + this.blockWidth / 2;
    }

    getPointerTop(pointer, index, lane) {
        return this.$visulContainer.height() - this.barBottom - parseFloat(this.arrayBlocks[index].css("height")) - pointer.outerHeight() - 4 - lane * (pointer.outerHeight() + 4);
    }

    positionPointer(pointerId, index, lane = 0) {
        let $pointer = this.$visulContainer.find("#" + pointerId);
        $pointer.css({
            left: this.getBlockCenter(index),
            top: this.getPointerTop($pointer, index, lane)
        });
    }

    animateMovePointer(pointerId, index, lane = 0, timelineOffset) {
        let $pointer = this.$visulContainer.find("#" + pointerId);
        let pointerTop = this.getPointerTop($pointer, index, lane);

        this.timeLine.add({
            targets: "#" + pointerId,
            left: this.getBlockCenter(index),
            ...($pointer.hasClass("searching-pointer-top") ? {top: pointerTop} : {}),
            easing: "easeInOutQuad"
        }, timelineOffset);
    }

    randomizeSearchTarget() {
        if (Math.random() < 0.75) {
            this.$searchTarget.val(_.sample(this.array));
        } else {
            this.$searchTarget.val(Math.floor(Math.random() * 15) + 1);
        }
    }

    prepareFindMin() {
        this.timeLine = anime.timeline({
            easing: 'easeOutExpo',
            duration: 750,
            update: function (anim) {
                this.$timeRange.val(this.timeLine.progress);
            }.bind(this)
        });

        this.preparePointers(this.translate("currentMin"));

        let minVal = this.array[0];
        let minInd = 0;
        this.positionPointer(this.pointerCurrentId, 0);
        this.positionPointer(this.pointerBestId, 0);
        this.animateMark([0], [this.colors.second]);
        for (let j = 1; j < this.array.length; j++) {
            this.animateMovePointer(this.pointerCurrentId, j);
            this.animateMark([j], [this.colors.first]);
            if (this.array[j] < minVal) {
                this.animateLeave([minInd]);
                this.animateMovePointer(this.pointerBestId, j);
                this.animateMark([j], [this.colors.second]);
                minVal = this.array[j];
                minInd = j;
            } else {
                this.animateLeave([j]);
            }
        }

        this.animateMarkSorted(minInd);

        this.timeLine.restart();
        this.timeLine.pause();
    }

    prepareFindMax() {
        this.timeLine = anime.timeline({
            easing: 'easeOutExpo',
            duration: 750,
            update: function (anim) {
                this.$timeRange.val(this.timeLine.progress);
            }.bind(this)
        });

        this.preparePointers(this.translate("currentMax"));

        let maxVal = this.array[0];
        let maxInd = 0;
        this.positionPointer(this.pointerCurrentId, 0);
        this.positionPointer(this.pointerBestId, 0);
        this.animateMark([0], [this.colors.second]);
        for (let j = 1; j < this.array.length; j++) {
            this.animateMovePointer(this.pointerCurrentId, j);
            this.animateMark([j], [this.colors.first]);
            if (this.array[j] > maxVal) {
                this.animateLeave([maxInd]);
                this.animateMovePointer(this.pointerBestId, j);
                this.animateMark([j], [this.colors.second]);
                maxVal = this.array[j];
                maxInd = j;
            } else {
                this.animateLeave([j]);
            }
        }

        this.animateMarkSorted(maxInd);

        this.timeLine.restart();
        this.timeLine.pause();
    }

    prepareMinMaxOptimal() {
        this.timeLine = anime.timeline({
            easing: 'easeOutExpo',
            duration: 750,
            update: function (anim) {
                this.$timeRange.val(this.timeLine.progress);
            }.bind(this)
        });

        this.preparePointers(this.translate("currentMin"));
        let maxCurrentId = this.pointerCurrentId + "-max";
        let maxBestId = this.pointerBestId + "-max";
        this.$visulContainer.append(this.createPointer(maxCurrentId, this.translate("current"), "searching-pointer-top"));
        this.$visulContainer.append(this.createPointer(maxBestId, this.translate("currentMax"), "searching-pointer-bottom"));
        this.$visulContainer.find(".searching-pointer").css("opacity", 0);
        this.$visulContainer.find(".searching-pointer-bottom").css("bottom", "36px");

        // Dla nieparzystej liczby elementów dodajemy kopię ostatniego elementu.
        if (this.array.length % 2 === 1) {
            let last = this.array.length - 1;
            let $copy = this.prepareSortingBlock(this.array[last], this.firstLeft + this.array.length * this.blockWidth, this.array.length);
            $copy.css("opacity", 0);
            this.$visulContainer.append($copy);
            this.array.push(this.array[last]);
            this.arrayBlocks.push($copy);
            this.timeLine.add({
                targets: "#" + $copy.attr("id"),
                opacity: 1,
                easing: "easeInOutQuad"
            });
        }

        let bw = this.blockWidth;
        let pairs = this.array.length / 2;

        // Tablica początkowa jest w górnym rzędzie, kandydaci w dolnym; słupki są skalowane, by rzędy się nie nakładały.
        let rowHeight = 150;
        let candidatesBottom = this.barBottom + 28;
        let originalBottom = this.barBottom + rowHeight + 100;
        this.$visulContainer.css("min-height", (originalBottom + rowHeight + 60) + "px");
        let maxValue = Math.max(1, ...this.array);
        for (let i = 0; i < this.arrayBlocks.length; i++) {
            this.arrayBlocks[i].css({
                height: Math.max(3, this.array[i] / maxValue * rowHeight) + "px",
                bottom: originalBottom + "px"
            });
        }

        let gap = 2 * bw;
        let leftStart = Math.floor((this.$visulContainer.width() - (2 * pairs * bw + gap)) / 2);
        let rightStart = leftStart + (pairs * bw) + gap;
        let minIdx = [];
        let maxIdx = [];

        let addGroupLabel = function (text, start) {
            let $label = $("<div></div>");
            $label.addClass("searching-group-label");
            $label.text(text);
            $label.css({left: start + pairs * bw / 2});
            this.$visulContainer.append($label);
        }.bind(this);
        addGroupLabel(this.translate("minCandidates"), leftStart);
        addGroupLabel(this.translate("maxCandidates"), rightStart);

        // Każda para jest rozdzielana: mniejszy element trafia do tablicy kandydatów na min, większy do kandydatów na max.
        for (let p = 0; p < pairs; p++) {
            let a = 2 * p;
            let b = a + 1;
            let minI = this.array[a] <= this.array[b] ? a : b;
            let maxI = minI === a ? b : a;
            minIdx.push(minI);
            maxIdx.push(maxI);

            this.animateCompare(a, b);
            this.timeLine.add({
                targets: "#" + this.arrayBlocks[minI].attr("id"),
                left: leftStart + p * bw,
                bottom: candidatesBottom + "px",
                easing: "easeInOutQuad"
            });
            this.timeLine.add({
                targets: "#" + this.arrayBlocks[maxI].attr("id"),
                left: rightStart + p * bw,
                bottom: candidatesBottom + "px",
                easing: "easeInOutQuad"
            }, "-=750");
            this.animateLeave([a, b]);
        }

        let movePointer = function (pointerId, idx, x, offset) {
            let $pointer = this.$visulContainer.find("#" + pointerId);
            let top = this.$visulContainer.height() - candidatesBottom - parseFloat(this.arrayBlocks[idx].css("height")) - $pointer.outerHeight() - 4;
            this.timeLine.add({
                targets: "#" + pointerId,
                left: x + bw / 2,
                ...($pointer.hasClass("searching-pointer-top") ? {top: top} : {}),
                easing: "easeInOutQuad"
            }, offset);
        }.bind(this);

        let pass = function (indices, start, currentId, bestId, better) {
            let $current = this.$visulContainer.find("#" + currentId);
            let $best = this.$visulContainer.find("#" + bestId);
            let first = indices[0];
            $current.css({
                left: start + bw / 2,
                top: this.$visulContainer.height() - candidatesBottom - parseFloat(this.arrayBlocks[first].css("height")) - $current.outerHeight() - 4
            });
            $best.css("left", start + bw / 2);

            this.timeLine.add({targets: ["#" + currentId, "#" + bestId], opacity: 1, duration: 1});
            let best = 0;
            this.animateMark([first], [this.colors.second]);
            for (let j = 1; j < indices.length; j++) {
                movePointer(currentId, indices[j], start + j * bw);
                this.animateMark([indices[j]], [this.colors.first]);
                if (better(this.array[indices[j]], this.array[indices[best]])) {
                    this.animateLeave([indices[best]]);
                    movePointer(bestId, indices[j], start + j * bw);
                    this.animateMark([indices[j]], [this.colors.second]);
                    best = j;
                } else {
                    this.animateLeave([indices[j]]);
                }
            }
            this.animateMarkSorted(indices[best]);
            this.timeLine.add({targets: ["#" + currentId, "#" + bestId], opacity: 0, duration: 1});
        }.bind(this);

        pass(minIdx, leftStart, this.pointerCurrentId, this.pointerBestId, (a, b) => a < b);
        pass(maxIdx, rightStart, maxCurrentId, maxBestId, (a, b) => a > b);

        this.timeLine.restart();
        this.timeLine.pause();
    }

    prepareLinearSearch() {
        let target = parseFloat(this.$searchTarget.val());
        if (!isFinite(target)) {
            this.$searchResult.text(this.translate("invalidSearchTarget"));
            return;
        }

        this.timeLine = anime.timeline({
            easing: 'easeOutExpo',
            duration: 750,
            update: function (anim) {
                this.$timeRange.val(this.timeLine.progress);
            }.bind(this)
        });

        this.$visulContainer.find(".searching-pointer").remove();
        this.$visulContainer.append(this.createPointer(this.pointerCurrentId, this.translate("current"), "searching-pointer-top"));
        this.$searchResult.text(this.translate("searchTarget", {value: target}));
        this.positionPointer(this.pointerCurrentId, 0);

        let foundIndex = -1;
        for (let i = 0; i < this.array.length; i++) {
            this.animateMovePointer(this.pointerCurrentId, i);
            this.animateMark([i], [this.colors.first]);

            if (this.array[i] === target) {
                foundIndex = i;
                this.animateMarkSorted(i);
                break;
            }

            this.animateLeave([i]);
        }

        this.timeLine.add({
            duration: 1,
            complete: function () {
                if (foundIndex === -1) {
                    this.$searchResult.text(this.translate("notFound", {value: target}));
                } else {
                    this.$searchResult.text(this.translate("found", {value: target, position: foundIndex + 1}));
                }
            }.bind(this)
        });

        this.timeLine.restart();
        this.timeLine.pause();
    }

    prepareBinarySearch() {
        let target = parseFloat(this.$searchTarget.val());
        if (!isFinite(target)) {
            this.$searchResult.text(this.translate("invalidSearchTarget"));
            return;
        }

        this.timeLine = anime.timeline({
            easing: 'easeOutExpo',
            duration: 750,
            update: function (anim) {
                this.$timeRange.val(this.timeLine.progress);
            }.bind(this)
        });

        this.$visulContainer.find(".searching-pointer").remove();
        this.createRangeFrame();
        this.$visulContainer.append(this.createPointer(this.pointerLeftId, this.translate("left"), "searching-pointer-top"));
        this.$visulContainer.append(this.createPointer(this.pointerMiddleId, this.translate("middle"), "searching-pointer-top"));
        this.$visulContainer.append(this.createPointer(this.pointerRightId, this.translate("right"), "searching-pointer-top"));
        this.$searchResult.text(this.translate("searchTarget", {value: target}));

        // Dolna granica: pierwszy element >= target; górna granica: pierwszy element > target.
        const upper = this.boundType === "upper";
        let left = 0;
        let right = this.array.length - 1;
        let result = this.array.length;
        let candidate = -1;
        let initialMiddle = Math.floor((left + right) / 2);
        this.positionPointer(this.pointerLeftId, left);
        this.positionPointer(this.pointerRightId, right, 2);
        this.positionPointer(this.pointerMiddleId, initialMiddle, 1);

        while (left <= right) {
            let middle = Math.floor((left + right) / 2);
            this.animateMovePointer(this.pointerLeftId, left);
            this.animateMovePointer(this.pointerRightId, right, 2, "-=750");
            this.animateMovePointer(this.pointerMiddleId, middle, 1, "-=750");
            this.animateJumpBlock(left, right, true);
            this.animateMark([middle], [this.colors.first]);

            const goesRight = upper ? this.array[middle] <= target : this.array[middle] < target;
            if (goesRight) {
                this.animateLeave([middle]);
                left = middle + 1;
            } else {
                if (candidate !== -1) {
                    this.animateLeave([candidate]);
                }
                this.animateMark([middle], [this.colors.second]);
                candidate = middle;
                result = middle;
                right = middle - 1;
            }
        }

        const lastIndex = this.array.length - 1;
        this.animateMovePointer(this.pointerLeftId, Math.min(left, lastIndex));
        this.animateMovePointer(this.pointerRightId, Math.max(right, 0), 2, "-=750");
        this.animateJumpBlock(left, right, true, candidate);
        if (candidate !== -1) {
            this.animateMarkSorted(candidate);
        }

        this.timeLine.add({
            duration: 1,
            complete: function () {
                const key = (upper ? "upperBound" : "lowerBound") + (result === this.array.length ? "End" : "");
                this.$searchResult.text(this.translate(key, {value: target, position: result + 1}));
            }.bind(this)
        });

        this.timeLine.restart();
        this.timeLine.pause();
    }

    animateJumpBlock(lo, hi, parallel = false, keepIndex = -1) {
        let empty = lo > hi;
        this.timeLine.add({
            targets: this.arrayBlocks.map(function (block) {
                return block[0];
            }),
            opacity: function (el, i) {
                return i === keepIndex || (!empty && i >= lo && i <= hi) ? 1 : 0.3;
            },
            easing: "easeInOutQuad"
        }, parallel ? "-=750" : undefined);
        this.timeLine.add({
            targets: "#jump-block-frame",
            ...(empty ? {} : {
                left: this.firstLeft + lo * this.blockWidth,
                width: (hi - lo + 1) * this.blockWidth
            }),
            opacity: empty ? 0 : 1,
            easing: "easeInOutQuad"
        }, "-=750");
    }

    createRangeFrame() {
        this.$visulContainer.find("#jump-block-frame").remove();
        let $frame = $("<div></div>").attr("id", "jump-block-frame").addClass("jump-block-frame");
        $frame.css({left: this.firstLeft + "px", width: this.array.length * this.blockWidth + "px", opacity: 0});
        this.$visulContainer.prepend($frame);
    }

    prepareJumpSearch() {
        let target = parseFloat(this.$searchTarget.val());
        if (!isFinite(target)) {
            this.$searchResult.text(this.translate("invalidSearchTarget"));
            return;
        }

        this.timeLine = anime.timeline({
            easing: 'easeOutExpo',
            duration: 750,
            update: function (anim) {
                this.$timeRange.val(this.timeLine.progress);
            }.bind(this)
        });

        const n = this.array.length;
        const step = Math.max(1, Math.floor(Math.sqrt(n)));

        this.$visulContainer.find(".searching-pointer").remove();
        this.createRangeFrame();
        this.$visulContainer.append(this.createPointer(this.pointerLeftId, this.translate("blockStart"), "searching-pointer-top"));
        this.$visulContainer.append(this.createPointer(this.pointerRightId, this.translate("jump"), "searching-pointer-top"));
        this.$visulContainer.append(this.createPointer(this.pointerCurrentId, this.translate("current"), "searching-pointer-top"));
        this.$visulContainer.find("#" + this.pointerCurrentId).css("opacity", 0);
        this.$searchResult.text(this.translate("searchTarget", {value: target}) + " " + this.translate("jumpStep", {value: step}));

        let prev = 0;
        let jump = Math.min(step - 1, n - 1);
        let foundIndex = -1;
        let exhausted = false;
        this.positionPointer(this.pointerLeftId, prev);
        this.positionPointer(this.pointerRightId, jump, 1);
        this.positionPointer(this.pointerCurrentId, prev, 2);

        // Faza 1: skaczemy co step elementów, aż ostatni element bloku będzie >= szukanej wartości.
        while (true) {
            this.animateMovePointer(this.pointerLeftId, prev);
            this.animateMovePointer(this.pointerRightId, jump, 1, "-=750");
            this.animateJumpBlock(prev, jump);
            this.animateMark([jump], [this.colors.first]);

            if (this.array[jump] >= target) {
                break;
            }

            this.animateLeave([jump]);
            if (jump === n - 1) {
                exhausted = true;
                break;
            }

            prev = jump + 1;
            jump = Math.min(prev + step - 1, n - 1);
        }

        // Faza 2: przeszukujemy liniowo znaleziony blok.
        if (!exhausted) {
            this.animateLeave([jump]);
            this.timeLine.add({targets: "#" + this.pointerCurrentId, opacity: 1, duration: 1});
            for (let i = prev; i <= jump; i++) {
                this.animateMovePointer(this.pointerCurrentId, i, 2);
                this.animateMark([i], [this.colors.first]);

                if (this.array[i] === target) {
                    foundIndex = i;
                    this.animateMarkSorted(i);
                    break;
                }

                this.animateLeave([i]);
                if (this.array[i] > target) {
                    break;
                }
            }
        }

        this.timeLine.add({
            duration: 1,
            complete: function () {
                if (foundIndex === -1) {
                    this.$searchResult.text(this.translate("notFound", {value: target}));
                } else {
                    this.$searchResult.text(this.translate("found", {value: target, position: foundIndex + 1}));
                }
            }.bind(this)
        });

        this.timeLine.restart();
        this.timeLine.pause();
    }

    prepareExponentialSearch() {
        let target = parseFloat(this.$searchTarget.val());
        if (!isFinite(target)) {
            this.$searchResult.text(this.translate("invalidSearchTarget"));
            return;
        }

        this.timeLine = anime.timeline({
            easing: 'easeOutExpo',
            duration: 750,
            update: function (anim) {
                this.$timeRange.val(this.timeLine.progress);
            }.bind(this)
        });

        const n = this.array.length;
        const lastIndex = n - 1;

        this.$visulContainer.find(".searching-pointer").remove();
        this.createRangeFrame();
        this.$visulContainer.append(this.createPointer(this.pointerLeftId, this.translate("left"), "searching-pointer-top"));
        this.$visulContainer.append(this.createPointer(this.pointerMiddleId, this.translate("middle"), "searching-pointer-top"));
        this.$visulContainer.append(this.createPointer(this.pointerRightId, this.translate("bound"), "searching-pointer-top"));
        this.$visulContainer.find("#" + this.pointerLeftId).css("opacity", 0);
        this.$visulContainer.find("#" + this.pointerMiddleId).css("opacity", 0);
        this.$searchResult.text(this.translate("searchTarget", {value: target}));

        let foundIndex = -1;
        this.positionPointer(this.pointerLeftId, 0);
        this.positionPointer(this.pointerMiddleId, 0, 1);
        this.positionPointer(this.pointerRightId, 0, 2);

        // Najpierw sprawdzamy pierwszy element.
        this.animateJumpBlock(0, 0);
        this.animateMark([0], [this.colors.first]);
        if (this.array[0] === target) {
            foundIndex = 0;
            this.animateMarkSorted(0);
        } else {
            this.animateLeave([0]);

            // Faza 1: podwajamy granicę, aż element na granicy będzie >= szukanej wartości.
            let prev = 0;
            let bound = 1;
            while (true) {
                const shown = Math.min(bound, lastIndex);
                this.animateMovePointer(this.pointerRightId, shown, 2);
                this.animateJumpBlock(0, shown, true);
                if (bound >= n) {
                    break;
                }
                this.animateMark([bound], [this.colors.first]);
                if (this.array[bound] >= target) {
                    this.animateLeave([bound]);
                    break;
                }
                this.animateLeave([bound]);
                prev = bound;
                bound = 2 * bound + 1;
            }

            // Faza 2: wyszukiwanie binarne w ostatnim przedziale.
            let left = prev + 1;
            let right = Math.min(bound, lastIndex);
            this.animateMovePointer(this.pointerRightId, right, 2);
            this.animateMovePointer(this.pointerLeftId, Math.min(left, lastIndex), 0, "-=750");
            this.animateMovePointer(this.pointerMiddleId, Math.min(Math.floor((left + right) / 2), lastIndex), 1, "-=750");
            this.timeLine.add({targets: ["#" + this.pointerLeftId, "#" + this.pointerMiddleId], opacity: 1, duration: 1});
            this.animateJumpBlock(left, right, true);

            while (left <= right) {
                let middle = Math.floor((left + right) / 2);
                this.animateMovePointer(this.pointerLeftId, left);
                this.animateMovePointer(this.pointerRightId, right, 2, "-=750");
                this.animateMovePointer(this.pointerMiddleId, middle, 1, "-=750");
                this.animateJumpBlock(left, right, true);
                this.animateMark([middle], [this.colors.first]);

                if (this.array[middle] === target) {
                    foundIndex = middle;
                    this.animateMarkSorted(middle);
                    break;
                }

                this.animateLeave([middle]);
                if (this.array[middle] < target) {
                    left = middle + 1;
                } else {
                    right = middle - 1;
                }
            }

            if (foundIndex == -1) {
                this.animateMovePointer(this.pointerLeftId, Math.min(left, lastIndex));
                this.animateMovePointer(this.pointerRightId, Math.max(right, 0), 2, "-=750");
                this.animateJumpBlock(left, right, true);
            }
        }

        this.timeLine.add({
            duration: 1,
            complete: function () {
                if (foundIndex === -1) {
                    this.$searchResult.text(this.translate("notFound", {value: target}));
                } else {
                    this.$searchResult.text(this.translate("found", {value: target, position: foundIndex + 1}));
                }
            }.bind(this)
        });

        this.timeLine.restart();
        this.timeLine.pause();
    }

    prepareFibonacciSearch() {
        let target = parseFloat(this.$searchTarget.val());
        if (!isFinite(target)) {
            this.$searchResult.text(this.translate("invalidSearchTarget"));
            return;
        }

        this.timeLine = anime.timeline({
            easing: 'easeOutExpo',
            duration: 750,
            update: function (anim) {
                this.$timeRange.val(this.timeLine.progress);
            }.bind(this)
        });

        const n = this.array.length;
        const lastIndex = n - 1;

        this.$visulContainer.find(".searching-pointer").remove();
        this.createRangeFrame();
        this.$visulContainer.append(this.createPointer(this.pointerLeftId, this.translate("left"), "searching-pointer-top"));
        this.$visulContainer.append(this.createPointer(this.pointerMiddleId, this.translate("current"), "searching-pointer-top"));
        this.$visulContainer.append(this.createPointer(this.pointerRightId, this.translate("right"), "searching-pointer-top"));
        this.$searchResult.text(this.translate("searchTarget", {value: target}));

        // Zakres przeszukiwany to indeksy offset + 1 ... offset + fibM (ucięte do końca tablicy).
        let fibM2 = 0;
        let fibM1 = 1;
        let fibM = 1;
        while (fibM < n) {
            fibM2 = fibM1;
            fibM1 = fibM;
            fibM = fibM1 + fibM2;
        }
        let offset = -1;
        let foundIndex = -1;

        this.positionPointer(this.pointerLeftId, 0);
        this.positionPointer(this.pointerMiddleId, 0, 1);
        this.positionPointer(this.pointerRightId, lastIndex, 2);
        this.animateJumpBlock(0, lastIndex);

        while (fibM > 1) {
            const lo = offset + 1;
            const hi = Math.min(offset + fibM, lastIndex);
            const i = Math.min(offset + fibM2, lastIndex);
            this.animateMovePointer(this.pointerLeftId, Math.min(lo, lastIndex));
            this.animateMovePointer(this.pointerRightId, hi, 2, "-=750");
            this.animateMovePointer(this.pointerMiddleId, i, 1, "-=750");
            this.animateJumpBlock(lo, hi, true);
            this.animateMark([i], [this.colors.first]);

            if (this.array[i] < target) {
                this.animateLeave([i]);
                fibM = fibM1;
                fibM1 = fibM2;
                fibM2 = fibM - fibM1;
                offset = i;
            } else if (this.array[i] > target) {
                this.animateLeave([i]);
                fibM = fibM2;
                fibM1 = fibM1 - fibM2;
                fibM2 = fibM - fibM1;
            } else {
                foundIndex = i;
                this.animateMarkSorted(i);
                break;
            }
        }

        // Pozostał co najwyżej jeden kandydat: element po offset.
        if (foundIndex === -1) {
            const last = offset + 1;
            if (last <= lastIndex) {
                this.animateMovePointer(this.pointerLeftId, last);
                this.animateMovePointer(this.pointerRightId, last, 2, "-=750");
                this.animateMovePointer(this.pointerMiddleId, last, 1, "-=750");
                this.animateJumpBlock(last, last, true);
                this.animateMark([last], [this.colors.first]);
                if (this.array[last] === target) {
                    foundIndex = last;
                    this.animateMarkSorted(last);
                } else {
                    this.animateLeave([last]);
                    this.animateJumpBlock(1, 0);
                }
            } else {
                this.animateJumpBlock(1, 0);
            }
        }

        this.timeLine.add({
            duration: 1,
            complete: function () {
                if (foundIndex === -1) {
                    this.$searchResult.text(this.translate("notFound", {value: target}));
                } else {
                    this.$searchResult.text(this.translate("found", {value: target, position: foundIndex + 1}));
                }
            }.bind(this)
        });

        this.timeLine.restart();
        this.timeLine.pause();
    }

    prepareTernarySearch() {
        let target = parseFloat(this.$searchTarget.val());
        if (!isFinite(target)) {
            this.$searchResult.text(this.translate("invalidSearchTarget"));
            return;
        }

        this.timeLine = anime.timeline({
            easing: 'easeOutExpo',
            duration: 750,
            update: function (anim) {
                this.$timeRange.val(this.timeLine.progress);
            }.bind(this)
        });

        this.$visulContainer.find(".searching-pointer").remove();
        this.createRangeFrame();
        this.$visulContainer.append(this.createPointer(this.pointerLeftId, this.translate("left"), "searching-pointer-top"));
        this.$visulContainer.append(this.createPointer(this.pointerMiddleId, this.translate("mid1"), "searching-pointer-top"));
        this.$visulContainer.append(this.createPointer(this.pointerCurrentId, this.translate("mid2"), "searching-pointer-top"));
        this.$visulContainer.append(this.createPointer(this.pointerRightId, this.translate("right"), "searching-pointer-top"));
        this.$searchResult.text(this.translate("searchTarget", {value: target}));

        const lastIndex = this.array.length - 1;
        let left = 0;
        let right = lastIndex;
        let foundIndex = -1;
        const third = function (lo, hi) {
            return Math.floor((hi - lo) / 3);
        };
        this.positionPointer(this.pointerLeftId, left);
        this.positionPointer(this.pointerMiddleId, left + third(left, right), 1);
        this.positionPointer(this.pointerCurrentId, right - third(left, right), 2);
        this.positionPointer(this.pointerRightId, right, 3);

        while (left <= right) {
            const m1 = left + third(left, right);
            const m2 = right - third(left, right);
            this.animateMovePointer(this.pointerLeftId, left);
            this.animateMovePointer(this.pointerMiddleId, m1, 1, "-=750");
            this.animateMovePointer(this.pointerCurrentId, m2, 2, "-=750");
            this.animateMovePointer(this.pointerRightId, right, 3, "-=750");
            this.animateJumpBlock(left, right, true);

            this.animateMark([m1], [this.colors.first]);
            if (this.array[m1] === target) {
                foundIndex = m1;
                this.animateMarkSorted(m1);
                break;
            }
            this.animateLeave([m1]);

            if (m2 !== m1) {
                this.animateMark([m2], [this.colors.first]);
                if (this.array[m2] === target) {
                    foundIndex = m2;
                    this.animateMarkSorted(m2);
                    break;
                }
                this.animateLeave([m2]);
            }

            if (target < this.array[m1]) {
                right = m1 - 1;
            } else if (target > this.array[m2]) {
                left = m2 + 1;
            } else {
                left = m1 + 1;
                right = m2 - 1;
            }
        }

        if (foundIndex === -1) {
            const l = Math.min(left, lastIndex);
            const r = Math.max(right, 0);
            this.animateMovePointer(this.pointerLeftId, l);
            this.animateMovePointer(this.pointerMiddleId, l, 1, "-=750");
            this.animateMovePointer(this.pointerCurrentId, r, 2, "-=750");
            this.animateMovePointer(this.pointerRightId, r, 3, "-=750");
            this.animateJumpBlock(left, right, true);
        }

        this.timeLine.add({
            duration: 1,
            complete: function () {
                if (foundIndex === -1) {
                    this.$searchResult.text(this.translate("notFound", {value: target}));
                } else {
                    this.$searchResult.text(this.translate("found", {value: target, position: foundIndex + 1}));
                }
            }.bind(this)
        });

        this.timeLine.restart();
        this.timeLine.pause();
    }
}
