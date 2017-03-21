// From http://www.redblobgames.com/
// Copyright 2017 Red Blob Games <redblobgames@gmail.com>
// License: Apache v2.0 <http://www.apache.org/licenses/LICENSE-2.0.html>

/** reference element: does not move during drag, defines coordinate system
    element: may move, gets mousedown handler
    handler: function called with (start, current, last)
    where last is the value returned last time handler called
    TODO: handle touch events -- http://devdocs.io/dom/touch_events/supporting_both_touchevent_and_mouseevent
*/
function makeDraggable(reference, element, handler) {
    element.addEventListener('mousedown', mouseDown);
    
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
        }

        function mouseUp(e) {
            window.removeEventListener('mousemove', mouseMove);
            window.removeEventListener('mouseup', mouseUp);
            e.preventDefault();
        }

        window.addEventListener('mousemove', mouseMove);
        window.addEventListener('mouseup', mouseUp);
        e.preventDefault();
    }
}
