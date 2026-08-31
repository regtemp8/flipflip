import * as React from "react";
import { SketchPicker } from "react-color";

import { Fab, Grid, Menu, TextField, Tooltip } from "@mui/material";
import { styled } from "@mui/material/styles";

const StyledColorPickerButton = styled(Fab)(({ theme }) => ({
  backgroundColor: theme.palette.common.white,
  marginRight: theme.spacing(0.25),
  width: theme.spacing(2),
  height: theme.spacing(2),
  minHeight: theme.spacing(2),
  boxShadow: "none",
}));

const COLORS = [
  "#f44336",
  "#e91e63",
  "#9c27b0",
  "#673ab7",
  "#3f51b5",
  "#2196f3",
  "#03a9f4",
  "#00bcd4",
  "#009688",
  "#4caf50",
  "#8bc34a",
  "#cddc39",
  "#ffeb3b",
  "#ffc107",
  "#ff9800",
  "#ff5722",
  "#795548",
  "#9e9e9e",
  "#607d8b",
  "#fff",
  "#000",
];

interface ColorPickerProps {
  currentColor: string;
  sidebar?: boolean;
  onChangeColor(e: any): void;
}

interface ColorPickerState {
  pickerColor: any;
  pickerAnchorEl: any;
}

class ColorPicker extends React.Component<ColorPickerProps, ColorPickerState> {
  constructor(props: ColorPickerProps) {
    super(props);

    this.state = {
      pickerColor: null as any,
      pickerAnchorEl: null as any,
    };
  }

  render() {
    return (
      <Grid container alignItems="center">
        <Grid item sx={{ width: 170 }}>
          <Tooltip disableInteractive title="Pick Color">
            <Fab
              sx={{
                m: 1,
                mt: 0,
                boxShadow: "none",
              }}
              style={{
                backgroundColor:
                  this.state?.pickerColor?.hex ??
                  this.state?.pickerColor ??
                  this.props.currentColor,
              }}
              onClick={this.onToggleColorPicker.bind(this)}
              size="medium"
            >
              <div />
            </Fab>
          </Tooltip>
          <TextField
            variant="standard"
            sx={{ width: 100 }}
            label="Color"
            value={
              this.state?.pickerColor?.hex ??
              this.state?.pickerColor ??
              this.props.currentColor
            }
            onChange={this.props.onChangeColor.bind(this)}
          />
          <Menu
            id="color-picker"
            elevation={1}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "left",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "left",
            }}
            anchorEl={this.state.pickerAnchorEl}
            keepMounted
            open={!!this.state.pickerColor}
            onClose={this.onToggleColorPicker.bind(this)}
          >
            <SketchPicker
              color={this.state?.pickerColor ?? this.props.currentColor}
              disableAlpha={false}
              presetColors={[]}
              onChange={this.onChangePickerColor.bind(this)}
            />
          </Menu>
        </Grid>
        <Grid item xs={12} sm={this.props.sidebar ? 12 : true}>
          <Grid container alignItems="center">
            {COLORS.map((c) => (
              <Grid key={c} item>
                <StyledColorPickerButton
                  style={{ backgroundColor: c }}
                  value={c}
                  onClick={this.props.onChangeColor.bind(this)}
                  size="small"
                >
                  <div />
                </StyledColorPickerButton>
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>
    );
  }

  onToggleColorPicker(e: MouseEvent) {
    if (this.state.pickerColor) {
      this.onChangeColor(this.state.pickerColor);
      this.setState({ pickerColor: null, pickerAnchorEl: null });
    } else {
      this.setState({
        pickerColor: this.props.currentColor,
        pickerAnchorEl: e.currentTarget,
      });
    }
  }

  onChangePickerColor(color: any) {
    this.setState({ pickerColor: color });
  }

  onChangeColor(color: any) {
    this.props.onChangeColor({ target: { value: color.hex } });
  }
}

export default ColorPicker;
