import * as React from "react";

import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Theme,
} from "@mui/material";
import createStyles from "@mui/styles/createStyles";
import withStyles from "@mui/styles/withStyles";

import { AF } from "../../../common/const";
import LibrarySearch from "../library/LibrarySearch";

const styles = (theme: Theme) =>
  createStyles({
    fullWidth: {
      width: "100%",
    },
    noScroll: {
      overflow: "visible",
    },
  });

interface HydrusDialogProps {
  config: any;
  tags: any;
  classes: any;
  open: boolean;
  onClose: () => void;
  onImportURL: (type: string, shiftKey: boolean, ...args: any[]) => void;
}

type FileSortOrder = "asc" | "desc";

interface HydrusDialogState {
  selectedTags: string[];
  includeCurrentTags: boolean;
  includePendingTags: boolean;
  fileSortType: number;
  fileSortOrder: FileSortOrder;
}

const sortTypes = [
  "File Size",
  "Duration",
  "Import Time",
  "Filetype",
  "Random",
  "Width",
  "Height",
  "Ratio",
  "Number of Pixels",
  "Number of Tags",
  "Number of Views",
  "Total Viewtime",
  "Approximate Bitrate",
  "Has Audio",
  "Modified Time",
  "Framerate",
  "Number of Frames",
  "Last Viewed Time",
  "Archive Timestamp",
  "Hash Hex",
  "Pixel Hash Hex",
  "Blurhash ",
  "Average Colour - Lightness",
  "Average Colour - Chromatic Magnitude",
  "Average Colour - Green/Red Axis ",
  "Average Colour - Blue/Yellow Axis ",
  "Average Colour - Hue",
];

const defaultState: HydrusDialogState = {
  selectedTags: [],
  includeCurrentTags: true,
  includePendingTags: true,
  fileSortType: 2,
  fileSortOrder: "asc",
};
class HydrusDialog extends React.Component<
  HydrusDialogProps,
  HydrusDialogState
> {
  constructor(props: HydrusDialogProps) {
    super(props);
    this.state = defaultState;
  }

  render() {
    const classes = this.props.classes;
    return (
      <Dialog
        classes={{ paper: classes.noScroll }}
        open={this.props.open}
        onClose={this.props.onClose}
        fullWidth={true}
        aria-labelledby="url-import-title"
        aria-describedby="url-import-description"
      >
        <DialogTitle id="url-import-title">
          Create a New Hydrus Source
        </DialogTitle>
        <DialogContent className={classes.noScroll}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12}>
              <DialogContentText id="batch-tag-description">
                Choose or create tags to add to Hydrus URL
              </DialogContentText>
            </Grid>
            <Grid item xs={12}>
              <LibrarySearch
                displaySources={[]}
                filters={this.state.selectedTags}
                tags={this.props.tags}
                placeholder="Add Tags"
                isClearable
                isCreatable
                onlyTags
                showCheckboxes
                hideSelectedOptions={false}
                onUpdateFilters={this.onSelectTags}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    onChange={this.setIncludeCurrentTags}
                    checked={this.state.includeCurrentTags}
                  />
                }
                label="Include Current Tags"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    onChange={this.setIncludePendingTags}
                    checked={this.state.includePendingTags}
                  />
                }
                label="Include Pending Tags"
              />
            </Grid>
            <Grid item xs={8}>
              <FormControl
                variant="standard"
                margin="dense"
                className={classes.fullWidth}
              >
                <InputLabel>Sort Type</InputLabel>
                <Select
                  variant="standard"
                  value={this.state.fileSortType}
                  onChange={this.onFileSortType}
                >
                  {sortTypes.map((type, index) => {
                    return (
                      <MenuItem key={index} value={index}>
                        {type}
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={4}>
              <FormControl
                variant="standard"
                margin="dense"
                className={classes.fullWidth}
              >
                <InputLabel>Sort Order</InputLabel>
                <Select
                  variant="standard"
                  value={this.state.fileSortOrder}
                  onChange={this.onFileSortOrder}
                >
                  <MenuItem key="asc" value="asc">
                    Ascending
                  </MenuItem>
                  <MenuItem key="desc" value="desc">
                    Descending
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={this.onClose} color="secondary">
            Cancel
          </Button>
          <Button
            onClick={this.createAPICall}
            disabled={
              this.state.selectedTags && this.state.selectedTags.length == 0
            }
            color="primary"
          >
            Create Source
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  setIncludeCurrentTags = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ includeCurrentTags: e.target.checked });
  };

  setIncludePendingTags = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ includePendingTags: e.target.checked });
  };

  onFileSortType = (e: SelectChangeEvent<number>) => {
    const input = e.target;
    this.setState({ fileSortType: Number(input.value) });
  };

  onFileSortOrder = (e: SelectChangeEvent<FileSortOrder>) => {
    const input = e.target;
    this.setState({ fileSortOrder: input.value as FileSortOrder });
  };

  onSelectTags = (selectedTags: Array<string>) => {
    selectedTags = selectedTags.map((tag) => {
      if (tag.startsWith("[") && tag.endsWith("]")) {
        tag = tag.substring(1, tag.length - 1);
      }

      return tag;
    });

    this.setState({ selectedTags });
  };

  onClose = () => {
    this.setState(defaultState);
    this.props.onClose();
  };

  createAPICall = (e: React.MouseEvent<HTMLButtonElement>) => {
    const { selectedTags } = this.state;
    const tags = encodeURIComponent(JSON.stringify(selectedTags));
    let url = `${this.makeURL()}?tags=${tags}`;
    url += `&include_current_tags=${this.state.includeCurrentTags}`;
    url += `&include_pending_tags=${this.state.includePendingTags}`;
    url += `&file_sort_type=${this.state.fileSortType}`;
    url += `&file_sort_asc=${this.state.fileSortOrder === "asc"}`;

    this.setState(defaultState);
    this.props.onImportURL(AF.url, e.shiftKey, [url]);
  };

  makeURL() {
    const { hydrusProtocol, hydrusDomain, hydrusPort } =
      this.props.config.remoteSettings;
    return (
      hydrusProtocol +
      "://" +
      hydrusDomain +
      ":" +
      hydrusPort +
      "/get_files/search_files"
    );
  }
}

(HydrusDialog as any).displayName = "HydrusDialog";
export default withStyles(styles)(HydrusDialog);
