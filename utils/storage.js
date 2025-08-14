function getItemStorage(key) {
  const dataJSON = localStorage.getItem(key);
  return JSON.parse(dataJSON);
}

function setItemStorage(key, value) {
  const dataJSON = JSON.stringify(value);
  localStorage.setItem(key, dataJSON);
}

function removeItemStorage(key) {
  localStorage.removeItem(key);
}

function clearStorage() {
  localStorage.clear();
}

export {
  getItemStorage,
  setItemStorage,
  removeItemStorage,
  clearStorage
};
