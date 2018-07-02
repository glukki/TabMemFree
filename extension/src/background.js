/*jslint browser: true, devel: true*/
/*global chrome, Store*/

// constants
var SETTING_ACTIVE = "active";
var SETTING_TIMEOUT = "timeout";
var SETTING_TICK = "tick";
var SETTING_PINNED = "pinned";
var DEFAULT_SETTINGS = {
  [SETTING_ACTIVE]: true,
  [SETTING_TIMEOUT]: 15 * 60, // seconds
  [SETTING_TICK]: 60, // seconds
  [SETTING_PINNED]: true
};
var PARK_URL = "https://tabmemfree.appspot.com/blank.html";

// globals
var tabs = {}; // list of tabIDs with inactivity time
var ticker = null;
var settings = {};

// park idle tab if it is not parked yet
function parkTab(tab) {
  //check if parked
  if (tab.url.substring(0, tab.url.indexOf("#")) !== PARK_URL) {
    // forward tab to blank.html
    var url = PARK_URL + "#title=" + encodeURIComponent(tab.title);
    if (tab.favIconUrl) {
      url += "&icon=" + encodeURIComponent(tab.favIconUrl);
    }
    chrome.tabs.update(tab.id, { url: url, selected: false });
  }
}

// simple timer - update inactivity time, unload timeouted tabs
function tick() {
  //sync
  chrome.windows.getAll({ populate: true }, function(windows) {
    // find active or pinned tabs to reset their time
    var tabsToReset = {};
    var skipPinned = settings.get(SETTING_PINNED);
    windows.forEach(function(window) {
      window.tabs.forEach(function(tab) {
        if (tab.active || (skipPinned && tab.pinned)) {
          tabsToReset[tab.id] = true;
        }
      });
    });

    // tick and find expired
    var tickTime = settings.get(SETTING_TICK);
    var tabTimeout = settings.get(SETTING_TIMEOUT);
    Object.keys(tabs).forEach(function(tabId) {
      if (tabsToReset[tabId]) {
        return (tabs[tabId].time = 0);
      }

      tabs[tabId].time += tickTime;
      if (tabs[tabId].time >= tabTimeout) {
        chrome.tabs.get(tabs[tabId].id, parkTab);
      }
    });
  });
}

// init function
function init() {
  // load exclusion list
  // get all windows with tabs
  chrome.windows.getAll({ populate: true }, function(windows) {
    // get all tabs, init array with 0 inactive time
    windows.forEach(function(window) {
      window.tabs.forEach(function(tab) {
        var id = tab.id;
        tabs[id] = { id: id, time: 0 };
      });
    });

    // bind events
    ticker = setInterval(tick, settings.get(SETTING_TICK) * 1000);
    //change icon
    chrome.browserAction.setIcon({ path: "img/icon19.png" });
    chrome.browserAction.setTitle({
      title: chrome.i18n.getMessage("browserActionActive")
    });
  });
}

// Events
// tabs.onCreated - add to list
chrome.tabs.onCreated.addListener(function(tab) {
  tabs[tab.id] = { id: tab.id, time: 0 };
});

// tabs.onRemoved - load if unloaded, remove from list
chrome.tabs.onRemoved.addListener(function(tabId) {
  var i;
  for (i in tabs) {
    if (tabs.hasOwnProperty(i) && i === tabId) {
      delete tabs[i];
      break;
    }
  }
});

// tabs.onSelectionChanged - load if unloaded, reset inactivity
chrome.tabs.onSelectionChanged.addListener(function(tabId) {
  var i;
  chrome.tabs.get(tabId, function(tab) {
    if (tab.url.substring(0, tab.url.indexOf("#")) === PARK_URL) {
      chrome.tabs.sendRequest(tabId, { do: "load" });
    }
  });
  for (i in tabs) {
    if (tabs.hasOwnProperty(i) && i === tabId) {
      tabs[i].time = 0;
      break;
    }
  }
});

// UI
chrome.browserAction.onClicked.addListener(function() {
  if (ticker) {
    //clear
    clearInterval(ticker);
    tabs = {};
    ticker = null;
    chrome.browserAction.setIcon({ path: "img/icon19_off.png" });
    chrome.browserAction.setTitle({
      title: chrome.i18n.getMessage("browserActionInactive")
    });
    settings.set(SETTING_ACTIVE, false);
  } else {
    settings.set(SETTING_ACTIVE, true);
    init();
  }
  return false;
});

// starter
function start() {
  settings = new Store("settings", DEFAULT_SETTINGS);

  if (settings.get(SETTING_ACTIVE)) {
    init();
  } else {
    chrome.browserAction.setIcon({ path: "img/icon19_off.png" });
  }
}

start();
