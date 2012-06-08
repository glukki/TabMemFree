/**
 * Created by IntelliJ IDEA.
 * User: glukki
 * Date: 27/08/11
 * Time: 13:32
 * To change this template use File | Settings | File Templates.
 */

// Browser Action - block pages from unload - http://code.google.com/chrome/extensions/dev/browserAction.html
var tabs = {}; // list of tabIDs with inactivity time
var ticker = null;
var settings = {};

// simple timer - update inactivity time, unload timeouted tabs
var tick = function(){
    //sync
    chrome.windows.getAll({'poppulate': true}, function(windows){
        // increment every tab time
        for(var i in tabs){
            if(tabs.hasOwnProperty(i)){
                tabs[i]['time'] += settings.get('tick');
            }
        }

        // reset active tabs time
        for(i in windows){
            if(windows.hasOwnProperty(i)){
                for(var j in windows[i].tabs){
                    if(windows[i].tabs.hasOwnProperty(j) && windows[i].tabs[j].active){
                        tabs[windows[i].tabs[j].id] = 0;
                        break;
                    }
                }
            }
        }

        // find expired
        for(i in tabs){
            if(tabs.hasOwnProperty(i) && tabs[i]['time'] > settings.get('timeout')){
                var currentId = parseInt(i);
                var title = '';
                // get original title
                chrome.tabs.sendRequest(currentId, {'do':'getTitle'}, function(title){
                    GetTitleResponse(title, currentId);
                });
            }

        }
    });
};

var GetTitleResponse = function(title, tabId){
    // save title
    for(var i in tabs){
        if(tabs.hasOwnProperty(i) && i == tabId){
            tabs[i]['title'] = title;
        }
    }

    // get tab state
    chrome.tabs.get(tabId, function(tab){
        if(tab.url != chrome.extension.getURL('blank.html').substring(0, chrome.extension.getURL('blank.html').indexOf('?') - 1)) {
            // forward tab to blank.html
            chrome.tabs.update(
                tabId,
                {'url': chrome.extension.getURL('blank.html?oldTitle=' + tab.title), 'selected': false}
            );
        }
    });
}

// init function
var init = function(){
// load exclusion list
    // get all windows with tabs
    chrome.windows.getAll({"populate": true}, function(wins){
        // get all tabs, init array with 0 inactive time
        for(var i=0;i<wins.length;i++){
            for(var j=0;j<wins[i]['tabs'].length;j++){
                if(true){
                    var id = wins[i]['tabs'][j]['id'];
                    tabs[id] = {'id': id, 'time': 0, 'title':''};
                }
            }
        }

        // bind events
        ticker = setInterval("tick()", settings.get('tick')*1000);
        //change icon
        chrome.browserAction.setIcon({'path':'img/icon19.png'})
    });
};

// Events
// tabs.onCreated - add to list
chrome.tabs.onCreated.addListener(function(tab){
    tabs[tab['id']] = {'id': tab['id'], 'time': 0, 'title':''};
});

// tabs.onRemoved - load if unloaded, remove from list
chrome.tabs.onRemoved.addListener(function(tabId, removeInfo){
    for(var i in tabs){
        if(tabs.hasOwnProperty(i) && i == tabId){
            delete tabs[i];
            break;
        }
    }
});

// tabs.onSelectionChanged - load if unloaded, reset inactivity
chrome.tabs.onSelectionChanged.addListener(function(tabId, selectInfo){
    chrome.tabs.sendRequest(tabId, {'do':'load'});
    for(var i in tabs){
        if(tabs.hasOwnProperty(i) && i == tabId){
            tabs[i]['time'] = 0;
            break;
        }
    }
});

// Messaging
chrome.extension.onRequest.addListener(
    function(request, sender, sendResponse) {
        if(request['do'] == 'getTitle'){
            for(var i in tabs){
                if(tabs.hasOwnProperty(i) && i == sender['tab']['id']){
                    sendResponse(tabs[i]['title']);
                    break;
                }
            }
        }
    }
);

// UI
chrome.browserAction.onClicked.addListener(function(tab){
    if(ticker){
        //clear
        clearInterval(ticker);
        tabs = new Array();
        ticker = null;
        chrome.browserAction.setIcon({'path':'img/icon19_off.png'});
        settings.set('active', false);
    } else {
        settings.set('active', true);
        init();
    }
    return false;
});



// starter
window.start = function(){
    settings = new Store('settings',{
        'active': true,
        'timeout': 15, // seconds
        'tick': 5 // seconds
    });

    if(settings.get('active')){
        init();
    } else {
        chrome.browserAction.setIcon({'path':'img/icon19_off.png'});
    }
};

