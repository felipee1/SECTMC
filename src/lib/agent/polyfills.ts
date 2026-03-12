/**
 * Improved polyfill for Node.js async_hooks in the browser.
 * LangGraph uses this to track the current graph execution context.
 * 
 * Without a functional getStore(), functions like interrupt() 
 * believe they are being called outside of a graph.
 */

let currentStore: any = undefined;

export class AsyncLocalStorage {
  disable() {
    console.log("AsyncLocalStorage: disabled");
    currentStore = undefined;
  }

  getStore() {
    // console.log("AsyncLocalStorage: getStore", !!currentStore);
    return currentStore;
  }

  run(store: any, callback: (...args: any[]) => any, ...args: any[]) {
    // console.log("AsyncLocalStorage: run start");
    const previousStore = currentStore;
    currentStore = store;
    try {
      return callback(...args);
    } finally {
      currentStore = previousStore;
    }
  }

  enterWith(store: any) {
    console.log("AsyncLocalStorage: enterWith");
    currentStore = store;
  }
}

// Default export for compatibility with CommonJS-style imports in transit
export default {
  AsyncLocalStorage
};
