class Searching extends Animation {
    constructor() {
        super();
    }

    prepareFindMin() {
        this.timeLine = anime.timeline({
            easing: 'easeOutExpo',
            duration: 750,
            update: function (anim) {
                this.$timeRange.val(this.timeLine.progress);
            }.bind(this)
        });

        let minVal = this.array[0];
        let minInd = 0;
        this.animateMark([0], [this.colors.second]);
        for (let j = 1; j < this.array.length; j++) {
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

        let maxVal = this.array[0];
        let maxInd = 0;
        this.animateMark([0], [this.colors.second]);
        for (let j = 1; j < this.array.length; j++) {
            this.animateMark([j], [this.colors.first]);
            if (this.array[j] > maxVal) {
                this.animateLeave([maxInd]);
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
