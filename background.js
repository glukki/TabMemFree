/**
 * Created by IntelliJ IDEA.
 * User: glukki
 * Date: 27/08/11
 * Time: 13:32
 * To change this template use File | Settings | File Templates.
 */

// Browser Action - block pages from unload - http://code.google.com/chrome/extensions/dev/browserAction.html

var maxInactive = 15; //seconds
var tickTime = 10;
var exclude = new Array(); //list of url
var tabs = new Array(); // list of tabIDs with inactivity time
var timer = null;


// events
// tabs.onCreated - add to list
chrome.tabs.onCreated.addListener(function(tab){
    tabs.push({'id': tab['id'], 'time': 0, 'title':''});
});

// tabs.onRemoved - load if unloaded, remove from list
chrome.tabs.onRemoved.addListener(function(tabId, removeInfo){
    for(var i=0; i<tabs.length; i++){
        if(tabs[i]['id'] == tabId){
            delete tabs[i];
        }
    }
});

// tabs.onSelectionChanged - load if unloaded, reset inactivity
chrome.tabs.onSelectionChanged.addListener(function(tabId, selectInfo){
    chrome.tabs.sendRequest(tabId, {'do':'load'});
});

// simple timer - update inactivity time, unload timeouted tabs
tick = function(){
    // get windows
    chrome.windows.getAll({'populate':false}, function(windows){
        for(var i=0; i<windows.length; i++){
            // get active tabs
            chrome.tabs.getSelected(windows[i]['id'], function(tab){
                // reset current tab time
                for(var j=0; j<tabs.length; j++){
                    if(tabs[j]['id'] == tab.id){
                        tabs[j]['time'] = 0;
                    }
                }
            });
        }

        // increment every tab time
        for(i=0; i<tabs.length; i++){
            tabs[i]['time'] += tickTime;

            // find expired
            if(tabs[i]['time'] > maxInactive){
                var currentId = tabs[i]['id'];
                var title = '';
                console.log(currentId, tabs);
                // get original title
                chrome.tabs.sendRequest(currentId, {'do':'getTitle'}, function(response){
                    // save title
                    for(var i=0; i<tabs.length; i++){
                        if(tabs[i]['id'] == currentId){
                            tabs[i]['title'] = response;
                        }
                    }

                    // get tab state
                    chrome.tabs.get(currentId, function(tab){
                        if(tab.url != chrome.extension.getURL('blank.html')){
                            // forward tab to blank.html
                            chrome.tabs.update(
                                currentId,
                                {'url': chrome.extension.getURL('blank.html'), 'selected': false}
                            );
                        }
                    });
                });
            }

        }

    });
};

chrome.extension.onRequest.addListener(
    function(request, sender, sendResponse) {
        if(request['do'] == 'getTitle'){
            for(var i=0; i<tabs.length; i++){
                if(tabs[i]['id'] == sender['tab']['id']){
                    sendResponse(tabs[i]['title']);
                    break;
                }
            }
        }
    }
);

// UI
chrome.browserAction.onClicked.addListener(function(tab){
    chrome.tabs.create({'url': chrome.extension.getURL('about.html')});
    return false;
});

// init
// load exclusion list
// get all windows with tabs
chrome.windows.getAll({"populate": true}, function(wins){
    // get all tabs, init array with 0 inactive time
    for(var i=0;i<wins.length;i++){
        for(var j=0;j<wins[i]['tabs'].length;j++){
            tabs.push({'id': wins[i]['tabs'][j]['id'], 'time': 0, 'title':''});
        }
    }

    // bind events
    timer = setInterval("tick()", tickTime*1000);
});