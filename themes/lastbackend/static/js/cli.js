(function () {
    'use strict';

    var qout = new Queue();

    var commands = [
        {cmd: /^lb\shelp$/, output: 'help'},
        {cmd: /^lb\sinit\shello-world$/, output: 'lbInit'},
        {cmd: /^git\spush\slb\smaster$/, output: 'gitPush'}
    ];

    var actions = {
        enter: exec
    };

    var keys = {
        13: 'enter'
    };

    var cli = document.querySelector('.w-cli');
    if (!cli) return;
    var input    = cli.querySelector('.w-cli__i');
    var scenario = new Scenario('[data-next-step]', [
        {name: 'lbInit', msg: 'lb init hello-world'},
        {name: 'gitPush', msg: 'git push lb master'}
    ]);

    cli.addEventListener('keyup', keyup);
    cli.addEventListener('click', click);
    qout.subscribe(printer, 500);

    function keyup(event) {
        var key    = keys[event.keyCode];
        var action = key && actions[key];
        return action && action();
    }

    function click() {
        input.style.display = "inline-block";
        input.focus();
        Array.prototype.forEach.call(document.getElementsByClassName('lb-hm-cli__cm'), hide);

        function hide(item) {
            item.style.display = 'none';
        }
    }

    function exec() {
        var stdin         = input.textContent;
        input.textContent = '';
        gaSend('cli', stdin);
        cmd(stdin);
    }

    function cmd(stdin) {
        print('<span class="w-cli__ow">$ ' + stdin + '</span>', 0);
        printer(qout.get());
        block();
        var action = commands.find(find, stdin);
        if (!action) return loadStdout('error');
        loadStdout(action.output);
        scenario.check(action.output);

        function find(item) {
            var exp = this;
            return item.cmd.test(exp);
        }
    }

    function print(text, timeout, rm) {
        var line       = document.createElement('div');
        line.innerHTML = text;
        line.classList.add('w-cli__o');
        qout.set({stdout: line.outerHTML, rm: rm || false}, timeout);
    }

    function printer(val) {
        if (!val || !val.stdout) return false;
        if (val.rm) rmLine();
        input.insertAdjacentHTML('beforeBegin', val.stdout);
        if (!qout.size) unblock();
        cli.scrollTop = cli.scrollHeight;
    }

    function rmLine() {
        var lines = cli.querySelectorAll('.w-cli__o');
        var line  = lines[lines.length - 1];
        line.parentNode.removeChild(line);
    }

    function block() {
        input.style.opacity = '0';
    }

    function unblock() {
        input.style.opacity = '1';
        input.focus();
        scenario.next();
    }

    function loadStdout(file, flags) {
        xhr('GET', '/js/logs/' + file + '.js', result);

        function result(text) {
            new Function('print, flags', text)(print, flags);
        }
    }

})();

// Auto typing text
(function () {
    /**
     * <strong data-autotype-text="simple, easy, fast, awesome, convenient">easy</strong>
     */
    var autotypes = document.querySelectorAll('[data-autotype-text]');
    for (var index = 0; index < autotypes.length; index++) {
        typing(autotypes[index]);
    }

    function typing(node) {
        if (!node) return false;
        var timeout = 2000;
        var speed   = 75;
        var texts   = node.getAttribute('data-autotype-text').split(',');
        var current = 0;

        setTimeout(type, timeout);

        function type() {
            var text = texts[current];
            if (node.innerText != text) node.innerText = text[0];
            var word = node.innerText.length;

            var iterator = setInterval(write, speed);

            function write() {
                if (word == text.length) return revers();
                node.innerText += text[word];
                word++;
            }

            function remove() {
                node.innerText = node.innerText.substr(0, node.innerText.length - 1);
                word--;
                if (word == 0) next();
            }

            function revers() {
                clearInterval(iterator);
                setTimeout(release, timeout);

                function release() {
                    iterator = setInterval(remove, speed);
                }
            }

            function next() {
                clearInterval(iterator);
                current++;
                if (current == texts.length) current = 0;
                setTimeout(type, 250);
            }
        }
    }

})();

// affix title
(function () {

    var container = document.querySelector('[data-lb-affix-container]');
    if (!container) return;
    var node = container.querySelector('[data-lb-affix]');
    if (!node) return;
    container.style.position = 'relative';
    node.style.position      = 'relative';
    node.style.transition    = 'none';

    setTimeout(iterator, 0);


    function iterator() {
        var parent = rect(container);
        var offset = {
            top   : 100,
            bottom: 115 //node.offsetHeight
        };
        var top    = -parent.top + offset.top;
        var bottom = parent.height - offset.bottom;

        if (top < 0) {
            node.style.position = 'relative';
            node.style.width    = 'auto';
            node.style.top      = '0';
        } else if (bottom > top) {
            node.style.position = 'fixed';
            node.style.width    = width(node.parentNode);
            node.style.top      = offset.top + 'px';
        } else {
            node.style.position = 'relative';
            node.style.width    = 'auto';
            node.style.top      = bottom + 'px';
        }

        setTimeout(iterator, 0);

        function width(node) {
            var styles = getComputedStyle(node);
            return parseInt(styles.width) -
                parseInt(styles.paddingLeft) -
                parseInt(styles.paddingRight);
        }
    }

    function rect(node) {
        return node.getClientRects()[0];
    }


})();

// Gallery
(function () {

    var controls = $('[data-gallery-control]');
    controls.on('click', move);

    function move($event) {
        var control = $(this);

        var params = control.attr('data-gallery-control').split(/[\,\s]+/g);
        var id     = params[0];
        var index  = params[1];

        var gallery  = $('[data-gallery-id="' + id + '"]');
        var controls = gallery.find('[data-gallery-control]');
        var slides   = gallery.find('[data-gallery-slide]');

        controls.removeClass('active');


        var i, slide;
        if ((index == 'next') || (index == 'back')) {
            for (i = 0; i < slides.length; i++) {
                slide = slides[i];
                if (slide.classList.contains('active')) {
                    index = i + ((index == 'next') ? +1 : -1);
                    break;
                }
            }
        }

        if (index < 0) index = slides.length - 1;
        if (index > slides.length - 1) index = 0;

        controls[index].classList.add('active');
        slides.removeClass('active');
        gallery.find('[data-gallery-slide="' + index + '"]').addClass('active');
    }

})();

// Video modal
(function () {

    var modal = $('#videoModal');
    var frame = '<iframe src="https://www.youtube.com/embed/Ibsd2OHSlDA?rel=0&amp;showinfo=0" ' +
        'frameborder="0" allowfullscreen></iframe>';

    modal.on('show.bs.modal', show);
    modal.on('hide.bs.modal', hide);

    function show() {
        modal.find('.modal-body').html(frame);
    }

    function hide() {
        modal.find('.modal-body').html('');
    }

})();

// Subscribe
(function () {
    var button = document.getElementById('subscribe-button');
    button.addEventListener('click', subscribe);

    if (getCookie('lb-subscribed')) {
        document.getElementById('footer-subscribe').innerHTML = '';
    }

    function subscribe() {
        var input = document.getElementById('subscribe-input');
        var box   = input.parentNode;
        prepare();
        var email = input.value;

        if (!email) return error();
        setCookie('lb-subscribed', email, {path: '/'});
        createIcContact({
            email: email
        });
        success();

        function prepare() {
            button.disabled = true;
            box.classList.remove('has-error');
        }

        function success() {
            box.classList.add('text-success');
            box.innerHTML = 'Subscribed!';
        }

        function error() {
            button.disabled = false;
            box.classList.add('has-error');
        }
    }

})();

// Subscribe Enterprise
(function () {
    var form = document.getElementById('enterprise-form');
    if (!form) return;
    var button = form.querySelector('button');
    button.addEventListener('click', subscribe);

    function subscribe() {
        var first_name = form.querySelector('[name="first_name"]');
        var last_name  = form.querySelector('[name="last_name"]');
        var email      = form.querySelector('[name="email"]');
        var company    = form.querySelector('[name="company"]');
        var country    = form.querySelector('[name="country"]');
        var message    = form.querySelector('[name="message"]');

        if (!validate()) return false;

        prepare();
        createIcContact({
            name   : [first_name.value, last_name.value].join(' '),
            email  : email.value,
            company: company.value,
            country: country.value,
            message: message.value
        });
        success();

        function validate() {
            first_name.parentNode.classList.remove('has-error');
            last_name.parentNode.classList.remove('has-error');
            email.parentNode.classList.remove('has-error');
            company.parentNode.classList.remove('has-error');
            message.parentNode.classList.remove('has-error');

            if (!first_name.value) {
                first_name.parentNode.classList.add('has-error');
                return false;
            }
            if (!last_name.value) {
                last_name.parentNode.classList.add('has-error');
                return false;
            }
            if (!email.value) {
                email.parentNode.classList.add('has-error');
                return false;
            }
            if (!company.value) {
                company.parentNode.classList.add('has-error');
                return false;
            }
            if (!message.value) {
                message.parentNode.classList.add('has-error');
                return false;
            }
            return true;
        }

        function prepare() {
            button.disabled = true;
        }

        function success() {
            form.classList.add('text-success');
            form.classList.add('text-20');
            form.innerHTML = 'Success!';
        }
    }

})();

// Tabs on how-it-works page
(function () {
    'use strict';

    var tabs   = document.querySelectorAll('.lb-how-it-works__scheme-tab');
    var images = document.querySelectorAll('.lb-how-it-works__scheme-img>img');

    tabs   = Array.prototype.map.call(tabs, transform);
    images = Array.prototype.map.call(images, transform);

    if (!tabs.length) return false;

    tabs.forEach(handle);
    click.call(tabs[0]);

    function transform(node) {
        return node;
    }

    function handle(tab) {
        tab.addEventListener('click', click);
    }

    function click() {
        var tab = this;

        if (tab.classList.contains('active')) {
            tabs.forEach(deactivate);
            images.forEach(deactivate);
            images[images.length - 1].classList.add('active');
            return false;
        }

        tabs.forEach(deactivate);
        images.forEach(deactivate);

        var index = tabs.indexOf(tab);

        tabs[index].classList.add('active');
        images[index].classList.add('active');
    }

    function deactivate(node) {
        node.classList.remove('active')
    }

})();

// Parallax
(function () {
    'use strict';

    var elements = document.querySelectorAll('[data-parallax="scroll-out"]');

    window.addEventListener('scroll', scrolling);

    function scrolling() {
        var value = document.body.scrollTop;
        Array.prototype.forEach.call(elements, scrollOut, value);
    }

    function scrollOut(element) {
        var position = this;
        var move     = position / 1.5;
        var height   = element.offsetHeight;
        var opacity  = (height - position) / height;
        opacity      = opacity * opacity;
        var inner    = element.querySelector('[data-parallax-inner]');

        element.style.transform = 'translate(' + 0 + ', ' + move + 'px)';
        if (inner) inner.style.opacity = opacity;
    }

})();

// Slider
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
        var cost     = parseFloat(box.getAttribute('data-calculator')) || 1;
        var decimal  = parseInt(box.getAttribute('data-decimal')) || 0;
        var min      = parseInt(box.getAttribute('data-min')) || 0;
        var step     = parseInt(box.getAttribute('data-step')) || 1;
        var isMemory = box.getAttribute('data-is-memory') == 'true';
        var five     = box.getAttribute('data-five') != 'false';

        var slider = box.getElementsByClassName('range-slider')[0];
        var memory = box.getElementsByClassName('di-slider-p__spr-im')[0];
        var price  = box.getElementsByClassName('di-slider-p__spr-ip')[0];
        var tplVal = memory.textContent;
        var tpl    = price.textContent;
        slider.addEventListener('change', change);
        change({detail: {value: 0}});

        function change(event) {
            var data  = event.detail;
            var value = data.value;

            var cPosition = Math.ceil(value / 10 * step);
            if (isMemory) cPosition = Math.pow(2, cPosition + 5);

            memory.textContent  = tplVal.replace('${val}', cPosition).replace('${mes}', 'MB');
            price.textContent  = tpl.replace('${price}', round(cost * cPosition));
        }

        function round(val) {
            var factor = Math.pow(10, decimal);
            val        = Math.ceil(val * factor);
            if (!five) return val / factor;
            var last = val % 10;
            val      = val - last;
            if (last > 5) return (val + 10) / factor;
            if (last > 0) return (val + 5) / factor;
            return val / factor;
        }
    }

    function getMemoryText(memory) {
        if (memory < 1024) return 'MB';
        memory = memory / 1024;
        if (memory < 1024) return 'GB';
        memory = memory / 1024;
        return 'TB';
    }

})();

function createIcContact(data) {
    var url = "https://api.lastbackend.com/user/subscribe";
    if (navigator && navigator.sendBeacon) {
        return navigator.sendBeacon(url, JSON.stringify(data));
    }
    return $.ajax({
        type: "POST",
        url : url,
        data: JSON.stringify(data)
    });
}

window.intercomSettings = {
    app_id: "qdkl9tv2"
    // app_id: "k5dlkzqz"
};

(function () {
    var w  = window;
    var ic = w.Intercom;
    if (typeof ic === "function") {
        ic('reattach_activator');
        ic('update', intercomSettings);
    } else {
        var d      = document;
        var i      = function () {
            i.c(arguments)
        };
        i.q        = [];
        i.c        = function (args) {
            i.q.push(args)
        };
        w.Intercom = i;
        function l() {
            var s   = d.createElement('script');
            s.type  = 'text/javascript';
            s.async = true;
            s.src   = 'https://widget.intercom.io/widget/' + window.intercomSettings.app_id;
            var x   = d.getElementsByTagName('script')[0];
            x.parentNode.insertBefore(s, x);
        }

        if (w.attachEvent) {
            w.attachEvent('onload', l);
        } else {
            w.addEventListener('load', l, false);
        }
    }
})();

// CLI
function gaSend(a, b, c, d) {
    ga('send', 'event', 'landing:' + a, b, c, d);
}

// Init
(function () {
    'use strict';


    loadScript('/js/cli.js');

})();

/**
 * @class Queue
 * @property {int} size
 */
function Queue() {
    var queue   = this;
    var storage = [];

    this.set       = set;
    this.get       = get;
    this.subscribe = subscribe;
    this.size      = 0;
    this.timeout   = 125;
    this.handler   = false;

    /**
     * @memberOf Queue
     */
    function set(value, delay) {
        storage.push(new QueueItem(value, delay));
        queue.size = storage.length;
    }

    /**
     * @memberOf Queue
     */
    function get() {
        var item   = storage.shift();
        queue.size = storage.length;
        return item.value;
    }

    /**
     * @memberOf Queue
     */
    function subscribe(handler, timeout) {
        if (typeof handler != 'function') throw TypeError('Queue handler must by a function');
        queue.timeout = timeout || queue.timeout;
        queue.handler = handler;
        setTimeout(exec, queue.timeout);
    }

    function exec() {
        if (!queue.size) return setTimeout(exec, queue.timeout);
        var item = storage.shift();
        if (!item) return setTimeout(exec, queue.timeout);
        queue.size = storage.length;
        queue.handler(item.value);
        var t    = queue.timeout;
        var next = storage[0];
        if (next && (next.delay != null)) t = item.delay;
        setTimeout(exec, t || 0);
    }
}

/**
 * @class QueueItem
 * @property {*} value
 * @property {int} delay
 * @param {*} value
 * @param delay
 */
function QueueItem(value, delay) {
    if (typeof delay == 'undefined') delay = null;
    this.value = value;

    Object.defineProperties(this, {
        delay: {get: getDelay, enumerable: true}
    });

    function getDelay() {
        if (delay == null) return null;
        if (typeof delay == 'function') return delay();
        return delay;
    }
}

/**
 * @class Scenario
 * @param {String} selector
 * @param {Array} storyboard
 */
function Scenario(selector, storyboard) {
    if (typeof selector != 'string') throw TypeError('Scenario selector must by a string');
    if (!(storyboard instanceof Array)) throw TypeError('Scenario storyboard must by a array');
    var display = document.querySelector(selector);
    var frame   = -1;
    var ready   = true;

    next();

    this.check = check;
    this.next  = next;

    /**
     * @methodOf Scenario
     */
    function next() {
        if (!ready) return;
        frame++;
        if (frame >= storyboard.length) return print('');
        print(storyboard[frame]);
        ready = false;
    }

    /**
     * @methodOf Scenario
     */
    function check(name) {
        var current = storyboard[frame];
        ready       = name == current.name;
    }

    function print(item) {
        display.textContent = item.msg;
    }
}

function xhr(method, url, callback, error) {
    var xhttp = new XMLHttpRequest();

    xhttp.addEventListener('readystatechange', readystatechange);

    xhttp.open(method, url, true);
    xhttp.send();
    return xhttp;

    function readystatechange() {
        if (xhttp.readyState == 4) {
            if ((xhttp.status > 0) && (xhttp.status < 400)) {
                callback && callback(xhttp.responseText);
            } else {
                error && error(xhttp);
            }
        }
    }
}

function http(method, url, data, callback, error) {
    var xhttp = new XMLHttpRequest();
    data      = data || {};

    xhttp.addEventListener('readystatechange', readystatechange);

    xhttp.open(method, url, true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send(JSON.stringify(data));
    return xhttp;

    function readystatechange() {
        if (xhttp.readyState == 4) {
            if ((xhttp.status > 0) && (xhttp.status < 400)) {
                try {
                    callback(JSON.parse(xhttp.responseText));
                } catch (err) {
                    console.error(new TypeError(err));
                }
            } else {
                error && error(xhttp);
            }
        }
    }

}

function loadScript(url) {
    xhr('GET', url, result);

    function result(text) {
        new Function('', text)();
    }
}

function params(obj) {
    return Object.keys(obj).map(transform, obj).join('&');

    function transform(item) {
        return [item, this[item]].join('=');
    }
}