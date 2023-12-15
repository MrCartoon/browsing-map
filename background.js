// Keep track of the last URL for each tab
let lastUrl = {};

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (changeInfo.url) {
    lastUrl[tabId] = changeInfo.url;
  }
});

chrome.webNavigation.onBeforeNavigate.addListener(async function (details) {
  // Get the current redirects from local storage
  if (!details.url.startsWith("http")) {
    return;
  }
  let data = await chrome.storage.local.get("redirects");
  let redirects = data.redirects || [];

  // Get the current URL
  let currentUrl = lastUrl[details.tabId];

  // Remove query parameters and hash from the new URL
  let newUrl = new URL(details.url);
  newUrl = newUrl.protocol + "//" + newUrl.hostname + newUrl.pathname;

  // Add the new redirect to the array
  if (currentUrl && newUrl) {
    redirects.push({
      tabId: details.tabId,
      currentUrl: currentUrl,
      newUrl: newUrl,
      time: new Date().getTime(),
    });
  }

  // Store the updated redirects back in local storage
  await chrome.storage.local.set({ redirects: redirects });

  // Update the last URL for this tab
  lastUrl[details.tabId] = newUrl;
});

// Listen for messages from the content script
chrome.runtime.onMessage.addListener(async function (message, sender) {
  // Get the current links from local storage
  let data = await chrome.storage.local.get("links");
  let links = data.links || {};

  // Remove query parameters and hash from the sender tab URL
  let senderUrl = new URL(sender.tab.url);
  senderUrl =
    senderUrl.protocol + "//" + senderUrl.hostname + senderUrl.pathname;

  // If there are already links for this URL, append the new links and remove duplicates
  if (links[senderUrl]) {
    links[senderUrl] = [...new Set(links[senderUrl].concat(message.links))];
  } else {
    links[senderUrl] = message.links;
  }

  // Store the updated links back in local storage
  await chrome.storage.local.set({ links: links });
});

chrome.action.onClicked.addListener(function (tab) {
  chrome.tabs.create({ url: "graph.html" });
});
