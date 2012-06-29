/**
 * Created by IntelliJ IDEA.
 * User: Vitaliy (GLuKKi) Meshchaninov glukki.spb.ru@gmail.com
 * Date: 27/08/11
 * Time: 13:32
 * To change this template use File | Settings | File Templates.
 */

// Browser Action - block pages from unload - http://code.google.com/chrome/extensions/dev/browserAction.html
var tabs = {}; // list of tabIDs with inactivity time
var ticker = null;
var settings = {};
var urlBlank = 'https://tabmemfree.appspot.com/blank.html';

// simple timer - update inactivity time, unload timeouted tabs
var tick = function(){
    //sync
    chrome.windows.getAll({'populate': true}, function(windows){
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
                    if(windows[i].tabs.hasOwnProperty(j)){
                        if(windows[i].tabs[j].active){
                            tabs[windows[i].tabs[j].id]['time'] = 0;
                        }
                        if(settings.get('pinned') && windows[i].tabs[j].pinned){
                            tabs[windows[i].tabs[j].id]['time'] = 0;
                        }
                    }
                }
            }
        }

        // find expired
        for(i in tabs){
            if(tabs.hasOwnProperty(i) && tabs[i]['time'] >= settings.get('timeout')){
                // get tab
                chrome.tabs.get(parseInt(i), function(tab){
                    //check if parked
                    if(tab.url.substring(0, tab.url.indexOf('#')) != urlBlank) {
                        // forward tab to blank.html
                        var url = urlBlank + '#title=' + encodeURIComponent(tab.title);
                        if(tab.favIconUrl){
                            url += '&icon=' + encodeURIComponent(tab.favIconUrl);
                        }
                        chrome.tabs.update(
                            tab.id,
                            {'url': url, 'selected': false}
                        );
                    }
                });
            }

        }
    });
};

// init function
var init = function(){
// load exclusion list
    // get all windows with tabs
    chrome.windows.getAll({"populate": true}, function(wins){
        // get all tabs, init array with 0 inactive time
        for(var i in wins){
            if(wins.hasOwnProperty(i)){
                for(var j in wins[i].tabs){
                    if(wins[i].tabs.hasOwnProperty(j)){
                        var id = wins[i].tabs[j].id;
                        tabs[id] = {'id': id, 'time': 0};
                    }
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
    tabs[tab['id']] = {'id': tab['id'], 'time': 0};
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
    chrome.tabs.get(tabId, function(tab){
        if(tab.url.substring(0, tab.url.indexOf('#')) == urlBlank){
            chrome.tabs.sendRequest(tabId, {'do':'load'});
        }
    });
    for(var i in tabs){
        if(tabs.hasOwnProperty(i) && i == tabId){
            tabs[i]['time'] = 0;
            break;
        }
    }
});

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
        'timeout': 15*60, // seconds
        'tick': 60, // seconds
        'pinned': true
    });

    if(settings.get('active')){
        init();
    } else {
        chrome.browserAction.setIcon({'path':'img/icon19_off.png'});
    }
};
