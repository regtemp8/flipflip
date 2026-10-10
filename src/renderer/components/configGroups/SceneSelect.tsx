import Select from "react-select";
import * as React from "react";
import { grey } from "@mui/material/colors";

import Scene from "../../../common/Scene";
import SceneGrid from "../../../common/SceneGrid";
import { areWeightsValid } from "../../data/utils";
import { SceneBase } from "../../../common/SceneBase";

interface SceneSelectProps<T extends SceneBase> {
  allScenes: Array<Scene>;
  value: number;
  allSceneGrids?: Array<SceneGrid>;
  scene?: T;
  menuIsOpen?: boolean;
  autoFocus?: boolean;
  includeExtra?: boolean;
  onlyExtra?: boolean;
  getSceneName: (sceneID: string) => string;
  onChange: (sceneID: number) => void;
}

class SceneSelect<T extends SceneBase> extends React.Component<
  SceneSelectProps<T>
> {
  constructor(props: SceneSelectProps<T>) {
    super(props);
  }

  render() {
    let defaults = [this.props.onlyExtra ? "-1" : "0"];
    if (this.props.includeExtra) {
      defaults = ["0", "-1"];
    }
    const scenes = this.props.allScenes
      .filter(
        (s) =>
          (!this.props.scene || s.id !== this.props.scene.id) &&
          (s.sources.length > 0 || (s.regenerate && areWeightsValid(s))),
      )
      .map((s) => s.id.toString());
    let idList = defaults.concat(scenes);
    if (this.props.allSceneGrids) {
      idList = idList.concat(this.props.allSceneGrids.map((s) => "999" + s.id));
    }
    const options = idList
      .map((id) => {
        return { label: this.props.getSceneName(id), value: Number(id) };
      })
      .filter((o) => o.label != "library_scene_temp");
    return (
      <Select
        sx={{
          color: grey[900],
        }}
        value={{
          label: this.props.getSceneName(this.props.value.toString()),
          value: this.props.value,
        }}
        options={options}
        backspaceRemovesValue={false}
        menuIsOpen={this.props.menuIsOpen}
        autoFocus={this.props.autoFocus}
        onChange={this.onChange}
      />
    );
  }

  onChange = (e: { label: string; value: number }) => {
    this.props.onChange(e.value);
  };
}

export default SceneSelect;
