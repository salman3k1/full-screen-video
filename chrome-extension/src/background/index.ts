import 'webextension-polyfill';
import { activeStateStorage } from '@extension/storage';

const browser = globalThis.chrome;
browser.runtime.onInstalled.addListener(() => {
  init();
  // Reload tabs so that the content script loads
  chrome.tabs.query({ currentWindow: true }, function (tabs) {
    tabs.forEach(tab => {
      if (typeof tab.id === 'number') {
        chrome.tabs.reload(tab.id);
      }
    });
  });
});
browser.runtime.onStartup.addListener(init);

activeStateStorage.subscribe(() => {
  const isActive = activeStateStorage.getSnapshot();
  browser.action.setBadgeText({
    text: isActive ? '' : 'OFF',
  });
});

browser.runtime.onMessage.addListener(async function (request) {
  if (request?.message === 'CONTENT_LOADED') {
    const isActive = await activeStateStorage.get();
    browser.action.setBadgeText({
      text: isActive ? '' : 'OFF',
    });
  }
});

async function init() {
  const isActive = await activeStateStorage.get();
  browser.action.setBadgeText({
    text: isActive ? '' : 'OFF',
  });
}
