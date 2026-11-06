class GeometryAlgorithms extends Animation {
    constructor() {
        super();
        this.$pointsInput = $("#graham-points-input");
        this.$searchResult = $("#search-result");
        this.svgNamespace = "http://www.w3.org/2000/svg";
        this.maxPoints = 16;
        this.maxCoordinate = 12;
        this.svgWidth = 780;
        this.svgHeight = 590;
        this.originX = 310;
        this.originY = 295;
        this.scale = 18.5;
    }

    prepareGrahamScan(input) {
        const points = this.parsePoints(input);
        if (!points) {
            this.showInputError(this.translate("invalidGrahamPoints", {
                maxPoints: this.maxPoints,
                maxCoordinate: this.maxCoordinate
            }));
            return false;
        }

        const pivot = points.reduce(function (lowest, point) {
            return point.y < lowest.y || (point.y === lowest.y && point.x < lowest.x) ? point : lowest;
        });
        const orientation = function (first, second, third) {
            return (second.x - first.x) * (third.y - first.y) -
                (second.y - first.y) * (third.x - first.x);
        };
        const distanceSquared = function (first, second) {
            const dx = first.x - second.x;
            const dy = first.y - second.y;
            return dx * dx + dy * dy;
        };
        const sortedPoints = points
            .filter(function (point) {
                return point !== pivot;
            })
            .sort(function (first, second) {
                const turn = orientation(pivot, first, second);
                return turn === 0
                    ? distanceSquared(pivot, first) - distanceSquared(pivot, second)
                    : turn > 0 ? -1 : 1;
            });

        const frames = [];
        const snapshot = function (caption, stack, candidate, comparison, popped, rays, finalHull) {
            frames.push({
                caption: caption,
                stack: stack.slice(),
                candidate: candidate || null,
                comparison: comparison || null,
                popped: popped || null,
                rays: rays || false,
                finalHull: finalHull || false
            });
        };
        snapshot(this.translate("grahamStart", {count: points.length}), []);
        snapshot(this.translate("grahamPivot", {point: pivot.id, x: pivot.x, y: pivot.y}), [pivot]);
        snapshot(
            this.translate("grahamSorted", {
                points: [pivot].concat(sortedPoints).map(function (point) {
                    return point.id;
                }).join(" → ")
            }),
            [pivot],
            null,
            null,
            null,
            true
        );

        const stack = [pivot];
        if (sortedPoints.length) {
            stack.push(sortedPoints[0]);
            snapshot(this.translate("grahamPush", {
                point: sortedPoints[0].id,
                size: stack.length
            }), stack);
        }
        if (sortedPoints.length > 1) {
            stack.push(sortedPoints[1]);
            snapshot(this.translate("grahamPush", {
                point: sortedPoints[1].id,
                size: stack.length
            }), stack);
        }

        for (let index = 2; index < sortedPoints.length; index++) {
            const candidate = sortedPoints[index];
            while (stack.length >= 2) {
                const first = stack[stack.length - 2];
                const second = stack[stack.length - 1];
                const turn = orientation(first, second, candidate);
                snapshot(this.translate("grahamTurn", {
                    first: first.id,
                    second: second.id,
                    candidate: candidate.id,
                    value: turn,
                    direction: turn > 0
                        ? this.translate("grahamCounterClockwise")
                        : turn < 0
                            ? this.translate("grahamClockwise")
                            : this.translate("grahamCollinear")
                }), stack, candidate, [first, second, candidate]);
                if (turn > 0) {
                    break;
                }

                const removedPoint = stack.pop();
                snapshot(this.translate("grahamPop", {
                    point: removedPoint.id,
                    candidate: candidate.id,
                    size: stack.length
                }), stack, candidate, [first, second, candidate], removedPoint);
            }

            stack.push(candidate);
            snapshot(this.translate("grahamPush", {
                point: candidate.id,
                size: stack.length
            }), stack, candidate);
        }

        snapshot(this.translate("grahamResult", {
            points: stack.map(function (point) {
                return point.id;
            }).join(" → "),
            count: stack.length
        }), stack, null, null, null, false, true);

        const $visualization = $("<div></div>").addClass("geometry-visualization");
        const svg = document.createElementNS(this.svgNamespace, "svg");
        svg.setAttribute("class", "graham-coordinate-plane");
        svg.setAttribute("viewBox", "0 0 " + this.svgWidth + " " + this.svgHeight);
        svg.setAttribute("role", "img");
        svg.setAttribute("aria-label", this.translate("grahamPlotLabel", {count: points.length}));
        this.drawCoordinatePlane(svg);
        this.drawHullEdges(svg, frames);
        this.drawPoints(svg, points);
        this.drawHullPointOutlines(svg, points, pivot, frames);
        this.updateHullEdges(0);
        this.updateHullPointOutlines(0);

        const $details = $("<aside></aside>")
            .addClass("graham-details")
            .attr("aria-label", this.translate("grahamLegendLabel"));
        $details.append(
            $("<h2></h2>").text(this.translate("grahamLegendTitle")),
            $("<p></p>").addClass("graham-step" + " js-graham-step").attr("aria-live", "polite"),
            $("<ul></ul>").append(
                this.createLegendItem("pivot", this.translate("grahamLegendPivot")),
                this.createLegendItem("stack", this.translate("grahamLegendHull")),
                this.createLegendItem("candidate", this.translate("grahamLegendCandidate")),
                this.createLegendItem("popped", this.translate("grahamLegendPopped"))
            ),
            $("<p></p>").addClass("graham-orientation-note")
                .text(this.translate("grahamOrientationNote"))
        );
        this.$stepDescription = $details.find(".js-graham-step");
        this.stepCaptions = frames.map(function (frame) {
            return frame.caption;
        });
        this.$stepDescription.text(frames[0].caption);
        $visualization.append(svg, $details);

        this.$visulContainer.empty().css({width: "100%", height: "auto"});
        this.$visulContainer.append($visualization);
        this.$timeRange.val(0);
        this.$searchResult.text(frames[0].caption);

        const frameElements = frames.map(function (frame) {
            return this.drawFrame(svg, pivot, sortedPoints, frame);
        }.bind(this));
        frameElements[0].setAttribute("opacity", "1");

        const transitionDuration = 350;
        const transitionGap = 1;
        this.timeLine = anime.timeline({
            easing: "easeInOutQuad",
            update: function () {
                const progress = this.timeLine.progress;
                this.$timeRange.val(progress);
                this.updateStepCaption(progress);
            }.bind(this)
        });

        for (let index = 0; index < frameElements.length; index++) {
            if (index > 0) {
                this.timeLine.add({
                    targets: frameElements[index - 1],
                    opacity: 0,
                    duration: transitionGap
                });
            }
            this.timeLine.add({
                targets: frameElements[index],
                opacity: 1,
                duration: transitionDuration
            });
        }

        this.timeLine.restart();
        this.timeLine.pause();
        this.currentInput = String(input).trim();
        return true;
    }

    randomizePoints() {
        const pointCount = Number($("#graham-point-count-input").val());
        if (!Number.isInteger(pointCount) || pointCount < 3 || pointCount > this.maxPoints) {
            this.showInputError(this.translate("invalidGrahamPointCount", {
                maxPoints: this.maxPoints
            }));
            return false;
        }

        const candidates = [];
        for (let x = -this.maxCoordinate; x <= this.maxCoordinate; x++) {
            for (let y = -this.maxCoordinate; y <= this.maxCoordinate; y++) {
                candidates.push({x: x, y: y});
            }
        }
        for (let index = candidates.length - 1; index > 0; index--) {
            const randomIndex = Math.floor(Math.random() * (index + 1));
            [candidates[index], candidates[randomIndex]] = [candidates[randomIndex], candidates[index]];
        }

        const input = candidates.slice(0, pointCount).map(function (point) {
            return point.x + ", " + point.y;
        }).join("; ");
        this.$pointsInput.val(input);
        return this.prepareGrahamScan(input);
    }

    parsePoints(input) {
        const tokens = (input || "").trim().split(/\s*;\s*/).filter(Boolean);
        if (tokens.length < 3 || tokens.length > this.maxPoints) {
            return null;
        }

        const points = [];
        const coordinates = new Set();
        for (let index = 0; index < tokens.length; index++) {
            const match = tokens[index].match(/^\s*(-?\d+)\s*,\s*(-?\d+)\s*$/);
            if (!match) {
                return null;
            }
            const x = Number(match[1]);
            const y = Number(match[2]);
            if (Math.abs(x) > this.maxCoordinate || Math.abs(y) > this.maxCoordinate) {
                return null;
            }
            const key = x + "," + y;
            if (coordinates.has(key)) {
                return null;
            }
            coordinates.add(key);
            points.push({id: "P" + (index + 1), x: x, y: y});
        }
        return points;
    }

    drawCoordinatePlane(svg) {
        const grid = this.createSvgElement("g", {"aria-hidden": "true"});
        for (let coordinate = -this.maxCoordinate; coordinate <= this.maxCoordinate; coordinate += 2) {
            const x = this.toSvgX(coordinate);
            const y = this.toSvgY(coordinate);
            grid.appendChild(this.createSvgElement("line", {
                x1: x,
                y1: this.toSvgY(-this.maxCoordinate),
                x2: x,
                y2: this.toSvgY(this.maxCoordinate),
                class: coordinate === 0 ? "graham-axis" : "graham-grid-line"
            }));
            grid.appendChild(this.createSvgElement("line", {
                x1: this.toSvgX(-this.maxCoordinate),
                y1: y,
                x2: this.toSvgX(this.maxCoordinate),
                y2: y,
                class: coordinate === 0 ? "graham-axis" : "graham-grid-line"
            }));
            if (coordinate !== 0) {
                grid.appendChild(this.createSvgElement("text", {
                    x: x,
                    y: this.originY + 20,
                    class: "graham-axis-label",
                    "text-anchor": "middle"
                }, coordinate.toString()));
                grid.appendChild(this.createSvgElement("text", {
                    x: this.originX - 12,
                    y: y + 4,
                    class: "graham-axis-label",
                    "text-anchor": "end"
                }, coordinate.toString()));
            }
        }
        grid.appendChild(this.createSvgElement("text", {
            x: this.originX + 8,
            y: this.originY + 17,
            class: "graham-axis-label"
        }, "0"));
        grid.appendChild(this.createSvgElement("text", {
            x: this.toSvgX(this.maxCoordinate) + 10,
            y: this.originY + 4,
            class: "graham-axis-title"
        }, "x"));
        grid.appendChild(this.createSvgElement("text", {
            x: this.originX - 6,
            y: this.toSvgY(this.maxCoordinate) - 12,
            class: "graham-axis-title",
            "text-anchor": "end"
        }, "y"));
        svg.appendChild(grid);
    }

    drawPoints(svg, points) {
        const group = this.createSvgElement("g", {
            class: "graham-static-points",
            "aria-hidden": "true"
        });
        points.forEach(function (point) {
            const position = this.pointToSvg(point);
            const marker = this.createSvgElement("circle", {
                cx: position.x,
                cy: position.y,
                r: 6,
                class: "graham-point"
            });
            marker.appendChild(this.createSvgElement("title", {}, point.id + " (" + point.x + ", " + point.y + ")"));
            group.appendChild(marker);
            group.appendChild(this.createSvgElement("text", {
                x: position.x + 10,
                y: position.y - 10,
                class: "graham-point-label"
            }, point.id));
        }.bind(this));
        svg.appendChild(group);
    }

    drawHullEdges(svg, frames) {
        const edgeElements = new Map();
        this.hullEdgeStates = frames.map(function (frame) {
            const edgeKeys = [];
            for (let index = 1; index < frame.stack.length; index++) {
                edgeKeys.push(this.ensureHullEdge(edgeElements, frame.stack[index - 1], frame.stack[index]));
            }
            if (frame.finalHull && frame.stack.length > 2) {
                edgeKeys.push(this.ensureHullEdge(
                    edgeElements,
                    frame.stack[frame.stack.length - 1],
                    frame.stack[0]
                ));
            }
            return new Set(edgeKeys);
        }.bind(this));
        this.hullEdgeElements = edgeElements;
        const edgeGroup = this.createSvgElement("g", {
            class: "graham-hull-edges",
            "aria-hidden": "true"
        });
        edgeElements.forEach(function (element) {
            edgeGroup.appendChild(element);
        });
        svg.appendChild(edgeGroup);
    }

    drawHullPointOutlines(svg, points, pivot, frames) {
        const pointElements = new Map();
        points.forEach(function (point) {
            const position = this.pointToSvg(point);
            pointElements.set(point.id, this.createSvgElement("circle", {
                cx: position.x,
                cy: position.y,
                r: 9,
                class: point === pivot
                    ? "graham-point-outline is-pivot"
                    : "graham-point-outline is-in-stack",
                opacity: 0
            }));
        }.bind(this));

        this.hullPointStates = frames.map(function (frame) {
            return new Set(frame.stack.map(function (point) {
                return point.id;
            }));
        });
        this.hullPointElements = pointElements;
        const group = this.createSvgElement("g", {
            class: "graham-hull-points",
            "aria-hidden": "true"
        });
        pointElements.forEach(function (element) {
            group.appendChild(element);
        });
        svg.appendChild(group);
    }

    updateHullPointOutlines(frameIndex) {
        if (!this.hullPointStates || !this.hullPointElements) {
            return;
        }
        const activePoints = this.hullPointStates[frameIndex];
        this.hullPointElements.forEach(function (element, pointId) {
            if ((element.getAttribute("opacity") === "1") !== activePoints.has(pointId)) {
                element.setAttribute("opacity", activePoints.has(pointId) ? "1" : "0");
            }
        });
    }

    ensureHullEdge(edgeElements, first, second) {
        const key = [first.id, second.id].sort().join(":");
        if (!edgeElements.has(key)) {
            const firstPosition = this.pointToSvg(first);
            const secondPosition = this.pointToSvg(second);
            edgeElements.set(key, this.createSvgElement("line", {
                x1: firstPosition.x,
                y1: firstPosition.y,
                x2: secondPosition.x,
                y2: secondPosition.y,
                class: "graham-hull-line",
                opacity: 0
            }));
        }
        return key;
    }

    updateHullEdges(frameIndex) {
        if (!this.hullEdgeStates || !this.hullEdgeElements) {
            return;
        }
        const activeEdges = this.hullEdgeStates[frameIndex];
        this.hullEdgeElements.forEach(function (element, key) {
            if ((element.getAttribute("opacity") === "1") !== activeEdges.has(key)) {
                element.setAttribute("opacity", activeEdges.has(key) ? "1" : "0");
            }
        });
    }

    drawFrame(svg, pivot, sortedPoints, frame) {
        const group = this.createSvgElement("g", {
            class: "graham-frame",
            opacity: 0,
            "aria-hidden": "true"
        });
        if (frame.rays) {
            sortedPoints.forEach(function (point, index) {
                const end = this.pointToSvg(point);
                group.appendChild(this.createSvgElement("line", {
                    x1: this.toSvgX(pivot.x),
                    y1: this.toSvgY(pivot.y),
                    x2: end.x,
                    y2: end.y,
                    class: "graham-polar-ray"
                }));
                group.appendChild(this.createSvgElement("text", {
                    x: end.x + 8,
                    y: end.y - 9,
                    class: "graham-order-label"
                }, (index + 1).toString()));
            }.bind(this));
        }
        if (frame.comparison) {
            const comparisonPoints = frame.comparison.map(function (point) {
                return this.pointToSvg(point);
            }.bind(this));
            group.appendChild(this.createSvgElement("polyline", {
                points: comparisonPoints.map(function (point) {
                    return point.x + "," + point.y;
                }).join(" "),
                class: "graham-comparison"
            }));
        }

        const highlightedPoint = frame.popped || frame.candidate;
        if (highlightedPoint) {
            const position = this.pointToSvg(highlightedPoint);
            group.appendChild(this.createSvgElement("circle", {
                cx: position.x,
                cy: position.y,
                r: 8,
                class: frame.popped ? "graham-point is-popped" : "graham-point is-candidate"
            }));
        }

        group.appendChild(this.createSvgElement("text", {
            x: 557,
            y: 58,
            class: "graham-canvas-title"
        }, this.translate("grahamCanvasTitle")));
        group.appendChild(this.createSvgElement("text", {
            x: 557,
            y: 83,
            class: "graham-canvas-caption"
        }, frame.comparison
            ? this.translate("grahamTurnValue", {
                value: this.orientation(frame.comparison[0], frame.comparison[1], frame.comparison[2])
            })
            : frame.finalHull
                ? this.translate("grahamHullSize", {count: frame.stack.length})
                : this.translate("grahamStackSize", {count: frame.stack.length})));
        svg.appendChild(group);
        return group;
    }

    orientation(first, second, third) {
        return (second.x - first.x) * (third.y - first.y) -
            (second.y - first.y) * (third.x - first.x);
    }

    pointToSvg(point) {
        return {x: this.toSvgX(point.x), y: this.toSvgY(point.y)};
    }

    toSvgX(x) {
        return this.originX + x * this.scale;
    }

    toSvgY(y) {
        return this.originY - y * this.scale;
    }

    createLegendItem(className, label) {
        return $("<li></li>").append(
            $("<span></span>").addClass("graham-legend-marker " + className),
            $("<span></span>").text(label)
        );
    }

    createSvgElement(tagName, attributes, text) {
        const element = document.createElementNS(this.svgNamespace, tagName);
        Object.keys(attributes).forEach(function (name) {
            element.setAttribute(name, attributes[name]);
        });
        if (text !== undefined) {
            element.textContent = text;
        }
        return element;
    }

    updateStepCaption(progress) {
        if (!this.stepCaptions || !this.stepCaptions.length) {
            return;
        }
        const percentage = Math.max(0, Math.min(100, Number(progress)));
        const frameIndex = Math.round(percentage / 100 * (this.stepCaptions.length - 1));
        this.updateHullEdges(frameIndex);
        this.updateHullPointOutlines(frameIndex);
        this.$searchResult.text(this.stepCaptions[frameIndex]);
        this.$stepDescription.text(this.stepCaptions[frameIndex]);
    }

    showInputError(message) {
        if (this.timeLine) {
            this.timeLine.pause();
        }
        this.$visulContainer.empty().css({width: "100%", height: ""});
        this.$timeRange.val(0);
        this.$searchResult.text(message);
        this.stepCaptions = [];
        this.$stepDescription = null;
        this.currentInput = null;
        this.timeLine = anime.timeline();
    }
}
