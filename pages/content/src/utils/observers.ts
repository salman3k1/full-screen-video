import { VidMap } from './types';

export function createGlobalMutationObserver(callback: MutationCallback) {
  const observerConfig = {
    childList: true,
    subtree: true,
  };
  const observer = new MutationObserver(callback);

  function observe(target: Node) {
    observer.observe(target, observerConfig);
  }
  return { observer, observe };
}

export function createVideoControlsMutationObserver() {
  // Observer config for the video element
  const observerConfig = {
    attributeFilter: ['controls'],
  };

  // Callback function to execute when video attributes are mutated
  function observerCallback(mutationList: MutationRecord[]) {
    if (!document.fullscreenElement) {
      return;
    }
    for (const mutation of mutationList) {
      if (mutation.attributeName === 'controls' && !(mutation.target as HTMLVideoElement).getAttribute('controls')) {
        (mutation.target as HTMLVideoElement).setAttribute('controls', 'true');
        return;
      }
    }
  }

  // Create an observer instance to watch for changes in attributes of the video element
  // Helpful to restore the controls on services such as youtube shorts which removes this attribute
  // on actions such as seek and pause
  const observer = new MutationObserver(observerCallback);

  function observe(target: Node) {
    observer.observe(target, observerConfig);
  }

  return { observer, observe };
}

const primaryVideoData: {
  intersecting: Map<HTMLVideoElement, boolean>;
} = {
  intersecting: new Map(),
};

export function getPrimaryVideo() {
  return Array.from(primaryVideoData.intersecting.keys()).pop();
}

export function createPrimaryVideoIntersectionObserver(vidMap: VidMap) {
  const observer = new IntersectionObserver(observerCallback, {
    rootMargin: '0px',
    threshold: 0.5,
  });

  function observerCallback(entries: IntersectionObserverEntry[]) {
    entries.forEach(entry => {
      const video = entry.target as HTMLVideoElement;
      const vidMapObj = vidMap.get(video);

      if (!vidMapObj) {
        return;
      }

      if (entry.isIntersecting) {
        primaryVideoData.intersecting.set(video, true);
      } else {
        primaryVideoData.intersecting.delete(video);
      }
    });
  }

  return observer;
}
