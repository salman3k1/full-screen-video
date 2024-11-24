import { autoUpdate, computePosition, offset } from '@floating-ui/dom';

export function floatButtonWithVideo(videoEl: HTMLVideoElement, buttonEl: HTMLButtonElement) {
  return autoUpdate(videoEl, buttonEl, () => {
    computePosition(videoEl, buttonEl, {
      placement: 'top-end',
      strategy: 'absolute',
      middleware: [offset({ mainAxis: -48, crossAxis: -12 })],
    }).then(({ x, y }) => {
      Object.assign(buttonEl.style, {
        left: `${x}px`,
        top: `${y}px`,
      });
    });
  });
}
