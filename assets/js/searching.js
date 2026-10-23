class Searching extends Animation {
    constructor() {
        super();
        this.pointerCurrentId = "searching-pointer-current";
        this.pointerBestId = "searching-pointer-best";
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

    animateMovePointer(pointerId, index) {
        let $pointer = this.$visulContainer.find("#" + pointerId);
        let pointerTop = this.$visulContainer.height() - 48 - parseFloat(this.arrayBlocks[index].css("height")) - $pointer.outerHeight() - 4;

        this.timeLine.add({
            targets: "#" + pointerId,
            left: this.getBlockCenter(index),
            ...(pointerId === this.pointerCurrentId ? {top: pointerTop} : {}),
            easing: "easeInOutQuad"
        });
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
}
