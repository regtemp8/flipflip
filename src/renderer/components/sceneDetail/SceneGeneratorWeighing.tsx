import * as React from "react";
import clsx from "clsx";

import {
  FormControlLabel,
  Radio,
  RadioGroup,
  Slider,
  Theme,
} from "@mui/material";
import createStyles from "@mui/styles/createStyles";
import withStyles from "@mui/styles/withStyles";

import { SDGT, TT } from "../../../common/const";
import en from "../../../common/en";
import WeightGroup from "../../../common/WeightGroup";

const styles = (theme: Theme) =>
  createStyles({
    slider: {
      height: "auto",
      transform: "scaleY(1)",
      zIndex: theme.zIndex.modal + 1,
      transition: theme.transitions.create("transform", {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
    },
    sliderClose: {
      transform: "scaleY(0)",
      zIndex: "auto",
      transition: theme.transitions.create("transform", {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
    },
    editSlider: {
      paddingLeft: theme.spacing(2),
      paddingRight: theme.spacing(1),
      height: "100%",
    },
    valueLabel: {
      top: theme.spacing(2.75),
      right: "unset",
      left: theme.spacing(4),
      "&:before": {
        left: "0%",
        right: "unset",
      },
    },
    editRadios: {
      paddingLeft: theme.spacing(1),
      paddingRight: theme.spacing(2),
    },
    highlight: {
      borderWidth: 2,
      borderColor: theme.palette.secondary.main,
      borderStyle: "solid",
    },
  });

interface SceneGeneratorWeighingProps {
  classes: any;
  isWeighing: number;
  isEditing: number;
  generatorWeights: WeightGroup[];
  onGroupSliderChange: (
    e: Event | React.SyntheticEvent<Element, Event>,
    value: number | number[],
  ) => void;
  onGroupInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
  advRule: boolean;
  tutorial: string;
}

class SceneGeneratorWeighing extends React.Component<SceneGeneratorWeighingProps> {
  constructor(props: SceneGeneratorWeighingProps) {
    super(props);
  }

  render() {
    const classes = this.props.classes;
    const isWeighing: WeightGroup | null =
      this.props.isWeighing == -1
        ? null
        : this.props.isEditing == -1
          ? this.props.generatorWeights[this.props.isWeighing]
          : this.props.generatorWeights[this.props.isEditing].rules[
              this.props.isWeighing
            ];

    if (isWeighing == null) {
      return null;
    }

    return (
      <React.Fragment>
        <div
          className={clsx(
            classes.slider,
            isWeighing.type != TT.weight && classes.sliderClose,
          )}
        >
          <Slider
            className={classes.editSlider}
            classes={{
              valueLabel: classes.valueLabel,
            }}
            max={this.getRemainingPercent() + isWeighing.percent}
            defaultValue={isWeighing.percent}
            onChangeCommitted={this.props.onGroupSliderChange}
            valueLabelDisplay={"auto"}
            valueLabelFormat={(v) => v + "%"}
            orientation="vertical"
          />
        </div>
        <RadioGroup
          className={classes.editRadios}
          value={isWeighing.type}
          onChange={this.props.onGroupInput}
        >
          {Object.values(TT)
            .filter((tt) => this.props.advRule || tt != TT.or)
            .map((tt) => (
              <FormControlLabel
                key={tt}
                value={tt}
                control={
                  <Radio
                    className={clsx(
                      this.props.tutorial == SDGT.edit2 &&
                        tt == TT.all &&
                        classes.highlight,
                    )}
                  />
                }
                label={en.get(tt)}
              />
            ))}
        </RadioGroup>
      </React.Fragment>
    );
  }

  getRemainingPercent(): number {
    let remaining = 100;
    if (this.props.isEditing == -1) {
      for (const wg of this.props.generatorWeights) {
        if (wg.type == TT.weight) {
          remaining = remaining - wg.percent;
        }
      }
    } else {
      for (const wg of this.props.generatorWeights[this.props.isEditing]
        .rules) {
        if (wg.type == TT.weight) {
          remaining = remaining - wg.percent;
        }
      }
    }
    return remaining;
  }
}

(SceneGeneratorWeighing as any).displayName = "SceneGeneratorWeighing";
export default withStyles(styles)(SceneGeneratorWeighing as any);
