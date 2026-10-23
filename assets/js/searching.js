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
        return this.$visulContainer.height() - 48 - parseFloat(this.arrayBlocks[index].css("height")) - pointer.outerHeight() - 4 - lane * (pointer.outerHeight() + 4);
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
        this.$searchTarget.val(Math.floor(Math.random() * 15) + 1);
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
        this.animateMovePointer(this.pointerCurrentId, 0);
        this.animateMovePointer(this.pointerBestId, 0);
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
        this.animateMovePointer(this.pointerCurrentId, 0);
        this.animateMovePointer(this.pointerBestId, 0);
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

    prepareLinearSearch() {
        let target = parseInt(this.$searchTarget.val(), 10);
        if (!Number.isInteger(target)) {
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
        let target = parseInt(this.$searchTarget.val(), 10);
        if (!Number.isInteger(target)) {
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
