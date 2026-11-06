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
        let animationDuration = 750;
        this.timeLine = anime.timeline({
            easing: 'easeOutExpo',
            duration: animationDuration,
            update: function (anim) {
                this.$timeRange.val(this.timeLine.progress);
            }.bind(this)
        });

        let treeHeight = Math.floor(Math.log2(this.array.length)) + 1;
        let lastLevel = Math.pow(2, treeHeight);
        let containerWidth = this.$visulContainer.width();
        let maxLevelWidth = lastLevel * this.blockWidth;
        let containerHeight = this.$visulContainer.height();
        let maxLevelHeight = (containerHeight - this.blockWidth) / treeHeight;
        let minLeft = Math.floor((containerWidth - maxLevelWidth) / 2);
        let positions = [];

        for (let i = 0; i < this.array.length; i++) {
            let currentLevel = Math.floor(Math.log2(i + 1)) + 1;
            let levelIndex = i + 1 - Math.pow(2, currentLevel - 1);
            let left = (maxLevelWidth / Math.pow(2, currentLevel)) + (levelIndex * (maxLevelWidth / Math.pow(2, currentLevel - 1))) + minLeft - (this.blockWidth / 2);
            let top = currentLevel * maxLevelHeight;
            let parentIndex = Math.floor((i - 1) / 2);
            positions.push({left: left, top: top});

            if (parentIndex >= 0) {
                this.addEdge(i, positions[i], positions[parentIndex]);
            }

            this.timeLine.add({
                targets: '#' + this.arrayBlocks[i].attr("id"),
                backgroundColor: this.colors["normal"],
                left: left.toString() + "px",
                top: top.toString() + "px",
                borderRadius: ['0%', '50%'],
                easing: 'linear',
            }, i * animationDuration);

            if (parentIndex >= 0) {
                this.timeLine.add({
                    targets: '#edge-' + i.toString(),
                    opacity: [0, 1],
                    easing: 'linear'
                }, i * animationDuration);
            }
        }

        this.timeLine.restart();
        this.timeLine.pause();
    }

    prepareBuildBinarySearchTree() {
        let animationDuration = 750;
        this.timeLine = anime.timeline({
            easing: 'easeOutExpo',
            duration: animationDuration,
            update: function (anim) {
                this.$timeRange.val(this.timeLine.progress);
            }.bind(this)
        });

        let nodes = this.array.map(function (value, index) {
            return {value: value, index: index, left: null, right: null, parent: null, depth: 0};
        });

        for (let i = 1; i < nodes.length; i++) {
            let current = nodes[0];
            while (true) {
                let side = nodes[i].value < current.value ? "left" : "right";
                if (current[side] === null) {
                    current[side] = nodes[i];
                    nodes[i].parent = current;
                    nodes[i].depth = current.depth + 1;
                    break;
                }
                current = current[side];
            }
        }

        let inorderIndex = 0;
        let maxDepth = 0;
        let assignInorderPositions = function (node) {
            if (node === null) {
                return;
            }

            assignInorderPositions(node.left);
            node.inorderIndex = inorderIndex++;
            maxDepth = Math.max(maxDepth, node.depth);
            assignInorderPositions(node.right);
        };
        assignInorderPositions(nodes[0]);

        let containerWidth = this.$visulContainer.width();
        let nodeSpacing = Math.max(this.blockWidth + 12, containerWidth / (nodes.length + 1));
        let treeWidth = nodeSpacing * (nodes.length + 1);
        let visualWidth = Math.max(containerWidth, treeWidth);
        let levelGap = 88;
        let treeTop = 24;
        let stagingTop = treeTop + (maxDepth + 1) * levelGap;
        let containerHeight = stagingTop + this.blockWidth + 24;

        this.$visulContainer.css({width: visualWidth + "px", height: containerHeight + "px"});
        this.$visulContainer.closest(".container-row").css({minHeight: containerHeight + "px", overflowX: "auto"});

        for (let i = 0; i < this.arrayBlocks.length; i++) {
            this.arrayBlocks[i].css({left: this.firstLeft + i * this.blockWidth + "px", top: stagingTop + "px", borderRadius: "0%"});
        }

        let positions = nodes.map(function (node) {
            return {
                left: ((node.inorderIndex + 1) * nodeSpacing) - this.blockWidth / 2 + (visualWidth - treeWidth) / 2,
                top: treeTop + node.depth * levelGap
            };
        }.bind(this));

        for (let i = 0; i < nodes.length; i++) {
            if (nodes[i].parent !== null) {
                this.addEdge(i, positions[i], positions[nodes[i].parent.index]);
            }
        }

        for (let i = 0; i < nodes.length; i++) {
            let node = nodes[i];
            let left = positions[i].left;
            let top = positions[i].top;

            this.timeLine.add({
                targets: "#" + this.arrayBlocks[i].attr("id"),
                left: left + "px",
                top: top + "px",
                backgroundColor: [this.colors.first, this.colors.normal],
                borderRadius: ["0%", "50%"],
                easing: "easeInOutQuad"
            }, i * animationDuration);

            if (node.parent !== null) {
                this.timeLine.add({
                    targets: "#edge-" + node.index.toString(),
                    opacity: [0, 1],
                    easing: "linear"
                }, i * animationDuration);
            }
        }

        this.timeLine.restart();
        this.timeLine.pause();
    }

    addEdge(id, childPosition, parentPosition) {
        let childLeft = childPosition.left;
        let parentLeft = parentPosition.left;
        let childTop = childPosition.top;
        let parentTop = parentPosition.top;
        let parentCenter = parentLeft + this.blockWidth / 2;
        let childCenter = childLeft + this.blockWidth / 2;
        let left = Math.min(parentCenter, childCenter);
        let width = Math.abs(childCenter - parentCenter);
        let top = parentTop + this.blockWidth;
        let height = childTop - top;
        let $edge = $("<div></div>");
        $edge.addClass("tree-edge");
        let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("viewBox", "0 0 " + width + " " + height);
        svg.setAttribute("preserveAspectRatio", "none");
        svg.setAttribute("aria-hidden", "true");
        let line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", (parentCenter - left).toString());
        line.setAttribute("y1", "0");
        line.setAttribute("x2", (childCenter - left).toString());
        line.setAttribute("y2", height.toString());
        svg.appendChild(line);
        $edge.append(svg);
        $edge.css("left", left.toString() + "px");
        $edge.css("top", top.toString() + "px");
        $edge.css("width", width.toString() + "px");
        $edge.css("height", height.toString() + "px");
        $edge.attr("id", "edge-" + id.toString());
        $edge.css("opacity", "0");
        this.$visulContainer.append($edge);
    }
}
