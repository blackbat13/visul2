class Sorting extends Animation {
    constructor() {
        super();
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
                this.animateMark([j - 1], [this.colors.first]);
                this.animateSwap(j, j - 1);
                this.animateLeave([j]);
                j--;
            }

            if (j > 0) {
                this.animateMark([j - 1], [this.colors.first]);
                this.animateLeave([j - 1]);
            }

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
                }

                this.animateLeave([j, j + 1]);
            }

            this.animateMarkSorted(this.arrayBlocks.length - i - 1);
        }

        this.timeLine.restart();
        this.timeLine.pause();
    }

    prepareSelectionSort() {
        this.timeLine = anime.timeline({
            easing: 'easeOutExpo',
            duration: 750,
            update: function (anim) {
                this.$timeRange.val(this.timeLine.progress);
            }.bind(this)
        });

        for (let i = 0; i < this.array.length - 1; i++) {
            let minVal = this.array[i];
            let minInd = i;
            this.animateMark([i], [this.colors.second]);
            for (let j = i + 1; j < this.array.length; j++) {
                this.animateMark([j], [this.colors.first]);
                if (this.array[j] < minVal) {
                    this.animateLeave([minInd]);
                    this.animateMark([j], [this.colors.second]);
                    minVal = this.array[j];
                    minInd = j;
                } else {
                    this.animateLeave([j]);
                }
            }

            if (minInd !== i) {
                this.animateSwap(i, minInd);
            }

            this.animateMarkSorted(i);
        }

        this.animateMarkSorted(this.array.length - 1);

        this.timeLine.restart();
        this.timeLine.pause();
    }

    prepareGnomeSort() {
        this.timeLine = anime.timeline({
            easing: 'easeOutExpo',
            duration: 750,
            update: function (anim) {
                this.$timeRange.val(this.timeLine.progress);
            }.bind(this)
        });

        let pos = 0;
        this.animateMark([pos], [this.colors.second]);
        while (pos < this.array.length) {
            if (pos === 0 || this.array[pos] >= this.array[pos - 1]) {
                this.animateLeave([pos]);
                pos += 1;
                if (pos < this.array.length) {
                    this.animateMark([pos], [this.colors.second]);
                }
            } else {
                this.animateSwap(pos, pos - 1);
                pos -= 1;
            }
        }

        this.animateMarkSortedAll();

        this.timeLine.restart();
        this.timeLine.pause();
    }

    prepareCocktailShakerSort() {
        this.timeLine = anime.timeline({
            easing: 'easeOutExpo',
            duration: 750,
            update: function (anim) {
                this.$timeRange.val(this.timeLine.progress);
            }.bind(this)
        });

        for (let i = 0; i <= this.array.length / 2; i++) {
            for (let j = i; j < this.array.length - i - 1; j++) {
                this.animateCompare(j, j + 1);
                if (this.array[j] > this.array[j + 1]) {
                    this.animateSwap(j, j + 1);
                }

                this.animateLeave([j, j + 1]);
            }
            this.animateMarkSorted(this.array.length - i - 1);

            for (let j = this.array.length - i - 2; j > i; j--) {
                this.animateCompare(j, j - 1);
                if (this.array[j] < this.array[j - 1]) {
                    this.animateSwap(j, j - 1);
                }

                this.animateLeave([j, j - 1]);
            }

            this.animateMarkSorted(i);
        }

        this.timeLine.restart();
        this.timeLine.pause();
    }

    prepareCombSort() {
        this.timeLine = anime.timeline({
            easing: 'easeOutExpo',
            duration: 750,
            update: function (anim) {
                this.$timeRange.val(this.timeLine.progress);
            }.bind(this)
        });

        let gap = this.array.length;
        let shrink = 1.3;
        let sorted = false;

        while (!sorted) {
            gap = Math.floor(gap / shrink);
            if (gap <= 1) {
                gap = 1;
                sorted = true;
            }

            let i = 0;
            while (i + gap < this.array.length) {
                this.animateCompare(i, i + gap);
                if (this.array[i] > this.array[i + gap]) {
                    this.animateSwap(i, i + gap);
                    sorted = false;
                }

                this.animateLeave([i, i + gap]);
                i++;
            }
        }

        this.animateMarkSortedAll();

        this.timeLine.restart();
        this.timeLine.pause();
    }

    prepareOddEvenSort() {
        this.timeLine = anime.timeline({
            easing: 'easeOutExpo',
            duration: 750,
            update: function (anim) {
                this.$timeRange.val(this.timeLine.progress);
            }.bind(this)
        });

        let sorted = false;
        while (!sorted) {
            sorted = true;
            for (let i = 1; i < this.array.length - 1; i += 2) {
                this.animateCompare(i, i + 1);
                if (this.array[i] > this.array[i + 1]) {
                    this.animateSwap(i, i + 1);
                    sorted = false;
                }
                this.animateLeave([i, i + 1]);
            }

            for (let i = 0; i < this.array.length - 1; i += 2) {
                this.animateCompare(i, i + 1);
                if (this.array[i] > this.array[i + 1]) {
                    this.animateSwap(i, i + 1);
                    sorted = false;
                }
                this.animateLeave([i, i + 1]);
            }
        }

        this.animateMarkSortedAll();

        this.timeLine.restart();
        this.timeLine.pause();
    }
}
