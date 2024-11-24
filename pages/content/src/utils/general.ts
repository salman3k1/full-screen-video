export function requestFullScreen(
  vid: HTMLVideoElement & {
    webkitSupportsFullscreen?: boolean;
    webkitEnterFullscreen?: () => void;
    mozRequestFullScreen?: () => void;
    webkitRequestFullscreen?: () => void;
    msRequestFullscreen?: () => void;
  }
) {
  if (vid.requestFullscreen) {
    vid.requestFullscreen();
    return;
  }

  if (vid.webkitRequestFullscreen) {
    vid.webkitRequestFullscreen();
    return;
  }

  if (vid.webkitSupportsFullscreen) {
    vid.webkitEnterFullscreen?.();
    return;
  }

  if (vid.mozRequestFullScreen) {
    vid.mozRequestFullScreen();
    return;
  }

  if (vid.msRequestFullscreen) {
    vid.msRequestFullscreen();
    return;
  }
}

export function createDomElement(html: string) {
  const dom = new DOMParser().parseFromString(html, "text/html");
  return dom.body.firstElementChild;
}
