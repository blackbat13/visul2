class Sorting {
    colors = {
        "sorted": "#ffd700",
        "normal": "#29B6F6",
        "first": "#43A047",
        "second": "#D32F2F",
    };

    constructor() {
        this.array = [];
        this.$visulContainer = $("#visul-container");
        this.blockWidth = 50;
        this.sortingBlocks = [];
        this.firstIndex = 0;
        this.secondIndex = 0;
        this.completedAnimation = 0;
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
        $sortingBlock.css("background-color", this.colors["normal"]);

        $sortingBlock.append(this.prepareSortingNumber(number));
        return $sortingBlock;
    }

    prepareSortingNumber(number) {
        let $sortingNumber = $("<span></span>")
        $sortingNumber.addClass("sorting-number");
        $sortingNumber.text(number.toString());
        return $sortingNumber;
    }

    startInsertionSort() {
        this.firstIndex = 1;
        this.secondIndex = 1;
        this.highlightBlock(0, this.colors["sorted"]);
        this.animateInsertionSort();
    }

    animateInsertionSort() {
        if(this.completedAnimation > 0) {
            requestAnimationFrame(this.animateInsertionSort.bind(this));
            return;
        }

        this.insertionSort();
        requestAnimationFrame(this.animateInsertionSort.bind(this));
    }

    insertionSort() {
        let tmp;
        while (this.firstIndex < this.array.length) {
            while (this.secondIndex > 0 && this.array[this.secondIndex] < this.array[this.secondIndex - 1]) {

                this.animateSwap(this.secondIndex, this.secondIndex-1);
                tmp = this.array[this.secondIndex];
                this.array[this.secondIndex] = this.array[this.secondIndex - 1];
                this.array[this.secondIndex - 1] = tmp;

                tmp = this.sortingBlocks[this.secondIndex];
                this.sortingBlocks[this.secondIndex] = this.sortingBlocks[this.secondIndex - 1];
                this.sortingBlocks[this.secondIndex - 1] = tmp;


                this.secondIndex--;
                return;
            }

            this.highlightBlock(this.secondIndex, this.colors["sorted"]);
            this.firstIndex++;
            this.secondIndex = this.firstIndex;
            return;
        }
    }

    startBubbleSort() {
        this.firstIndex = 0;
        this.secondIndex = 0;
        this.step = 0;
        this.animateBubbleSort();
    }

   animateBubbleSort() {
        if(this.completedAnimation > 0) {
            requestAnimationFrame(this.animateBubbleSort.bind(this));
            return;
        }

       this.bubbleSort();
       requestAnimationFrame(this.animateBubbleSort.bind(this));
    }

    bubbleSort() {
        let tmp;
        while (this.firstIndex < this.array.length) {
            while (this.secondIndex < this.array.length - this.firstIndex - 1) {
                if(this.step === 0) {
                    this.highlightBlock(this.secondIndex, this.colors["first"]);
                    this.highlightBlock(this.secondIndex + 1, this.colors["second"]);
                    this.step += 1;
                    return;
                }

                if (this.array[this.secondIndex] > this.array[this.secondIndex + 1]) {
                    this.animateSwap(this.secondIndex, this.secondIndex+1, this.colors["normal"], this.colors["normal"]);
                    tmp = this.array[this.secondIndex];
                    this.array[this.secondIndex] = this.array[this.secondIndex + 1];
                    this.array[this.secondIndex + 1] = tmp;

                    tmp = this.sortingBlocks[this.secondIndex];
                    this.sortingBlocks[this.secondIndex] = this.sortingBlocks[this.secondIndex + 1];
                    this.sortingBlocks[this.secondIndex + 1] = tmp;
                } else {
                    this.highlightBlock(this.secondIndex, this.colors["normal"]);
                    this.highlightBlock(this.secondIndex + 1, this.colors["normal"]);
                }

                this.step = 0;
                this.secondIndex++;
                return;
            }

            this.secondIndex = 0;
            this.firstIndex++;
            this.highlightBlock(this.array.length - this.firstIndex, this.colors["sorted"]);
            return;
        }
    }

    highlightBlock(i, color) {
        this.completedAnimation += 1;
        anime({
            targets: '#' + this.sortingBlocks[i].attr("id"),
            backgroundColor: color,
            complete: function (anim) {
                this.completedAnimation--;
            }.bind(this)
        });
    }

    animateSwap(i, j, color1, color2) {
        this.completedAnimation += 2;

        anime({
            targets: '#' + this.sortingBlocks[i].attr("id"),
            left: this.sortingBlocks[j].css("left"),
            easing: 'easeInOutQuad',
            complete: function (anim) {
                this.completedAnimation--;
                this.highlightBlock(i, color1);
            }.bind(this)
        });

        anime({
            targets: '#' + this.sortingBlocks[j].attr("id"),
            left: this.sortingBlocks[i].css("left"),
            easing: 'easeInOutQuad',
            complete: function (anim) {
                this.completedAnimation--;
                this.highlightBlock(j, color2);
            }.bind(this)
        });
    }
}
