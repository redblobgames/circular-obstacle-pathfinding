// From https://redblobgames.github.io/circular-obstacle-pathfinding/
// Copyright 2017 Red Blob Games <redblobgames@gmail.com>
// License: Apache v2.0 <http://www.apache.org/licenses/LICENSE-2.0.html>

const TEXT_OFFSET = {x: 0, y: 5};

/** Label placed on the opposite side from a reference point.
 *  e.g. if R is the reference and L is the label for point P,
 *  R P --> place L on the right, R P L
 *  P R --> place L on the left, L P R
 */
Vue.component('a-label', {
    props: ['at', 'opposite', 'label', 'dx', 'dy'],
    template: '<text :x="at.x" :y="at.y" :dx="shove.x" :dy="shove.y">{{ label }}</text>',
    computed: {
        shove: function() {
            const angle = vec_facing(this.at, this.opposite);
            return vec_add(vec_add(TEXT_OFFSET, {x: parseFloat(this.dx) || 0, y: parseFloat(this.dy) || 0}),
                           vec_polar(-15, angle));
        }
    }
});


/** Small dashed tick perpendicular to a line,
 *  from t0 to t1 units relative to the at --> opposite line,
 *  e.g. t0 = -5, t1 = +5 will make a 10 unit long dashed line
 *  centered at 'at'
 */
Vue.component('a-tick', {
    props: ['at', 'opposite', 't0', 't1'],
    template: `
         <line class="dashed"
               :x1="this.at.x + d.x*(t0||-15)" :y1="this.at.y + d.y*(t0||-15)"
               :x2="this.at.x + d.x*(t1||+15)" :y2="this.at.y + d.y*(t1||+15)"/>`,
    computed: {
        d: function() {
            return vec_normalize({x: this.opposite.y - this.at.y,
                                  y: this.at.x - this.opposite.x});
        }
    }
});


/** Draggable svg object
 *
 * Use: <a-draggable :model="...">...svg...</a-draggable>
 *
 * Creates a <g class="draggable"> that's positioned at the x,y
 * coordinates in the model object. The contained svg object should be
 * drawn at 0,0, not at x,y.
 *
 * When the svg object is dragged, it will update the x,y fields in
 * the model object, and move the <g>. If a constraint= property is
 * set, it should return a function(x,y) that returns true if the
 * position (x,y) is an allowed position for the object.
 *
 * A Vue component version of http://www.redblobgames.com/js/draggable.js
 * specialized for dragging svg objects.
 */
Vue.component('a-draggable', {
    props: ['model', 'constraint'],
    template: `
       <g :class="classList"
          :transform='"translate(" + [this.model.x, this.model.y] + ")"'
          @mousedown.left.stop.prevent="mousedown"
          @touchstart.stop.prevent="touchstart"
          @touchmove.stop.prevent="touchmove"
          @touchend.stop.prevent="touchend">
          <slot/>
       </g>`,
    data: function() {
        return {
            startTouchCoords: [],
            startTouchModel: [],
            dragging: 0
        };
    },
    computed: {
        classList: function() {
            return "draggable" + (this.dragging? " dragging" : "");
        }
    },
    methods: {
        coords: function(e) {
            const svg = this.$el.ownerSVGElement;
            const rect = svg.getBoundingClientRect();
            let domCoords = {x: e.clientX - rect.left, y: e.clientY - rect.top};
            let point = svg.createSVGPoint();
            point.x = domCoords.x;
            point.y = domCoords.y;
            let svgCoords = point.matrixTransform(svg.getScreenCTM().inverse());
            return svgCoords;
        },
        moveTo: function(startCoords, startModel, currentCoords) {
            const newX = startModel.x + (currentCoords.x - startCoords.x);
            const newY = startModel.y + (currentCoords.y - startCoords.y);
            let svg = this.$el.ownerSVGElement;
            const rect = svg.getBoundingClientRect();

            // newX, newY are svg coords but the rect is dom coords so convert
            let point = svg.createSVGPoint();
            point.x = newX;
            point.y = newY;
            let domCoords = point.matrixTransform(svg.getScreenCTM());
            
            if (rect.left <= domCoords.x && domCoords.x < rect.right
                && rect.top <= domCoords.y && domCoords.y < rect.bottom
                && (this.constraint === undefined || this.constraint(newX, newY))) {
                this.model.x = newX;
                this.model.y = newY;
            }
        },
        mousedown: function(e) {
            const startCoords = this.coords(e);
            const startModel = {x: this.model.x, y: this.model.y};
            
            const mousemove = (e) => {
                this.moveTo(startCoords, startModel, this.coords(e));
                e.preventDefault();
                e.stopPropagation();
            };

            const mouseup = (e) => {
                this.dragging--;
                window.removeEventListener('mousemove', mousemove);
                window.removeEventListener('mouseup', mouseup);
                e.preventDefault();
                e.stopPropagation();
            };

            this.dragging++;
            window.addEventListener('mousemove', mousemove);
            window.addEventListener('mouseup', mouseup);
        },
        touchstart: function(e) {
            this.dragging += e.changedTouches.length;
            for (let i = 0; i < e.changedTouches.length; i++) {
                const touch = e.changedTouches[i], id = touch.identifier;
                this.startTouchCoords[id] = this.coords(touch);
                this.startTouchModel[id] = {x: this.model.x, y: this.model.y};
            }
        },
        touchmove: function(e) {
            for (let i = 0; i < e.changedTouches.length; i++) {
                const touch = e.changedTouches[i], id = touch.identifier;
                this.moveTo(this.startTouchCoords[id],
                            this.startTouchModel[id],
                            this.coords(touch));
            }
        },
        touchend: function(e) {
            this.dragging -= e.changedTouches.length;
        }
    }
});
