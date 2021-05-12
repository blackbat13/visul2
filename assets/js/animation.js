class Animation {
    colors = {
        sorted: "#ffd700",
        normal: "#29B6F6",
        first: "#43A047",
        second: "#D32F2F",
    };

    constructor() {
        this.array = [];
        this.$visulContainer = $("#visul-container");
        this.blockWidth = 50;
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
        }.bind(this));

        this.$restartButton.click(function () {
            this.timeLine.restart();
        }.bind(this));

        this.$pauseButton.click(function () {
            this.timeLine.pause();
        }.bind(this));

        this.$timeRange.on("input", function () {
            this.timeLine.seek(this.timeLine.duration * (this.$timeRange.val() / 100));
        }.bind(this));

        this.$timeRange.val(0);
    }

    loadOrPrepareArray() {
        let params = new URLSearchParams(decodeURIComponent(window.location.hash.substr(1)));
        if(params.has("array")) {
            this.array = JSON.parse(params.get("array"));
        } else {
            this.prepareRandomArray(10);
        }
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
    }

    prepareSortingBlock(number, left, orderId) {
        let $sortingBlock = $("<div></div>");
        $sortingBlock.addClass("sorting-block");
        $sortingBlock.css("height", (number * 25).toString() + "px");
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
}
