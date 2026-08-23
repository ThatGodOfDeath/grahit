class GraphRenderer {

    constructor(canvas) {

        this.canvas =
            canvas;

        this.ctx =
            canvas.getContext("2d");


        this.nodeRadius =
            24;


        /*
         * Camera / viewport
         */

        this.zoom =
            1;

        this.offsetX =
            0;

        this.offsetY =
            0;


        /*
         * Resize canvas.
         */

        this.resize();


        window.addEventListener(
            "resize",
            () => this.resize()
        );
    }


    /*
     * Resize canvas according
     * to its displayed size.
     */

    resize() {

        const rect =
            this.canvas.getBoundingClientRect();


        const dpr =
            window.devicePixelRatio || 1;


        this.canvas.width =
            rect.width * dpr;


        this.canvas.height =
            rect.height * dpr;


        this.ctx.setTransform(
            dpr,
            0,
            0,
            dpr,
            0,
            0
        );


        if (window.currentGraph) {

            this.draw(
                window.currentGraph
            );
        }
    }


    /*
     * Convert graph coordinates
     * into screen coordinates.
     */

    graphToScreen(
        x,
        y
    ) {

        return {

            x:
                x * this.zoom +
                this.offsetX,

            y:
                y * this.zoom +
                this.offsetY
        };
    }


    /*
     * Convert screen coordinates
     * into graph coordinates.
     */

    screenToGraph(
        x,
        y
    ) {

        return {

            x:
                (
                    x -
                    this.offsetX
                ) /
                this.zoom,

            y:
                (
                    y -
                    this.offsetY
                ) /
                this.zoom
        };
    }


    /*
     * Draw complete graph.
     */

    draw(graph) {

        if (!graph) {
            return;
        }


        const rect =
            this.canvas.getBoundingClientRect();


        const width =
            rect.width;

        const height =
            rect.height;


        /*
         * Clear viewport.
         */

        this.ctx.clearRect(
            0,
            0,
            width,
            height
        );


        /*
         * Edges first.
         *
         * Nodes are drawn afterward
         * so they appear above edges.
         */

        this.drawEdges(
            graph
        );


        this.drawNodes(
            graph
        );
    }


    /*
     * Draw all edges.
     */

    drawEdges(graph) {

        const ctx =
            this.ctx;


        for (
            const edge
            of graph.edges
        ) {

            const source =
                graph.getNode(
                    edge.source
                );


            const target =
                graph.getNode(
                    edge.target
                );


            if (
                !source ||
                !target
            ) {

                continue;
            }


            const sourceScreen =
                this.graphToScreen(
                    source.x,
                    source.y
                );


            const targetScreen =
                this.graphToScreen(
                    target.x,
                    target.y
                );


            /*
             * Selection state.
             */

            const selected =
                edge ===
                window.selectedEdge;


            /*
             * Hover state.
             */

            const hovered =
                edge ===
                window.hoveredEdge;


            /*
             * Default appearance.
             */

            let strokeStyle =
                "#6b7280";

            let lineWidth =
                2;


            /*
             * Hovered edge.
             */

            if (hovered) {

                strokeStyle =
                    "#2563eb";

                lineWidth =
                    3;
            }


            /*
             * Selected edge takes
             * priority over hover.
             */

            if (selected) {

                strokeStyle =
                    "#f59e0b";

                lineWidth =
                    4;
            }


            /*
             * Directed edge.
             */

            if (graph.directed) {

                this.drawArrow(
                    sourceScreen,
                    targetScreen,
                    strokeStyle,
                    lineWidth
                );
            }


            /*
             * Undirected edge.
             */

            else {

                ctx.beginPath();


                ctx.moveTo(
                    sourceScreen.x,
                    sourceScreen.y
                );


                ctx.lineTo(
                    targetScreen.x,
                    targetScreen.y
                );


                ctx.strokeStyle =
                    strokeStyle;


                ctx.lineWidth =
                    lineWidth;


                ctx.stroke();
            }


            /*
             * Draw edge weight.
             */

            if (
                graph.weighted &&
                edge.weight !== null &&
                edge.weight !== undefined
            ) {

                const midX =
                    (
                        sourceScreen.x +
                        targetScreen.x
                    ) / 2;


                const midY =
                    (
                        sourceScreen.y +
                        targetScreen.y
                    ) / 2;


                const text =
                    String(
                        edge.weight
                    );


                ctx.font =
                    "13px Arial";


                const textWidth =
                    ctx.measureText(
                        text
                    ).width;


                /*
                 * Background behind weight.
                 */

                ctx.fillStyle =
                    "#ffffff";


                ctx.fillRect(

                    midX -
                    textWidth / 2 -
                    4,

                    midY - 10,

                    textWidth + 8,

                    20
                );


                /*
                 * Weight text color.
                 */

                ctx.fillStyle =
                    selected
                        ? "#b45309"
                        : hovered
                            ? "#1d4ed8"
                            : "#111827";


                ctx.textAlign =
                    "center";


                ctx.textBaseline =
                    "middle";


                ctx.fillText(
                    text,
                    midX,
                    midY
                );
            }
        }
    }


    /*
     * Draw directed edge
     * with arrow head.
     */

    drawArrow(
        source,
        target,
        strokeStyle =
            "#6b7280",
        lineWidth =
            2
    ) {

        const ctx =
            this.ctx;


        const dx =
            target.x -
            source.x;


        const dy =
            target.y -
            source.y;


        const angle =
            Math.atan2(
                dy,
                dx
            );


        /*
         * Keep edge endpoints
         * outside node circles.
         */

        const radius =
            this.nodeRadius *
            this.zoom;


        const startX =
            source.x +
            Math.cos(angle) *
            radius;


        const startY =
            source.y +
            Math.sin(angle) *
            radius;


        const endX =
            target.x -
            Math.cos(angle) *
            radius;


        const endY =
            target.y -
            Math.sin(angle) *
            radius;


        /*
         * Edge line.
         */

        ctx.beginPath();


        ctx.moveTo(
            startX,
            startY
        );


        ctx.lineTo(
            endX,
            endY
        );


        ctx.strokeStyle =
            strokeStyle;


        ctx.lineWidth =
            lineWidth;


        ctx.stroke();


        /*
         * Arrow head.
         */

        const arrowSize =
            9;


        ctx.beginPath();


        ctx.moveTo(
            endX,
            endY
        );


        ctx.lineTo(

            endX -
            arrowSize *
            Math.cos(
                angle -
                Math.PI / 6
            ),

            endY -
            arrowSize *
            Math.sin(
                angle -
                Math.PI / 6
            )
        );


        ctx.lineTo(

            endX -
            arrowSize *
            Math.cos(
                angle +
                Math.PI / 6
            ),

            endY -
            arrowSize *
            Math.sin(
                angle +
                Math.PI / 6
            )
        );


        ctx.closePath();


        ctx.fillStyle =
            strokeStyle;


        ctx.fill();
    }


    /*
     * Draw all nodes.
     */

    drawNodes(graph) {

        const ctx =
            this.ctx;


        for (
            const node
            of graph.nodes
        ) {

            const screen =
                this.graphToScreen(
                    node.x,
                    node.y
                );


            const radius =
                this.nodeRadius *
                this.zoom;


            /*
             * Selection state.
             */

            const selected =
                node ===
                window.selectedNode;


            /*
             * Hover state.
             */

            const hovered =
                node ===
                window.hoveredNode;


            /*
             * Default appearance.
             */

            let fillStyle =
                "#2563eb";


            let strokeStyle =
                "#1e40af";


            let lineWidth =
                2;


            /*
             * Hovered node.
             */

            if (hovered) {

                fillStyle =
                    "#3b82f6";

                strokeStyle =
                    "#1d4ed8";

                lineWidth =
                    3;
            }


            /*
             * Selected node takes
             * priority over hover.
             */

            if (selected) {

                fillStyle =
                    "#f59e0b";

                strokeStyle =
                    "#b45309";

                lineWidth =
                    3;
            }


            /*
             * Hover ring.
             */

            if (
                hovered &&
                !selected
            ) {

                ctx.beginPath();


                ctx.arc(
                    screen.x,
                    screen.y,
                    radius + 5,
                    0,
                    Math.PI * 2
                );


                ctx.strokeStyle =
                    "#93c5fd";


                ctx.lineWidth =
                    2;


                ctx.stroke();
            }


            /*
             * Node body.
             */

            ctx.beginPath();


            ctx.arc(
                screen.x,
                screen.y,
                radius,
                0,
                Math.PI * 2
            );


            ctx.fillStyle =
                fillStyle;


            ctx.fill();


            ctx.strokeStyle =
                strokeStyle;


            ctx.lineWidth =
                lineWidth;


            ctx.stroke();


            /*
             * Node label.
             */

            ctx.fillStyle =
                "#ffffff";


            ctx.font =
                `${Math.max(
                    10,
                    14 * this.zoom
                )}px Arial`;


            ctx.textAlign =
                "center";


            ctx.textBaseline =
                "middle";


            ctx.fillText(
                node.label,
                screen.x,
                screen.y
            );
        }
    }


    /*
     * Reset camera position.
     *
     * IMPORTANT:
     *
     * Reset does NOT change zoom.
     *
     * It only moves the camera so
     * the current graph is centered.
     */

    resetView() {

        const graph =
            window.currentGraph;


        if (
            !graph ||
            graph.nodes.length === 0
        ) {

            return;
        }


        const rect =
            this.canvas.getBoundingClientRect();


        let minX =
            Infinity;

        let maxX =
            -Infinity;


        let minY =
            Infinity;

        let maxY =
            -Infinity;


        for (
            const node
            of graph.nodes
        ) {

            minX =
                Math.min(
                    minX,
                    node.x
                );


            maxX =
                Math.max(
                    maxX,
                    node.x
                );


            minY =
                Math.min(
                    minY,
                    node.y
                );


            maxY =
                Math.max(
                    maxY,
                    node.y
                );
        }


        /*
         * Find graph center.
         */

        const graphCenterX =
            (
                minX +
                maxX
            ) / 2;


        const graphCenterY =
            (
                minY +
                maxY
            ) / 2;


        /*
         * Keep this.zoom unchanged.
         *
         * Only change camera position.
         */

        this.offsetX =
            rect.width / 2 -
            graphCenterX *
            this.zoom;


        this.offsetY =
            rect.height / 2 -
            graphCenterY *
            this.zoom;


        this.draw(
            graph
        );
    }


    /*
     * Fit graph into canvas.
     *
     * Fit changes BOTH:
     *
     * 1. Zoom
     * 2. Camera position
     */

    fitGraph(graph) {

        if (
            !graph ||
            graph.nodes.length === 0
        ) {

            return;
        }


        const rect =
            this.canvas.getBoundingClientRect();


        let minX =
            Infinity;

        let maxX =
            -Infinity;


        let minY =
            Infinity;

        let maxY =
            -Infinity;


        /*
         * Find graph bounds.
         */

        for (
            const node
            of graph.nodes
        ) {

            minX =
                Math.min(
                    minX,
                    node.x
                );


            maxX =
                Math.max(
                    maxX,
                    node.x
                );


            minY =
                Math.min(
                    minY,
                    node.y
                );


            maxY =
                Math.max(
                    maxY,
                    node.y
                );
        }


        /*
         * Graph dimensions.
         */

        const graphWidth =
            Math.max(
                maxX - minX,
                1
            );


        const graphHeight =
            Math.max(
                maxY - minY,
                1
            );


        /*
         * Canvas padding.
         */

        const padding =
            120;


        /*
         * Calculate zoom required
         * to fit the graph.
         */

        this.zoom =
            Math.min(

                (
                    rect.width -
                    padding
                ) /
                graphWidth,

                (
                    rect.height -
                    padding
                ) /
                graphHeight
            );


        /*
         * Prevent extreme zoom.
         */

        this.zoom =
            Math.max(
                0.2,

                Math.min(
                    this.zoom,
                    3
                )
            );


        /*
         * Graph center.
         */

        const graphCenterX =
            (
                minX +
                maxX
            ) / 2;


        const graphCenterY =
            (
                minY +
                maxY
            ) / 2;


        /*
         * Center graph in canvas.
         */

        this.offsetX =
            rect.width / 2 -
            graphCenterX *
            this.zoom;


        this.offsetY =
            rect.height / 2 -
            graphCenterY *
            this.zoom;


        this.draw(
            graph
        );
    }
}