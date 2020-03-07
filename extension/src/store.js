import chromep from "chrome-promise";
import { Store as StoreOld } from "./store-old.js";

class Store {
  constructor(defaults) {
    this._storage = chromep.storage.local;
    this._initDone = this._init(defaults);
  }

  async _init(defaults) {
    await this._copyFromOldStoreAndRemove(defaults);

    if (defaults && Object.keys(defaults)) {
      await this._populateWithDefaults(defaults);
    }
  }

  async _copyFromOldStoreAndRemove() {
    const currentData = await this._storage.get(null);
    if (currentData && Object.keys(currentData).length) {
      return; // storage has data, no need to copy from old store
    }

    const oldStore = new StoreOld("settings");
    const oldData = oldStore.toObject();
    if (Object.keys(oldData).length) {
      await this._storage.set(oldData);
    }

    oldStore.removeAll();
  }

  async _populateWithDefaults(defaults) {
    const defaultsKeys = Object.keys(defaults);

    const data = await this._storage.get(defaultsKeys);
    const update = defaultsKeys.reduce((update, key) => {
      if (data[key] === undefined) {
        update[key] = defaults[key];
      }
      return update;
    }, {});

    if (Object.keys(update).length) {
      await this._storage.set(update);
    }
  }

  ready() {
    return this._initDone;
  }

  async get(keys) {
    return this._storage.get(keys);
  }

  async set(items) {
    return this._storage.set(items);
  }

  async remove(keys) {
    return this._storage.remove(keys);
  }

  async clear() {
    return this._storage.clear();
  }

  addListener(fn) {
    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName === "local") {
        fn(changes);
      }
    });
  }
}

export { Store };
