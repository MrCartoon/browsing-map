function sendLinks() {
  let baseUrl = window.location.href;
  let links = Array.from(document.querySelectorAll("a"))
    .map((a) => {
      let url = new URL(a.getAttribute("href"), baseUrl);
      return url.protocol + "//" + url.hostname + url.pathname;
    })
    .filter((href) => href.startsWith("http"));

  // Remove duplicates by converting the array to a Set and then back to an array
  links = [...new Set(links)];

  chrome.runtime.sendMessage({ links: links });
}

// Debounce function
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Debounced version of sendLinks
const debouncedSendLinks = debounce(sendLinks, 1000);

// Run the function initially when the page is fully loaded
window.onload = debouncedSendLinks;

// Run the function every time the DOM changes
const observer = new MutationObserver(debouncedSendLinks);
observer.observe(document, { childList: true, subtree: true });
