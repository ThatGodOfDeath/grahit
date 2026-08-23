function parseEdgeList(input) {

    if (!Array.isArray(input)) {

        throw new Error(
            "Edge list must be a JSON array."
        );
    }


    const graph = new Graph();


    /*
     * First discover all nodes.
     */

    for (const edge of input) {

        if (
            !Array.isArray(edge) ||
            edge.length < 2
        ) {

            throw new Error(
                "Each edge must contain at least source and target."
            );
        }


        const source =
            String(edge[0]);

        const target =
            String(edge[1]);


        if (!graph.getNode(source)) {

            graph.addNode(
                source,
                source
            );
        }


        if (!graph.getNode(target)) {

            graph.addNode(
                target,
                target
            );
        }
    }


    /*
     * Determine whether weights exist.
     */

    const weighted =
        input.some(
            edge => edge.length >= 3
        );


    /*
     * Phase 2 edge lists are assumed
     * to represent undirected graphs.
     */

    for (const edge of input) {

        const source =
            String(edge[0]);

        const target =
            String(edge[1]);


        const weight =
            edge.length >= 3
                ? edge[2]
                : null;


        graph.addEdge(
            source,
            target,
            weight
        );
    }


    graph.directed = false;
    graph.weighted = weighted;


    return graph;
}