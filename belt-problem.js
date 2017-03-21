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
        B: {x: 450, y: 150, r: 50}
    },
    computed: {
        non_overlapping: function() {
            return !isNaN(this.theta);
        },
        theta: function() {
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
            return vec_add(this.A, vec_polar(this.A.r, this.A_to_B_angle - this.theta));
        },
        D: function() {
            return vec_add(this.A, vec_polar(this.A.r, this.A_to_B_angle + this.theta));
        },
        E: function() {
            return vec_add(this.B, vec_polar(this.B.r, this.B_to_A_angle + this.theta));
        },
        F: function() {
            return vec_add(this.B, vec_polar(this.B.r, this.B_to_A_angle - this.theta));
        },
        theta_AC: function() {
            return vec_add(this.A, vec_polar(20, this.A_to_B_angle - this.theta/2));
        },
        theta_AD: function() {
            return vec_add(this.A, vec_polar(20, this.A_to_B_angle + this.theta/2));
        },
        theta_BE: function() {
            return vec_add(this.B, vec_polar(20, this.B_to_A_angle + this.theta/2));
        },
        theta_BF: function() {
            return vec_add(this.B, vec_polar(20, this.B_to_A_angle - this.theta/2));
        }
    }
});


let pulley_problem = new Vue({
    el: "#pulley-problem",
    data: {
        A: {x: 150, y: 150, r: 130},
        B: {x: 450, y: 150, r: 50}
    },
    computed: {
        non_containing: function() {
            return vec_distance(this.A, this.B) >= this.A.r - this.B.r;
        },
        theta: function() {
            const P = vec_distance(this.A, this.B);
            const cos_angle = (this.A.r - this.B.r) / P;
            return Math.acos(cos_angle);
        },
        A_to_B_angle: function() {
            return vec_facing(this.A, this.B);
        },
        C: function() {
            return vec_add(this.A, vec_polar(this.A.r, this.A_to_B_angle - this.theta));
        },
        D: function() {
            return vec_add(this.A, vec_polar(this.A.r, this.A_to_B_angle + this.theta));
        },
        E: function() {
            return vec_add(this.B, vec_polar(this.B.r, this.A_to_B_angle + this.theta));
        },
        F: function() {
            return vec_add(this.B, vec_polar(this.B.r, this.A_to_B_angle - this.theta));
        },
        theta_AC: function() {
            return vec_add(this.A, vec_polar(20, this.A_to_B_angle - this.theta/2));
        },
        theta_AD: function() {
            return vec_add(this.A, vec_polar(20, this.A_to_B_angle + this.theta/2));
        },
        theta_BE: function() {
            return vec_add(this.B, vec_polar(20, this.A_to_B_angle + this.theta/2));
        },
        theta_BF: function() {
            return vec_add(this.B, vec_polar(20, this.A_to_B_angle - this.theta/2));
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
makeCircleDraggable($('pulley-problem'), $('pulley-circle-1'), pulley_problem.A);
makeCircleDraggable($('pulley-problem'), $('pulley-circle-2'), pulley_problem.B);

// TODO: might be better to make the draggable into a vue component, but this works for now
