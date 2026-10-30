class Animation {
    colors = {
        sorted: "#d8f36a",
        normal: "#6e8a80",
        first: "#b9efc5",
        second: "#f0745c",
    };

    constructor() {
        this.array = [];
        this.translate = window.visul2Translate;
        this.$visulContainer = $("#visul-container");
        this.blockWidth = 50;
        this.minSize = 2;
        this.maxSize = 15;
        this.minValue = 0;
        this.maxValue = 999;
        this.barBottom = 48;
        this.barHeadroom = 30;
        this.$customArrayInput = $("#custom-array-input");
        this.$customArrayButton = $("#custom-array-button");
        this.$customArrayError = $("#custom-array-error");
        this.arrayBlocks = [];
        this.timeLine = null;
        this.$timeRange = $("#time-range");
        this.$startButton = $("#start-button");
        this.$restartButton = $("#restart-button");
        this.$pauseButton = $("#pause-button");
        this.$exportSlidesButton = $("#export-slides-button");
    }

    bindControls() {
        this.$startButton.click(function () {
            this.timeLine.play();
            this.activateButton(this.$startButton);
            this.deactivateButton(this.$pauseButton);
        }.bind(this));

        this.$restartButton.click(function () {
            this.timeLine.restart();
            this.activateButton(this.$startButton);
            this.deactivateButton(this.$pauseButton);
        }.bind(this));

        this.$pauseButton.click(function () {
            this.timeLine.pause();
            this.activateButton(this.$pauseButton);
            this.deactivateButton(this.$startButton);
        }.bind(this));

        this.$timeRange.on("input", function () {
            this.timeLine.seek(this.timeLine.duration * (this.$timeRange.val() / 100));
        }.bind(this));

        this.$exportSlidesButton.off("click").on("click", this.exportSlides.bind(this));
        this.$timeRange.val(0);
        this.activateButton(this.$pauseButton);
    }

    async exportSlides() {
        if (!this.timeLine || !this.timeLine.children.length || !this.timeLine.duration) {
            window.alert(this.translate("slidesUnavailable"));
            return;
        }

        const wasPlaying = !this.timeLine.paused;
        const currentTime = this.timeLine.currentTime;
        const childEndTimes = this.timeLine.children
            .map(function (child) {
                return child.timelineOffset + child.duration;
            })
            .filter(function (time) {
                return isFinite(time) && time > 0;
            })
            .sort(function (a, b) {
                return a - b;
            });
        const checkpoints = [];
        for (const endTime of childEndTimes) {
            const previous = checkpoints[checkpoints.length - 1];
            if (previous !== undefined && endTime - previous < 50) {
                checkpoints[checkpoints.length - 1] = endTime;
            } else {
                checkpoints.push(endTime);
            }
        }
        if (!checkpoints.length || this.timeLine.duration - checkpoints[checkpoints.length - 1] >= 50) {
            checkpoints.push(this.timeLine.duration);
        } else {
            checkpoints[checkpoints.length - 1] = this.timeLine.duration;
        }

        const html2canvas = window.html2canvas;
        const jsPDF = window.jspdf && window.jspdf.jsPDF;
        if (!html2canvas || !jsPDF) {
            const error = new Error("PDF export libraries did not load.");
            console.error("Failed to export simulation slides as PDF.", error);
            window.alert(this.translate("slidesExportFailed"));
            return;
        }

        const sourceWidth = Math.max(this.$visulContainer[0].scrollWidth, this.$visulContainer[0].clientWidth);
        const sourceHeight = Math.max(this.$visulContainer[0].scrollHeight, this.$visulContainer[0].clientHeight);
        const slideWidth = 1047;
        const slideHeight = 590;
        const slideWidthPx = 1122;
        const slideHeightPx = 794;
        const slideTimes = [0].concat(checkpoints);
        const pdf = new jsPDF({orientation: "landscape", unit: "mm", format: "a4"});
        const stage = document.createElement("div");
        let pdfUrl = null;
        let downloadLink = null;
        stage.setAttribute("aria-hidden", "true");
        stage.style.cssText = "position:fixed;left:0;top:0;z-index:-1;width:" + slideWidthPx + "px;";

        try {
            this.timeLine.pause();
            this.$exportSlidesButton.prop("disabled", true).text(this.translate("exportSlidesInProgress"));
            document.body.appendChild(stage);

            if (document.fonts && document.fonts.ready) {
                await document.fonts.ready;
            }

            for (let i = 0; i < slideTimes.length; i++) {
                this.timeLine.seek(slideTimes[i]);
                const slide = document.createElement("section");
                slide.style.cssText = "box-sizing:border-box;width:" + slideWidthPx + "px;height:" + slideHeightPx +
                    "px;padding:38px;position:relative;background:#fff;color:#14211f;font-family:'Space Grotesk',sans-serif;";

                const heading = document.createElement("h1");
                heading.textContent = document.title;
                heading.style.cssText = "height:36px;margin:0 0 16px;font-size:29px;font-weight:600;line-height:36px;";

                const frame = document.createElement("div");
                frame.style.cssText = "position:relative;width:" + slideWidth + "px;height:" + slideHeight +
                    "px;overflow:hidden;background-color:#edf2ec;background-image:linear-gradient(rgba(20,33,31,.045) 1px,transparent 1px),linear-gradient(90deg,rgba(20,33,31,.045) 1px,transparent 1px);background-size:36px 36px;";
                slide.append(heading, frame);
                stage.appendChild(slide);

                const visual = this.$visulContainer[0].cloneNode(true);
                visual.removeAttribute("id");
                visual.style.width = sourceWidth + "px";
                visual.style.height = sourceHeight + "px";
                visual.style.minHeight = "0";
                visual.style.position = "relative";
                visual.style.overflow = "visible";
                visual.style.transform = "none";
                frame.appendChild(visual);

                const visualBounds = visual.getBoundingClientRect();
                const contentBounds = Array.from(visual.querySelectorAll("*"))
                    .map(function (element) {
                        const bounds = element.getBoundingClientRect();
                        return {
                            left: bounds.left - visualBounds.left,
                            top: bounds.top - visualBounds.top,
                            right: bounds.right - visualBounds.left,
                            bottom: bounds.bottom - visualBounds.top
                        };
                    })
                    .filter(function (bounds) {
                        return bounds.right > bounds.left || bounds.bottom > bounds.top;
                    })
                    .reduce(function (result, bounds) {
                        return {
                            left: Math.min(result.left, bounds.left),
                            top: Math.min(result.top, bounds.top),
                            right: Math.max(result.right, bounds.right),
                            bottom: Math.max(result.bottom, bounds.bottom)
                        };
                    }, {
                        left: Infinity,
                        top: Infinity,
                        right: -Infinity,
                        bottom: -Infinity
                    });
                const contentWidth = contentBounds.right - contentBounds.left;
                const contentHeight = contentBounds.bottom - contentBounds.top;
                if (!isFinite(contentWidth) || !isFinite(contentHeight) || contentWidth <= 0 || contentHeight <= 0) {
                    throw new Error("The simulation visualization has no measurable content.");
                }

                const scale = Math.min(slideWidth / contentWidth, slideHeight / contentHeight);
                visual.style.position = "absolute";
                visual.style.left = ((slideWidth - contentWidth * scale) / 2 - contentBounds.left * scale) + "px";
                visual.style.top = ((slideHeight - contentHeight * scale) / 2 - contentBounds.top * scale) + "px";
                visual.style.transform = "scale(" + scale + ")";
                visual.style.transformOrigin = "top left";

                const footer = document.createElement("footer");
                footer.textContent = this.translate("slideNumber", {
                    current: i + 1,
                    total: slideTimes.length
                });
                footer.style.cssText = "position:absolute;right:38px;bottom:16px;color:#66716c;font:13px 'IBM Plex Mono',monospace;";

                slide.appendChild(footer);

                const canvas = await html2canvas(slide, {
                    backgroundColor: "#ffffff",
                    scale: 1.5,
                    width: slideWidthPx,
                    height: slideHeightPx,
                    windowWidth: slideWidthPx,
                    windowHeight: slideHeightPx,
                    scrollX: 0,
                    scrollY: 0,
                    useCORS: true
                });
                if (i > 0) {
                    pdf.addPage();
                }
                pdf.addImage(canvas.toDataURL("image/jpeg", 0.95), "JPEG", 0, 0, 297, 210);
                canvas.width = 0;
                canvas.height = 0;
                slide.remove();
            }

            const filename = document.title.trim().replace(/[\\/:*?"<>|]+/g, "-") + ".pdf";
            const pdfObjectUrl = URL.createObjectURL(pdf.output("blob"));
            pdfUrl = pdfObjectUrl;
            downloadLink = document.createElement("a");
            downloadLink.href = pdfObjectUrl;
            downloadLink.download = filename;
            downloadLink.style.display = "none";
            document.body.appendChild(downloadLink);
            downloadLink.click();
            downloadLink.remove();
            window.setTimeout(function () {
                URL.revokeObjectURL(pdfObjectUrl);
            }, 1000);
            pdfUrl = null;
        } catch (error) {
            console.error("Failed to export simulation slides as PDF.", error);
            window.alert(this.translate("slidesExportFailed"));
        } finally {
            if (downloadLink) {
                downloadLink.remove();
            }
            if (pdfUrl) {
                URL.revokeObjectURL(pdfUrl);
            }
            stage.remove();
            this.timeLine.seek(currentTime);
            if (wasPlaying) {
                this.timeLine.play();
            }
            this.$timeRange.val(this.timeLine.progress);
            this.$exportSlidesButton.prop("disabled", false).html(
                '<i class="fa fa-file-pdf-o" aria-hidden="true"></i> ' + this.translate("exportSlides")
            );
        }
    }

    activateButton($button) {
        anime({
            targets: "#" + $button.attr("id"),
            backgroundColor: "#d8f36a",
            borderColor: "#d8f36a",
            color: "#14211f",
            duration: 200
        })
    }

    deactivateButton($button) {
        anime({
            targets: "#" + $button.attr("id"),
            backgroundColor: "#14211f",
            borderColor: "#14211f",
            color: "#fff",
            duration: 200
        })
    }

    loadOrPrepareArray() {
        let params = new URLSearchParams(decodeURIComponent(window.location.hash.substr(1)));
        let loaded = null;
        if (params.has("array")) {
            try {
                loaded = JSON.parse(params.get("array"));
            } catch (e) {
                loaded = null;
            }
        }

        if (this.isValidArray(loaded)) {
            this.array = loaded;
        } else {
            this.prepareRandomArray(10);
        }
    }

    isValidArray(array) {
        return Array.isArray(array)
            && array.length >= this.minSize && array.length <= this.maxSize
            && array.every(function (v) {
                return typeof v === "number" && isFinite(v) && v >= this.minValue && v <= this.maxValue;
            }, this);
    }

    parseArrayText(text) {
        let tokens = text.trim().split(/[\s,;]+/).filter(function (t) { return t !== ""; });
        if (tokens.length < this.minSize || tokens.length > this.maxSize) {
            return {error: this.translate("arraySize", {min: this.minSize, max: this.maxSize})};
        }

        let array = [];
        for (let token of tokens) {
            if (!/^\d+(\.\d+)?$/.test(token)) {
                return {error: this.translate("invalidNumber", {value: token})};
            }

            let value = Math.round(parseFloat(token) * 100) / 100;
            if (value < this.minValue || value > this.maxValue) {
                return {error: this.translate("outOfRange", {value: token, min: this.minValue, max: this.maxValue})};
            }

            array.push(value);
        }

        return {array: array};
    }

    bindCustomArray(onChange) {
        let apply = function () {
            let result = this.parseArrayText(this.$customArrayInput.val());
            if (result.error) {
                this.$customArrayError.text(result.error);
                return;
            }

            this.$customArrayError.text("");
            this.array = result.array;
            onChange();
        }.bind(this);

        this.$customArrayButton.click(apply);
        this.$customArrayInput.on("keydown", function (e) {
            if (e.key === "Enter") {
                e.preventDefault();
                apply();
            }
        });
    }

    getBarHeight(value) {
        let available = Math.max(60, this.$visulContainer.height() - this.barBottom - this.barHeadroom);
        let maxValue = Math.max(1, ...this.array);
        return Math.max(3, value / maxValue * available);
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

        this.$customArrayInput.val(this.array.join(" "));
        this.$customArrayError.text("");

        this.activateButton(this.$pauseButton);
        this.deactivateButton(this.$startButton);
    }

    prepareSortingBlock(number, left, orderId) {
        let $sortingBlock = $("<div></div>");
        $sortingBlock.addClass("sorting-block");
        $sortingBlock.css("height", this.getBarHeight(number).toString() + "px");
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
        if (number.toString().length > 4) {
            $sortingNumber.addClass("sorting-number-long");
        }
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

    animateMarkSortedAll() {
        for (let i = 0; i < this.array.length; i++) {
            this.animateMarkSorted(i);
        }
    }
}
