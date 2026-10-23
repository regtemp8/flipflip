import Select, { components, MultiValue } from "react-select";
import * as React from "react";
import { Checkbox } from "@mui/material";
import { grey } from "@mui/material/colors";

import Scene from "../../../common/Scene";
import { SceneBase } from "../../../common/SceneBase";

interface MultiSceneSelectProps<T extends SceneBase> {
  scene: T;
  allScenes: Array<Scene>;
  values: Array<number>;
  getSceneName: (sceneID: string) => string;
  onChange: (sceneIDs: Array<number>) => void;
}

class MultiSceneSelect<T extends SceneBase> extends React.Component<
  MultiSceneSelectProps<T>
> {
  constructor(props: MultiSceneSelectProps<T>) {
    super(props);
  }

  Option = (props: any) => (
    <div>
      <components.Option {...props}>
        <Checkbox
          sx={{ color: grey[900] }}
          checked={props.isSelected}
          onChange={() => null}
        />{" "}
        <label>{props.label}</label>
      </components.Option>
    </div>
  );
  MultiValue = (props: any) => (
    <components.MultiValue {...props}>
      <span>{props.data.label}</span>
    </components.MultiValue>
  );

  render() {
    const Option = this.Option;
    const MultiValue = this.MultiValue;
    return (
      <Select
        styles={{
          container: (baseStyles) => ({ ...baseStyles, color: grey[900] }),
        }}
        value={this.props.values.map((id) => {
          return { label: this.props.getSceneName(id.toString()), value: id };
        })}
        options={this.props.allScenes
          .filter((s) => s.id !== this.props.scene.id && s.sources.length > 0)
          .map((s) => {
            return { label: this.props.getSceneName(s.id.toString()), value: s.id };
          })}
        components={{ Option, MultiValue }}
        isClearable
        isMulti
        hideSelectedOptions={false}
        closeMenuOnSelect={false}
        backspaceRemovesValue={false}
        placeholder="Search scenes ..."
        onChange={this.onChange}
      />
    );
  }

  onChange = (e: MultiValue<{ label: string; value: number }>) => {
    this.props.onChange(e.map((v) => v.value));
  };
}

export default MultiSceneSelect;
