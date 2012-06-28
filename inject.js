/**
 * Created by IntelliJ IDEA.
 * User: Vitaliy (GLuKKi) Meshchaninov glukki.spb.ru@gmail.com
 * Date: 27/08/11
 * Time: 16:15
 * To change this template use File | Settings | File Templates.
 */

(function(){
//    Parse window.location.hash, get params encoded with encodeURIComponent, source string is:
//    https://tabmemfree.appengine.com/blank.html#title=___&icon=___
    function getParam(name){
        var res = '';
        var url = window.location.hash;

        var start = url.indexOf(name);
        var end = url.indexOf('&', start);
        if(start > 0){
            start += name.length + 1;
            if(end > 0){
                res = url.substring(start, end);
            } else {
                res = url.substring(start);
            }
        }

        return decodeURIComponent(res);
    }

    //get message for history alteration: back
    chrome.extension.onRequest.addListener(function(request, sender, sendResponse){
        if(request['do'] == 'load'){
            sendResponse('loaded');
            history.back();
        }
    });

    //set old title
    var title = getParam('title');
    if(title){
        document.title = title;
    }

    //set old favicon
    var href = getParam('icon');
    if(href){
        var link = document.createElement('link');
        link.type = 'image/x-icon';
        link.rel = 'icon';
        link.href = href;
        document.getElementsByTagName('head')[0].appendChild(link);
    }
})();