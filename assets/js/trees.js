class Trees extends Animation {
    constructor() {
        super();
    }

    prepareSortingBlock(number, left, orderId) {
        let $sortingBlock = $("<div></div>");
        $sortingBlock.addClass("sorting-block");
        $sortingBlock.css("height", this.blockWidth.toString() + "px");
        $sortingBlock.css("width", this.blockWidth.toString() + "px");
        $sortingBlock.css("left", left.toString() + "px");
        $sortingBlock.attr("id", "sorting-block-" + orderId.toString());
        $sortingBlock.attr("s-color", this.colors.normal);
        $sortingBlock.css("background-color", this.colors.normal);

        $sortingBlock.append(this.prepareSortingNumber(number));
        return $sortingBlock;
    }

    prepareBuildBinaryTree() {
        this.timeLine = anime.timeline({
            easing: 'easeOutExpo',
            duration: 750,
            update: function (anim) {
                this.$timeRange.val(this.timeLine.progress);
            }.bind(this)
        });

        let treeHeight = Math.ceil(Math.log2(this.array.length));
        let lastLevel = Math.pow(2, treeHeight);
        let containerWidth = this.$visulContainer.width();
        let maxLevelWidth = lastLevel * this.blockWidth;
        let containerHeight = this.$visulContainer.height();
        let maxLevelHeight = (containerHeight - this.blockWidth) / treeHeight;
        let minLeft = Math.floor((containerWidth - maxLevelWidth) / 2);
        let treeArray = [];

        for (let i = 0; i < this.array.length; i++) {
            treeArray.push(this.array[i]);
            let currentLevel = Math.floor(Math.log2(treeArray.length)) + 1;
            let levelIndex = treeArray.length - Math.pow(2, currentLevel - 1);
            let left = (maxLevelWidth / Math.pow(2, currentLevel)) + (levelIndex * (maxLevelWidth / Math.pow(2, currentLevel - 1))) + minLeft - (this.blockWidth / 2);
            let top = currentLevel * (maxLevelHeight);
            let parentIndex = Math.floor((i - 1) / 2);

            this.timeLine.add({
                targets: '#' + this.arrayBlocks[i].attr("id"),
                backgroundColor: this.colors["normal"],
                left: left.toString() + "px",
                top: top.toString() + "px",
                borderRadius: ['0%', '50%'],
                easing: 'linear',
                complete: function (anim) {
                    if (parentIndex >= 0) {
                        this.addEdge(this.arrayBlocks[i], this.arrayBlocks[parentIndex], i);
                    }
                }.bind(this)
            });

            if (parentIndex >= 0) {
                this.timeLine.add({
                    targets: '#line-' + i.toString(),
                    x2: 5
                })
            }
        }

        this.timeLine.restart();
        this.timeLine.pause();
    }

    addEdge(node1, node2, id) {
        let left1 = parseInt(node1.css("left"));
        let left2 = parseInt(node2.css("left"));
        let top1 = parseInt(node1.css("top"));
        let top2 = parseInt(node2.css("top"));
        let left = Math.min(left1, left2) + this.blockWidth / 2;
        let width = Math.max(left1, left2) - left + this.blockWidth / 2;
        let top = Math.min(top1, top2) + this.blockWidth;
        let height = Math.max(top1, top2) - top;
        let $edge = $("<div></div>");
        if (left1 > left2) {
            $edge.addClass("edge");
            let $svg = $("<svg xmlns='http://www.w3.org/2000/svg' version='1.1' preserveAspectRatio='none' viewBox='0 0 10 10'></svg>");
            let $line = $("<line x1='0' y1='0' x2='10' y2='10' />");
            $line.css("stroke", "#000");
            $line.css("stroke-width", 1);
            $line.attr("id", "line-" + id.toString());
            $svg.append($line);
            $edge.append($svg);
        } else {
            $edge.addClass("edger");
        }
        $edge.css("left", left.toString() + "px");
        $edge.css("top", top.toString() + "px");
        $edge.css("width", width.toString() + "px");
        $edge.css("height", height.toString() + "px");
        // $edge.css("visibility", "hidden");
        $edge.attr("id", "edge-" + id.toString());
        this.$visulContainer.append($edge);
    }
}
