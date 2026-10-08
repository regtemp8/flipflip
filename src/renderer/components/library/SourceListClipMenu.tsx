import * as React from "react";

import {
  ListItemSecondaryAction,
  ListItemText,
  Menu,
  MenuItem,
  Switch,
  Theme,
} from "@mui/material";

import createStyles from "@mui/styles/createStyles";
import withStyles from "@mui/styles/withStyles";

import { getTimestamp } from "../../data/utils";
import LibrarySource from "../../../common/LibrarySource";
import Clip from "../../../common/Clip";

const styles = (theme: Theme) =>
  createStyles({
    marginRight: {
      marginRight: theme.spacing(1),
    },
  });

interface SourceListClipMenuProps {
  classes: any;
  mouseX?: any;
  mouseY?: any;
  clipMenu?: LibrarySource;
  onCloseDialog: () => void;
  onToggleClip: (s: LibrarySource, c: Clip) => void;
}

class SourceListClipMenu extends React.Component<SourceListClipMenuProps> {
  constructor(props: SourceListClipMenuProps) {
    super(props);
  }

  render() {
    const open = this.props.clipMenu != null;
    const clips = this.props.clipMenu?.clips ?? [];
    const disabledClips = this.props.clipMenu?.disabledClips ?? [];
    const classes = this.props.classes;
    return (
      <Menu
        id="clip-menu"
        elevation={1}
        anchorReference="anchorPosition"
        anchorPosition={
          this.props.mouseY != null && this.props.mouseX != null
            ? { top: this.props.mouseY, left: this.props.mouseX }
            : undefined
        }
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        keepMounted
        open={open}
        onClose={this.props.onCloseDialog}
      >
        {clips.map((c, index) => (
          <MenuItem key={c.id}>
            <ListItemText
              primary={
                "(" +
                (index + 1) +
                ") " +
                getTimestamp(c.start) +
                " - " +
                getTimestamp(c.end)
              }
              className={classes.marginRight}
            />
            <ListItemSecondaryAction>
              <Switch
                size="small"
                checked={!disabledClips.includes(c.id)}
                onChange={() =>
                  this.props.onToggleClip(this.props.clipMenu!, c)
                }
              />
            </ListItemSecondaryAction>
          </MenuItem>
        ))}
      </Menu>
    );
  }
}

(SourceListClipMenu as any).displayName = "SourceListClipMenu";
export default withStyles(styles)(SourceListClipMenu);
