import * as React from "react";
import { Card, CardContent, Grid } from "@mui/material";

import { SDT } from "../../../common/const";
import Scene from "../../../common/Scene";
import ImageVideoCard from "../configGroups/ImageVideoCard";
import SceneOptionCard from "../configGroups/SceneOptionCard";
import SceneGrid from "../../../common/SceneGrid";
import { SceneBase } from "../../../common/SceneBase";

interface SceneOptionsProps<T extends SceneBase> {
  allScenes: Array<Scene>;
  allSceneGrids: Array<SceneGrid>;
  scene: T;
  tutorial: string | null;
  isConfig?: boolean;
  onUpdateScene: (scene: T, fn: (scene: T) => void) => void;
}

class SceneOptions<T extends SceneBase> extends React.Component<
  SceneOptionsProps<T>
> {
  constructor(props: SceneOptionsProps<T>) {
    super(props);
  }

  render() {
    const tutorial1 =
      this.props.tutorial == SDT.optionsLeft ||
      this.props.tutorial == SDT.timing ||
      this.props.tutorial == SDT.backForth ||
      this.props.tutorial == SDT.imageSizing ||
      this.props.tutorial == SDT.nextScene ||
      this.props.tutorial == SDT.overlays;
    const tutorial2 =
      this.props.tutorial == SDT.optionsRight ||
      this.props.tutorial == SDT.imageOptions ||
      this.props.tutorial == SDT.videoOptions ||
      this.props.tutorial == SDT.weighting ||
      this.props.tutorial == SDT.sordering ||
      this.props.tutorial == SDT.ordering;
    return (
      <Grid container spacing={2}>
        <Grid
          item
          xs={12}
          md={6}
          sx={
            tutorial1
              ? {
                  zIndex: (theme) => theme.zIndex.modal + 1,
                  pointerEvents: "none",
                }
              : undefined
          }
        >
          <Card
            sx={{
              overflow: "inherit",
              borderWidth: this.props.tutorial == SDT.optionsLeft ? 2 : 0,
              borderColor: "secondary.main",
              borderStyle: "solid",
            }}
          >
            <CardContent>
              <SceneOptionCard
                allScenes={this.props.allScenes}
                allSceneGrids={this.props.allSceneGrids}
                scene={this.props.scene}
                tutorial={this.props.tutorial}
                onUpdateScene={this.props.onUpdateScene}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid
          item
          xs={12}
          md={6}
          sx={
            tutorial2
              ? {
                  zIndex: (theme) => theme.zIndex.modal + 1,
                  pointerEvents: "none",
                }
              : undefined
          }
        >
          <Card
            sx={{
              borderWidth: this.props.tutorial == SDT.optionsRight ? 2 : 0,
              borderColor: "secondary.main",
              borderStyle: "solid",
            }}
          >
            <CardContent>
              <ImageVideoCard
                scene={this.props.scene}
                isConfig={this.props.isConfig}
                tutorial={this.props.tutorial}
                onUpdateScene={this.props.onUpdateScene}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  }
}

export default SceneOptions;
