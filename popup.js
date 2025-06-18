import { getActiveTabURL } from "./utils.js";

// === Bookmark Handling ===

const addNewBookmark = (bookmarks, bookmark) => {
  const bookmarkTitleElement = document.createElement("div");
  const controlsElement = document.createElement("div");
  const newBookmarkElement = document.createElement("div");

  bookmarkTitleElement.textContent = bookmark.desc;
  bookmarkTitleElement.className = "bookmark-title";
  controlsElement.className = "bookmark-controls";

  setBookmarkAttributes("play", onPlay, controlsElement);
  setBookmarkAttributes("delete", onDelete, controlsElement);

  newBookmarkElement.id = "bookmark-" + bookmark.time;
  newBookmarkElement.className = "bookmark";
  newBookmarkElement.setAttribute("timestamp", bookmark.time);

  newBookmarkElement.appendChild(bookmarkTitleElement);
  newBookmarkElement.appendChild(controlsElement);
  bookmarks.appendChild(newBookmarkElement);
};

const viewBookmarks = (currentBookmarks = []) => {
  const bookmarksElement = document.getElementById("bookmarks");
  bookmarksElement.innerHTML = "";

  if (currentBookmarks.length > 0) {
    currentBookmarks.forEach(bookmark => addNewBookmark(bookmarksElement, bookmark));
  } else {
    bookmarksElement.innerHTML = '<i class="row">No bookmarks to show</i>';
  }
};

const onPlay = async (e) => {
  const bookmarkTime = e.target.closest(".bookmark").getAttribute("timestamp");
  const activeTab = await getActiveTabURL();
  chrome.tabs.sendMessage(activeTab.id, {
    type: "PLAY",
    value: bookmarkTime,
  });
};

const onDelete = async (e) => {
  const bookmarkTime = e.target.closest(".bookmark").getAttribute("timestamp");
  const activeTab = await getActiveTabURL();
  const bookmarkElement = document.getElementById("bookmark-" + bookmarkTime);
  bookmarkElement.remove();

  chrome.tabs.sendMessage(activeTab.id, {
    type: "DELETE",
    value: bookmarkTime,
  }, viewBookmarks);
};

const setBookmarkAttributes = (src, eventListener, controlParentElement) => {
  const controlElement = document.createElement("img");
  controlElement.src = "assets/" + src + ".png";
  controlElement.title = src;
  controlElement.addEventListener("click", eventListener);
  controlParentElement.appendChild(controlElement);
};

// === Focus Mode & Pomodoro Timer ===

const setupFocusMode = () => {
  const focusBtn = document.getElementById("focusModeBtn");
  if (focusBtn) {
    focusBtn.addEventListener("click", async () => {
      const activeTab = await getActiveTabURL();
      chrome.tabs.sendMessage(activeTab.id, { action: "toggleFocus" });
    });
  }
};

const setupPomodoro = () => {
  const timerBtn = document.getElementById("startTimerBtn");
  const display = document.getElementById("timerDisplay");

  if (timerBtn && display) {
    timerBtn.addEventListener("click", () => {
      let secondsLeft = 25 * 60;
      const interval = setInterval(() => {
        const minutes = Math.floor(secondsLeft / 60);
        const seconds = secondsLeft % 60;
        display.innerText = `Pomodoro Timer: ${minutes}:${seconds.toString().padStart(2, "0")}`;

        if (secondsLeft <= 0) {
          clearInterval(interval);
          display.innerText = "⏰ Time's up! Take a break!";
          chrome.notifications.create({
            type: "basic",
            iconUrl: "assets/ext-icon.png",
            title: "StudyPal",
            message: "Pomodoro complete! 🎉 Time for a break."
          });
        }

        secondsLeft--;
      }, 1000);
    });
  }
};

// === Load and Initialize ===

document.addEventListener("DOMContentLoaded", async () => {
  const activeTab = await getActiveTabURL();
  const urlParams = new URLSearchParams(activeTab.url.split("?")[1]);
  const currentVideo = urlParams.get("v");

  if (activeTab.url.includes("youtube.com/watch") && currentVideo) {
    chrome.storage.sync.get([currentVideo], (data) => {
      const bookmarks = data[currentVideo] ? JSON.parse(data[currentVideo]) : [];
      viewBookmarks(bookmarks);
    });

    setupFocusMode();
    setupPomodoro();

    document.getElementById("bookmarkBtn")?.addEventListener("click", async () => {
      const tab = await getActiveTabURL();
      chrome.tabs.sendMessage(tab.id, { type: "NEW" });
    });

    // Show total study time if stored
    chrome.storage.local.get("studyTime", (result) => {
      const minutes = result.studyTime || 0;
      document.getElementById("studyTime").innerText = `Total Study Time: ${minutes} mins`;
    });

  } else {
    document.querySelector(".container").innerHTML = `
      <div class="title">
        <p>📵 Not a YouTube video page</p>
      </div>`;
  }
});
