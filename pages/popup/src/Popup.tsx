import '@src/Popup.css';
import { useStorage, withErrorBoundary, withSuspense } from '@extension/shared';
import { activeStateStorage } from '@extension/storage';

const Popup = () => {
  const isActive = useStorage(activeStateStorage);
  const logo = 'popup/128.png';

  return (
    <div className="App">
      <header className="App-header text-gray-900">
        <img src={chrome.runtime.getURL(logo)} className="App-logo" alt="logo" />
        <div className="option-container">
          <p className="option-container__caption">{isActive ? 'ON' : 'OFF'}</p>
          <label className="option-container__switch">
            <input
              id="toggle-active-state-switch"
              type="checkbox"
              checked={isActive}
              onChange={activeStateStorage.toggle}
            />
            <span className="slider round"></span>
          </label>
        </div>
        <p className={['text-sm text-start', !isActive ? 'text-gray-400' : ''].join(' ')}>
          {!isActive ? <span>After turning the extension ON by toggling the switch above, you</span> : 'You'} can go
          full screen by clicking the full screen video button on the top right corner of each compatible video.
          Alternatively press <span className="font-semibold">Shift + V</span> to go full screen on the current video.
        </p>
      </header>
    </div>
  );
};

export default withErrorBoundary(withSuspense(Popup, <div> Loading ... </div>), <div> Error Occur </div>);
