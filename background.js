let activeTabId = null;
let activeStartTime = null;

// Track active tab change
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  if (activeTabId !== null && activeStartTime !== null) {
    const endTime = Date.now();
    const timeSpent = Math.floor((endTime - activeStartTime) / 1000); // in seconds

    chrome.tabs.get(activeTabId, (tab) => {
      if (tab && tab.url && tab.url.startsWith("http")) {
        sendTrackingData(tab.url, timeSpent);
      }
    });
  }

  activeTabId = activeInfo.tabId;
  activeStartTime = Date.now();
});

// Track tab URL update (refresh or change)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tab.active && changeInfo.url && changeInfo.url.startsWith("http")) {
    if (activeTabId !== null && activeStartTime !== null) {
      const endTime = Date.now();
      const timeSpent = Math.floor((endTime - activeStartTime) / 1000);

      chrome.tabs.get(activeTabId, (tab) => {
        if (tab && tab.url && tab.url.startsWith("http")) {
          sendTrackingData(tab.url, timeSpent);
        }
      });
    }

    activeTabId = tabId;
    activeStartTime = Date.now();
  }
});

// Track browser shutdown or extension unload
function handleUnload() {
  if (activeTabId !== null && activeStartTime !== null) {
    const endTime = Date.now();
    const timeSpent = Math.floor((endTime - activeStartTime) / 1000);

    chrome.tabs.get(activeTabId, (tab) => {
      if (tab && tab.url && tab.url.startsWith("http")) {
        sendTrackingData(tab.url, timeSpent);
      }
    });
  }
}

chrome.runtime.onSuspend.addListener(handleUnload);

// Send data to backend
function sendTrackingData(url, timeSpent) {
  fetch("http://127.0.0.1:5000/api/track", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      url: url,
      timeSpent: timeSpent
    })
  })
    .then(res => res.json())
    .then(data => console.log("✅ Sent to backend:", data))
    .catch(err => console.error("❌ Error sending data:", err));
}