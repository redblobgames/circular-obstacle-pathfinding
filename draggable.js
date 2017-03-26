// From http://www.redblobgames.com/
// Copyright 2017 Red Blob Games <redblobgames@gmail.com>
// License: Apache v2.0 <http://www.apache.org/licenses/LICENSE-2.0.html>

/** reference element: does not move during drag, defines coordinate system
    element: may move, gets mousedown handler
    handler: function called with (start, current, last)
    where last is the value returned last time handler called
*/
function makeDraggable(reference, element, handler) {
    element.addEventListener('mousedown', mouseDown);
    element.addEventListener('touchstart', touchEvent);
    element.addEventListener('touchmove', touchEvent);
    element.addEventListener('touchend', touchEvent);
    
    function coords(rect, e) {
        return {x: e.clientX - rect.left, y: e.clientY - rect.top};
    }

    function mouseDown(e) {
        if (e.button != 0) { return; /* don't trap right click */ }
        const rect = reference.getBoundingClientRect();
        const start = coords(rect, e);
        let last = handler(start, start, null);
        
        function mouseMove(e) {
            last = handler(start, coords(rect, e), last);
            e.preventDefault();
            e.stopPropagation();
        }

        function mouseUp(e) {
            window.removeEventListener('mousemove', mouseMove);
            window.removeEventListener('mouseup', mouseUp);
            e.preventDefault();
            e.stopPropagation();
        }

        window.addEventListener('mousemove', mouseMove);
        window.addEventListener('mouseup', mouseUp);
        e.preventDefault();
        e.stopPropagation();
    }

    let touch_start = [];
    let touch_last = [];
    
    function touchEvent(e) {
        for (let i = 0; i < e.changedTouches.length; i++) {
            const rect = reference.getBoundingClientRect();
            const touch = e.changedTouches[i];
            let current = coords(rect, touch);
            if (e.type == 'touchstart') {
                touch_start[touch.identifier] = current;
                touch_last[touch.identifier] = handler(current, current, null);
            } else {
                let start = touch_start[touch.identifier];
                let last = touch_last[touch.identifier];
                touch_last[touch.identifier] = handler(start, current, last);
            }
        }
        e.preventDefault();
        e.stopPropagation();
    }
}
