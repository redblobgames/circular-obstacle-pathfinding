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

    function round(x) { return Math.round(100*x)/100; }
    
    // create a new node, or reuse an existing one that's close
    function make_node(i, p) {
        let node = {circle: circles[i], x: round(p.x), y: round(p.y)};
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
        // adding 1 to each edge cost to favor fewer nodes in the path
        if (a.circle.id == b.circle.id) {
            // hugging edge
            let center = a.circle;
            let a_angle = vec_facing(center, a);
            let b_angle = vec_facing(center, b);
            let delta_angle = angle_difference(a_angle, b_angle);
            return 1 + delta_angle * center.r;
        } else {
            // surfing edge
            return 1 + vec_distance(a, b);
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


function make_path_diagram(element, circles) {
    circles = circles.map((c, i) => ({id: i, x: c.x, y: c.y, r: c.r}));
    circles.sort((a, b) => b.r - a.r);
    
    return new Vue({
        el: element,
        data: {circles: circles},
        computed: {
            nodes_and_surfing_edges: function() { return generate_nodes_and_surfing_edges(this.circles); },
            surfing_edges: function() { return this.nodes_and_surfing_edges.edges; },
            nodes: function() { return this.nodes_and_surfing_edges.nodes; },
            hugging_edges: function() { return generate_hugging_edges(this.nodes); },
            edges: function() { return this.surfing_edges.concat(this.hugging_edges); },
            path: function() { return find_path(this.circles[this.circles.length-2],
                                                this.circles[this.circles.length-1],
                                                this.nodes, this.edges); }
        },
        methods: {
            no_touching_circle: no_touching_circle,
            d: function(include_surfing, include_hugging) {
                let path = this.path;
                let d = [];
                for (let i = 1; i < path.length; i++) {
                    if (path[i].circle == path[i-1].circle) {
                        if (include_hugging) {
                            let center = path[i].circle;
                            let sweep = vec_cross(vec_sub(center, path[i-1]), vec_sub(path[i], path[i-1])) < 0 ? 1 : 0;
                            d.push('M', path[i-1].x, path[i-1].y, 'A', center.r, center.r, 0, 0, sweep, path[i].x, path[i].y);
                        }
                    } else {
                        if (include_surfing) {
                            d.push('M', path[i-1].x, path[i-1].y, 'L', path[i].x, path[i].y);
                        }
                    }
                }
                return d.join(' ');
            }
        }
    });
}


let diagram_surfing_edges = make_path_diagram(
    "#diagram-surfing-edges",
    [
        {x: 340, y: 200, r: 90},
        {x:  80, y: 200, r: 70},
        {x: 505, y:  65, r: 50}
    ]
);

let diagram_intro = make_path_diagram(
    "#diagram-intro", [
        {x: 113, y: 99, r: 55},
        {x: 497, y: 243, r: 40},
        {x: 379, y: 237, r: 40},
        {x: 330, y: 113, r: 35},
        {x: 179, y: 190, r: 30},
        {x: 278, y: 233, r: 30},
        {x: 30, y: 74, r: 0},
        {x: 570, y: 280, r: 0}
    ]
);

let diagram_path_edges = make_path_diagram(
    "#diagram-path-edges", [
        {x: 86, y: 85, r: 55},
        {x: 197, y: 38, r: 55},
        {x: 178, y: 145, r: 45},
        {x: 467, y: 85, r: 45},
        {x: 369, y: 137, r: 45},
        {x: 310, y: 47, r: 45},
        {x: 17, y: 72, r: 0},
        {x: 546, y: 97, r: 0}
    ]
);

let diagram_final = make_path_diagram(
    "#diagram-final", [
        {x: 180, y: 100, r: 55},
        {x: 240, y: 230, r: 30},
        {x: 340, y: 200, r: 30},
        {x: 505, y:  65, r: 25},
        {x: 405, y: 255, r: 20},
        {x:  80, y: 200, r: 20},
        {x:  20, y:  20, r:  0},
        {x: 570, y: 280, r:  0}
    ]
);

let rotation1 = new Vue({
    el: "#diagram-rotation-1",
    data: {
        circle: {x: 300, y: 150, r: 100},
        edges: [
            {label: 'A', x: 100, y: 110, dir: 'left', marker: 'start'},
            {label: 'B', x: 500, y: 110, dir: 'right', marker: 'end'},
            {label: 'C', x: 500, y: 190, dir: 'left', marker: 'end'},
            {label: 'D', x: 100, y: 190, dir: 'right', marker: 'end'}
        ]
    },
    methods: {
        center: function(edge) {
            let bitangent = new ExternalBitangents(this.circle, {x: edge.x, y: edge.y, r: 0});
            return bitangent[edge.dir == 'left'? 'D' : 'C'];
        }
    }
});
