document.getElementById("startTimerBtn").addEventListener("click", () => {
  let secondsLeft = 25 * 60; // 25 minutes
  const display = document.getElementById("timerDisplay");

  const interval = setInterval(() => {
    const minutes = Math.floor(secondsLeft / 60);
    const seconds = secondsLeft % 60;
    display.innerText = `⏳ Pomodoro: ${minutes}:${seconds.toString().padStart(2, "0")}`;

    if (secondsLeft <= 0) {
      clearInterval(interval);
      display.innerText = "✅ Time's up! Take a break.";

      // Show notification
      chrome.runtime.sendMessage({
        type: "SHOW_NOTIFICATION",
        message: "Pomodoro complete! 🎉 Time for a short break."
      });
    }

    secondsLeft--;
  }, 1000);
});
