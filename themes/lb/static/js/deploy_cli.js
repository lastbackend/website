'use strict';

function whilefun() {
    var i = 0;
    var text = '';

    while (i < 53) {
        if (i == 0) {
            text += "# try 'deploy help' for all commands" + '<br>';
            setTimeout(function(){printText(text)}, 1000);
        }

        if (i == 1) {
            text += '# ~ your-project $ deploy it to production' + '<br>';
            setTimeout(function(){printText(text)}, 1000);
        }

        if (i == 2) {
            text += '> Build [=';
            setTimeout(function(){printText(text)}, 1000);
            while (i < 28) {
                i++;
                text += '=';
                setTimeout(printText(text), 1000);
            }
            text += '] 100% 6.9s' + '<br>';
            setTimeout(function(){printText(text)}, 1000);
            text += '> Building complete!' + '<br>';
            setTimeout(function(){printText(text)}, 1000);
        }

        if (i == 28) {
            text += '> Deploy [=';
            setTimeout(function(){printText(text)}, 1000);
            while (i < 53) {
                i++;
                text += '=';
                setTimeout(printText(text), 1000);
            }
            text += '] 100% 2.2s' + '<br>';
            setTimeout(function(){printText(text)}, 1000);
            text += '> Deploy success!' + '<br>';
            setTimeout(function(){printText(text)}, 1000);
        }

        i++;
    }

    text += '> Complete! https://your-project.yourdomain.com';
    setTimeout(function(){printText(text)}, 1000);
}

window.onload = function show_deploy_cli() {
    setTimeout(function(){whilefun()}, 1000);
};

function printText(text) {
    var p = document.querySelector('.new_cli_text');
    // p.innerHTML = text;
    console.log(text);
}