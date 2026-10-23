import * as React from "react";

import {
  Grid,
  InputAdornment,
  TextField,
  Theme,
  Tooltip,
  Typography,
} from "@mui/material";

import { DisplaySettings } from "../../../common/Config";
import LibrarySearch from "../library/LibrarySearch";
import LibrarySource from "../../../common/LibrarySource";
import Tag from "../../../common/Tag";
import { withStyles } from "@mui/styles";
import createStyles from "@mui/styles/createStyles";

const styles = (theme: Theme) =>
  createStyles({
    grey: {
      color: theme.palette.text.secondary,
    },
  });

interface PlayerNumCardProps {
  classes: any;
  library: Array<LibrarySource>;
  tags: Array<Tag>;
  settings: DisplaySettings;
  onUpdateSettings: (fn: (settings: DisplaySettings) => void) => void;
}

class PlayerNumCard extends React.Component<PlayerNumCardProps> {
  constructor(props: PlayerNumCardProps) {
    super(props);
  }

  render() {
    const classes = this.props.classes;
    return (
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12}>
          <Tooltip
            disableInteractive
            title="Images under this size (width or height) will be skipped"
          >
            <TextField
              variant="standard"
              label="Min Image Size"
              margin="dense"
              value={this.props.settings.minImageSize}
              onChange={(e) => this.onIntInput("minImageSize", e)}
              onBlur={(e) => this.blurIntKey("minImageSize", e)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">px</InputAdornment>
                ),
              }}
              inputProps={{
                min: 0,
                type: "number",
              }}
            />
          </Tooltip>
        </Grid>
        <Grid item xs={12}>
          <Tooltip
            disableInteractive
            title="Videos under this size (width or height) will be skipped"
          >
            <TextField
              variant="standard"
              label="Min Video Size"
              margin="dense"
              value={this.props.settings.minVideoSize}
              onChange={(e) => this.onIntInput("minVideoSize", e)}
              onBlur={(e) => this.blurIntKey("minVideoSize", e)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">px</InputAdornment>
                ),
              }}
              inputProps={{
                min: 0,
                type: "number",
              }}
            />
          </Tooltip>
        </Grid>
        <Grid item xs={12}>
          <Tooltip
            disableInteractive
            title="The maximum number of images/videos to keep in player history. Reduce this number to reduce memory usage and improve performance."
          >
            <TextField
              variant="standard"
              label="Max in History"
              margin="dense"
              value={this.props.settings.maxInHistory}
              onChange={(e) => this.onIntInput("maxInHistory", e)}
              onBlur={(e) => this.blurIntKey("maxInHistory", e)}
              inputProps={{
                min: 0,
                type: "number",
              }}
            />
          </Tooltip>
        </Grid>
        <Grid item xs={12}>
          <Tooltip
            disableInteractive
            title="The maximum number of images/videos to queue up for rendering. Reduce this number to reduce memory usage and improve performance."
          >
            <TextField
              variant="standard"
              label="Max in Memory"
              margin="dense"
              value={this.props.settings.maxInMemory}
              onChange={(e) => this.onIntInput("maxInMemory", e)}
              onBlur={(e) => this.blurIntKey("maxInMemory", e)}
              inputProps={{
                min: 0,
                type: "number",
              }}
            />
          </Tooltip>
        </Grid>
        <Grid item xs={12}>
          <Tooltip
            disableInteractive
            title="The maximum number of simultaneous images/videos loading. Increase this number to load sources faster. Reduce this number to improve display performance."
          >
            <TextField
              variant="standard"
              label="Max Loading at Once"
              margin="dense"
              value={this.props.settings.maxLoadingAtOnce}
              onChange={(e) => this.onIntInput("maxLoadingAtOnce", e)}
              onBlur={(e) => this.blurIntKey("maxLoadingAtOnce", e)}
              inputProps={{
                min: 0,
                type: "number",
              }}
            />
          </Tooltip>
        </Grid>
        <Grid item xs={12}>
          <Tooltip
            disableInteractive
            placement="top"
            title="The following tags/types will be ignored when using a Scene Generator. This setting overrides any generator rules."
          >
            <div>
              <Typography variant="caption" className={classes.grey}>
                Ignored Tags/Types
              </Typography>
              <LibrarySearch
                displaySources={this.props.library}
                filters={this.props.settings.ignoredTags}
                tags={this.props.tags}
                placeholder="Ignore These Tags"
                isClearable
                onlyTagsAndTypes
                showCheckboxes
                withBrackets
                hideSelectedOptions={false}
                onUpdateFilters={this.onSelectTags}
              />
            </div>
          </Tooltip>
        </Grid>
      </Grid>
    );
  }

  onSelectTags = (selectedTags: Array<string>) => {
    this.changeKey("ignoredTags", selectedTags);
  };

  blurIntKey = (
    key: string,
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { min, max } = e.currentTarget as HTMLInputElement;
    if (min && (this.props.settings as any)[key] < Number(min)) {
      this.changeIntKey(key, min);
    } else if (max && (this.props.settings as any)[key] > Number(max)) {
      this.changeIntKey(key, max);
    }
  };

  onIntInput = (
    key: string,
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const input = e.target;
    this.changeKey(key, input.value === "" ? "" : Number(input.value));
  };

  changeIntKey(key: string, intString: string) {
    this.changeKey(key, intString === "" ? "" : Number(intString));
  }

  changeKey(key: string, value: any) {
    this.update((s) => (s[key] = value));
  }

  update(fn: (settings: any) => void) {
    this.props.onUpdateSettings(fn);
  }
}

(PlayerNumCard as any).displayName = "PlayerNumCard";
export default withStyles(styles)(PlayerNumCard);
