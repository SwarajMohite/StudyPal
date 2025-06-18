// Initialize study time when extension is installed
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ studyTime: 0 });
});

// Track when user is on a YouTube video and update study time every minute
chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    if (tab.url && tab.url.includes("youtube.com/watch")) {
      chrome.alarms.create("trackStudy", { delayInMinutes: 1, periodInMinutes: 1 });
    } else {
      chrome.alarms.clear("trackStudy");
    }
  });
});

// Increase study time in storage every minute
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "trackStudy") {
    chrome.storage.local.get("studyTime", (data) => {
      const newTime = (data.studyTime || 0) + 1;
      chrome.storage.local.set({ studyTime: newTime });
    });
  }
});

// Notify content script with new video ID when a YouTube tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tab.url && tab.url.includes("youtube.com/watch")) {
    const queryParameters = tab.url.split("?")[1];
    const urlParameters = new URLSearchParams(queryParameters);
    const videoId = urlParameters.get("v");

    chrome.tabs.sendMessage(tabId, {
      type: "NEW",
      videoId: videoId
    });
  }
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "SHOW_NOTIFICATION") {
    chrome.notifications.create({
      type: "basic",
      iconUrl: "assets/ext-icon.png",
      title: "StudyPal",
      message: msg.message
    });
  }
});

