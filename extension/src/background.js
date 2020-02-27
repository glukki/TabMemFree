/* eslint no-console: ["error", { allow: ["debug"] }] */

import { Store } from "./store.js";

// constants
const SETTING_ACTIVE = "active";
const SETTING_TIMEOUT = "timeout";
const SETTING_TICK = "tick";
const SETTING_PINNED = "pinned";
const DEFAULT_SETTINGS = {
  [SETTING_ACTIVE]: true,
  [SETTING_TIMEOUT]: 15 * 60, // seconds
  [SETTING_TICK]: 60, // seconds
  [SETTING_PINNED]: true
};
const TABS_QUERY = { discarded: false, autoDiscardable: true };

// globals
const store = new Store(DEFAULT_SETTINGS);
const tabsIdle = new Map(); // key: tabId, value: idle time
let ticker = null;

// park idle tab if it is not parked yet
function parkTab(tabId) {
  tabsIdle.delete(tabId);

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
async function tick() {
  console.debug("tick");
  const {
    [SETTING_PINNED]: skipPinned,
    [SETTING_TICK]: tickTime,
    [SETTING_TIMEOUT]: tabTimeout
  } = await store.get([SETTING_PINNED, SETTING_TICK, SETTING_TIMEOUT]);

  ticker = setTimeout(tick, tickTime * 1000);

  chrome.tabs.query(TABS_QUERY, async tabs => {
    // find active or pinned tabs to reset their time
    const activeTabs = new Set();
    tabs.forEach(tab => {
      if (tab.active || (skipPinned && tab.pinned)) {
        activeTabs.add(tab.id);
      }
    });

    // tick and find expired
    for (const [tabId, idleTime] of tabsIdle.entries()) {
      if (activeTabs.has(tabId)) {
        tabsIdle.set(tabId, 0);
        continue;
      }

      const newTime = idleTime + tickTime;
      if (newTime < tabTimeout) {
        tabsIdle.set(tabId, newTime);
        continue;
      }

      parkTab(tabId);
    }
  });
}

async function setExtensionState(newState) {
  await store.set({ [SETTING_ACTIVE]: newState });

  if (!newState) {
    if (ticker) {
      clearTimeout(ticker);
    }

    ticker = null;
    tabsIdle.clear();

    // set icon
    chrome.browserAction.setIcon({ path: "img/icon19_off.png" });
    chrome.browserAction.setTitle({
      title: chrome.i18n.getMessage("browserActionInactive")
    });

    return;
  }

  // get all tabs
  chrome.tabs.query(TABS_QUERY, tabs => {
    tabs.forEach(tab => tabsIdle.set(tab.id, 0));
  });

  // set icon
  chrome.browserAction.setIcon({ path: "img/icon19.png" });
  chrome.browserAction.setTitle({
    title: chrome.i18n.getMessage("browserActionActive")
  });

  const { [SETTING_TICK]: tickTime } = await store.get(SETTING_TICK);
  ticker = setTimeout(tick, tickTime * 1000);
}

// Events
// tabs.onCreated - add to list
chrome.tabs.onCreated.addListener(tab => {
  console.debug("Tab created:", tab.id);
  tabsIdle.set(tab.id, 0);
});

// tabs.onRemoved - load if unloaded, remove from list
chrome.tabs.onRemoved.addListener(tabId => {
  console.debug("Tab removed:", tabId);
  tabsIdle.delete(tabId);
});

// tabs.onSelectionChanged - load if unloaded, reset inactivity
chrome.tabs.onSelectionChanged.addListener(tabId => {
  console.debug("Tab activated:", tabId);
  tabsIdle.set(tabId, 0);
});

// UI
chrome.browserAction.onClicked.addListener(async () => {
  console.debug("Extension icon clicked");

  const { [SETTING_ACTIVE]: isActive } = await store.get(SETTING_ACTIVE);

  await setExtensionState(!isActive);

  return false;
});

// starter
async function start() {
  console.debug("Extension started");

  await store.ready();

  const { [SETTING_ACTIVE]: isActive } = await store.get(SETTING_ACTIVE);
  await setExtensionState(isActive);
}

start();
