class Trees {
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
        this.arrayBlocks = [];
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
        this.arrayBlocks = [];
        for (let i = 0; i < this.array.length; i++) {
            this.arrayBlocks.push(this.prepareArrayBlock(this.array[i], left, i));
            this.$visulContainer.append(this.arrayBlocks[i]);
            left += this.blockWidth;
        }
    }

    prepareArrayBlock(number, left, orderId) {
        let $sortingBlock = $("<div></div>");
        $sortingBlock.addClass("array-block");
        $sortingBlock.css("height", this.blockWidth.toString() + "px");
        $sortingBlock.css("width", this.blockWidth.toString() + "px");
        $sortingBlock.css("left", left.toString() + "px");
        $sortingBlock.attr("id", "array-block-" + orderId.toString());
        $sortingBlock.css("background-color", this.colors["normal"]);

        $sortingBlock.append(this.prepareArrayNumber(number));
        return $sortingBlock;
    }

    prepareArrayNumber(number) {
        let $sortingNumber = $("<span></span>")
        $sortingNumber.addClass("array-number");
        $sortingNumber.text(number.toString());
        return $sortingNumber;
    }

    highlightArrayBlock(i, color) {
        this.completedAnimation += 1;
        anime({
            targets: '#' + this.arrayBlocks[i].attr("id"),
            backgroundColor: color,
            complete: function (anim) {
                this.completedAnimation--;
            }.bind(this)
        });
    }

    startBuildBinaryTree() {
        this.treeHeight = Math.ceil(Math.log2(this.array.length));
        let lastLevel = Math.pow(2, this.treeHeight);
        let containerWidth = this.$visulContainer.width();
        this.maxLevelWidth = lastLevel * this.blockWidth;
        this.minLeft = Math.floor((containerWidth - this.maxLevelWidth) / 2);
        this.treeArray = [];
        this.currentIndex = 0;
        this.animateBuildTree();
    }

    animateBuildTree() {
        if(this.currentIndex >= this.array.length) {
            return;
        }

        if(this.completedAnimation > 0) {
            requestAnimationFrame(this.animateBuildTree.bind(this));
            return;
        }

        this.treeArray.push(this.array[this.currentIndex]);
        let currentLevel = Math.floor(Math.log2(this.treeArray.length)) + 1;
        let levelIndex = this.treeArray.length - Math.pow(2, currentLevel-1);
        let left = (this.maxLevelWidth / Math.pow(2, currentLevel)) + (levelIndex * (this.maxLevelWidth / Math.pow(2, currentLevel-1))) + this.minLeft - (this.blockWidth / 2);
        let top = currentLevel * (this.blockWidth * 3);
        let parentIndex = Math.floor((this.currentIndex - 1) / 2);
        this.currentIndex++;

        this.completedAnimation += 1;
        anime({
            targets: '#' + this.arrayBlocks[this.currentIndex - 1].attr("id"),
            backgroundColor: this.colors["normal"],
            left: left.toString() + "px",
            top: top.toString() + "px",
            borderRadius: ['0%', '50%'],
            easing: 'linear',
            complete: function (anim) {
                this.completedAnimation--;
                if(parentIndex >= 0) {
                    this.addEdge(this.arrayBlocks[this.currentIndex - 1], this.arrayBlocks[parentIndex]);
                }
            }.bind(this)
        });

        requestAnimationFrame(this.animateBuildTree.bind(this));
    }

    addEdge(node1, node2) {
        let left1 = parseInt(node1.css("left"));
        let left2 = parseInt(node2.css("left"));
        let top1 = parseInt(node1.css("top"));
        let top2 = parseInt(node2.css("top"));
        let left = Math.min(left1, left2) + this.blockWidth / 2;
        let width = Math.max(left1, left2) - left + this.blockWidth / 2;
        let top = Math.min(top1, top2) + this.blockWidth;
        let height = Math.max(top1, top2) - top;
        let $edge = $("<div></div>");
        if(left1 > left2) {
            $edge.addClass("edge");
        } else {
            $edge.addClass("edger");
        }
        $edge.css("left", left.toString() + "px");
        $edge.css("top", top.toString() + "px");
        $edge.css("width", width.toString() + "px");
        $edge.css("height", height.toString() + "px");
        this.$visulContainer.append($edge);
    }
}
