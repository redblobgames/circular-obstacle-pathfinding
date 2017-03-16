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

Diagram can detect overlap and say we'll handle these later

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
