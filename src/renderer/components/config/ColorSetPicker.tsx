import * as React from "react";
import { SketchPicker } from "react-color";

import { Fab, Grid, IconButton, Menu, Tooltip } from "@mui/material";
import { styled } from "@mui/material/styles";

import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";

const StyledColorPickerButton = styled(Fab)(({ theme }) => ({
  backgroundColor: theme.palette.common.white,
  marginRight: theme.spacing(0.25),
  width: theme.spacing(2),
  height: theme.spacing(2),
  minHeight: theme.spacing(2),
  boxShadow: "none",
}));

interface ColorSetPickerProps {
  currentColors: Array<string>;
  sidebar?: boolean;
  onChangeColors: (colors: string[]) => void;
}

interface ColorSetPickerState {
  pickerIndex?: number;
  pickerColor?: string;
  pickerAnchorEl?: any;
}

class ColorSetPicker extends React.Component<
  ColorSetPickerProps,
  ColorSetPickerState
> {
  constructor(props: ColorSetPickerProps) {
    super(props);

    this.state = {};
  }

  render() {
    return (
      <Grid container>
        <Grid item sx={{ width: 64 }}>
          <Tooltip disableInteractive title="Add Color">
            <Fab
              id="add-color"
              sx={{
                m: 1,
                mt: 0,
                boxShadow: "none",
              }}
              style={
                this.state.pickerIndex == null
                  ? {}
                  : { backgroundColor: this.state.pickerColor }
              }
              onClick={this.onOpenColorPicker}
              size="medium"
            >
              {this.state.pickerIndex == null && <AddIcon />}
              {this.state.pickerIndex != null && <div />}
            </Fab>
          </Tooltip>
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
            onClose={this.onCloseColorPicker}
          >
            <SketchPicker
              color={
                this.state.pickerColor ? this.state.pickerColor : "#000000"
              }
              disableAlpha={false}
              presetColors={[]}
              onChange={this.onChangeColor}
            />
          </Menu>
        </Grid>
        <Grid item xs>
          <Grid container alignItems="center">
            {this.props.currentColors.map((c, index) => (
              <Grid key={c + index} item>
                <StyledColorPickerButton
                  id={"color-" + index}
                  style={{
                    backgroundColor: c,
                    border:
                      index == this.state.pickerIndex
                        ? "black solid 3px"
                        : undefined,
                  }}
                  value={c}
                  onClick={this.onOpenColorPicker}
                  size="small"
                >
                  <div />
                </StyledColorPickerButton>
              </Grid>
            ))}
          </Grid>
        </Grid>
        <Grid item>
          <Tooltip disableInteractive title="Clear Colors">
            <IconButton onClick={this.onClearColors} size="large">
              <DeleteIcon color="error" />
            </IconButton>
          </Tooltip>
        </Grid>
      </Grid>
    );
  }

  onOpenColorPicker = (e: React.MouseEvent<HTMLButtonElement>) => {
    const target = e.currentTarget;
    let color, index;
    if (target.id == "add-color") {
      index = this.props.currentColors.length;
      color = "#000000";
      this.props.onChangeColors(this.props.currentColors.concat(color));
    } else {
      index = Number.parseInt(target.id.replace("color-", ""));
      color = this.props.currentColors[index];
    }
    this.setState({
      pickerIndex: index,
      pickerColor: color,
      pickerAnchorEl: document.getElementById("add-color"),
    });
  };

  onCloseColorPicker = () => {
    const newColors = this.props.currentColors;
    newColors[this.state.pickerIndex as number] = this.state
      .pickerColor as string;
    this.props.onChangeColors(newColors);
    this.setState({
      pickerIndex: undefined,
      pickerColor: undefined,
      pickerAnchorEl: undefined,
    });
  };

  onChangeColor = (color: any) => {
    this.setState({ pickerColor: color.hex });
  };

  onClearColors = () => {
    this.setState({
      pickerIndex: undefined,
      pickerColor: undefined,
      pickerAnchorEl: undefined,
    });
    this.props.onChangeColors([]);
  };
}

export default ColorSetPicker;
