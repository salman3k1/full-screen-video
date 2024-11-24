import { activeStateStorage } from '@extension/storage';
import {
  createGlobalMutationObserver,
  createPrimaryVideoIntersectionObserver,
  createVideoControlsMutationObserver,
  getPrimaryVideo,
} from './utils/observers';
import { IgnoredVidMap, VidMap, VidMapConfig } from './utils/types';
import { createDomElement, requestFullScreen } from './utils/general';
import { floatButtonWithVideo } from './utils/floating-ui';

console.log('fsv: content script loaded');

const browser = globalThis.chrome;
const vidMap: VidMap = new Map<HTMLVideoElement, VidMapConfig>();
const ignoredVidMap: IgnoredVidMap = new Map<HTMLVideoElement, boolean>();

const { observer: globalMutationObserver, observe: globalMutationObserverObserve } =
  createGlobalMutationObserver(addFullScreenButtons);
const videoIntersectionObserver = createPrimaryVideoIntersectionObserver(vidMap);
reset();

browser.runtime.sendMessage({ message: 'CONTENT_LOADED' });

activeStateStorage.subscribe(() => {
  const isActive = activeStateStorage.getSnapshot();
  if (typeof isActive !== 'undefined') {
    reset();
  }
});

async function reset() {
  const isActive = activeStateStorage.getSnapshot();
  if (isActive) {
    addFullScreenButtons();
  } else {
    cleanup();
  }
}

function cleanup() {
  globalMutationObserver.disconnect();
  vidMap.forEach(config => {
    config.btn.remove();
    config.floatingUiCleanup();
  });
  vidMap.clear();
  ignoredVidMap.clear();
}

function addFullScreenButtons() {
  // If in full screen don't recalculate buttons due to mutations in the background
  if (document.fullscreenElement) {
    return;
  }

  // Since we are going to perform some mutations on our own here by adding new buttons
  // Let's disconnect the observer temporarily
  globalMutationObserver.disconnect();

  // Cleanup videos in vidMap that are not in the document anymore
  for (let vid of vidMap.keys()) {
    if (!document.body.contains(vid)) {
      const mapObj = vidMap.get(vid);
      mapObj?.btn.remove();
      mapObj?.floatingUiCleanup();
      vidMap.delete(vid);
    }
  }

  // Cleanup videos in ignoredVidMap that are not in the document anymore
  for (let vid of ignoredVidMap.keys()) {
    if (!document.body.contains(vid)) {
      ignoredVidMap.delete(vid);
    }
  }

  const vids = document.getElementsByTagName('video');

  for (let x = 0; x < vids.length; x++) {
    const vid = vids[x];

    // Skip if
    //    already in the vidMap or the ignored videos list
    //    Or doesn't have valid dimensions
    if (vidMap.has(vid) || ignoredVidMap.has(vid) || vid.offsetHeight === 0 || vid.offsetWidth === 0) {
      continue;
    }

    // Ignore videos wrapped in an anchor element
    if (vid.closest('a')) {
      ignoredVidMap.set(vid, true);
      continue;
    }

    // Create a new button and append to the parent
    const fullScreenButton = createDomElement(`<button class="fsV-full-screen-button"></button>`) as HTMLButtonElement;

    fullScreenButton.addEventListener('click', (e: MouseEvent) => {
      e.stopPropagation();
      goFullScreen(vid);
    });

    document.body.appendChild(fullScreenButton);

    const floatingUiCleanup = floatButtonWithVideo(vid, fullScreenButton);
    videoIntersectionObserver.observe(vid);
    // Create a map record for this video with values for the button and parent element
    vidMap.set(vid, { btn: fullScreenButton, floatingUiCleanup });
  }
  // Resume observer after our mutations
  globalMutationObserverObserve(document.body);
}

async function goFullScreen(vid: HTMLVideoElement) {
  const originalControlsValue = vid.getAttribute('controls');
  const originalObjectFitValue = vid.style.objectFit;
  vid.setAttribute('controls', 'true');
  vid.style.objectFit = 'contain';

  // In cases such as YouTube's native full screen functionality,
  // its not the video that is running in full screen but the whole document
  // In those cases we'd want to exit the full screen first before calling our own full screen function
  if (document.fullscreenElement) {
    await document.exitFullscreen();
  }

  requestFullScreen(vid);

  // Create an observer instance to watch for changes in attributes of the video element
  // Helpful to restore the controls on services such as youtube shorts which removes this attribute
  // on actions such as seek and pause
  const { observer: videoControlsMutationObserver, observe: videoControlsMutationObserverObserve } =
    createVideoControlsMutationObserver();

  // Start observing the video node for configured mutations
  videoControlsMutationObserverObserve(vid);

  // Event handler to handle the exit full screen event and restore video values
  function handleFullScreenChange() {
    if (!vid) {
      return;
    }
    if (!document.fullscreenElement) {
      if (originalControlsValue) {
        vid.setAttribute('controls', originalControlsValue);
      } else {
        vid.removeAttribute('controls');
      }

      vid.style.objectFit = originalObjectFitValue;

      vid.removeEventListener('fullscreenchange', handleFullScreenChange);
      videoControlsMutationObserver.disconnect();
    }
  }

  vid.addEventListener('fullscreenchange', handleFullScreenChange);
}

window.addEventListener('keydown', function (event) {
  if (event.shiftKey && event.key.toLowerCase() === 'v') {
    const primaryVideo = getPrimaryVideo();
    if (primaryVideo) {
      goFullScreen(primaryVideo);
    }
  }
});
