class GraphInteraction {

    constructor(
        canvas,
        renderer
    ) {

        this.canvas =
            canvas;

        this.renderer =
            renderer;


        /*
         * Selection state
         */

        this.selectedNode =
            null;

        this.selectedEdge =
            null;


        /*
         * Hover state
         */

        this.hoveredNode =
            null;

        this.hoveredEdge =
            null;


        window.hoveredNode =
            null;

        window.hoveredEdge =
            null;


        /*
         * Current interaction mode.
         *
         * select
         * add-node
         * add-edge
         * delete
         */

        this.mode =
            "select";


        /*
         * Temporary node used
         * while creating an edge.
         */

        this.edgeStartNode =
            null;


        /*
         * Interaction state
         */

        this.draggingNode =
            null;

        this.isPanning =
            false;


        this.lastMouseX =
            0;

        this.lastMouseY =
            0;


        /*
         * Mode buttons
         */

        this.selectModeButton =
            document.getElementById(
                "selectMode"
            );

        this.addNodeModeButton =
            document.getElementById(
                "addNodeMode"
            );

        this.addEdgeModeButton =
            document.getElementById(
                "addEdgeMode"
            );

        this.deleteModeButton =
            document.getElementById(
                "deleteMode"
            );

        this.currentModeElement =
            document.getElementById(
                "currentMode"
            );


        /*
         * Mode button events
         */

        if (this.selectModeButton) {

            this.selectModeButton.addEventListener(
                "click",
                () => this.setMode("select")
            );
        }


        if (this.addNodeModeButton) {

            this.addNodeModeButton.addEventListener(
                "click",
                () => this.setMode("add-node")
            );
        }


        if (this.addEdgeModeButton) {

            this.addEdgeModeButton.addEventListener(
                "click",
                () => this.setMode("add-edge")
            );
        }


        if (this.deleteModeButton) {

            this.deleteModeButton.addEventListener(
                "click",
                () => this.setMode("delete")
            );
        }


        /*
         * Mouse events
         */

        canvas.addEventListener(
            "mousedown",
            event =>
                this.onMouseDown(event)
        );


        canvas.addEventListener(
            "mousemove",
            event =>
                this.onMouseMove(event)
        );


        canvas.addEventListener(
            "mouseup",
            event =>
                this.onMouseUp(event)
        );


        canvas.addEventListener(
            "mouseleave",
            event =>
                this.onMouseUp(event)
        );


        canvas.addEventListener(
            "wheel",
            event =>
                this.onWheel(event),

            {
                passive: false
            }
        );


        /*
         * Keyboard events
         */

        document.addEventListener(
            "keydown",
            event =>
                this.onKeyDown(event)
        );


        /*
         * Initialize mode UI.
         */

        this.updateModeUI();
    }


    /*
     * Change interaction mode.
     */

    setMode(mode) {

        this.mode =
            mode;


        /*
         * Starting a new mode
         * cancels an unfinished
         * edge creation.
         */

        this.edgeStartNode =
            null;


        /*
         * Stop any current dragging.
         */

        this.draggingNode =
            null;


        /*
         * Clear selection when
         * entering Add Node/Delete
         * only where appropriate.
         *
         * Selection itself is preserved
         * for Add Edge because it can
         * be useful as the first node.
         */

        if (mode !== "add-edge") {

            this.edgeStartNode =
                null;
        }


        this.updateModeUI();


        if (window.currentGraph) {

            this.renderer.draw(
                window.currentGraph
            );
        }
    }


    /*
     * Update mode buttons and
     * current mode text.
     */

    updateModeUI() {

        const buttons = [

            this.selectModeButton,

            this.addNodeModeButton,

            this.addEdgeModeButton,

            this.deleteModeButton

        ];


        buttons.forEach(
            button => {

                if (!button) {
                    return;
                }


                button.classList.remove(
                    "active"
                );
            }
        );


        let activeButton =
            null;

        let modeName =
            "Select";


        switch (this.mode) {

            case "select":

                activeButton =
                    this.selectModeButton;

                modeName =
                    "Select";

                break;


            case "add-node":

                activeButton =
                    this.addNodeModeButton;

                modeName =
                    "Add Node";

                break;


            case "add-edge":

                activeButton =
                    this.addEdgeModeButton;

                modeName =
                    "Add Edge";

                break;


            case "delete":

                activeButton =
                    this.deleteModeButton;

                modeName =
                    "Delete";

                break;
        }


        if (activeButton) {

            activeButton.classList.add(
                "active"
            );
        }


        if (this.currentModeElement) {

            this.currentModeElement.textContent =
                modeName;
        }
    }


    /*
     * Convert mouse position
     * from screen to canvas coordinates.
     */

    getMousePosition(event) {

        const rect =
            this.canvas.getBoundingClientRect();


        return {

            x:
                event.clientX -
                rect.left,

            y:
                event.clientY -
                rect.top
        };
    }


    /*
     * Mouse down.
     */

    onMouseDown(event) {

        if (!window.currentGraph) {
            return;
        }


        const mouse =
            this.getMousePosition(
                event
            );


        const graphPosition =
            this.renderer.screenToGraph(
                mouse.x,
                mouse.y
            );


        /*
         * Middle mouse:
         * always allow panning,
         * regardless of mode.
         */

        if (event.button === 1) {

            this.isPanning =
                true;


            this.lastMouseX =
                event.clientX;


            this.lastMouseY =
                event.clientY;


            this.canvas.style.cursor =
                "grabbing";


            return;
        }


        /*
         * Only left mouse from here.
         */

        if (event.button !== 0) {
            return;
        }


        const graph =
            window.currentGraph;


        /*
         * Find node.
         */

        const node =
            graph.getNodeAt(
                graphPosition.x,
                graphPosition.y,
                this.renderer.nodeRadius
            );


        /*
         * Find edge only when
         * not over a node.
         */

        let edge =
            null;


        if (!node) {

            edge =
                graph.getEdgeAt(
                    graphPosition.x,
                    graphPosition.y
                );
        }


        /*
         * =================================
         * SHIFT ACTIONS
         * =================================
         *
         * Shift + click empty:
         * create node.
         *
         * Shift + click another node
         * while a node is selected:
         * create edge.
         */

        if (event.shiftKey) {

            /*
             * Shift + click node:
             * create edge if another
             * node is selected.
             */

            if (
                node &&
                this.selectedNode &&
                this.selectedNode !== node
            ) {

                this.createEdge(
                    this.selectedNode,
                    node
                );


                return;
            }


            /*
             * Shift + click empty:
             * create node.
             */

            if (!node && !edge) {

                this.createNode(
                    graphPosition.x,
                    graphPosition.y
                );


                return;
            }
        }


        /*
         * =================================
         * ADD NODE MODE
         * =================================
         */

        if (
            this.mode ===
            "add-node"
        ) {

            /*
             * Only create nodes
             * on empty space.
             */

            if (!node && !edge) {

                this.createNode(
                    graphPosition.x,
                    graphPosition.y
                );
            }


            return;
        }


        /*
         * =================================
         * ADD EDGE MODE
         * =================================
         */

        if (
            this.mode ===
            "add-edge"
        ) {

            /*
             * Edge creation requires
             * two nodes.
             */

            if (node) {

                /*
                 * First node.
                 */

                if (!this.edgeStartNode) {

                    this.edgeStartNode =
                        node;


                    this.selectNode(
                        node
                    );


                    this.renderer.draw(
                        graph
                    );


                    return;
                }


                /*
                 * Second node.
                 */

                if (
                    this.edgeStartNode !==
                    node
                ) {

                    this.createEdge(
                        this.edgeStartNode,
                        node
                    );


                    this.edgeStartNode =
                        null;


                    return;
                }
            }


            /*
             * Clicking empty space
             * cancels the current edge.
             */

            if (!node) {

                this.edgeStartNode =
                    null;

                this.clearSelection();
            }


            return;
        }


        /*
         * =================================
         * DELETE MODE
         * =================================
         */

        if (
            this.mode ===
            "delete"
        ) {

            if (node) {

                this.deleteNode(
                    node
                );


                return;
            }


            if (edge) {

                this.deleteEdge(
                    edge
                );


                return;
            }


            return;
        }


        /*
         * =================================
         * SELECT MODE
         * =================================
         */

        if (
            this.mode ===
            "select"
        ) {

            /*
             * Node selected.
             */

            if (node) {

                this.selectNode(
                    node
                );


                /*
                 * Start dragging.
                 */

                this.draggingNode =
                    node;


                this.canvas.style.cursor =
                    "grabbing";


                return;
            }


            /*
             * Edge selected.
             */

            if (edge) {

                this.selectEdge(
                    edge
                );


                return;
            }


            /*
             * Empty canvas:
             * clear selection.
             */

            this.clearSelection();
        }
    }


    /*
     * Select node.
     */

    selectNode(node) {

        this.selectedNode =
            node;

        this.selectedEdge =
            null;


        window.selectedNode =
            node;

        window.selectedEdge =
            null;


        updateSelectionInformation(
            node,
            null
        );


        this.renderer.draw(
            window.currentGraph
        );
    }


    /*
     * Select edge.
     */

    selectEdge(edge) {

        this.selectedNode =
            null;

        this.selectedEdge =
            edge;


        window.selectedNode =
            null;

        window.selectedEdge =
            edge;


        updateSelectionInformation(
            null,
            edge
        );


        this.renderer.draw(
            window.currentGraph
        );
    }


    /*
     * Clear selection.
     */

    clearSelection() {

        this.selectedNode =
            null;

        this.selectedEdge =
            null;


        this.edgeStartNode =
            null;


        window.selectedNode =
            null;

        window.selectedEdge =
            null;


        updateSelectionInformation(
            null,
            null
        );


        if (window.currentGraph) {

            this.renderer.draw(
                window.currentGraph
            );
        }
    }


    /*
     * Create a node.
     */

    createNode(
        x,
        y
    ) {

        const graph =
            window.currentGraph;


        const id =
            this.generateNodeId();


        const node =
            graph.addNode(
                id,
                id
            );


        if (!node) {
            return;
        }


        node.x =
            x;

        node.y =
            y;


        this.selectNode(
            node
        );


        updateGraphInformation(
            graph
        );


        this.renderer.draw(
            graph
        );
    }


    /*
     * Create an edge.
     */

    createEdge(
        source,
        target
    ) {

        const graph =
            window.currentGraph;


        if (
            source ===
            target
        ) {

            return;
        }


        /*
         * Prevent duplicate edge.
         */

        if (
            graph.hasEdge(
                source.id,
                target.id
            )
        ) {

            return;
        }


        const edge =
            graph.addEdge(
                source.id,
                target.id
            );


        if (!edge) {
            return;
        }


        this.selectEdge(
            edge
        );


        updateGraphInformation(
            graph
        );


        this.renderer.draw(
            graph
        );
    }


    /*
     * Delete node.
     *
     * Graph.removeNode()
     * is responsible for removing
     * connected edges.
     */

    deleteNode(node) {

        const graph =
            window.currentGraph;


        if (!graph) {
            return;
        }


        graph.removeNode(
            node.id
        );


        if (
            this.selectedNode ===
            node
        ) {

            this.selectedNode =
                null;
        }


        window.selectedNode =
            null;


        this.selectedEdge =
            null;


        window.selectedEdge =
            null;


        this.edgeStartNode =
            null;


        updateGraphInformation(
            graph
        );


        updateSelectionInformation(
            null,
            null
        );


        this.renderer.draw(
            graph
        );
    }


    /*
     * Delete edge.
     */

    deleteEdge(edge) {

        const graph =
            window.currentGraph;


        if (!graph) {
            return;
        }


        graph.removeEdge(
            edge
        );


        this.selectedEdge =
            null;


        window.selectedEdge =
            null;


        this.selectedNode =
            null;


        window.selectedNode =
            null;


        updateGraphInformation(
            graph
        );


        updateSelectionInformation(
            null,
            null
        );


        this.renderer.draw(
            graph
        );
    }


    /*
     * Mouse move.
     */

    onMouseMove(event) {

        if (!window.currentGraph) {
            return;
        }


        /*
         * Move node only in Select mode.
         */

        if (
            this.mode ===
            "select" &&

            this.draggingNode &&

            event.buttons & 1
        ) {

            const mouse =
                this.getMousePosition(
                    event
                );


            const graphPosition =
                this.renderer.screenToGraph(
                    mouse.x,
                    mouse.y
                );


            this.draggingNode.x =
                graphPosition.x;


            this.draggingNode.y =
                graphPosition.y;


            this.renderer.draw(
                window.currentGraph
            );


            return;
        }


        /*
         * Pan camera.
         */

        if (
            this.isPanning &&
            event.buttons & 4
        ) {

            const dx =
                event.clientX -
                this.lastMouseX;


            const dy =
                event.clientY -
                this.lastMouseY;


            this.renderer.offsetX +=
                dx;


            this.renderer.offsetY +=
                dy;


            this.lastMouseX =
                event.clientX;


            this.lastMouseY =
                event.clientY;


            this.renderer.draw(
                window.currentGraph
            );


            return;
        }


        /*
         * Hover detection.
         */

        const mouse =
            this.getMousePosition(
                event
            );


        const graphPosition =
            this.renderer.screenToGraph(
                mouse.x,
                mouse.y
            );


        const hoveredNode =
            window.currentGraph.getNodeAt(
                graphPosition.x,
                graphPosition.y,
                this.renderer.nodeRadius
            );


        let hoveredEdge =
            null;


        if (!hoveredNode) {

            hoveredEdge =
                window.currentGraph.getEdgeAt(
                    graphPosition.x,
                    graphPosition.y
                );
        }


        /*
         * Update hover state only
         * when something changes.
         */

        if (
            hoveredNode !==
            this.hoveredNode ||

            hoveredEdge !==
            this.hoveredEdge
        ) {

            this.hoveredNode =
                hoveredNode;

            this.hoveredEdge =
                hoveredEdge;


            window.hoveredNode =
                hoveredNode;

            window.hoveredEdge =
                hoveredEdge;


            /*
             * Cursor based on mode.
             */

            if (
                this.mode ===
                "add-node"
            ) {

                this.canvas.style.cursor =
                    "crosshair";
            }

            else if (
                this.mode ===
                "delete"
            ) {

                this.canvas.style.cursor =
                    hoveredNode ||
                    hoveredEdge
                        ? "pointer"
                        : "default";
            }

            else if (
                this.mode ===
                "add-edge"
            ) {

                this.canvas.style.cursor =
                    hoveredNode
                        ? "crosshair"
                        : "default";
            }

            else if (hoveredNode) {

                this.canvas.style.cursor =
                    "grab";
            }

            else if (hoveredEdge) {

                this.canvas.style.cursor =
                    "pointer";
            }

            else {

                this.canvas.style.cursor =
                    "default";
            }


            this.renderer.draw(
                window.currentGraph
            );
        }
    }


    /*
     * Mouse up.
     */

    onMouseUp(event) {

        this.draggingNode =
            null;


        this.isPanning =
            false;


        /*
         * Restore cursor.
         */

        if (
            this.mode ===
            "add-node"
        ) {

            this.canvas.style.cursor =
                "crosshair";

        }

        else if (
            this.mode ===
            "add-edge"
        ) {

            this.canvas.style.cursor =
                this.hoveredNode
                    ? "crosshair"
                    : "default";

        }

        else if (
            this.mode ===
            "delete"
        ) {

            this.canvas.style.cursor =
                (
                    this.hoveredNode ||
                    this.hoveredEdge
                )
                    ? "pointer"
                    : "default";

        }

        else if (this.hoveredNode) {

            this.canvas.style.cursor =
                "grab";

        }

        else if (this.hoveredEdge) {

            this.canvas.style.cursor =
                "pointer";

        }

        else {

            this.canvas.style.cursor =
                "default";
        }
    }


    /*
     * Generate unique node ID.
     */

    generateNodeId() {

        const graph =
            window.currentGraph;


        /*
         * A-Z
         */

        for (
            let i = 0;
            i < 26;
            i++
        ) {

            const id =
                String.fromCharCode(
                    65 + i
                );


            if (
                !graph.getNode(id)
            ) {

                return id;
            }
        }


        /*
         * Node27, Node28...
         */

        let number =
            1;


        while (
            graph.getNode(
                `Node${number}`
            )
        ) {

            number++;
        }


        return `Node${number}`;
    }


    /*
     * Keyboard shortcuts.
     */

    onKeyDown(event) {

        /*
         * Don't trigger shortcuts
         * while typing.
         */

        const target =
            event.target;


        if (
            target.tagName ===
                "INPUT" ||

            target.tagName ===
                "TEXTAREA" ||

            target.tagName ===
                "SELECT"
        ) {

            return;
        }


        /*
         * Escape:
         * Select mode + clear.
         */

        if (
            event.key ===
            "Escape"
        ) {

            this.setMode(
                "select"
            );


            this.clearSelection();


            return;
        }


        /*
         * F:
         * Fit graph.
         */

        if (
            event.key.toLowerCase() ===
            "f"
        ) {

            if (window.currentGraph) {

                this.renderer.fitGraph(
                    window.currentGraph
                );
            }


            return;
        }


        /*
         * R:
         * Reset view.
         *
         * Reset does NOT change zoom.
         */

        if (
            event.key.toLowerCase() ===
            "r"
        ) {

            this.renderer.resetView();


            return;
        }


        /*
         * Delete / Backspace:
         * delete selected object.
         */

        if (
            event.key !== "Delete" &&
            event.key !== "Backspace"
        ) {

            return;
        }


        const graph =
            window.currentGraph;


        if (!graph) {
            return;
        }


        /*
         * Delete selected node.
         */

        if (this.selectedNode) {

            this.deleteNode(
                this.selectedNode
            );


            return;
        }


        /*
         * Delete selected edge.
         */

        if (this.selectedEdge) {

            this.deleteEdge(
                this.selectedEdge
            );
        }
    }


    /*
     * Mouse wheel zoom.
     */

    onWheel(event) {

        event.preventDefault();


        if (!window.currentGraph) {
            return;
        }


        const mouse =
            this.getMousePosition(
                event
            );


        /*
         * Remember graph position
         * underneath cursor.
         */

        const beforeZoom =
            this.renderer.screenToGraph(
                mouse.x,
                mouse.y
            );


        const zoomFactor =
            event.deltaY < 0
                ? 1.1
                : 0.9;


        const oldZoom =
            this.renderer.zoom;


        const newZoom =
            Math.max(
                0.2,

                Math.min(
                    oldZoom *
                    zoomFactor,

                    5
                )
            );


        this.renderer.zoom =
            newZoom;


        /*
         * Keep the graph position
         * underneath the mouse.
         */

        this.renderer.offsetX =
            mouse.x -
            beforeZoom.x *
            newZoom;


        this.renderer.offsetY =
            mouse.y -
            beforeZoom.y *
            newZoom;


        this.renderer.draw(
            window.currentGraph
        );
    }
}