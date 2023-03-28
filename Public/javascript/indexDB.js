
export function openDatabase(databaseName, version, objectStores) {
    const request = indexedDB.open(databaseName, version);
  
    request.onerror = function (event) {
      console.error("Database error:", event.target.error);
    };
  
    request.onupgradeneeded = function (event) {
      const db = event.target.result;
      objectStores.forEach((store) => {
        if (!db.objectStoreNames.contains(store.name)) {
          db.createObjectStore(store.name, { keyPath: store.keyPath });
        }
      });
    };
  
    return new Promise((resolve, reject) => {
      request.onsuccess = function (event) {
        const db = event.target.result;
        resolve(db);
      };
    });
}



export function storeKeys(database,id, publicKey, privateKey) {
    return new Promise((resolve, reject) => {
      const transaction = database.transaction("keys", "readwrite");
      const store = transaction.objectStore("keys");
      const request = store.put({ id: id, publicKey, privateKey });
  
      request.onsuccess = function (event) {
        resolve(event.target.result);
      };
  
      request.onerror = function (event) {
        reject(event.target.error);
      };
    });
}