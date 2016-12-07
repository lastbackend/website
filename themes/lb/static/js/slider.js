(function () {
    'use strict';

    var sliders = document.getElementsByClassName('range-slider');
    Array.prototype.forEach.call(sliders, init);

    var boxes = document.getElementsByClassName('di-slider-p__spr');
    Array.prototype.forEach.call(boxes, watch);

    function init(slider) {
        var progress = slider.getElementsByClassName('range-slider-progress')[0];
        var handle   = slider.getElementsByClassName('range-slider-handle')[0];
        var stats    = {
            x       : 0,
            width   : 0,
            k       : 1,
            progress: 0,
            position: 0
        };

        handle.addEventListener('mousedown', begin);
        handle.addEventListener('touchstart', begin);

        function begin(event) {
            stats.x     = getScreenX(event);
            stats.width = progress.offsetWidth;
            stats.k     = 100 / (stats.width || 100);
            window.addEventListener('mousemove', move);
            window.addEventListener('touchmove', move);
            window.addEventListener('mouseup', end);
            window.addEventListener('mouseleave', end);
            window.addEventListener('touchend', end);
        }

        function move(event) {
            var different  = getScreenX(event) - stats.x;
            stats.position = stats.progress + different * stats.k;
            if (stats.position < 0) stats.position = 0;
            if (stats.position > 100) stats.position = 100;

            progress.style.left = (stats.position - 100) + '%';
            handle.style.left   = stats.position + '%';

            change(stats.position);
        }

        function end() {
            stats.progress = stats.position;
            window.removeEventListener('mousemove', move);
            window.removeEventListener('touchmove', move);
            window.removeEventListener('mouseup', end);
            window.removeEventListener('mouseleave', end);
            window.removeEventListener('touchend', end);
        }

        function change(value) {
            var data = {
                value: value
            };

            var event = document.createEvent("CustomEvent");
            event.initCustomEvent("change", true, true, data);
            slider.dispatchEvent(event);
        }

        function getScreenX(event) {
            if (event.clientX) return event.clientX;
            var changedTouches = event.changedTouches;
            var touch          = changedTouches && changedTouches[0];
            return (touch && touch.clientX) || 0;
        }

    }

    function watch(box) {
        var decimal  = parseInt(box.getAttribute('data-decimal')) || 0;
        var min      = parseInt(box.getAttribute('data-min')) || 0;
        var step     = parseInt(box.getAttribute('data-step')) || 1;
        var isMemory = box.getAttribute('data-is-memory') == 'true';
        var five     = box.getAttribute('data-five') != 'false';

        var slider = box.getElementsByClassName('range-slider')[0];
        var memory = box.getElementsByClassName('slider_memory')[0];
        var price  = box.getElementsByClassName('slider_price')[0];
        var tplVal = memory.textContent;
        var tpl    = price.textContent;
        slider.addEventListener('change', change);
        change({detail: {value: 0}});

        function change(event) {
            var data  = event.detail;
            var value = data.value;

            var cPosition = Math.ceil(value / 14 * step);
            if (isMemory) cPosition = Math.pow(2, cPosition + 7);

            memory.textContent  = tplVal.replace('${val}', getMemory(cPosition));
            price.textContent  = tpl.replace('${price}', round(cPosition));
        }

        function round(val) {
            if (val == 128) return 1.25;
            if (val == 256) return 2.5;
            if (val == 512) return 5;
            if (val == 1024) return 10;
            if (val == 2048) return 20;
            if (val == 4096) return 40;
            if (val == 8192) return 80;
            if (val == 16384) return 120;
            if (val == 32768) return 240;
        }
    }

    function getMemory(memory) {
        if (memory == 128) return '128 MB';
        if (memory == 256) return '256 MB';
        if (memory == 512) return '512 MB';
        if (memory == 1024) return '1 GB';
        if (memory == 2048) return '2 GB';
        if (memory == 4096) return '4 GB';
        if (memory == 8192) return '8 GB';
        if (memory == 16384) return '16 GB';
        if (memory == 32768) return '32 GB';
    }

})();

