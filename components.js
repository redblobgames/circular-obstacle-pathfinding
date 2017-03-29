// From https://redblobgames.github.io/circular-obstacle-pathfinding/
// Copyright 2017 Red Blob Games <redblobgames@gmail.com>
// License: Apache v2.0 <http://www.apache.org/licenses/LICENSE-2.0.html>

const TEXT_OFFSET = {x: 0, y: 5};

Vue.component('a-label', {
    props: ['at', 'opposite', 'label'],
    template: '<text :x="at.x" :y="at.y" :dx="shove.x" :dy="shove.y">{{ label }}</text>',
    computed: {
        shove: function() {
            const angle = vec_facing(this.at, this.opposite);
            return vec_add(TEXT_OFFSET, vec_polar(-15, angle));
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
 * the model object, and move the <g>.
 * 
 * A Vue component version of http://www.redblobgames.com/js/draggable.js
 * specialized for dragging svg objects.
 */
Vue.component('a-draggable', {
    props: ['model'],
    template: `
       <g class="draggable"
          :transform='"translate(" + [this.model.x, this.model.y] + ")"'
          @mousedown.left.stop.prevent="mousedown"
          @touchstart.stop.prevent="touchstart"
          @touchmove.stop.prevent="touchmove">
          <slot/>
       </g>`,
    data: function() {
        return {
            startTouchCoords: [],
            startTouchModel: []
        };
    },
    methods: {
        coords: function(e) {
            const rect = this.$parent.$el.getBoundingClientRect();
            return {x: e.clientX - rect.left, y: e.clientY - rect.top};
        },
        moveTo: function(startCoords, startModel, currentCoords) {
            // TODO: constraints on movement
            this.model.x = startModel.x + (currentCoords.x - startCoords.x);
            this.model.y = startModel.y + (currentCoords.y - startCoords.y);
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
                window.removeEventListener('mousemove', mousemove);
                window.removeEventListener('mouseup', mouseup);
                e.preventDefault();
                e.stopPropagation();
            };

            // TODO: add "dragging" class to <g>; remove on mouseup
            window.addEventListener('mousemove', mousemove);
            window.addEventListener('mouseup', mouseup);
        },
        touchstart: function(e) {
            // TODO: add "dragging" class to <g>; remove on touchend
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
        }
    }
});
