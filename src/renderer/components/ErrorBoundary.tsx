import * as React from "react";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import RestoreIcon from "@mui/icons-material/Restore";

import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  FormControl,
  InputLabel,
  Link,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography,
} from "@mui/material";

import { convertFromEpoch } from "../data/utils";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  version: string;
  goBack: () => void;
  onRestore: (backupFile: string) => void;
}

interface ErrorBoundaryState {
  catch?: {
    error: Error;
    info: React.ErrorInfo;
  };
  resetCheck: boolean;
  backupCheck: boolean;
  backup?: { url: string; size: number };
  backups: Array<{ url: string; size: number }>;
}

export default class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);

    this.state = {
      resetCheck: false,
      backupCheck: false,
      backups: new Array<{ url: string; size: number }>(),
    };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Display fallback UI
    this.setState({ catch: { error, info } });
  }

  render() {
    if (this.state.catch) {
      return (
        <Box
          style={{
            overflow: "auto",
            padding: 8,
            position: "absolute",
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
          }}
          className="Error"
        >
          <Typography component="h2" variant="h2">
            Mistakes were made ಥ﹏ಥ
          </Typography>
          <Divider />
          <Typography
            style={{ margin: 10 }}
            component="h5"
            variant="h5"
            color="error"
          >
            {this.state.catch.error.name}: {this.state.catch.error.message}
          </Typography>
          <Typography
            style={{ whiteSpace: "pre", marginBottom: 20 }}
            component="div"
            variant="body2"
            color="error"
          >
            {this.state.catch.info.componentStack
              .trim()
              .replace(/\s*in (ForwardRef|div)/g, "")}
          </Typography>
          <Typography component="h6" variant="h6">
            Please consider reporting this bug to our{" "}
            <Link href="#" onClick={this.onSubmitIssue} underline="hover">
              GitHub
            </Link>
          </Typography>
          <Button
            style={{ margin: 10 }}
            variant="contained"
            size="large"
            color="primary"
            onClick={this.goBack}
            startIcon={<ArrowBackIcon />}
          >
            Go Back
          </Button>
          <Button
            style={{ margin: 10 }}
            variant="contained"
            size="large"
            color="secondary"
            onClick={this.backupCheck}
            startIcon={<RestoreIcon />}
          >
            Restore Backup
          </Button>
          <Button
            style={{ margin: 10 }}
            variant="contained"
            size="large"
            onClick={this.resetCheck}
            startIcon={<HighlightOffIcon />}
          >
            Reset
          </Button>

          {this.state.resetCheck && (
            <Dialog open={this.state.resetCheck} onClose={this.onCloseDialog}>
              <DialogTitle>Confirm FlipFlip Reset</DialogTitle>
              <DialogContent>
                <DialogContentText>
                  Are you sure you want to{" "}
                  <u>
                    <b>completely reset FlipFlip</b>
                  </u>
                  ? This will delete your current data (backups/cache will{" "}
                  <b>not</b> be effected).
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button onClick={this.onCloseDialog} color="secondary">
                  Cancel
                </Button>
                <Button onClick={this.reset} color="primary">
                  Reset FlipFlip
                </Button>
              </DialogActions>
            </Dialog>
          )}

          {this.state.backupCheck && (
            <Dialog
              open={this.state.backupCheck}
              onClose={this.onCloseDialog}
              aria-labelledby="restore-title"
              aria-describedby="restore-description"
            >
              <DialogTitle id="restore-title">Restore Backup</DialogTitle>
              {this.state.backups.length > 0 && (
                <React.Fragment>
                  <DialogContent>
                    <DialogContentText id="restore-description">
                      Choose a backup to restore from:
                    </DialogContentText>
                    {this.state.backup && (
                      <FormControl variant="standard">
                        <InputLabel>Backups</InputLabel>
                        <Select
                          variant="standard"
                          value={this.state.backup.url}
                          MenuProps={{
                            PaperProps: {
                              style: {
                                maxHeight: 300,
                              },
                            },
                          }}
                          onChange={this.onChangeBackup}
                        >
                          {this.state.backups.map((b) => (
                            <MenuItem value={b.url} key={b.url}>
                              {convertFromEpoch(b.url)} (
                              {Math.round(b.size / 1000)} KB)
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )}
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={this.onCloseDialog} color="secondary">
                      Cancel
                    </Button>
                    <Button onClick={this.onFinishRestore} color="primary">
                      Restore
                    </Button>
                  </DialogActions>
                </React.Fragment>
              )}
              {this.state.backups.length == 0 && (
                <React.Fragment>
                  <DialogContent>
                    <DialogContentText id="restore-description">
                      You don't have any backups available
                    </DialogContentText>
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={this.onCloseDialog} color="secondary">
                      Cancel
                    </Button>
                  </DialogActions>
                </React.Fragment>
              )}
            </Dialog>
          )}
        </Box>
      );
    } else {
      return this.props.children;
    }
  }

  clearError() {
    this.setState({
      catch: undefined,
      resetCheck: false,
      backupCheck: false,
      backup: undefined,
      backups: new Array<{ url: string; size: number }>(),
    });
  }

  goBack = () => {
    this.clearError();
    this.props.goBack();
  };

  reset = () => {
    window.ipc.reset();
  };

  resetCheck = () => {
    this.setState({ resetCheck: true });
  };

  onCloseDialog = () => {
    this.setState({ resetCheck: false, backupCheck: false });
  };

  backupCheck = () => {
    window.ipc.getBackups().then((backups) => {
      if (backups.length == 0) {
        this.setState({
          backupCheck: true,
          backups: backups,
          backup: undefined,
        });
      } else {
        this.setState({
          backupCheck: true,
          backups: backups,
          backup: backups[0],
        });
      }
    });
  };

  onChangeBackup = (e: SelectChangeEvent<string>) => {
    const input = e.target;
    this.setState({
      backup: this.state.backups.find((b) => b.url == input.value),
    });
  };

  onFinishRestore = () => {
    if (!this.state.backup) {
      return;
    }

    this.onCloseDialog();
    window.ipc.getBackupFile(this.state.backup.url).then((backupFile) => {
      try {
        this.props.onRestore(backupFile);
        this.clearError();
      } catch (err) {
        console.error(err);
      }
    });
  };

  onSubmitIssue = () => {
    if (!this.state.catch) {
      return;
    }

    const { error, info } = this.state.catch;
    const componentStack = info.componentStack
      .trim()
      .replace(/\s*in (ForwardRef|div)/g, "");
    let title = error.name + ": " + error.message;
    let body =
      "[[Please describe the bug and how to reproduce it]]%0D%0A%0D%0A%0D%0AFlipFlip Version: " +
      this.props.version +
      "%0D%0A```%0D%0A" +
      error.name +
      ": " +
      error.message +
      "%0D%0A" +
      componentStack.replace(/(\r\n|\r|\n)/g, "%0D%0A") +
      "%0D%0A```";
    const errorComponent = /^\s*in (\w*)/.exec(componentStack);
    if (errorComponent != null) {
      title = errorComponent[1] + " - " + title;
    }

    window.ipc.openExternal(
      "https://github.com/regtemp8/flipflip/issues/new?title=" +
        title +
        "&body=" +
        body,
    );
  };
}

(ErrorBoundary as any).displayName = "ErrorBoundary";
