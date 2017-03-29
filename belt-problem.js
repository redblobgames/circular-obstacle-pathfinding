// From https://redblobgames.github.io/circular-obstacle-pathfinding/
// Copyright 2017 Red Blob Games <redblobgames@gmail.com>
// License: Apache v2.0 <http://www.apache.org/licenses/LICENSE-2.0.html>

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


let hugging_edge = new Vue({
    el: "#hugging-edge",
    data: {
        A: {x: 150, y: 200},
        C: {x: 300, y: 100, r: 40},
        E: {x: 450, y: 200}
    },
    computed: {
        valid: function() { return !isNaN(this.angle_to_A) && !isNaN(this.angle_to_E); },
        mid_BD: function() { return vec_interpolate(this.B, this.D, 0.5); },
        angle_to_A: function() {
            return vec_facing(this.C, this.A) + Math.acos(this.C.r / vec_distance(this.C, this.A));
        },
        angle_to_E: function() {
            return vec_facing(this.C, this.E) - Math.acos(this.C.r / vec_distance(this.C, this.E));
        },
        B: function() { return vec_add(this.C, vec_polar(this.C.r, this.angle_to_A)); },
        D: function() { return vec_add(this.C, vec_polar(this.C.r, this.angle_to_E)); },
        arc_path: function() {
            // TODO: large-arc flag
            return `M ${this.B.x},${this.B.y} A ${this.C.r},${this.C.r} 0 0 1 ${this.D.x},${this.D.y}`;
        }
    }
});
