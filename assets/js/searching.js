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
        this.$visulContainer.append(this.createPointer(this.pointerCurrentId, "Sprawdzany", "searching-pointer-top"));
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

        this.preparePointers("Aktualne min");

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

        this.preparePointers("Aktualne max");

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

        this.preparePointers("Aktualne min");
        let maxCurrentId = this.pointerCurrentId + "-max";
        let maxBestId = this.pointerBestId + "-max";
        this.$visulContainer.append(this.createPointer(maxCurrentId, "Sprawdzany", "searching-pointer-top"));
        this.$visulContainer.append(this.createPointer(maxBestId, "Aktualne max", "searching-pointer-bottom"));
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
        addGroupLabel("Kandydaci min", leftStart);
        addGroupLabel("Kandydaci max", rightStart);

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
            this.$searchResult.text("Wpisz poprawną wartość do wyszukania.");
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
        this.$visulContainer.append(this.createPointer(this.pointerCurrentId, "Sprawdzany", "searching-pointer-top"));
        this.$searchResult.text("Wyszukiwany element: " + target + ".");
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
                    this.$searchResult.text("Nie znaleziono elementu " + target + ".");
                } else {
                    this.$searchResult.text("Znaleziono element " + target + " na pozycji " + (foundIndex + 1) + ".");
                }
            }.bind(this)
        });

        this.timeLine.restart();
        this.timeLine.pause();
    }

    prepareBinarySearch() {
        let target = parseFloat(this.$searchTarget.val());
        if (!isFinite(target)) {
            this.$searchResult.text("Wpisz poprawną wartość do wyszukania.");
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
        this.$visulContainer.append(this.createPointer(this.pointerLeftId, "Lewo", "searching-pointer-top"));
        this.$visulContainer.append(this.createPointer(this.pointerMiddleId, "Środek", "searching-pointer-top"));
        this.$visulContainer.append(this.createPointer(this.pointerRightId, "Prawo", "searching-pointer-top"));
        this.$searchResult.text("Wyszukiwany element: " + target + ".");

        let left = 0;
        let right = this.array.length - 1;
        let foundIndex = -1;
        let initialMiddle = Math.floor((left + right) / 2);
        this.positionPointer(this.pointerLeftId, left);
        this.positionPointer(this.pointerRightId, right, 2);
        this.positionPointer(this.pointerMiddleId, initialMiddle, 1);

        while (left <= right) {
            let middle = Math.floor((left + right) / 2);
            this.animateMovePointer(this.pointerLeftId, left);
            this.animateMovePointer(this.pointerRightId, right, 2, "-=750");
            this.animateMovePointer(this.pointerMiddleId, middle, 1, "-=750");
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
            this.animateMovePointer(this.pointerLeftId, left);
            this.animateMovePointer(this.pointerRightId, right, 2, "-=750");
        }

        this.timeLine.add({
            duration: 1,
            complete: function () {
                if (foundIndex === -1) {
                    this.$searchResult.text("Nie znaleziono elementu " + target + ".");
                } else {
                    this.$searchResult.text("Znaleziono element " + target + " na pozycji " + (foundIndex + 1) + ".");
                }
            }.bind(this)
        });

        this.timeLine.restart();
        this.timeLine.pause();
    }
}
