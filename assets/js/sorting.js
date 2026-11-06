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

    prepareShellSort() {
        this.timeLine = anime.timeline({
            easing: 'easeOutExpo',
            duration: 750,
            update: function (anim) {
                this.$timeRange.val(this.timeLine.progress);
            }.bind(this)
        });

        const n = this.array.length;
        for (let gap = Math.floor(n / 2); gap > 0; gap = Math.floor(gap / 2)) {
            for (let i = gap; i < n; i++) {
                let j = i;
                this.animateMark([j], [this.colors.second]);
                while (j >= gap && this.array[j] < this.array[j - gap]) {
                    this.animateMark([j - gap], [this.colors.first]);
                    this.animateSwap(j, j - gap);
                    this.animateLeave([j]);
                    j -= gap;
                }

                if (j >= gap) {
                    this.animateMark([j - gap], [this.colors.first]);
                    this.animateLeave([j - gap]);
                }

                this.animateLeave([j]);
            }
        }

        this.animateMarkSortedAll();

        this.timeLine.restart();
        this.timeLine.pause();
    }

    chooseQuickSortPivot(values, lo, hi, pivotType) {
        const mid = Math.floor((lo + hi) / 2);
        switch (pivotType) {
            case "first":
                return {index: lo, candidates: [lo]};
            case "middle":
                return {index: mid, candidates: [mid]};
            case "random": {
                const index = lo + Math.floor(Math.random() * (hi - lo + 1));
                return {index: index, candidates: [index]};
            }
            case "median3": {
                const candidates = Array.from(new Set([lo, mid, hi]));
                const ordered = candidates.slice().sort((a, b) => values[a] - values[b]);
                return {index: ordered[Math.floor(ordered.length / 2)], candidates: candidates};
            }
            default:
                return {index: hi, candidates: [hi]};
        }
    }

    // Runs quicksort (Lomuto partition) on a copy of the array and records what has to be animated.
    planQuickSort(pivotType) {
        const values = this.array.slice();
        const events = [];
        let maxDepth = 0;
        let nextId = 0;

        const swap = function (i, j) {
            if (i !== j) {
                events.push({type: "swap", i: i, j: j});
                [values[i], values[j]] = [values[j], values[i]];
            }
        };

        const sort = function (lo, hi, depth) {
            if (lo > hi) {
                return;
            }

            const id = nextId++;
            maxDepth = Math.max(maxDepth, depth);
            events.push({type: "enter", id: id, lo: lo, hi: hi, depth: depth});

            if (lo === hi) {
                events.push({type: "place", index: lo});
                events.push({type: "exit", id: id});
                return;
            }

            const choice = this.chooseQuickSortPivot(values, lo, hi, pivotType);
            events.push({type: "pivot", index: choice.index, candidates: choice.candidates});
            swap(choice.index, hi);

            const pivotValue = values[hi];
            let store = lo;
            for (let j = lo; j < hi; j++) {
                events.push({type: "scan", index: j});
                if (values[j] < pivotValue) {
                    swap(store, j);
                    events.push({type: "leave", positions: store === j ? [j] : [store, j]});
                    store++;
                } else {
                    events.push({type: "leave", positions: [j]});
                }
            }

            swap(store, hi);
            events.push({type: "place", index: store});

            sort(lo, store - 1, depth + 1);
            sort(store + 1, hi, depth + 1);
            events.push({type: "exit", id: id});
        }.bind(this);

        sort(0, values.length - 1, 0);
        return {events: events, maxDepth: maxDepth};
    }

    animateQuickSortFocus(lo, hi) {
        this.timeLine.add({
            targets: this.arrayBlocks.map(function (block) {
                return block[0];
            }),
            opacity: function (el, i) {
                return i >= lo && i <= hi ? 1 : 0.3;
            },
            easing: 'easeInOutQuad'
        });
        this.timeLine.add({
            targets: "#quick-range-frame",
            left: this.firstLeft + lo * this.blockWidth,
            width: (hi - lo + 1) * this.blockWidth,
            opacity: 1,
            easing: 'easeInOutQuad'
        }, '-=750');
    }

    animateQuickSortPivotTag(index, opacity, timelineOffset) {
        this.timeLine.add({
            targets: this.arrayBlocks[index].find(".quick-pivot-tag")[0],
            opacity: opacity,
            easing: 'easeInOutQuad'
        }, timelineOffset);
    }

    prepareMergeSort() {
        this.timeLine = anime.timeline({
            easing: 'easeOutExpo',
            duration: 750,
            update: function (anim) {
                this.$timeRange.val(this.timeLine.progress);
            }.bind(this)
        });

        const bw = this.blockWidth;
        const n = this.array.length;
        const barMax = 140;
        const rowHeight = 22;
        const rowsBottom = 8;
        const levels = function (len) {
            return len <= 1 ? 0 : 1 + levels(Math.ceil(len / 2));
        };
        const rows = levels(n);
        const maxDepth = rows - 1;

        // Od dołu: rzędy zakresów rekurencji, tablica pomocnicza, tablica główna.
        const auxBottom = rowsBottom + rows * rowHeight + 36;
        const mainBottom = auxBottom + barMax + 44;
        const minHeight = "max(40vh, " + (mainBottom + barMax + 50) + "px)";
        this.$visulContainer.css("min-height", minHeight);
        this.$visulContainer.closest(".container-row").css("min-height", minHeight);

        const maxValue = Math.max(1, ...this.array);
        for (let i = 0; i < n; i++) {
            this.arrayBlocks[i].css({
                bottom: mainBottom + "px",
                height: Math.max(3, this.array[i] / maxValue * barMax) + "px"
            });
        }

        const $frame = $("<div></div>").attr("id", "quick-range-frame").addClass("quick-range-frame");
        $frame.css({
            left: this.firstLeft + "px",
            width: n * bw + "px",
            top: "auto",
            bottom: (mainBottom - 28) + "px",
            height: (barMax + 28 + 30) + "px"
        });
        this.$visulContainer.prepend($frame);

        let nextId = 0;
        const sort = function (lo, hi, depth) {
            if (lo >= hi) {
                return;
            }

            const id = nextId++;
            const mid = Math.floor((lo + hi) / 2);
            const $range = $("<div></div>").attr("id", "quick-range-" + id).addClass("quick-range");
            $range.text("[" + lo + ", " + hi + "]");
            $range.css({
                left: this.firstLeft + lo * bw + "px",
                width: (hi - lo + 1) * bw + "px",
                bottom: rowsBottom + (maxDepth - depth) * rowHeight + "px",
                height: rowHeight - 4 + "px"
            });
            this.$visulContainer.append($range);

            this.animateQuickSortFocus(lo, hi);
            this.timeLine.add({
                targets: "#quick-range-" + id,
                opacity: 1,
                easing: 'easeInOutQuad'
            }, '-=750');

            sort(lo, mid, depth + 1);
            sort(mid + 1, hi, depth + 1);

            if (hi - lo > 1) {
                this.animateQuickSortFocus(lo, hi);
            }

            // Scalanie: elementy zakresu trafiają do tablicy pomocniczej, a następnie wracają w posortowanej kolejności.
            const snapshot = this.arrayBlocks.slice(lo, hi + 1);
            this.timeLine.add({
                targets: snapshot.map(function (block) {
                    return block[0];
                }),
                bottom: auxBottom + "px",
                easing: 'easeInOutQuad'
            });

            const merged = [];
            const mergedValues = [];
            let i = lo;
            let j = mid + 1;
            for (let k = lo; k <= hi; k++) {
                const bothAvailable = i <= mid && j <= hi;
                const takeLeft = j > hi || (i <= mid && this.array[i] <= this.array[j]);
                const from = takeLeft ? i : j;
                const block = this.arrayBlocks[from];

                if (bothAvailable) {
                    this.animateMark([i, j], [this.colors.first, this.colors.second]);
                }

                this.timeLine.add({
                    targets: block[0],
                    left: this.firstLeft + k * bw,
                    bottom: mainBottom + "px",
                    backgroundColor: block.attr("s-color"),
                    easing: 'easeInOutQuad'
                });
                if (bothAvailable) {
                    this.timeLine.add({
                        targets: this.arrayBlocks[takeLeft ? j : i][0],
                        backgroundColor: this.arrayBlocks[takeLeft ? j : i].attr("s-color"),
                        easing: 'easeInOutQuad'
                    }, '-=750');
                }

                merged.push(block);
                mergedValues.push(this.array[from]);
                if (takeLeft) {
                    i++;
                } else {
                    j++;
                }
            }

            for (let k = 0; k < merged.length; k++) {
                this.arrayBlocks[lo + k] = merged[k];
                this.array[lo + k] = mergedValues[k];
            }

            this.timeLine.add({
                targets: "#quick-range-" + id,
                opacity: 0.35,
                easing: 'easeInOutQuad'
            });
        }.bind(this);

        sort(0, n - 1, 0);

        this.timeLine.add({
            targets: this.arrayBlocks.map(function (block) {
                return block[0];
            }),
            opacity: 1,
            easing: 'easeInOutQuad'
        });
        this.timeLine.add({
            targets: "#quick-range-frame",
            opacity: 0,
            easing: 'easeInOutQuad'
        }, '-=750');
        this.animateMarkSortedAll();

        this.timeLine.restart();
        this.timeLine.pause();
    }

    prepareQuickSort() {
        this.timeLine = anime.timeline({
            easing: 'easeOutExpo',
            duration: 750,
            update: function (anim) {
                this.$timeRange.val(this.timeLine.progress);
            }.bind(this)
        });

        const rowHeight = 22;
        const rowsBottom = 8;
        const plan = this.planQuickSort(this.pivotType || "last");
        const rowsHeight = (plan.maxDepth + 1) * rowHeight;

        // Space under the bars is reserved for one row per recursion depth.
        this.barBottom = rowsBottom + rowsHeight + 30;
        const minHeight = "max(40vh, " + (this.barBottom + 340) + "px)";
        this.$visulContainer.css("min-height", minHeight);
        this.$visulContainer.closest(".container-row").css("min-height", minHeight);

        for (let i = 0; i < this.arrayBlocks.length; i++) {
            const $tag = $("<span></span>").addClass("quick-pivot-tag").text(this.translate("pivot"));
            this.arrayBlocks[i].css({bottom: this.barBottom + "px", height: this.getBarHeight(this.array[i]) + "px"});
            this.arrayBlocks[i].append($tag);
        }

        const $frame = $("<div></div>").attr("id", "quick-range-frame").addClass("quick-range-frame");
        $frame.css({
            left: this.firstLeft + "px",
            width: this.array.length * this.blockWidth + "px",
            bottom: (rowsBottom + rowsHeight + 4) + "px"
        });
        this.$visulContainer.prepend($frame);

        for (const event of plan.events) {
            switch (event.type) {
                case "enter": {
                    const $range = $("<div></div>").attr("id", "quick-range-" + event.id).addClass("quick-range");
                    $range.text("[" + event.lo + ", " + event.hi + "]");
                    $range.css({
                        left: this.firstLeft + event.lo * this.blockWidth + "px",
                        width: (event.hi - event.lo + 1) * this.blockWidth + "px",
                        bottom: rowsBottom + (plan.maxDepth - event.depth) * rowHeight + "px",
                        height: rowHeight - 4 + "px"
                    });
                    this.$visulContainer.append($range);

                    this.animateQuickSortFocus(event.lo, event.hi);
                    this.timeLine.add({
                        targets: "#quick-range-" + event.id,
                        opacity: 1,
                        easing: 'easeInOutQuad'
                    }, '-=750');
                    break;
                }
                case "pivot": {
                    const others = event.candidates.filter(function (index) {
                        return index !== event.index;
                    });
                    if (others.length) {
                        this.animateMark(event.candidates, event.candidates.map(() => this.colors.first));
                        this.animateMark([event.index], [this.colors.second]);
                    } else {
                        this.animateMark([event.index], [this.colors.second]);
                    }
                    this.animateQuickSortPivotTag(event.index, 1, '-=750');
                    if (others.length) {
                        this.animateLeave(others);
                    }
                    break;
                }
                case "swap":
                    this.animateSwap(event.i, event.j);
                    break;
                case "scan":
                    this.animateMark([event.index], [this.colors.first]);
                    break;
                case "leave":
                    this.animateLeave(event.positions);
                    break;
                case "place":
                    this.animateMarkSorted(event.index);
                    this.animateQuickSortPivotTag(event.index, 0, '-=750');
                    break;
                case "exit":
                    this.timeLine.add({
                        targets: "#quick-range-" + event.id,
                        opacity: 0.35,
                        easing: 'easeInOutQuad'
                    });
                    break;
            }
        }

        this.timeLine.add({
            targets: this.arrayBlocks.map(function (block) {
                return block[0];
            }),
            opacity: 1,
            easing: 'easeInOutQuad'
        });
        this.timeLine.add({
            targets: "#quick-range-frame",
            opacity: 0,
            easing: 'easeInOutQuad'
        }, '-=750');

        this.timeLine.restart();
        this.timeLine.pause();
    }
}
