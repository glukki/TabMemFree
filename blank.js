/**
 * Created by IntelliJ IDEA.
 * User: glukki
 * Date: 27/08/11
 * Time: 20:04
 * To change this template use File | Settings | File Templates.
 */

//get message for history alteration: back

chrome.extension.onRequest.addListener(function(request, sender, sendResponse){
    if(request['do'] == 'load'){
        history.back();
        sendResponse('loaded');
    }
});

document.onload = function(){
    console.log('loaded');
    chrome.extension.sendRequest({'do':'getTitle'}, function(response){
        document.title = response;
    });
};
