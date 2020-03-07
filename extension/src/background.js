/*jslint browser: true, devel: true*/
/*global chrome*/
/* eslint no-console: ["error", { allow: ["debug"] }] */

import { Store } from "./store-old.js";

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
const TABS_QUERY = { discarded: false, autoDiscardable: true };

// globals
var tabs = {}; // list of tabIDs with inactivity time
var ticker = null;
var store = {};

// park idle tab if it is not parked yet
function parkTab(tabId) {
  delete tabs[tabId];

  chrome.tabs.discard(tabId, tab => {
    if (chrome.runtime.lastError) {
      return console.debug("Tab discard error:", chrome.runtime.lastError);
    }

    if (!tab) {
      return console.debug("Tab was not discarded:", tabId);
    }

    console.debug("Tab discarded:", tabId);
  });
}

// simple timer - update inactivity time, unload timeouted tabs
function tick() {
  console.debug("tick");
  ticker = setTimeout(tick, store.get(SETTING_TICK) * 1000);

  chrome.tabs.query(TABS_QUERY, fetchedTabs => {
    // find active or pinned tabs to reset their time
    const skipPinned = store.get(SETTING_PINNED);

    const activeTabs = new Set();
    fetchedTabs.forEach(tab => {
      if (tab.active || (skipPinned && tab.pinned)) {
        activeTabs.add(tab.id);
      }
    });

    // tick and find expired
    const tickTime = store.get(SETTING_TICK);
    const tabTimeout = store.get(SETTING_TIMEOUT);
    Object.keys(tabs).forEach(key => {
      const tab = tabs[key];

      const tabId = tab.id;
      if (activeTabs.has(tabId)) {
        return (tabs[tabId].time = 0);
      }

      tabs[tabId].time += tickTime;
      if (tabs[tabId].time >= tabTimeout) {
        parkTab(tabId);
      }
    });
  });
}

// init function
function init() {
  // load exclusion list
  // get all windows with tabs
  chrome.tabs.query(TABS_QUERY, fetchedTabs => {
    fetchedTabs.forEach(tab => {
      tabs[tab.id] = { id: tab.id, time: 0 };
    });
  });

  //change icon
  chrome.browserAction.setIcon({ path: "img/icon19.png" });
  chrome.browserAction.setTitle({
    title: chrome.i18n.getMessage("browserActionActive")
  });

  ticker = setTimeout(tick, store.get(SETTING_TICK) * 1000);
}

// Events
// tabs.onCreated - add to list
chrome.tabs.onCreated.addListener(function(tab) {
  console.debug("Tab created:", tab.id);
  tabs[tab.id] = { id: tab.id, time: 0 };
});

// tabs.onRemoved - load if unloaded, remove from list
chrome.tabs.onRemoved.addListener(function(tabId) {
  console.debug("Tab removed:", tabId);
  delete tabs[tabId];
});

// tabs.onSelectionChanged - load if unloaded, reset inactivity
chrome.tabs.onSelectionChanged.addListener(function(tabId) {
  console.debug("Tab activated:", tabId);
  tabs[tabId] = { id: tabId, time: 0 };
});

// UI
chrome.browserAction.onClicked.addListener(function() {
  console.debug("Extension icon clicked");

  if (ticker) {
    //clear
    clearTimeout(ticker);
    tabs = {};
    ticker = null;
    chrome.browserAction.setIcon({ path: "img/icon19_off.png" });
    chrome.browserAction.setTitle({
      title: chrome.i18n.getMessage("browserActionInactive")
    });
    store.set(SETTING_ACTIVE, false);
  } else {
    store.set(SETTING_ACTIVE, true);
    init();
  }

  return false;
});

// starter
function start() {
  store = new Store("settings", DEFAULT_SETTINGS);

  if (store.get(SETTING_ACTIVE)) {
    init();
  } else {
    chrome.browserAction.setIcon({ path: "img/icon19_off.png" });
  }
}

start();
