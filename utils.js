export async function getActiveTabURL() {
  try {
    const tabs = await chrome.tabs.query({
      currentWindow: true,
      active: true
    });

    if (!tabs || tabs.length === 0) {
      throw new Error("No active tab found.");
    }

    return tabs[0];
  } catch (err) {
    console.error("Error fetching active tab:", err);
    return null;
  }
}
