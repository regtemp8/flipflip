import * as React from 'react';

import {RemoteSettings} from "../../Config";
import ControlGroup from "../sceneDetail/ControlGroup";

export default class APIGroup extends React.Component {
  readonly props: {
    settings: RemoteSettings
    activateReddit(): void,
    clearReddit(): void,
    activateTumblr(): void,
    clearTumblr(): void,
    onUpdateSettings(keys: RemoteSettings, fn: (keys: RemoteSettings) => void): void,
  };

  render() {
    const tumblrAuthorized = this.props.settings.tumblrOAuthToken != "" && this.props.settings.tumblrOAuthTokenSecret != "";
    const redditAuthorized = this.props.settings.redditRefreshToken != "";
    return (
      <ControlGroup title="API Keys" isNarrow={true}>
        <div className="ControlSubgroup" style={{display: 'block'}}>
          <button onClick={!tumblrAuthorized ? this.props.activateTumblr.bind(this) : this.nop}
                  className={`u-button ${!tumblrAuthorized ? 'u-clickable' : 'u-disabled'}`}>Authorize FlipFlip on Tumblr</button>
          <button onClick={tumblrAuthorized ? this.props.clearTumblr.bind(this) : this.nop}
                  className={`u-button ${tumblrAuthorized ? 'u-clickable' : 'u-disabled'}`}>Clear Tumblr Token</button>
        </div>
        <hr/>
        <div className="ControlSubgroup">
          <button onClick={!redditAuthorized ? this.props.activateReddit.bind(this) : this.nop}
                  className={`u-button ${!redditAuthorized ? 'u-clickable' : 'u-disabled'}`}>Authorize FlipFlip on Reddit</button>
          <button onClick={redditAuthorized ? this.props.clearReddit.bind(this) : this.nop}
                  className={`u-button ${redditAuthorized ? 'u-clickable' : 'u-disabled'}`}>Clear Reddit Token</button>
        </div>
      </ControlGroup>
    )
  }

  nop() {}

  paste(fn: Function) {
    (navigator as any).clipboard.readText().then((pastedText: string) => {
      fn(pastedText);
    });
  }

  update(fn: (keys: any) => void) {
    this.props.onUpdateSettings(this.props.settings, fn);
  }
}