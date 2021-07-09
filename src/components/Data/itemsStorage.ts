export function getLocalStorageItem(item: string) {
    return localStorage.getItem(item);
}

export function setLocalStorageItem(item: string, value: string) {
  localStorage.setItem(item, value);
}