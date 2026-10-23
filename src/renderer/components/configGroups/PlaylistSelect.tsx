import Select, { SingleValue } from "react-select";
import * as React from "react";

import { grey } from "@mui/material/colors";

import Playlist from "../../../common/Playlist";

interface PlaylistSelectProps {
  playlists: Array<Playlist>;
  menuIsOpen?: boolean;
  autoFocus?: boolean;
  onChange: (sceneID: number) => void;
}

class PlaylistSelect extends React.Component<PlaylistSelectProps> {
  constructor(props: PlaylistSelectProps) {
    super(props);
  }

  render() {
    const defaults = [{ label: "+ New Playlist", value: -1 }];
    return (
      <Select
        styles={{
          container: (baseStyles) => ({ ...baseStyles, color: grey[900] }),
        }}
        options={defaults.concat(
          this.props.playlists.map((p) => {
            return { label: p.name, value: p.id };
          }),
        )}
        backspaceRemovesValue={false}
        menuIsOpen={this.props.menuIsOpen}
        autoFocus={this.props.autoFocus}
        onChange={this.onChange}
      />
    );
  }

  onChange = (e: SingleValue<{ label: string; value: number }>) => {
    if (e != null) {
      this.props.onChange(e.value);
    }
  };
}

export default PlaylistSelect;
