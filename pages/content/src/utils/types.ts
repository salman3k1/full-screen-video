export type VidMapConfig = {
  btn: HTMLButtonElement;
  floatingUiCleanup: () => void;
};

export type VidMap = Map<HTMLVideoElement, VidMapConfig>;

export type IgnoredVidMap = Map<HTMLVideoElement, boolean>;
