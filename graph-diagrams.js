// From https://redblobgames.github.io/circular-obstacle-pathfinding/
// Copyright 2017 Red Blob Games <redblobgames@gmail.com>
// License: Apache v2.0 <http://www.apache.org/licenses/LICENSE-2.0.html>

/** Check line of sight between circle i point P and circle j point Q
    (excludes circles i,j from the test) 
 */
function line_of_sight(circles, i, P, j, Q) {
    for (let k = 0; k < circles.length; k++) {
        if (k != i && k != j
            && segment_circle_intersection(P, Q, circles[k]).intersects) {
            return false;
        }
    }
    return true;
}


/** Generate surfing edges, [{circle: int, x: number, y: number},
                             {circle: int, x: number, y: number}]
 */
function generate_surfing_edges(circles) {
    let edges = [];

    // try to add edge from circle i point P to circle j point Q
    function add_edge(i, P, j, Q) {
        if (isNaN(P.x) || isNaN(Q.x)) { return; }
        if (!line_of_sight(circles, i, P, j, Q)) { return; }
        edges.push([{circle: i, x: P.x, y: P.y},
                    {circle: j, x: Q.x, y: Q.y}]);
    }
    
    for (let i = 0; i < circles.length; i++) {
        for (let j = 0; j < i; j++) {
            let candidates = [];
            var internal = new InternalBitangents(circles[i], circles[j]);
            add_edge(i, internal.C, j, internal.F);
            add_edge(i, internal.D, j, internal.E);
            var external = new ExternalBitangents(circles[i], circles[j]);
            add_edge(i, external.C, j, external.F);
            add_edge(i, external.D, j, external.E);
            // TODO: handle circles[i].r == 0 or circles[j].r == 0
        }
    }
    return edges;
}


let graph_all_edges = new Vue({
    el: "#diagram-graph-all-edges",
    data: {
        circles: [ // sorted by r
            {x: 340, y: 200, r: 90},
            {x:  80, y: 200, r: 70},
            {x: 505, y:  65, r: 50}
        ]
    },
    computed: {
        edges: function() { return generate_surfing_edges(this.circles); }
    }
});


let graph_busy_edges = new Vue({
    el: "#diagram-graph-busy-edges",
    data: {
        circles: [ // sorted by r
            {x: 180, y: 100, r: 55},
            {x: 240, y: 230, r: 30},
            {x: 340, y: 200, r: 30},
            {x: 505, y:  65, r: 25},
            {x: 405, y: 255, r: 20},
            {x:  80, y: 200, r: 20},
            {x:  20, y:  20, r:  0},
            {x: 570, y: 280, r:  0}
        ]
    },
    computed: {
        edges: function() { return generate_surfing_edges(this.circles); }
    }
});
