const canvas =
    document.getElementById("graphCanvas");


const graphInput =
    document.getElementById("graphInput");


const inputFormat =
    document.getElementById("inputFormat");


const loadGraphButton =
    document.getElementById("loadGraph");


const errorMessage =
    document.getElementById("errorMessage");


const nodeCount =
    document.getElementById("nodeCount");


const edgeCount =
    document.getElementById("edgeCount");


const directedStatus =
    document.getElementById("directedStatus");


const weightedStatus =
    document.getElementById("weightedStatus");


const fitGraphButton =
    document.getElementById("fitGraph");


const resetViewButton =
    document.getElementById("resetView");


const selectionInfo =
    document.getElementById("selectionInfo");


const directedToggle =
    document.getElementById(
        "directedToggle"
    );


const weightedToggle =
    document.getElementById(
        "weightedToggle"
    );


/*
 * Global graph state.
 */

window.currentGraph =
    null;


window.selectedNode =
    null;


window.selectedEdge =
    null;


window.hoveredNode =
    null;


window.hoveredEdge =
    null;


/*
 * Renderer.
 */

const renderer =
    new GraphRenderer(
        canvas
    );


/*
 * Interaction.
 */

const interaction =
    new GraphInteraction(
        canvas,
        renderer
    );


/*
 * Example inputs for each format.
 */

const examples = {

    "adjacency-list": {

        "A": [
            "B",
            "C"
        ],

        "B": [
            "A",
            "D"
        ],

        "C": [
            "A",
            "D"
        ],

        "D": [
            "B",
            "C"
        ]
    },


    "adjacency-matrix": {

        "nodes": [
            "A",
            "B",
            "C",
            "D"
        ],

        "matrix": [

            [0, 1, 1, 0],

            [1, 0, 0, 1],

            [1, 0, 0, 1],

            [0, 1, 1, 0]
        ]
    },


    "edge-list": [

        [
            "A",
            "B"
        ],

        [
            "A",
            "C"
        ],

        [
            "B",
            "D"
        ],

        [
            "C",
            "D"
        ]
    ]
};


/*
 * Load example when
 * input format changes.
 */

inputFormat.addEventListener(
    "change",
    () => {

        const example =
            examples[
                inputFormat.value
            ];


        graphInput.value =
            JSON.stringify(
                example,
                null,
                4
            );
    }
);


/*
 * Select appropriate parser.
 */

function parseInput(input) {

    switch (
        inputFormat.value
    ) {

        case "adjacency-list":

            return parseAdjacencyList(
                input
            );


        case "adjacency-matrix":

            return parseAdjacencyMatrix(
                input
            );


        case "edge-list":

            return parseEdgeList(
                input
            );


        default:

            throw new Error(
                "Unsupported input format."
            );
    }
}


/*
 * Load graph.
 */

function loadGraph() {

    hideError();


    /*
     * Reset interaction state.
     *
     * Loading a new graph should
     * always start in Select mode.
     */

    if (interaction) {

        interaction.setMode(
            "select"
        );


        interaction.selectedNode =
            null;

        interaction.selectedEdge =
            null;

        interaction.hoveredNode =
            null;

        interaction.hoveredEdge =
            null;

        interaction.edgeStartNode =
            null;

        interaction.draggingNode =
            null;

        interaction.isPanning =
            false;
    }


    /*
     * Clear global selections.
     */

    window.selectedNode =
        null;

    window.selectedEdge =
        null;

    window.hoveredNode =
        null;

    window.hoveredEdge =
        null;


    /*
     * Clear selection information.
     */

    updateSelectionInformation(
        null,
        null
    );


    try {

        const input =
            JSON.parse(
                graphInput.value
            );


        /*
         * Every parser MUST return
         * the Universal Graph Model.
         */

        const graph =
            parseInput(
                input
            );


        /*
         * Position nodes in graph
         * coordinates.
         */

        positionNodes(
            graph
        );


        /*
         * Store current graph.
         */

        window.currentGraph =
            graph;


        /*
         * Automatically fit the
         * graph to the canvas.
         */

        renderer.fitGraph(
            graph
        );


        /*
         * Update graph information.
         */

        updateGraphInformation(
            graph
        );


        /*
         * Update graph settings.
         */

        updateGraphSettings(
            graph
        );


        /*
         * Clear hover state after
         * rendering the new graph.
         */

        interaction.hoveredNode =
            null;

        interaction.hoveredEdge =
            null;


        window.hoveredNode =
            null;

        window.hoveredEdge =
            null;


        renderer.draw(
            graph
        );
    }


    catch (error) {

        showError(
            error.message
        );
    }
}


/*
 * Position nodes in graph coordinates.
 *
 * The graph itself does NOT know
 * anything about the canvas size.
 *
 * The renderer/camera handles
 * displaying these coordinates.
 */

function positionNodes(
    graph
) {

    const spacing =
        120;


    const columns =
        Math.ceil(
            Math.sqrt(
                graph.nodes.length
            )
        );


    graph.nodes.forEach(
        (
            node,
            index
        ) => {

            const column =
                index %
                columns;


            const row =
                Math.floor(
                    index /
                    columns
                );


            node.x =
                column *
                spacing;


            node.y =
                row *
                spacing;
        }
    );
}


/*
 * Graph information.
 */

function updateGraphInformation(
    graph
) {

    nodeCount.textContent =
        graph.nodes.length;


    edgeCount.textContent =
        graph.edges.length;


    directedStatus.textContent =
        graph.directed
            ? "Yes"
            : "No";


    weightedStatus.textContent =
        graph.weighted
            ? "Yes"
            : "No";
}


/*
 * Graph settings.
 */

function updateGraphSettings(
    graph
) {

    if (directedToggle) {

        directedToggle.checked =
            graph.directed;
    }


    if (weightedToggle) {

        weightedToggle.checked =
            graph.weighted;
    }
}


/*
 * Selection information.
 */

function updateSelectionInformation(
    node,
    edge
) {

    if (!selectionInfo) {
        return;
    }


    /*
     * Nothing selected.
     */

    if (
        !node &&
        !edge
    ) {

        selectionInfo.innerHTML =
            `
            <p class="no-selection">
                Nothing selected
            </p>
            `;

        return;
    }


    /*
     * Node selected.
     */

    if (node) {

        const graph =
            window.currentGraph;


        const neighbors =
            [];


        for (
            const currentEdge
            of graph.edges
        ) {

            if (
                currentEdge.source ===
                node.id
            ) {

                neighbors.push(
                    currentEdge.target
                );
            }


            else if (
                !graph.directed &&
                currentEdge.target ===
                node.id
            ) {

                neighbors.push(
                    currentEdge.source
                );
            }
        }


        selectionInfo.innerHTML =
            `
            <div class="selection-row">

                <span>
                    Type
                </span>

                <strong>
                    Node
                </strong>

            </div>


            <div class="selection-row">

                <span>
                    ID
                </span>

                <strong>
                    ${node.id}
                </strong>

            </div>


            <div class="selection-edit">

                <label>
                    Label
                </label>

                <input
                    type="text"
                    id="nodeLabelInput"
                    value="${node.label}"
                >


                <button
                    id="updateNodeLabel"
                    type="button"
                >
                    Update
                </button>

            </div>


            <div class="selection-row">

                <span>
                    Degree
                </span>

                <strong>
                    ${neighbors.length}
                </strong>

            </div>


            <div class="selection-row">

                <span>
                    Neighbors
                </span>

                <strong>
                    ${
                        neighbors.length
                            ? neighbors.join(", ")
                            : "None"
                    }
                </strong>

            </div>


            <div class="selection-row">

                <span>
                    X
                </span>

                <strong>
                    ${node.x.toFixed(1)}
                </strong>

            </div>


            <div class="selection-row">

                <span>
                    Y
                </span>

                <strong>
                    ${node.y.toFixed(1)}
                </strong>

            </div>
            `;


        const labelInput =
            document.getElementById(
                "nodeLabelInput"
            );


        const updateButton =
            document.getElementById(
                "updateNodeLabel"
            );


        if (updateButton) {

            updateButton.addEventListener(
                "click",
                () => {

                    const newLabel =
                        labelInput.value.trim();


                    if (!newLabel) {
                        return;
                    }


                    node.label =
                        newLabel;


                    renderer.draw(
                        graph
                    );


                    updateSelectionInformation(
                        node,
                        null
                    );
                }
            );
        }


        return;
    }


    /*
     * Edge selected.
     */

    if (edge) {

        const graph =
            window.currentGraph;


        selectionInfo.innerHTML =
            `
            <div class="selection-row">

                <span>
                    Type
                </span>

                <strong>
                    Edge
                </strong>

            </div>


            <div class="selection-row">

                <span>
                    Source
                </span>

                <strong>
                    ${edge.source}
                </strong>

            </div>


            <div class="selection-row">

                <span>
                    Target
                </span>

                <strong>
                    ${edge.target}
                </strong>

            </div>


            <div class="selection-edit">

                <label>
                    Weight
                </label>

                <input
                    type="number"
                    id="edgeWeightInput"
                    value="${
                        edge.weight !== null
                            ? edge.weight
                            : ""
                    }"
                    ${
                        graph.weighted
                            ? ""
                            : "disabled"
                    }
                >


                <button
                    id="updateEdgeWeight"
                    type="button"
                    ${
                        graph.weighted
                            ? ""
                            : "disabled"
                    }
                >
                    Update
                </button>

            </div>
            `;


        const weightInput =
            document.getElementById(
                "edgeWeightInput"
            );


        const updateButton =
            document.getElementById(
                "updateEdgeWeight"
            );


        if (updateButton) {

            updateButton.addEventListener(
                "click",
                () => {

                    const value =
                        weightInput.value.trim();


                    if (
                        value === ""
                    ) {

                        edge.weight =
                            null;
                    }

                    else {

                        const weight =
                            Number(
                                value
                            );


                        if (
                            !Number.isFinite(
                                weight
                            )
                        ) {

                            return;
                        }


                        edge.weight =
                            weight;
                    }


                    renderer.draw(
                        graph
                    );


                    updateSelectionInformation(
                        null,
                        edge
                    );
                }
            );
        }
    }
}


/*
 * Error handling.
 */

function showError(
    message
) {

    errorMessage.textContent =
        message;


    errorMessage.classList.remove(
        "hidden"
    );
}


function hideError() {

    errorMessage.textContent =
        "";


    errorMessage.classList.add(
        "hidden"
    );
}


/*
 * Load graph button.
 */

loadGraphButton.addEventListener(
    "click",
    loadGraph
);


/*
 * Fit graph button.
 */

fitGraphButton.addEventListener(
    "click",
    () => {

        if (
            !window.currentGraph
        ) {

            return;
        }


        renderer.fitGraph(
            window.currentGraph
        );
    }
);


/*
 * Reset view button.
 *
 * Reset keeps the current zoom.
 */

resetViewButton.addEventListener(
    "click",
    () => {

        renderer.resetView();
    }
);


/*
 * Directed setting.
 */

if (directedToggle) {

    directedToggle.addEventListener(
        "change",
        () => {

            if (
                !window.currentGraph
            ) {

                return;
            }


            window.currentGraph.directed =
                directedToggle.checked;


            renderer.draw(
                window.currentGraph
            );


            updateGraphInformation(
                window.currentGraph
            );


            updateSelectionInformation(
                window.selectedNode,
                window.selectedEdge
            );
        }
    );
}


/*
 * Weighted setting.
 */

if (weightedToggle) {

    weightedToggle.addEventListener(
        "change",
        () => {

            if (
                !window.currentGraph
            ) {

                return;
            }


            window.currentGraph.weighted =
                weightedToggle.checked;


            /*
             * If the graph becomes
             * weighted, existing edges
             * without weights receive
             * a default weight.
             */

            if (
                window.currentGraph.weighted
            ) {

                for (
                    const edge
                    of window.currentGraph.edges
                ) {

                    if (
                        edge.weight === null ||
                        edge.weight === undefined
                    ) {

                        edge.weight =
                            1;
                    }
                }
            }


            renderer.draw(
                window.currentGraph
            );


            updateGraphInformation(
                window.currentGraph
            );


            updateSelectionInformation(
                window.selectedNode,
                window.selectedEdge
            );
        }
    );
}


/*
 * Initial example.
 */

graphInput.value =
    JSON.stringify(
        examples[
            "adjacency-list"
        ],
        null,
        4
    );


/*
 * Load initial graph.
 */

loadGraph();