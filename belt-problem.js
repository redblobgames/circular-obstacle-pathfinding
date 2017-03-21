// From http://www.redblobgames.com/
// Copyright 2017 Red Blob Games <redblobgames@gmail.com>
// License: Apache v2.0 <http://www.apache.org/licenses/LICENSE-2.0.html>

const $ = document.getElementById.bind(document);
const TEXT_OFFSET = {x: 0, y: 5};

function vec_polar(r, a) {
    return {x: r * Math.cos(a), y: r * Math.sin(a)};
}

function vec_add(p, q) {
    return {x: p.x + q.x, y: p.y + q.y};
}

function vec_facing(p, q) {
    const dx = q.x - p.x, dy = q.y - p.y;
    return Math.atan2(dy, dx);
}

function vec_distance(p, q) {
    const dx = p.x - q.x, dy = p.y - q.y;
    return Math.sqrt(dx*dx + dy*dy);
}

Vue.component('belt-label', {
    props: ['at', 'opposite', 'label'],
    template: '<text :x="at.x" :y="at.y" :dx="shove.x" :dy="shove.y">{{ label }}</text>',
    computed: {
        shove: function() {
            const angle = vec_facing(this.at, this.opposite);
            return vec_add(TEXT_OFFSET, vec_polar(-10, angle));
        }
    }
});

let belt_problem = new Vue({
    el: "#belt-problem",
    data: {
        A: {x: 150, y: 150, r: 130},
        B: {x: 450, y: 150, r: 70}
    },
    computed: {
        non_overlapping: function() {
            return !isNaN(this.inner_angle);
        },
        inner_angle: function() {
            const P = vec_distance(this.A, this.B);
            const cos_angle = (this.A.r + this.B.r) / P;
            return Math.acos(cos_angle);
        },
        A_to_B_angle: function() {
            return vec_facing(this.A, this.B);
        },
        B_to_A_angle: function() {
            return vec_facing(this.B, this.A);
        },
        C: function() {
            return vec_add(this.A, vec_polar(this.A.r, this.A_to_B_angle - this.inner_angle));
        },
        D: function() {
            return vec_add(this.A, vec_polar(this.A.r, this.A_to_B_angle + this.inner_angle));
        },
        E: function() {
            return vec_add(this.B, vec_polar(this.B.r, this.B_to_A_angle + this.inner_angle));
        },
        F: function() {
            return vec_add(this.B, vec_polar(this.B.r, this.B_to_A_angle - this.inner_angle));
        }
    }
    
});

function makeCircleDraggable(reference, element, coordinates) {
    makeDraggable(reference, element,
                  function(start, current, last) {
                      if (last == null) { last = {x: coordinates.x, y: coordinates.y}; }
                      coordinates.x = current.x + last.x - start.x;
                      coordinates.y = current.y + last.y - start.y;
                      return last;
                  });
}

makeCircleDraggable($('belt-problem'), $('belt-circle-1'), belt_problem.A);
makeCircleDraggable($('belt-problem'), $('belt-circle-2'), belt_problem.B);

// TODO: might be better to make the draggable into a vue component, but this works for now
