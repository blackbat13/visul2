class Sorting {
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
        this.sortingBlocks = [];
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
        this.sortingBlocks = [];
        for (let i = 0; i < this.array.length; i++) {
            this.sortingBlocks.push(this.prepareSortingBlock(this.array[i], left, i));
            this.$visulContainer.append(this.sortingBlocks[i]);
            left += this.blockWidth;
        }
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

    prepareInsertionSort() {
        this.timeLine = anime.timeline({
            easing: 'easeOutExpo',
            duration: 750,
            update: function (anim) {
                this.$timeRange.val(this.timeLine.progress);
            }.bind(this)
        });

        this.animateMarkSorted(0);

        for (let i = 0; i < this.array.length - 1; i++) {
            let j = i + 1;
            this.animateMark([j], [this.colors.second]);
            while (j > 0 && this.array[j] < this.array[j - 1]) {
                // this.animateCompare(j, j - 1);
                this.animateMark([j - 1], [this.colors.first]);
                this.animateSwap(j, j - 1);

                [this.array[j], this.array[j - 1]] = [this.array[j - 1], this.array[j]];
                [this.sortingBlocks[j], this.sortingBlocks[j - 1]] = [this.sortingBlocks[j - 1], this.sortingBlocks[j]];

                this.animateLeave([j]);
                j--;
            }

            if (j > 0) {
                this.animateMark([j - 1], [this.colors.first]);
                this.animateLeave([j - 1]);
            }

            // this.animateLeave([j])

            this.animateMarkSorted(j);
        }

        this.timeLine.restart();
        this.timeLine.pause();
    }

    prepareBubbleSort() {
        this.timeLine = anime.timeline({
            easing: 'easeOutExpo',
            duration: 750,
            update: function (anim) {
                this.$timeRange.val(this.timeLine.progress);
            }.bind(this)
        });

        for (let i = 0; i < this.array.length; i++) {
            for (let j = 0; j < this.array.length - i - 1; j++) {
                this.animateCompare(j, j + 1);

                if (this.array[j] > this.array[j + 1]) {
                    this.animateSwap(j, j + 1);

                    [this.array[j], this.array[j + 1]] = [this.array[j + 1], this.array[j]];
                    [this.sortingBlocks[j], this.sortingBlocks[j + 1]] = [this.sortingBlocks[j + 1], this.sortingBlocks[j]];
                }

                this.animateLeave([j, j + 1]);
            }

            this.animateMarkSorted(this.sortingBlocks.length - i - 1);
        }

        this.timeLine.restart();
        this.timeLine.pause();
    }

    animateCompare(i, j) {
        this.timeLine.add({
            targets: '#' + this.sortingBlocks[i].attr("id"),
            backgroundColor: this.colors.first,
            easing: 'easeInOutQuad'
        });
        this.timeLine.add({
            targets: '#' + this.sortingBlocks[j].attr("id"),
            backgroundColor: this.colors.second,
            easing: 'easeInOutQuad'
        }, '-=750');
    }

    animateSwap(i, j) {
        this.timeLine.add({
            targets: '#' + this.sortingBlocks[i].attr("id"),
            left: this.firstLeft + j * this.blockWidth,
            easing: 'easeInOutQuad'
        });
        this.timeLine.add({
            targets: '#' + this.sortingBlocks[j].attr("id"),
            left: this.firstLeft + i * this.blockWidth,
            easing: 'easeInOutQuad'
        }, '-=750');
    }

    animateLeave(ind) {
        this.timeLine.add({
            targets: '#' + this.sortingBlocks[ind[0]].attr("id"),
            backgroundColor: this.sortingBlocks[ind[0]].attr("s-color"),
            easing: 'easeInOutQuad'
        });
        for (let i = 1; i < ind.length; i++) {
            this.timeLine.add({
                targets: '#' + this.sortingBlocks[ind[i]].attr("id"),
                backgroundColor: this.sortingBlocks[ind[i]].attr("s-color"),
                easing: 'easeInOutQuad'
            }, '-=750');
        }
    }

    animateMark(ind, colors) {
        this.timeLine.add({
            targets: '#' + this.sortingBlocks[ind[0]].attr("id"),
            backgroundColor: colors[0],
            easing: 'easeInOutQuad'
        });
        for (let i = 1; i < ind.length; i++) {
            this.timeLine.add({
                targets: '#' + this.sortingBlocks[ind[i]].attr("id"),
                backgroundColor: colors[i],
                easing: 'easeInOutQuad'
            }, '-=750');
        }
    }

    animateMarkSorted(i) {
        this.timeLine.add({
            targets: '#' + this.sortingBlocks[i].attr("id"),
            backgroundColor: this.colors.sorted,
            easing: 'easeInOutQuad'
        });

        this.sortingBlocks[i].attr("s-color", this.colors.sorted)
    }
}
