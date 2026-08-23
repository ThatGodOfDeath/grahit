class Graph {

    constructor() {

        this.nodes = [];
        this.edges = [];

        this.directed = false;
        this.weighted = false;
    }


    addNode(id, label = id) {

        if (this.getNode(id)) {
            return null;
        }

        const node = {

            id: id,

            label: label,

            x: 0,

            y: 0
        };

        this.nodes.push(node);

        return node;
    }


    addEdge(
        source,
        target,
        weight = null
    ) {

        /*
         * Make sure both nodes exist.
         */

        if (
            !this.getNode(source) ||
            !this.getNode(target)
        ) {
            return null;
        }


        /*
         * Prevent duplicate edges.
         *
         * For undirected graphs:
         * A-B and B-A are the same edge.
         */

        if (this.hasEdge(source, target)) {
            return null;
        }


        const edge = {

            source: source,

            target: target,

            weight: weight
        };


        this.edges.push(edge);

        return edge;
    }


    getNode(id) {

        return this.nodes.find(
            node => node.id === id
        );
    }


    getNodeAt(
        x,
        y,
        radius
    ) {

        /*
         * Iterate backwards so the
         * visually topmost node is
         * selected first.
         */

        for (
            let i = this.nodes.length - 1;
            i >= 0;
            i--
        ) {

            const node =
                this.nodes[i];


            const dx =
                x - node.x;

            const dy =
                y - node.y;


            const distance =
                Math.sqrt(
                    dx * dx +
                    dy * dy
                );


            if (
                distance <= radius
            ) {

                return node;
            }
        }


        return null;
    }


    hasEdge(
        source,
        target
    ) {

        return this.edges.some(
            edge => {

                if (this.directed) {

                    return (
                        edge.source === source &&
                        edge.target === target
                    );
                }


                return (
                    (
                        edge.source === source &&
                        edge.target === target
                    )
                    ||
                    (
                        edge.source === target &&
                        edge.target === source
                    )
                );
            }
        );
    }


    getEdgeAt(
        x,
        y,
        tolerance = 8
    ) {

        for (
            let i = this.edges.length - 1;
            i >= 0;
            i--
        ) {

            const edge =
                this.edges[i];


            const source =
                this.getNode(
                    edge.source
                );

            const target =
                this.getNode(
                    edge.target
                );


            if (
                !source ||
                !target
            ) {
                continue;
            }


            const distance =
                this.pointToLineDistance(
                    x,
                    y,
                    source.x,
                    source.y,
                    target.x,
                    target.y
                );


            if (
                distance <= tolerance
            ) {

                return edge;
            }
        }


        return null;
    }


    pointToLineDistance(
        px,
        py,
        x1,
        y1,
        x2,
        y2
    ) {

        const dx =
            x2 - x1;

        const dy =
            y2 - y1;


        if (
            dx === 0 &&
            dy === 0
        ) {

            return Math.sqrt(
                (px - x1) ** 2 +
                (py - y1) ** 2
            );
        }


        const t =
            Math.max(
                0,
                Math.min(
                    1,
                    (
                        (px - x1) * dx +
                        (py - y1) * dy
                    ) /
                    (
                        dx * dx +
                        dy * dy
                    )
                )
            );


        const closestX =
            x1 + t * dx;

        const closestY =
            y1 + t * dy;


        return Math.sqrt(
            (px - closestX) ** 2 +
            (py - closestY) ** 2
        );
    }


    removeNode(id) {

        /*
         * Remove node.
         */

        this.nodes =
            this.nodes.filter(
                node => node.id !== id
            );


        /*
         * Remove every edge
         * connected to the node.
         */

        this.edges =
            this.edges.filter(
                edge =>
                    edge.source !== id &&
                    edge.target !== id
            );
    }


    removeEdge(edge) {

        this.edges =
            this.edges.filter(
                currentEdge =>
                    currentEdge !== edge
            );
    }
}