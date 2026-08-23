function parseAdjacencyList(input) {

    if (
        typeof input !== "object" ||
        input === null ||
        Array.isArray(input)
    ) {
        throw new Error(
            "Adjacency list must be a JSON object."
        );
    }


    const graph = new Graph();


    /*
     * First create all nodes.
     */

    for (const nodeId of Object.keys(input)) {

        graph.addNode(
            nodeId,
            nodeId
        );
    }


    /*
     * Then create edges.
     */

    const processedEdges = new Set();

    for (const source of Object.keys(input)) {

        const neighbors = input[source];


        if (!Array.isArray(neighbors)) {

            throw new Error(
                `Neighbors of "${source}" must be an array.`
            );
        }


        for (const target of neighbors) {

            /*
             * Automatically create a node if it
             * appears only as a neighbor.
             */

            if (!graph.getNode(target)) {

                graph.addNode(
                    target,
                    target
                );
            }


            /*
             * The Phase 1 adjacency-list format
             * represents an undirected graph.
             *
             * Therefore:
             *
             * A -> B
             *
             * and
             *
             * B -> A
             *
             * represent the same edge.
             */

            const id1 = String(source);
            const id2 = String(target);

            const edgeKey =
                id1 < id2
                    ? `${id1}|${id2}`
                    : `${id2}|${id1}`;


            if (!processedEdges.has(edgeKey)) {

                graph.addEdge(
                    source,
                    target
                );

                processedEdges.add(edgeKey);
            }
        }
    }


    graph.directed = false;
    graph.weighted = false;


    return graph;
}