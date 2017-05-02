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


/** Generate surfing edges, [{circle: circle, x: number, y: number},
                             {circle: circle, x: number, y: number}]
    as well as the set of nodes. Although the edges are bidirectional,
    each is in the list only once.
 */
function generate_nodes_and_surfing_edges(circles) {
    let edges = [], node_map = new Map();

    // create a new node, or reuse an existing one that's close
    function make_node(i, p) {
        let node = {circle: circles[i], x: Math.round(p.x), y: Math.round(p.y)};
        let key = JSON.stringify(node);
        if (!node_map.has(key)) { node_map.set(key, node); }
        return node_map.get(key);
    }
    
    // try to add edge from circle i point P to circle j point Q
    function add_edge(i, P, j, Q) {
        if (isNaN(P.x) || isNaN(Q.x)) { return; }
        if (!line_of_sight(circles, i, P, j, Q)) { return; }
        edges.push([make_node(i, P), make_node(j, Q)]);
    }
    
    // some circles have radius 0; they will generate fewer bitangents
    for (let i = 0; i < circles.length; i++) {
        for (let j = 0; j < i; j++) {
            let candidates = [];
            var internal = new InternalBitangents(circles[i], circles[j]);
            add_edge(i, internal.C, j, internal.F);
            if (circles[i].r != 0 && circles[j].r != 0) { add_edge(i, internal.D, j, internal.E); }
            var external = new ExternalBitangents(circles[i], circles[j]);
            if (circles[i].r != 0 || circles[j].r != 0) { add_edge(i, external.C, j, external.F); }
            if (circles[i].r != 0 && circles[j].r != 0) { add_edge(i, external.D, j, external.E); }
        }
    }
    return {nodes: [...node_map.values()], edges: edges};
}


/** Generate hugging edges from nodes
 
    Any nodes on the same circle get connected by a hugging edge. 
    Although the edges are bidirectional, each is in the list only once.
*/
function generate_hugging_edges(nodes) {
    let buckets = [];
    for (let node of nodes) {
        if (buckets[node.circle.id] === undefined) { buckets[node.circle.id] = []; }
        buckets[node.circle.id].push(node);
    }

    let hugging_edges = [];
    for (let bucket of buckets) {
        for (let i = 0; i < bucket.length; i++) {
            for (let j = 0; j < i; j++) {
                hugging_edges.push([bucket[i], bucket[j]]);
            }
        }
    }
    return hugging_edges;
}


/** Pathfinding */
function find_path(start_circle, goal_circle, nodes, edges) {
    // TODO: I know this is horribly inefficient but it may not matter; let's see

    function circle_to_node(circle) {
        let nodes_on_circle = nodes.filter((n) => n.circle.id == circle.id);
        if (nodes_on_circle.length !== 1) { throw "start/goal should be on r=0 circle"; }
        return nodes_on_circle[0];
    }

    function neighbors(node) {
        let results = [];
        for (let edge of edges) {
            if (edge[0] === node) { results.push(edge[1]); }
            if (edge[1] === node) { results.push(edge[0]); }
        }
        return results;
    }

    function edge_cost(a, b) {
        if (a.circle.id == b.circle.id) {
            // hugging edge
            let center = a.circle;
            let a_angle = vec_facing(center, a);
            let b_angle = vec_facing(center, b);
            let delta_angle = angle_difference(a_angle, b_angle);
            return delta_angle * center.r;
        } else {
            // surfing edge
            return vec_distance(a, b);
        }
    }

    function heuristic(node) {
        return 0; // TODO: not working yet
        return vec_distance(goal_node, node);
    }

    let start_node = circle_to_node(start_circle);
    let goal_node = circle_to_node(goal_circle);

    let frontier = [[start_node, 0]];
    let came_from = new Map([[start_node, null]]);
    let cost_so_far = new Map([[start_node, 0]]);

    while (frontier.length > 0) {
        frontier.sort((a, b) => a[1] - b[1]);
        let current = frontier.shift()[0];
        if (current === goal_node) { break; }
        for (let next of neighbors(current)) {
            let new_cost = cost_so_far.get(current) + edge_cost(current, next);
            if (!cost_so_far.has(next) || new_cost < cost_so_far.get(next)) {
                cost_so_far.set(next, new_cost);
                came_from.set(next, current);
                frontier.push([next, new_cost + heuristic(next), vec_distance(goal_node, next)]);
            }
        }
    }

    reconstruct_path: {
        let current = goal_node;
        let path = [current];
        while (current !== start_node && current !== undefined) {
            current = came_from.get(current);
            path.push(current);
        }
        path.push(start_node);
        return path;
    }
}


/** Don't allow a circle drag operation if it would touch another circle */
function no_touching_circle(index) {
    return (x, y) => {
        for (let i = 0; i < this.circles.length; i++) {
            if (i != index
                && vec_distance({x, y}, this.circles[i])
                <= this.circles[i].r + this.circles[index].r) {
                return false;
            }
        }
        return true;
    };
}


let graph_all_edges = new Vue({
    el: "#diagram-graph-all-edges",
    data: {
        circles: [ // sorted by r
            {id: 0, x: 340, y: 200, r: 90},
            {id: 1, x:  80, y: 200, r: 70},
            {id: 2, x: 505, y:  65, r: 50}
        ]
    },
    computed: {
        nodes_and_surfing_edges: function() { return generate_nodes_and_surfing_edges(this.circles); },
        surfing_edges: function() { return this.nodes_and_surfing_edges.edges; },
        nodes: function() { return this.nodes_and_surfing_edges.nodes; },
        hugging_edges: function() { return generate_hugging_edges(this.nodes); },
        edges: function() { return this.surfing_edges.concat(this.hugging_edges); }
    },
    methods: {
        no_touching_circle: no_touching_circle
    }
});


let graph_busy_edges = new Vue({
    el: "#diagram-graph-busy-edges",
    data: {
        circles: [ // sorted by r
            {id: 0, x: 180, y: 100, r: 55},
            {id: 1, x: 240, y: 230, r: 30},
            {id: 2, x: 340, y: 200, r: 30},
            {id: 3, x: 505, y:  65, r: 25},
            {id: 4, x: 405, y: 255, r: 20},
            {id: 5, x:  80, y: 200, r: 20},
            {id: 6, x:  20, y:  20, r:  0},
            {id: 7, x: 570, y: 280, r:  0}
        ]
    },
    computed: {
        nodes_and_surfing_edges: function() { return generate_nodes_and_surfing_edges(this.circles); },
        surfing_edges: function() { return this.nodes_and_surfing_edges.edges; },
        nodes: function() { return this.nodes_and_surfing_edges.nodes; },
        hugging_edges: function() { return generate_hugging_edges(this.nodes); },
        edges: function() { return this.surfing_edges.concat(this.hugging_edges); },
        path: function() { return find_path(this.circles[this.circles.length-2],
                                            this.circles[this.circles.length-1],
                                            this.nodes, this.edges); },
        d: function() {
            let path = this.path;
            let d = [];
            for (let p of path) {
                d.push('L', p.x, p.y);
            }
            d[0] = 'M';
            return d.join(' ');
        }
    },
    methods: {
        no_touching_circle: no_touching_circle
    }
});
