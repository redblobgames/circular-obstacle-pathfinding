// From https://redblobgames.github.io/circular-obstacle-pathfinding/
// Copyright 2017 Red Blob Games <redblobgames@gmail.com>
// License: Apache v2.0 <http://www.apache.org/licenses/LICENSE-2.0.html>

const TEXT_OFFSET = {x: 0, y: 5};

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


/** Draggable svg object
 *
 * Use: <a-draggable :model="...">...svg...</draggable>
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
            const rect = this.$parent.$el.getBoundingClientRect();
            return {x: e.clientX - rect.left, y: e.clientY - rect.top};
        },
        moveTo: function(startCoords, startModel, currentCoords) {
            const newX = startModel.x + (currentCoords.x - startCoords.x);
            const newY = startModel.y + (currentCoords.y - startCoords.y);
            const rect = this.$parent.$el.getBoundingClientRect();
            if (0 <= currentCoords.x && currentCoords.x < rect.width
                && 0 <= currentCoords.y && currentCoords.y < rect.height
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
