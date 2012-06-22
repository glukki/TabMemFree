/**
 * Created by IntelliJ IDEA.
 * User: Vitaliy (GLuKKi) Meshchaninov glukki.spb.ru@gmail.com
 * Date: 27/08/11
 * Time: 16:15
 * To change this template use File | Settings | File Templates.
 */

(function(){
    function getParameterByName(name){
        name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
        var regexS = "[\\?&]" + name + "=([^&#]*)";
        var regex = new RegExp(regexS);
        var results = regex.exec(window.location.search);
        if(results)
            return decodeURIComponent(results[1].replace(/\+/g, ' '));
        return '';
    }

    //get message for history alteration: back
    chrome.extension.onRequest.addListener(function(request, sender, sendResponse){
        if(request['do'] == 'load'){
            sendResponse('loaded');
            history.back();
        }
    });

    //set old title
    document.title = getParameterByName('title');

    //set old favicon
    var link = document.createElement('link');
    link.type = 'image/x-icon';
    link.rel = 'icon';
    link.href = getParameterByName('icon');
    document.getElementsByTagName('head')[0].appendChild(link);

})();