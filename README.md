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



# Problem statement

Show the problem being solved with an interactive diagram

## Path

Show a path. It will be alternating "surfing" and "hugging" edges.

# A\* Algorithm

Review A\*, emphasizing that it works on graphs. We'll want to represent the surfing and hugging edges, as well as the nodes, in this graph. A\* is versatile and does not need to be modified for this problem (is this true?). 

# Graph

Show the graph corresponding to the initial diagram, with surfing and hugging edges. Simplications: player is a point instead of a circle, and the obstacles don't intersect.

Every node is on a circle (or is the start/end point), and every edge is either a hugging edge between two points on the same circle, or a surfing edge between two points on different circles

## Generating surfing edges

- Given two circles, generate the nodes and edges for the graph
- bitangents, biarcs
- pulley problem, belt problem

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

## Generating hugging edges


## Line of sight

Diagram with three circles shows that some of the surfing edges don't actually work because they're blocked. Implement line of sight here

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
