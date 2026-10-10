import * as React from "react";
import { Card, CardContent, Grid } from "@mui/material";

import { SDT } from "../../../common/const";
import CrossFadeCard from "../configGroups/CrossFadeCard";
import SlideCard from "../configGroups/SlideCard";
import StrobeCard from "../configGroups/StrobeCard";
import ZoomMoveCard from "../configGroups/ZoomMoveCard";
import FadeIOCard from "../configGroups/FadeIOCard";
import PanningCard from "../configGroups/PanningCard";
import { SceneBase } from "../../../common/SceneBase";

interface SceneEffectsProps<T extends SceneBase> {
  scene: T;
  easingControls: boolean;
  tutorial?: string;
  onUpdateScene: (scene: T, fn: (scene: T) => void) => void;
}

class SceneEffects<T extends SceneBase> extends React.Component<
  SceneEffectsProps<T>
> {
  constructor(props: SceneEffectsProps<T>) {
    super(props);
  }

  render() {
    const tutorialZoom =
      this.props.tutorial == SDT.zoom1 ||
      this.props.tutorial == SDT.zoom2 ||
      this.props.tutorial == SDT.zoom3 ||
      this.props.tutorial == SDT.zoom4;
    const tutorialFade =
      this.props.tutorial == SDT.fade1 || this.props.tutorial == SDT.fade2;
    return (
      <Grid container spacing={2}>
        <Grid
          item
          xs={12}
          md={6}
          lg={4}
          sx={{
            zIndex: tutorialZoom
              ? (theme) => theme.zIndex.modal + 1
              : undefined,
          }}
        >
          <Card>
            <CardContent>
              <ZoomMoveCard
                scene={this.props.scene}
                easingControls={this.props.easingControls}
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
          lg={4}
          sx={{
            zIndex: tutorialFade
              ? (theme) => theme.zIndex.modal + 1
              : undefined,
          }}
        >
          <Card>
            <CardContent>
              <CrossFadeCard
                scene={this.props.scene}
                easingControls={this.props.easingControls}
                tutorial={this.props.tutorial}
                onUpdateScene={this.props.onUpdateScene}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} lg={4}>
          <Card>
            <CardContent>
              <SlideCard
                scene={this.props.scene}
                easingControls={this.props.easingControls}
                tutorial={this.props.tutorial}
                onUpdateScene={this.props.onUpdateScene}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} lg={4}>
          <Card>
            <CardContent>
              <StrobeCard
                scene={this.props.scene}
                easingControls={this.props.easingControls}
                onUpdateScene={this.props.onUpdateScene}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} lg={4}>
          <Card>
            <CardContent>
              <FadeIOCard
                scene={this.props.scene}
                easingControls={this.props.easingControls}
                tutorial={this.props.tutorial}
                onUpdateScene={this.props.onUpdateScene}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} lg={4}>
          <Card>
            <CardContent>
              <PanningCard
                scene={this.props.scene}
                easingControls={this.props.easingControls}
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

export default SceneEffects;
