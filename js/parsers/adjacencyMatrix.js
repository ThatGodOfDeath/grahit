function parseAdjacencyMatrix(input) {

    if (
        typeof input !== "object" ||
        input === null ||
        Array.isArray(input)
    ) {
        throw new Error(
            "Adjacency matrix must be a JSON object."
        );
    }


    if (!Array.isArray(input.nodes)) {

        throw new Error(
            'Adjacency matrix requires a "nodes" array.'
        );
    }


    if (!Array.isArray(input.matrix)) {

        throw new Error(
            'Adjacency matrix requires a "matrix" array.'
        );
    }


    const nodes = input.nodes;
    const matrix = input.matrix;


    /*
     * Matrix must be square.
     */

    if (matrix.length !== nodes.length) {

        throw new Error(
            "Matrix size must match the number of nodes."
        );
    }


    for (const row of matrix) {

        if (
            !Array.isArray(row) ||
            row.length !== nodes.length
        ) {

            throw new Error(
                "Adjacency matrix must be square."
            );
        }
    }


    const graph = new Graph();


    /*
     * Create nodes.
     */

    for (const nodeId of nodes) {

        graph.addNode(
            String(nodeId),
            String(nodeId)
        );
    }


    /*
     * Determine whether the matrix is weighted.
     */

    let weighted = false;


    for (let i = 0; i < matrix.length; i++) {

        for (let j = 0; j < matrix[i].length; j++) {

            const value = matrix[i][j];

            if (
                value !== 0 &&
                value !== 1 &&
                value !== null
            ) {
                weighted = true;
            }
        }
    }


    /*
     * Determine whether the matrix is directed.
     */

    let directed = false;


    for (let i = 0; i < matrix.length; i++) {

        for (let j = 0; j < matrix.length; j++) {

            if (
                matrix[i][j] !== matrix[j][i]
            ) {

                directed = true;

                break;
            }
        }

        if (directed) {
            break;
        }
    }


    /*
     * Create edges.
     *
     * For undirected graphs we only process
     * the upper triangular portion.
     */

    if (directed) {

        for (let i = 0; i < nodes.length; i++) {

            for (let j = 0; j < nodes.length; j++) {

                const value = matrix[i][j];

                if (
                    value !== 0 &&
                    value !== null
                ) {

                    graph.addEdge(
                        String(nodes[i]),
                        String(nodes[j]),
                        weighted ? value : null
                    );
                }
            }
        }

    } else {

        for (let i = 0; i < nodes.length; i++) {

            for (
                let j = i;
                j < nodes.length;
                j++
            ) {

                const value = matrix[i][j];

                if (
                    value !== 0 &&
                    value !== null
                ) {

                    graph.addEdge(
                        String(nodes[i]),
                        String(nodes[j]),
                        weighted ? value : null
                    );
                }
            }
        }
    }


    graph.directed = directed;
    graph.weighted = weighted;


    return graph;
}