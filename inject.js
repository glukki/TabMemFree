/**
 * Created by IntelliJ IDEA.
 * User: glukki
 * Date: 27/08/11
 * Time: 16:15
 * To change this template use File | Settings | File Templates.
 */

chrome.extension.onRequest.addListener(function(request, sender, sendResponse){
    if(request['do'] == 'getTitle'){
        sendResponse(document.title);
    }
});