import * as React from "react";

import { Fab, Grid, TextField } from "@mui/material";
import { styled } from "@mui/material/styles";

import * as color from "@mui/material/colors";

const StyledColorPickerButton = styled(Fab)(({ theme }) => ({
  marginRight: theme.spacing(0.25),
  width: theme.spacing(2),
  height: theme.spacing(2),
  minHeight: theme.spacing(2),
  boxShadow: "none",
}));

const colors = [
  color.red,
  color.pink,
  color.purple,
  color.deepPurple,
  color.indigo,
  color.blue,
  color.lightBlue,
  color.cyan,
  color.teal,
  color.green,
  color.lightGreen,
  color.lime,
  color.yellow,
  color.amber,
  color.orange,
  color.deepOrange,
  color.brown,
  color.grey,
  color.blueGrey,
];

interface ThemeColorPickerProps {
  currentColor: string;
  onChangeColor(colorTheme: any): void;
}

class ThemeColorPicker extends React.Component<ThemeColorPickerProps> {
  constructor(props: ThemeColorPickerProps) {
    super(props);
  }

  render() {
    return (
      <Grid container alignItems="center">
        <Grid item sx={{ width: 170 }}>
          <Fab
            sx={{
              m: 1,
              mt: 0,
              boxShadow: "none",
            }}
            style={{ backgroundColor: this.props.currentColor }}
            size="medium"
          >
            <div />
          </Fab>
          <TextField
            variant="standard"
            sx={{ width: 100 }}
            label="Color"
            InputProps={{
              readOnly: true,
            }}
            value={this.props.currentColor}
          />
        </Grid>
        <Grid item xs={12} sm>
          <Grid container alignItems="center">
            {colors.map((c) => (
              <Grid key={c[500]} item>
                <StyledColorPickerButton
                  style={{ backgroundColor: c[500] }}
                  value={c[500]}
                  onClick={this.onChangeColor.bind(this, c)}
                  size="small"
                >
                  <div />
                </StyledColorPickerButton>
              </Grid>
            ))}
            <Grid key={color.common.white} item>
              <StyledColorPickerButton
                style={{ backgroundColor: color.common.white }}
                value={color.common.white}
                onClick={this.onChangeWhite.bind(this)}
                size="small"
              >
                <div />
              </StyledColorPickerButton>
            </Grid>
            <Grid key={color.common.black} item>
              <StyledColorPickerButton
                style={{ backgroundColor: color.common.black }}
                value={color.common.black}
                onClick={this.onChangeBlack.bind(this)}
                size="small"
              >
                <div />
              </StyledColorPickerButton>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    );
  }

  onChangeBlack() {
    const black = color.common.black;
    const grey = color.grey;
    this.props.onChangeColor({
      50: grey[50],
      100: grey[100],
      200: grey[200],
      300: grey[300],
      400: grey[400],
      500: grey[500],
      600: grey[600],
      700: grey[700],
      800: grey[800],
      900: grey[900],
      main: black,
    });
  }

  onChangeWhite() {
    const white = color.common.white;
    const grey = color.grey;
    this.props.onChangeColor({
      50: grey[900],
      100: grey[800],
      200: grey[700],
      300: grey[600],
      400: grey[500],
      500: grey[400],
      600: grey[300],
      700: grey[200],
      800: grey[100],
      900: grey[50],
      main: white,
    });
  }

  onChangeColor(color: any) {
    this.props.onChangeColor({
      50: color[50],
      100: color[100],
      200: color[200],
      300: color[300],
      400: color[400],
      500: color[500],
      600: color[600],
      700: color[700],
      800: color[800],
      900: color[900],
      main: color[500],
    });
  }
}

export default ThemeColorPicker;
