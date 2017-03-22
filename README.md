<meta charset="utf-8" />

<address>Mar 2017</address>

<style>
svg { pointer-events: none; }
text { font-family: helvetica; font-size: 16px; text-anchor: middle; }
line { fill: none; stroke: black; }
.dashed { stroke-dasharray: 4,3; }
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

Review A\*, emphasizing that it works on graphs. We'll want to
represent the surfing and hugging edges, as well as the nodes, in this
graph. A\* is versatile and does not need to be modified for this
problem (is this true?).

# Graph

It's time to convert the forest into a graph that A* can use. Remember
that all the paths consist of line segments and arc sections. The
segments and arcs act as edges in the graph; the endpoints of the
segments and arcs become the nodes. A path through this graph is a
series of nodes (that is, segment or arc endpoints) connected by edges
(that is, segments or arcs).

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
    <line :x1="C.x" :y1="C.y" :x2="F.x" :y2="F.y" stroke-width="2" style="stroke:hsl(240,50%,50%)"/>
    <line :x1="D.x" :y1="D.y" :x2="E.x" :y2="E.y" stroke-width="2" style="stroke:hsl(240,50%,50%)"/>
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
    <line :x1="C.x" :y1="C.y" :x2="F.x" :y2="F.y" stroke-width="2" style="stroke:hsl(240,50%,50%)"/>
    <line :x1="D.x" :y1="D.y" :x2="E.x" :y2="E.y" stroke-width="2" style="stroke:hsl(240,50%,50%)"/>
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

## Generating hugging edges

Each hugging edge starts at the endpoint of a bitangent, traverses
around the circle, and terminates at the endpoint of a different
bitangent. Importantly, the starting bitangent determines the
direction the hugging edge takes&mdash;clockwise or
anticlockwise&mdash;as it travels around the circle, and the direction
of the hugging edge&mdash;clockwise or anticlockwise&mdash;determines
which bitangents can serve as the termination of the hugging edge.

[Possible diagram: Show a circle with some tangents leading off of
it. Highlight one hugging edge and show how it starts and ends at the
right kind of endpoint. Show bad example too?]

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
generate a hugging edge to each endpoint of the opposite type.

## Line of sight

Diagram with three circles shows that some of the surfing edges don't
actually work because they're blocked. Implement line of sight here

# MVP Demo

We have enough to run pathfinding

# Enhancements

## left/right direction

Not sure how to explain this yet

### delay edge generation

In the pathfinding demo show which edges were even looked at. If these things are moving around, we can delay generating that graph by moving the edge generation to the neighbors() function

## overlapping circles

Show the bitangent diagram, but this time with circles overlapping, we need the belt problem but not the pulley problem

## polygonal obstacles

exercise for the reader

## spatial index

# Full demo




# References

- Belt problem
- Pulley problem


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

<!-- hhmts start -->Last modified: 20 Mar 2017<!-- hhmts end -->
