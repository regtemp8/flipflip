import * as React from "react";
import {remote} from "electron";
import {readFileSync} from "fs";
import clsx from "clsx";
import * as mm from "music-metadata";

import {
  Button,
  createStyles, Dialog,
  DialogActions,
  DialogContent,
  IconButton,
  TextField,
  Theme,
  Typography,
  withStyles
} from "@material-ui/core";

import AudiotrackIcon from "@material-ui/icons/Audiotrack";
import DeleteIcon from "@material-ui/icons/Delete";

import {generateThumbnailFile, isImage} from "../../data/utils";
import Audio from "../../data/Audio";

const styles = (theme: Theme) => createStyles({
  input: {
    width: '100%',
    maxWidth: 365,
    marginRight: theme.spacing(4),
  },
  inputShort: {
    width: 75,
  },
  inputFull: {
    width: '100%',
    maxWidth: 530,
  },
  pointer: {
    cursor: 'pointer',
  },
  trackThumb: {
    height: 140,
    width: 140,
    overflow: 'hidden',
    display: 'inline-flex',
    justifyContent: 'center',
    position: 'absolute',
  },
  thumbImage: {
    height: '100%',
  },
  deleteThumbButton: {
    backgroundColor: theme.palette.error.main,
    position: 'absolute',
    bottom: '3%',
    right: '6%',
  },
  deleteIcon: {
    color: theme.palette.error.contrastText,
  },
  audioIcon: {
    height: '100%',
    width: '100%',
  },
  actions: {
    marginRight: theme.spacing(3),
  },
});

class AudioEdit extends React.Component {
  readonly props: {
    classes: any,
    audio: Audio,
    cachePath: string,
    title: string,
    allowSuggestion?: boolean,
    onCancel(): void,
    onFinishEdit(common: Audio): void,
  };

  readonly state = {
    audio: this.props.audio,
  }

  render() {
    const classes = this.props.classes;

    return(
      <Dialog
        open={true}
        onClose={this.props.onCancel.bind(this)}
        aria-describedby="edit-description">
        <DialogContent>
          <Typography variant="h6">{this.props.title}</Typography>
          <TextField
            className={classes.input}
            value={this.state.audio.name}
            margin="normal"
            label="Name"
            onChange={this.onEdit.bind(this, 'name')}/>
          <div className={clsx(classes.trackThumb, this.state.audio.thumb == null && classes.pointer)} onClick={this.state.audio.thumb == null ? this.loadThumb.bind(this) : this.nop}>
            {this.state.audio.thumb != null && (
              <React.Fragment>
                <IconButton
                  onClick={this.onRemoveThumb.bind(this)}
                  className={classes.deleteThumbButton}
                  edge="end"
                  size="small"
                  aria-label="delete">
                  <DeleteIcon className={classes.deleteIcon} color="inherit"/>
                </IconButton>
                <img className={classes.thumbImage} src={this.state.audio.thumb}/>
              </React.Fragment>
            )}
            {this.state.audio.thumb == null && (
              <AudiotrackIcon className={classes.audioIcon} />
            )}
          </div>
          <TextField
            className={classes.input}
            value={this.state.audio.artist}
            margin="normal"
            label="Artist"
            onChange={this.onEdit.bind(this, 'artist')}/>
          <TextField
            className={classes.input}
            value={this.state.audio.album}
            margin="normal"
            label="Album"
            onChange={this.onEdit.bind(this, 'album')}/>
          <TextField
            className={classes.inputFull}
            value={this.state.audio.comment}
            margin="normal"
            label="Comment"
            multiline
            onChange={this.onEdit.bind(this, 'comment')}/>
        </DialogContent>
        <DialogActions className={classes.actions}>
          {this.props.allowSuggestion && (
            <Button onClick={this.loadSuggestions.bind(this)} color="default">
              Use Suggestions
            </Button>
          )}
          <Button onClick={this.props.onCancel.bind(this)} color="secondary">
            Cancel
          </Button>
          <Button onClick={this.props.onFinishEdit.bind(this, this.state.audio)} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  nop() {}

  onEdit(key: string, e: MouseEvent) {
    const input = (e.target as HTMLInputElement);
    const newAudio = new Audio(this.state.audio);
    (newAudio as any)[key] = input.value;
    this.setState({audio: newAudio});
  }

  onRemoveThumb(e: MouseEvent) {
    e.preventDefault();
    const newAudio = new Audio(this.state.audio);
    newAudio.thumb = null;
    this.setState({audio: newAudio});
  }

  loadThumb() {
    let iResult = remote.dialog.showOpenDialog(remote.getCurrentWindow(),
      {filters: [{name:'All Files (*.*)', extensions: ['*']}, {name: 'Image files', extensions: ["gif", "png", "jpeg", "jpg", "webp", "tiff", "svg"]}], properties: ['openFile']});
    if (!iResult) return;
    iResult = iResult.filter((i) => isImage(i, true));
    if (iResult.length > 0) {
      const newAudio = this.state.audio;
      newAudio.thumb = generateThumbnailFile(this.props.cachePath, readFileSync(iResult[0]));
      this.setState({audio: newAudio});
    }
  }

  loadSuggestions() {
    const url = this.state.audio.url;
    mm.parseFile(url)
      .then((metadata: any) => {
        if (metadata) {
          const newAudio = new Audio(this.state.audio);
          if (metadata.common) {
            newAudio.name = metadata.common.title;
            newAudio.album = metadata.common.album;
            newAudio.artist = metadata.common.artist;
            if (metadata.common.picture && metadata.common.picture.length > 0) {
              newAudio.thumb = generateThumbnailFile(this.props.cachePath, metadata.common.picture[0].data);
            }
          }
          if (metadata.format) {
            newAudio.duration = metadata.format.duration;
          }
          this.setState({audio: newAudio});
        }
      })
      .catch((err: any) => {
        console.error("Error reading metadata:", err.message);
      });
  }
}

export default withStyles(styles)(AudioEdit as any);