// From https://redblobgames.github.io/circular-obstacle-pathfinding/
// Copyright 2017 Red Blob Games <redblobgames@gmail.com>
// License: Apache v2.0 <http://www.apache.org/licenses/LICENSE-2.0.html>

let graph_all_edges = new Vue({
    el: "#graph-all-edges",
    data: {
        circles: [
            {x:  80, y: 200, r: 70},
            {x: 340, y: 200, r: 90},
            {x: 505, y:  65, r: 50}
        ]
    },
    computed: {
        edges: function() {
            let edges = [];
            const circles = this.circles;
            for (let i = 0; i < circles.length; i++) {
                for (let j = 0; j < i; j++) {
                    let candidates = [];
                    var internal = new InternalBitangents(circles[i], circles[j]);
                    candidates.push([internal.C, internal.F],
                                    [internal.D, internal.E]);
                    var external = new ExternalBitangents(circles[i], circles[j]);
                    candidates.push([external.C, external.F],
                                    [external.D, external.E]);
                    edges.push.apply(edges,
                                     candidates
                                     .filter((e) => !isNaN(e[0].x) && !isNaN(e[1].x))
                                     .filter((e) => this.line_of_sight(e[0], e[1], i, j)));
                }
            }
            return edges;
        }
    },
    methods: {
        /** does A have line of sight to B, excluding circles not_i, not_j? */
        line_of_sight: function(A, B, not_i, not_j) {
            for (let k = 0; k < this.circles.length; k++) {
                if (k != not_i && k != not_j) {
                    const calculation = segment_circle_intersection(A, B, this.circles[k]);
                    if (calculation.intersects) {
                        return false;
                    }
                }
            }
            return true;
        }
    }
});
