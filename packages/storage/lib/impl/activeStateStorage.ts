import { StorageEnum } from '../base/enums';
import { createStorage } from '../base/base';
import type { BaseStorage } from '../base/types';

type ActiveState = boolean;

type ThemeStorage = BaseStorage<ActiveState> & {
  toggle: () => Promise<void>;
};

const storage = createStorage<ActiveState>('isActive', false, {
  storageEnum: StorageEnum.Local,
  liveUpdate: true,
});

// You can extend it with your own methods
export const activeStateStorage: ThemeStorage = {
  ...storage,
  toggle: async () => {
    await storage.set(isActive => !isActive);
  },
};
