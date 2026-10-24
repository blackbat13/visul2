class Animation {
    colors = {
        sorted: "#d8f36a",
        normal: "#6e8a80",
        first: "#b9efc5",
        second: "#f0745c",
    };

    constructor() {
        this.array = [];
        this.translate = window.visul2Translate;
        this.$visulContainer = $("#visul-container");
        this.blockWidth = 50;
        this.minSize = 2;
        this.maxSize = 15;
        this.minValue = 0;
        this.maxValue = 999;
        this.barBottom = 48;
        this.barHeadroom = 30;
        this.$customArrayInput = $("#custom-array-input");
        this.$customArrayButton = $("#custom-array-button");
        this.$customArrayError = $("#custom-array-error");
        this.arrayBlocks = [];
        this.timeLine = null;
        this.$timeRange = $("#time-range");
        this.$startButton = $("#start-button");
        this.$restartButton = $("#restart-button");
        this.$pauseButton = $("#pause-button");
    }

    bindControls() {
        this.$startButton.click(function () {
            this.timeLine.play();
            this.activateButton(this.$startButton);
            this.deactivateButton(this.$pauseButton);
        }.bind(this));

        this.$restartButton.click(function () {
            this.timeLine.restart();
            this.activateButton(this.$startButton);
            this.deactivateButton(this.$pauseButton);
        }.bind(this));

        this.$pauseButton.click(function () {
            this.timeLine.pause();
            this.activateButton(this.$pauseButton);
            this.deactivateButton(this.$startButton);
        }.bind(this));

        this.$timeRange.on("input", function () {
            this.timeLine.seek(this.timeLine.duration * (this.$timeRange.val() / 100));
        }.bind(this));

        this.$timeRange.val(0);
        this.activateButton(this.$pauseButton);
    }

    activateButton($button) {
        anime({
            targets: "#" + $button.attr("id"),
            backgroundColor: "#d8f36a",
            borderColor: "#d8f36a",
            color: "#14211f",
            duration: 200
        })
    }

    deactivateButton($button) {
        anime({
            targets: "#" + $button.attr("id"),
            backgroundColor: "#14211f",
            borderColor: "#14211f",
            color: "#fff",
            duration: 200
        })
    }

    loadOrPrepareArray() {
        let params = new URLSearchParams(decodeURIComponent(window.location.hash.substr(1)));
        let loaded = null;
        if (params.has("array")) {
            try {
                loaded = JSON.parse(params.get("array"));
            } catch (e) {
                loaded = null;
            }
        }

        if (this.isValidArray(loaded)) {
            this.array = loaded;
        } else {
            this.prepareRandomArray(10);
        }
    }

    isValidArray(array) {
        return Array.isArray(array)
            && array.length >= this.minSize && array.length <= this.maxSize
            && array.every(function (v) {
                return typeof v === "number" && isFinite(v) && v >= this.minValue && v <= this.maxValue;
            }, this);
    }

    parseArrayText(text) {
        let tokens = text.trim().split(/[\s,;]+/).filter(function (t) { return t !== ""; });
        if (tokens.length < this.minSize || tokens.length > this.maxSize) {
            return {error: this.translate("arraySize", {min: this.minSize, max: this.maxSize})};
        }

        let array = [];
        for (let token of tokens) {
            if (!/^\d+(\.\d+)?$/.test(token)) {
                return {error: this.translate("invalidNumber", {value: token})};
            }

            let value = Math.round(parseFloat(token) * 100) / 100;
            if (value < this.minValue || value > this.maxValue) {
                return {error: this.translate("outOfRange", {value: token, min: this.minValue, max: this.maxValue})};
            }

            array.push(value);
        }

        return {array: array};
    }

    bindCustomArray(onChange) {
        let apply = function () {
            let result = this.parseArrayText(this.$customArrayInput.val());
            if (result.error) {
                this.$customArrayError.text(result.error);
                return;
            }

            this.$customArrayError.text("");
            this.array = result.array;
            onChange();
        }.bind(this);

        this.$customArrayButton.click(apply);
        this.$customArrayInput.on("keydown", function (e) {
            if (e.key === "Enter") {
                e.preventDefault();
                apply();
            }
        });
    }

    getBarHeight(value) {
        let available = Math.max(60, this.$visulContainer.height() - this.barBottom - this.barHeadroom);
        let maxValue = Math.max(1, ...this.array);
        return Math.max(3, value / maxValue * available);
    }

    prepareRandomOrder(n) {
        this.array = [];
        for (let i = 1; i <= n; i++) {
            this.array.push(i);
        }

        this.array = _.shuffle(this.array);
    }

    prepareReverseOrder(n) {
        this.array = [];
        for (let i = n; i >= 1; i--) {
            this.array.push(i);
        }
    }

    prepareRandomArray(n) {
        this.array = [];
        for (let i = 0; i < n; i++) {
            this.array.push(Math.floor(Math.random() * 15) + 1);
        }
    }

    showArray() {
        let containerWidth = this.$visulContainer.width();
        let left = Math.floor((containerWidth - this.array.length * this.blockWidth) / 2);
        this.firstLeft = left;
        this.$visulContainer.empty();
        this.arrayBlocks = [];
        for (let i = 0; i < this.array.length; i++) {
            this.arrayBlocks.push(this.prepareSortingBlock(this.array[i], left, i));
            this.$visulContainer.append(this.arrayBlocks[i]);
            left += this.blockWidth;
        }

        let params = {array: JSON.stringify(this.array)};
        window.location.hash = $.param(params);

        this.$customArrayInput.val(this.array.join(" "));
        this.$customArrayError.text("");

        this.activateButton(this.$pauseButton);
        this.deactivateButton(this.$startButton);
    }

    prepareSortingBlock(number, left, orderId) {
        let $sortingBlock = $("<div></div>");
        $sortingBlock.addClass("sorting-block");
        $sortingBlock.css("height", this.getBarHeight(number).toString() + "px");
        $sortingBlock.css("width", this.blockWidth.toString() + "px");
        $sortingBlock.css("left", left.toString() + "px");
        $sortingBlock.attr("id", "sorting-block-" + orderId.toString());
        $sortingBlock.attr("s-color", this.colors.normal);
        $sortingBlock.css("background-color", this.colors.normal);

        $sortingBlock.append(this.prepareSortingNumber(number));
        return $sortingBlock;
    }

    prepareSortingNumber(number) {
        let $sortingNumber = $("<span></span>")
        $sortingNumber.addClass("sorting-number");
        $sortingNumber.text(number.toString());
        if (number.toString().length > 4) {
            $sortingNumber.addClass("sorting-number-long");
        }
        return $sortingNumber;
    }

    animateCompare(i, j) {
        this.timeLine.add({
            targets: '#' + this.arrayBlocks[i].attr("id"),
            backgroundColor: this.colors.first,
            easing: 'easeInOutQuad'
        });
        this.timeLine.add({
            targets: '#' + this.arrayBlocks[j].attr("id"),
            backgroundColor: this.colors.second,
            easing: 'easeInOutQuad'
        }, '-=750');
    }

    animateSwap(i, j) {
        this.timeLine.add({
            targets: '#' + this.arrayBlocks[i].attr("id"),
            left: this.firstLeft + j * this.blockWidth,
            easing: 'easeInOutQuad'
        });
        this.timeLine.add({
            targets: '#' + this.arrayBlocks[j].attr("id"),
            left: this.firstLeft + i * this.blockWidth,
            easing: 'easeInOutQuad'
        }, '-=750');

        [this.array[i], this.array[j]] = [this.array[j], this.array[i]];
        [this.arrayBlocks[i], this.arrayBlocks[j]] = [this.arrayBlocks[j], this.arrayBlocks[i]];
    }

    animateLeave(ind) {
        this.timeLine.add({
            targets: '#' + this.arrayBlocks[ind[0]].attr("id"),
            backgroundColor: this.arrayBlocks[ind[0]].attr("s-color"),
            easing: 'easeInOutQuad'
        });
        for (let i = 1; i < ind.length; i++) {
            this.timeLine.add({
                targets: '#' + this.arrayBlocks[ind[i]].attr("id"),
                backgroundColor: this.arrayBlocks[ind[i]].attr("s-color"),
                easing: 'easeInOutQuad'
            }, '-=750');
        }
    }

    animateMark(ind, colors) {
        this.timeLine.add({
            targets: '#' + this.arrayBlocks[ind[0]].attr("id"),
            backgroundColor: colors[0],
            easing: 'easeInOutQuad'
        });
        for (let i = 1; i < ind.length; i++) {
            this.timeLine.add({
                targets: '#' + this.arrayBlocks[ind[i]].attr("id"),
                backgroundColor: colors[i],
                easing: 'easeInOutQuad'
            }, '-=750');
        }
    }

    animateMarkSorted(i) {
        this.timeLine.add({
            targets: '#' + this.arrayBlocks[i].attr("id"),
            backgroundColor: this.colors.sorted,
            easing: 'easeInOutQuad'
        });

        this.arrayBlocks[i].attr("s-color", this.colors.sorted)
    }

    animateMarkSortedAll() {
        for (let i = 0; i < this.array.length; i++) {
            this.animateMarkSorted(i);
        }
    }
}
