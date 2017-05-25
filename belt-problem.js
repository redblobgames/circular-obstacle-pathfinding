// From https://redblobgames.github.io/circular-obstacle-pathfinding/
// Copyright 2017 Red Blob Games <redblobgames@gmail.com>
// License: Apache v2.0 <http://www.apache.org/licenses/LICENSE-2.0.html>

/** Return point a given distance and direction from a start point */
function direction_step(start, distance, angle) {
    return vec_add(start, vec_polar(distance, angle));
}


/** Intersection between segment AB and circle C */
function segment_circle_intersection(A, B, C) {
    const CA = vec_sub(C, A), BA = vec_sub(B, A);
    let u = (CA.x * BA.x + CA.y * BA.y) / (BA.x * BA.x + BA.y * BA.y);
    if (u < 0.0) { u = 0.0; }
    if (u > 1.0) { u = 1.0; }

    const E = vec_interpolate(A, B, u);
    const d = vec_distance(C, E);
    return { u: u, d: d, E: E, intersects: d <= C.r };
}

    
/** Calculations needed for internal bitangents */
class InternalBitangents {
    constructor (A, B) {
        this.A = A;
        this.B = B;
    }
    get theta() {
        const P = vec_distance(this.A, this.B);
        const cos_angle = (this.A.r + this.B.r) / P;
        return Math.acos(cos_angle);
    }
    get AB_angle() { return vec_facing(this.A, this.B); }
    get BA_angle() { return vec_facing(this.B, this.A); }
    get C() { return direction_step(this.A, this.A.r, this.AB_angle - this.theta); }
    get D() { return direction_step(this.A, this.A.r, this.AB_angle + this.theta); }
    get E() { return direction_step(this.B, this.B.r, this.BA_angle + this.theta); }
    get F() { return direction_step(this.B, this.B.r, this.BA_angle - this.theta); }
}


/** Calculations needed for external bitangents */
class ExternalBitangents {
    constructor (A, B) {
        this.A = A;
        this.B = B;
    }
    get theta() {
        const P = vec_distance(this.A, this.B);
        const cos_angle = (this.A.r - this.B.r) / P;
        return Math.acos(cos_angle);
    }
    get AB_angle() { return vec_facing(this.A, this.B); }
    get C() { return direction_step(this.A, this.A.r, this.AB_angle - this.theta); }
    get D() { return direction_step(this.A, this.A.r, this.AB_angle + this.theta); }
    get E() { return direction_step(this.B, this.B.r, this.AB_angle + this.theta); }
    get F() { return direction_step(this.B, this.B.r, this.AB_angle - this.theta); }
}


/* Diagrams */


let belt_problem = new Vue({
    el: "#diagram-belt-problem",
    data: {
        A: {x: 150, y: 150, r: 130},
        B: {x: 450, y: 150, r: 50}
    },
    computed: {
        non_overlapping: function() { return !isNaN(this.bitangent.theta); },
        bitangent: function() { return new InternalBitangents(this.A, this.B); },
        C: function() { return this.bitangent.C; },
        D: function() { return this.bitangent.D; },
        E: function() { return this.bitangent.E; },
        F: function() { return this.bitangent.F; },
        theta_AC: function() { return direction_step(this.A, 20, this.bitangent.AB_angle - this.bitangent.theta/2); },
        theta_AD: function() { return direction_step(this.A, 20, this.bitangent.AB_angle + this.bitangent.theta/2); },
        theta_BE: function() { return direction_step(this.B, 20, this.bitangent.BA_angle + this.bitangent.theta/2); },
        theta_BF: function() { return direction_step(this.B, 20, this.bitangent.BA_angle - this.bitangent.theta/2); }
    }
});


let pulley_problem = new Vue({
    el: "#diagram-pulley-problem",
    data: {
        A: {x: 150, y: 150, r: 130},
        B: {x: 450, y: 150, r: 50}
    },
    computed: {
        containing: function() { return vec_distance(this.A, this.B) < this.A.r - this.B.r; },
        bitangent: function() { return new ExternalBitangents(this.A, this.B); },
        C: function() { return this.bitangent.C; },
        D: function() { return this.bitangent.D; },
        E: function() { return this.bitangent.E; },
        F: function() { return this.bitangent.F; },
        theta_AC: function() { return direction_step(this.A, 20, this.bitangent.AB_angle - this.bitangent.theta/2); },
        theta_AD: function() { return direction_step(this.A, 20, this.bitangent.AB_angle + this.bitangent.theta/2); },
        theta_BE: function() { return direction_step(this.B, 20, this.bitangent.AB_angle + this.bitangent.theta/2); },
        theta_BF: function() { return direction_step(this.B, 20, this.bitangent.AB_angle - this.bitangent.theta/2); }
    }
});


let hugging_edge = new Vue({
    el: "#diagram-hugging-edge",
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
        B: function() { return direction_step(this.C, this.C.r, this.angle_to_A); },
        D: function() { return direction_step(this.C, this.C.r, this.angle_to_E); },
        arc_path: function() {
            let angle = this.angle_to_E - this.angle_to_A;
            while (angle < 0) { angle += 2 * Math.PI; }
            let large_arc = angle >= Math.PI ? 1 : 0;
            return `M ${this.B.x},${this.B.y} A ${this.C.r},${this.C.r} 0 ${large_arc} 1 ${this.D.x},${this.D.y}`;
        }
    }
});


let surfing_line_of_sight = new Vue({
    el: "#diagram-surfing-line-of-sight",
    data: {
        A: {x: 150, y: 150},
        B: {x: 450, y: 150},
        C: {x: 300, y: 125, r: 50}
    },
    computed: {
        calculation: function() { return segment_circle_intersection(this.A, this.B, this.C); },
        intersects: function() { return this.calculation.intersects; },
        d: function() { return this.calculation.d; },
        r: function() { return this.C.r; },
        E: function() { return vec_add(this.calculation.E, {x: 0, y: 1e-6}); /* need epsilon for label placement when C.y == 0 */ },
        F: function() { // the end of the line showing 'r'
            let angle = Math.PI * 0.75 + vec_facing(this.C, this.E);
            return direction_step(this.C, this.C.r, angle);
        },
        dashed_line_offset: function() { return this.C.y < this.A.y? 70 : -70; },
        signed_r: function() { return this.C.y < this.A.y? this.r : -this.r; }
    }
});


let circle_overlap = new Vue({
    el: "#diagram-circle-overlap",
    data: {
        A: {x: 220, y: 120, r: 100},
        B: {x: 350, y: 180, r: 80}
    },
    computed: {
        valid: function() { return !isNaN(this.theta); },
        containing: function() { return this.AB_distance < this.A.r - this.B.r; },
        overlapping: function() { return this.AB_distance < this.A.r + this.B.r; },
        AB_distance: function() { return vec_distance(this.A, this.B); },
        AB_angle: function() { return vec_facing(this.A, this.B); },
        C: function() { return vec_interpolate(this.A, this.B, this.a / this.AB_distance); },
        D: function() { return direction_step(this.A, this.A.r, this.AB_angle + this.theta); },
        E: function() { return direction_step(this.A, this.A.r, this.AB_angle - this.theta); },
        theta_AC: function() { return direction_step(this.A, 20, this.AB_angle - this.theta/2); },
        theta_AD: function() { return direction_step(this.A, 20, this.AB_angle + this.theta/2); },
        a: function() {
            const d = this.AB_distance;
            const Ar = this.A.r, Br = this.B.r;
            return (Ar*Ar - Br*Br + d*d) / (2*d);
        },
        theta: function() {
            return Math.acos(this.a / this.A.r);
        },
        opposite_C: function() {
            return direction_step(this.C, 1, vec_facing(this.A, this.B) + Math.PI/4);
        }
    }
});


let bitangents_overlap = new Vue({
    el: "#diagram-bitangents-overlap",
    data: {
        A: {x: 150, y: 150, r: 130},
        B: {x: 450, y: 150, r: 50}
    },
    computed: {
        overlapping: function() { return vec_distance(this.A, this.B) < this.A.r + this.B.r; },
        containing: function() { return vec_distance(this.A, this.B) < this.A.r - this.B.r; },
        internal: function() { return new InternalBitangents(this.A, this.B); },
        external: function() { return new ExternalBitangents(this.A, this.B); }
    }
});
