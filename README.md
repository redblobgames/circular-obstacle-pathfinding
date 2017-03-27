<meta charset="utf-8" />

<address>Mar 2017</address>

<style>
svg { pointer-events: none; }
text { font-family: helvetica; font-size: 16px; text-anchor: middle; }
line { fill: none; stroke: black; }
.dashed { stroke-dasharray: 4,3; }
.graph-node { fill: hsl(220,75%,50%); }
.graph-edge { fill: none; stroke: hsl(120,50%,50%); stroke-width: 2px; }
.draggable { pointer-events: visible; cursor: move; }
.draggable:hover { filter:url(#drop-shadow); }
</style>



# Navigating a forest

The A* pathfinding algorithm is a powerful method for quickly
generating optimal paths. Typically, people demonstrate A* navigating
grid-based maps such as this one, avoiding obstacles to reach a goal.

[Diagram here]

But A* isn't just a grid algorithm! It can work on any graph. We can
use A* to find a path for this round object through this world of
round obstacles.

[Diagram here, with lots of obstacles, draggable start/endpoints, slider
for actor radius]

How does the same algorithm solve both problems?

## First steps

When navigating a round object through a world of round obstacles, we
can make a few observations that simplify the problem. First, we can
make things easier by noticing that moving a circle of radius _r_
through a forest of round obstacles is identical to moving a point
through that same forest with one change: each obstacle has its radius
increased by _r_. This is an extremely simple application of
_Minkowski addition_, and it's so effective for this case that from
now on we'll ignore the radius of the moving object. If it has a
radius larger than zero, we'll just increase the size of the obstacles
before we start.

Another observation to make about the problem is that the paths
consist of two types of sections: line segments and circular arcs. The
endpoints of the line segments can be the starting or ending points,
but they can also be points on the circular obstacles which are
tangent to the line segments. The circular arcs are paths along the
boundaries of the obstacles which link up the line segments.

Also notice that the paths alternate between the two types. The first
piece is always a line segment. If there is a direct path to the goal,
this is the whole path. But if the path is longer, there is an arc
next, followed by a segment. This may be the end of the path, or there
may be more arc and segment pairs. The final piece is always a
segment.

[Diagram here: fixed start/end, two draggable obstacles]

How can we use A* to generate this type of path? Let's start with a
review of how A* works.

# A\* algorithm

A _partial path_ is a series of steps from the start point to some
intermediate point. A* works by evaluating a set of partial paths,
generating new paths from the most promising path in the set, and
terminating once it finds a complete path to the goal that it can
prove to be better than any of the remaining possibilities. To do
this, A* keeps the partial paths in a priority queue, sorted by
estimated length. A partial path's estimated length is the actual
measured length of the path so far, plus a guess of the remaining
distance to the goal. This guess must be an _underestimate_; that is,
the guess can be less than the actual distance, but not greater. In
most pathfinding problems, a good underestimate is the geometric
straight-line distance from the intermediate point to the goal. The
actual best path from an intermediate point to the goal might be
longer than the straight line distance, but it can't be shorter.

When A* begins, the priority queue contains just one partial path: the
start point. The algorithm works by repeatedly removing the most
promising path from the priority queue. If this path ends at the goal
point, the algorithm is done&mdash;the priority queue ensures that no
other path could possibly be better. Otherwise, A* generates a set of
new paths by taking single steps in all possible directions, and
places these new paths back into the priority queue.

# Graph

A* works on a _graph_: a collection of _nodes_ connected by
_edges_. When generating new paths from a partial path that ends at
node _q_, A* makes a new path for each out-edge leading from _q_. In a
grid-based world that doesn't support diagonal movement, the new paths
correspond to taking one step north, south, east and west. On a grid
with diagonal movement, A* makes additional paths for going northeast,
southeast, etc.

Before A* can run on the forest of round obstacles, we need to convert
it into a graph that A* can use. Remember that all the paths through
the forest consist of alternating line segments and arc sections. The
segments and arcs act as edges in the graph; the endpoints of the
segments and arcs&mdash;and the start and goal points&mdash;become the
nodes. A path through this graph is a series of nodes (that is,
segment or arc endpoints) connected by edges (that is, segments or
arcs).

[interactive diagram showing the path broken into segments and arcs with
common endpoints]

Both segments and arcs act as edges in the graph. We'll call the
segments _surfing edges_, because the path uses them to surf between
obstacles. The arcs we'll call _hugging edges_, as their purpose in
the path is to hug the sides of the obstacles.

One simple way to make a graph for A* to use is to generate all
possible surfing and hugging edges.

[interactive diagram showing all surfing and hugging edges for a small
3-obstacle problem]

## Generating surfing edges

The surfing edges between a pair of circles are the line segments
which just barely kiss both circles; these segments are known as
_bitangents_, and in general, there are four of them for each pair of
circles. The bitangents which cross between the circles are the
_internal bitangents_, while the ones which go along the outside are
the _external bitangents_.

### Internal bitangents

Historically, internal bitangents were important for calculating the
length of a belt which crosses over two different sized pulleys, and
so the problem of constructing internal bitangents is known as the _belt
problem_.  To find the internal bitangents, calculate the angle &theta;
in the diagram below.

<svg id="belt-problem" width="600" height="300">
  <circle id="belt-circle-1" class="draggable" :cx="A.x" :cy="A.y" :r="A.r" fill="hsl(240,10%,90%)"/>
  <circle id="belt-circle-2" class="draggable" :cx="B.x" :cy="B.y" :r="B.r" fill="hsl(240,10%,90%)"/>
  <circle :cx="A.x" :cy="A.y" :r="A.r" fill="none" stroke="black"/>
  <circle :cx="B.x" :cy="B.y" :r="B.r" fill="none" stroke="black"/>
  <line class="dashed" :x1="A.x" :y1="A.y" :x2="B.x" :y2="B.y"/>
  <belt-label :at="A" :opposite="B" label="A"/>
  <belt-label :at="B" :opposite="A" label="B"/>
  <template v-if="non_overlapping">
    <line class="dashed" :x1="A.x" :y1="A.y" :x2="C.x" :y2="C.y"/>
    <line class="dashed" :x1="A.x" :y1="A.y" :x2="D.x" :y2="D.y"/>
    <line class="dashed" :x1="B.x" :y1="B.y" :x2="E.x" :y2="E.y"/>
    <line class="dashed" :x1="B.x" :y1="B.y" :x2="F.x" :y2="F.y"/>
    <line class="graph-edge" :x1="C.x" :y1="C.y" :x2="F.x" :y2="F.y"/>
    <line class="graph-edge" :x1="D.x" :y1="D.y" :x2="E.x" :y2="E.y"/>
    <circle class="graph-node" :cx="C.x" :cy="C.y" r="5"/>
    <circle class="graph-node" :cx="D.x" :cy="D.y" r="5"/>
    <circle class="graph-node" :cx="E.x" :cy="E.y" r="5"/>
    <circle class="graph-node" :cx="F.x" :cy="F.y" r="5"/>
    <belt-label :at="C" :opposite="A" label="C"/>
    <belt-label :at="D" :opposite="A" label="D"/>
    <belt-label :at="E" :opposite="B" label="E"/>
    <belt-label :at="F" :opposite="B" label="F"/>
    <belt-label :at="theta_AC" :opposite="A" label="θ"/>
    <belt-label :at="theta_AD" :opposite="A" label="θ"/>
    <belt-label :at="theta_BE" :opposite="B" label="θ"/>
    <belt-label :at="theta_BF" :opposite="B" label="θ"/>
  </template>
  <template v-else>
    <text x="300" y="15">Overlapping circles have no bitangents</text>
  </template>
</svg>

It turns out that, given circles A and B with radius r1 and r2, and
centers separated by distance P, theta = acos((r1 + r2) / P). Note
that when the two circles overlap, (r1 + r2) is greater than P, and
thus the ratio is greater than one. Arccosine is not defined for
values outside the range [-1..1], and there are no internal bitangents
between overlapping circles.

### External bitangents

Constructing external bitangents&mdash;the _pulley problem_&mdash;uses a
similar technique.

<svg id="pulley-problem" width="600" height="300">
  <circle id="pulley-circle-1" class="draggable" :cx="A.x" :cy="A.y" :r="A.r" fill="hsl(240,10%,90%)"/>
  <circle id="pulley-circle-2" class="draggable" :cx="B.x" :cy="B.y" :r="B.r" fill="hsl(240,10%,90%)"/>
  <circle :cx="A.x" :cy="A.y" :r="A.r" fill="none" stroke="black"/>
  <circle :cx="B.x" :cy="B.y" :r="B.r" fill="none" stroke="black"/>
  <line class="dashed" :x1="A.x" :y1="A.y" :x2="B.x" :y2="B.y"/>
  <belt-label :at="A" :opposite="B" label="A"/>
  <belt-label :at="B" :opposite="A" label="B"/>
  <template v-if="non_containing">
    <line class="dashed" :x1="A.x" :y1="A.y" :x2="C.x" :y2="C.y"/>
    <line class="dashed" :x1="A.x" :y1="A.y" :x2="D.x" :y2="D.y"/>
    <line class="dashed" :x1="B.x" :y1="B.y" :x2="E.x" :y2="E.y"/>
    <line class="dashed" :x1="B.x" :y1="B.y" :x2="F.x" :y2="F.y"/>
    <line class="graph-edge" :x1="C.x" :y1="C.y" :x2="F.x" :y2="F.y"/>
    <line class="graph-edge" :x1="D.x" :y1="D.y" :x2="E.x" :y2="E.y"/>
    <circle class="graph-node" :cx="C.x" :cy="C.y" r="5"/>
    <circle class="graph-node" :cx="D.x" :cy="D.y" r="5"/>
    <circle class="graph-node" :cx="E.x" :cy="E.y" r="5"/>
    <circle class="graph-node" :cx="F.x" :cy="F.y" r="5"/>
    <belt-label :at="C" :opposite="A" label="C"/>
    <belt-label :at="D" :opposite="A" label="D"/>
    <belt-label :at="E" :opposite="B" label="E"/>
    <belt-label :at="F" :opposite="B" label="F"/>
    <belt-label :at="theta_AC" :opposite="A" label="θ"/>
    <belt-label :at="theta_AD" :opposite="A" label="θ"/>
    <belt-label :at="theta_BE" :opposite="B" label="θ"/>
    <belt-label :at="theta_BF" :opposite="B" label="θ"/>
  </template>
  <template v-else>
    <text x="300" y="15">Smaller circle entirely contained in larger one</text>
  </template>
</svg>

For external bitangents, &theta; = acos((r1 - r2) / P). It doesn't
matter whether circle A or B is bigger, but as shown in the diagram,
&theta; appears on the side of A toward B, but on the side of B away
from A. If the difference in size of the two circles is greater than
the separation of the centers, acos((r1 - r2) / P) is undefined. This
corresponds to the case where one circle is completely inside the
other, for which there are no external bitangents.

### Line of sight

Taken together, the internal and external bitangents between two
circles constitute surfing edges between the circles. But what if a
third circle blocks some of the surfing edges?

[Diagram with two fixed circles with bitangents drawn between them. A
third circle can be moved so that it blocks some of the bitangents,
graying them out.]

If a surfing edge is blocked by another circle, we need to throw it
out.  To detect this case, we use a simple _point-line-distance_
calculation. For each obstacle other than the two obstacles on which
the surfing edge terminates, we determine the distance from the
surfing edge to the center of the obstacle. If the distance is less
than the obstacle's radius, then the obstacle blocks the surfing edge,
and we should throw it away.

To calculate the distance from a point to a line segment, use the following
formula (from http://paulbourke.net/geometry/pointlineplane/):

```

float pointLineDeterminant(const FPoint &p, const FPoint &A, const FPoint &B) {
  return ((p.x - A.x) * (B.x - A.x) + (p.y - A.y) * (B.y - A.y)) /
	 ((B.x - A.x) * (B.x - A.x) + (B.y - A.y) * (B.y - A.y));
}
		 
float sqDist(const FPoint &p1, const FPoint &p2) { return (p2 - p1).sqmag(); }

float pointLineSqDist(const FPoint &p, const FPoint &A, const FPoint &B) {
  const auto u = pointLineDeterminant(p, A, B);
  if (u < 0) return sqDist(p, A);
  if (u > 1) return sqDist(p, B);
  return (A + u * (B - A) - p).sqmag();
}

```


## Generating hugging edges

Each hugging edge starts at the endpoint of a bitangent, traverses
around the circle, and terminates at the endpoint of a different
bitangent. Importantly, the starting bitangent determines the
direction the hugging edge takes&mdash;clockwise or
anticlockwise&mdash;as it travels around the circle, and the direction
of the hugging edge&mdash;clockwise or anticlockwise&mdash;determines
which bitangents can serve as the termination of the hugging edge.

<svg id="hugging-edge" width="600" height="300">
  <template v-if="valid">
    <line :x1="A.x" :y1="A.y" :x2="B.x" :y2="B.y" fill="none" stroke="black"/>
    <line :x1="D.x" :y1="D.y" :x2="E.x" :y2="E.y" fill="none" stroke="black"/>
  </template>
  <circle id="hugging-edge-left" class="draggable" :cx="A.x" :cy="A.y" r="10" fill="hsl(240,10%,90%)"/>
  <circle id="hugging-edge-right" class="draggable" :cx="E.x" :cy="E.y" r="10" fill="hsl(240,10%,90%)"/>
  <circle id="hugging-edge-circle" class="draggable" :cx="C.x" :cy="C.y" :r="C.r" fill="hsl(240,10%,90%)"/>
  <template v-if="valid">
    <line class="dashed" :x1="C.x" :y1="C.y" :x2="B.x" :y2="B.y"/>
    <line class="dashed" :x1="C.x" :y1="C.y" :x2="D.x" :y2="D.y"/>
    <belt-label :at="C" :opposite="mid_BD" label="C"/>
    <belt-label :at="B" :opposite="C" label="B"/>
    <belt-label :at="D" :opposite="C" label="D"/>
  </template>
  <circle :cx="C.x" :cy="C.y" :r="C.r" fill="none" stroke="black"/>
  <template v-if="valid">
    <path class="graph-edge" :d="arc_path"/>
    <circle class="graph-node" :cx="B.x" :cy="B.y" r="5"/>
    <circle class="graph-node" :cx="D.x" :cy="D.y" r="5"/>
  </template>
</svg>

[TODO: diagram doesn't work when angle >180°]

[TODO: is left/right an optimization we can leave for later, or do we need a diagram to show it now?]

Every endpoint of every bitangent is one of two kinds: the kind that
can start clockwise hugging edges and terminate anticlockwise hugging
edges, or the kind that can start anticlockwise hugging edges and
terminate clockwise hugging edges. Both the endpoints of an internal
bitangent are the same type; the endpoints of an external bitangent
are opposite types.

[TODO: Come up with a good name for the two classes. "left" and
"right"?]

[Interactive diagram: three draggable circles with all bitangents
drawn, with each bitangent endpoint drawn red or blue.]

To find the set of hugging edges for a circle, collect all the
bitangent endpoints on the circle. Then for each endpoint of one type,
generate a hugging edge to each endpoint of the opposite type, going
around the circle in the appropriate direction.

### Line of sight

Hugging edges can be blocked by obstacles just as surfing edges
can. Consider the hugging edge in the diagram below. If another
obstacle touches the hugging edge, it's blocked and should be thrown
out.

[Diagram with a fixed hugging edge between two points on the circle. A
second circle can be dragged; if it touches the hugging edge, the edge
gets grayed out.]

To determine whether a hugging edge is blocked by another obstacle,
determine the points at which to two circles intersect.

```

// http://paulbourke.net/geometry/circlesphere/
// returns bearings to intersections of c0 & c1, as seen from c0.center
void getIntersectionAnglesOnC0(const Circle &c0, const Circle &c1,
                               std::vector<double> *intersections) {
  const auto d = dist(c0.center, c1.center);
  if (d > c0.radius + c1.radius) return;            // not touching
  if (d < std::abs(c0.radius - c1.radius)) return;  // subsumed
  if (d == 0 && c0.center == c1.center) return;     // coincident

  // a is dist from c0 to closest point on "radical line" which connects the two
  // intersection points
  // a = (r0^2 - r1^2 + d^2 ) / (2 d)
  const auto a =
      (c0.radius * c0.radius - c1.radius * c1.radius + d * d) / (2 * d);

  // my shortcut here, we just want the bearings not the points
  const auto theta = std::acos(a / c0.radius);
  const auto bearing = bearingFrom(c0.center, c1.center);
  intersections->push_back(bearing + theta);
  if (theta != 0) intersections->push_back(bearing - theta);
}

```

[Diagram with two draggable circles, showing points of intersection.]

Next, determine whether either of the intersection points fall between
the start and end points of the hugging edge. If this is the case,
then the obstacle blocks the hugging edge, and we should discard the
edge.  Note that we don't have to worry about the case where the
hugging edge is entirely contained within an obstacle, as the line of
sight culling for surfing edges will have already thrown the edge out.

# Putting it all together

Given Minkowski expansion of obstacles, the generation of surfing and
hugging edges, and the culling of blocked edges, we can run
pathfinding using the A* algorithm.

[Diagram: full demo]



# Enhancements


## Delayed edge generation

In the pathfinding demo show which edges were even looked at. If these
things are moving around, we can delay generating that graph by moving
the edge generation to the neighbors() function

## Polygonal obstacles

exercise for the reader

## spatial index

# Full demo




# References

- Belt problem
- Pulley problem
- Point line distance
- Intersection of two circles

<svg width="0" height="0">
  <defs>
    <filter id="drop-shadow" x="-100%" y="-100%" width="300%" height="300%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
      <feOffset dx="0" dy="1" result="offsetblur"/>
      <feFlood flood-color="#000000"/>
      <feComposite in2="offsetblur" operator="in"/>
      <feMerge>
        <feMergeNode/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
</svg>

<script src="https://unpkg.com/vue"></script>
<script src="draggable.js"></script>
<script src="belt-problem.js"></script>
