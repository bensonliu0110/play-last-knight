const loadingScreen = document.querySelector('#loading-screen');
const mainScreen = document.querySelector('#main-screen');
const screenFlash = document.querySelector('#screen-flash');
const progressFill = document.querySelector('#progress-fill');
const progressValue = document.querySelector('#progress-value');
const progressTrack = document.querySelector('.progress-track');

const loadingDuration = 3600;
const startedAt = performance.now();

function updateProgress(now) {
  const elapsed = now - startedAt;
  const progress = Math.min(elapsed / loadingDuration, 1);
  const percentage = Math.round(progress * 100);

  progressFill.style.width = `${percentage}%`;
  progressValue.textContent = `${percentage}%`;
  progressTrack.setAttribute('aria-valuenow', percentage);

  if (progress < 1) {
    setTimeout(() => updateProgress(performance.now()), 16);
    return;
  }

  finishLoading();
}

function finishLoading() {
  screenFlash.classList.add('is-flashing');
  loadingScreen.classList.add('is-complete');
  mainScreen.setAttribute('aria-hidden', 'false');
  window.LastKnightGame.startPlayTimeTracking();
  window.dispatchEvent(new CustomEvent('last-knight-main-ready'));
}

updateProgress(performance.now());