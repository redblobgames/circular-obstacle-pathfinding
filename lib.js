// From https://redblobgames.github.io/circular-obstacle-pathfinding/
// Copyright 2017 Red Blob Games <redblobgames@gmail.com>
// License: Apache v2.0 <http://www.apache.org/licenses/LICENSE-2.0.html>

function vec_polar(r, a) {
    return {x: r * Math.cos(a), y: r * Math.sin(a)};
}

function vec_add(p, q) {
    return {x: p.x + q.x, y: p.y + q.y};
}

function vec_sub(p, q) {
    return {x: p.x - q.x, y: p.y - q.y};
}

function vec_dot(p, q) {
    return p.x * q.x + p.y * q.y;
}

function vec_cross(p, q) {
    return p.x * q.y - p.y * q.x;
}

function vec_interpolate(p, q, t) {
    return {x: p.x + (q.x - p.x) * t, y: p.y + (q.y - p.y) * t};
}

function vec_facing(p, q) {
    const dx = q.x - p.x, dy = q.y - p.y;
    return Math.atan2(dy, dx);
}

function vec_length(p) {
    return Math.sqrt(p.x*p.x + p.y*p.y);
}

function vec_distance(p, q) {
    return vec_length(vec_sub(p, q));
}

function vec_normalize(p) {
    let d = vec_length(p) || 1e-6; // avoid divide by 0
    return {x: p.x / d, y: p.y / d};
}

function angle_difference(a, b) {
    return Math.abs(b - a) % (2 * Math.PI);
}
