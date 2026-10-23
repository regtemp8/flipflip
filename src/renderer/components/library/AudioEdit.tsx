import * as React from "react";
import clsx from "clsx";

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  IconButton,
  TextField,
  Theme,
  Typography,
} from "@mui/material";

import createStyles from "@mui/styles/createStyles";
import withStyles from "@mui/styles/withStyles";

import AudiotrackIcon from "@mui/icons-material/Audiotrack";
import DeleteIcon from "@mui/icons-material/Delete";

import Audio from "../../../common/Audio";
import Config from "../../../common/Config";

const styles = (theme: Theme) =>
  createStyles({
    input: {
      width: "100%",
      maxWidth: 365,
      marginRight: theme.spacing(4),
    },
    inputShort: {
      width: 75,
    },
    inputFull: {
      width: "100%",
      maxWidth: 530,
    },
    pointer: {
      cursor: "pointer",
    },
    trackThumb: {
      height: 140,
      width: 140,
      overflow: "hidden",
      display: "inline-flex",
      justifyContent: "center",
      position: "absolute",
    },
    thumbImage: {
      height: "100%",
    },
    deleteThumbButton: {
      backgroundColor: theme.palette.error.main,
      position: "absolute",
      bottom: "3%",
      right: "6%",
    },
    deleteIcon: {
      color: theme.palette.error.contrastText,
    },
    audioIcon: {
      height: "100%",
      width: "100%",
    },
    actions: {
      marginRight: theme.spacing(3),
    },
  });

interface AudioEditProps {
  classes: any;
  audio: Audio;
  config: Config;
  title: string;
  allowSuggestion?: boolean;
  onCancel: () => void;
  onFinishEdit: (common: Audio) => void;
}

interface AudioEditState {
  audio: Audio;
}

class AudioEdit extends React.Component<AudioEditProps, AudioEditState> {
  constructor(props: AudioEditProps) {
    super(props);

    this.state = {
      audio: props.audio,
    };
  }

  render() {
    const classes = this.props.classes;

    return (
      <Dialog
        open={true}
        onClose={this.props.onCancel}
        aria-describedby="edit-description"
      >
        <DialogContent>
          <Typography variant="h6">{this.props.title}</Typography>
          <TextField
            variant="standard"
            className={classes.input}
            value={this.state.audio.name == null ? "" : this.state.audio.name}
            margin="normal"
            label="Name"
            onChange={(e) => this.onEdit("name", e)}
          />
          <div
            className={clsx(
              classes.trackThumb,
              this.state.audio.thumb == null && classes.pointer,
            )}
            onClick={this.state.audio.thumb == null ? this.loadThumb : this.nop}
          >
            {this.state.audio.thumb != null && (
              <React.Fragment>
                <IconButton
                  onClick={this.onRemoveThumb}
                  className={classes.deleteThumbButton}
                  edge="end"
                  size="small"
                  aria-label="delete"
                >
                  <DeleteIcon className={classes.deleteIcon} color="inherit" />
                </IconButton>
                <img
                  className={classes.thumbImage}
                  src={this.state.audio.thumb}
                />
              </React.Fragment>
            )}
            {this.state.audio.thumb == null && (
              <AudiotrackIcon className={classes.audioIcon} />
            )}
          </div>
          <TextField
            variant="standard"
            className={classes.input}
            value={
              this.state.audio.artist == null ? "" : this.state.audio.artist
            }
            margin="normal"
            label="Artist"
            onChange={(e) => this.onEdit("artist", e)}
          />
          <TextField
            variant="standard"
            className={classes.input}
            value={this.state.audio.album == null ? "" : this.state.audio.album}
            margin="normal"
            label="Album"
            onChange={(e) => this.onEdit("album", e)}
          />
          <TextField
            variant="standard"
            className={classes.inputShort}
            value={
              this.state.audio.trackNum == null ? "" : this.state.audio.trackNum
            }
            margin="normal"
            label="Track #"
            inputProps={{
              min: 0,
              type: "number",
            }}
            onChange={(e) => this.onEditInt("trackNum", e)}
          />
          <TextField
            variant="standard"
            className={classes.inputFull}
            value={
              this.state.audio.comment == null ? "" : this.state.audio.comment
            }
            margin="normal"
            label="Comment"
            multiline
            onChange={(e) => this.onEdit("comment", e)}
          />
        </DialogContent>
        <DialogActions className={classes.actions}>
          {this.props.allowSuggestion && (
            <Button onClick={this.loadSuggestions}>Use Suggestions</Button>
          )}
          <Button onClick={this.props.onCancel} color="secondary">
            Cancel
          </Button>
          <Button
            onClick={() => this.props.onFinishEdit(this.state.audio)}
            color="primary"
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  nop = () => {};

  onEditInt = (
    key: string,
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const input = e.target;
    const newAudio = new Audio(this.state.audio);
    (newAudio as any)[key] = Number.parseInt(input.value);
    this.setState({ audio: newAudio });
  };

  onEdit = (
    key: string,
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const input = e.target;
    const newAudio = new Audio(this.state.audio);
    (newAudio as any)[key] = input.value;
    this.setState({ audio: newAudio });
  };

  onRemoveThumb = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const newAudio = new Audio(this.state.audio);
    newAudio.thumb = null;
    this.setState({ audio: newAudio });
  };

  loadThumb = () => {
    window.ipc.getAudioThumbnail(this.props.config).then((thumb) => {
      if (thumb != null) {
        const newAudio = this.state.audio;
        newAudio.thumb = thumb;
        this.setState({ audio: newAudio });
      }
    });
  };

  loadSuggestions = () => {
    window.ipc
      .getAudioMetadata(this.state.audio, this.props.config)
      .then((audio) => {
        if (audio != null) {
          this.setState({ audio });
        }
      });
  };
}

(AudioEdit as any).displayName = "AudioEdit";
export default withStyles(styles)(AudioEdit);
