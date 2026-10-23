import * as React from "react";
import clsx from "clsx";

import {
  Alert,
  AlertColor,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  FormControlLabel,
  Grid,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Slide,
  Snackbar,
  Switch,
  TextField,
  Theme,
  Tooltip,
} from "@mui/material";

import createStyles from "@mui/styles/createStyles";
import withStyles from "@mui/styles/withStyles";

import DeleteIcon from "@mui/icons-material/Delete";
import RestoreIcon from "@mui/icons-material/Restore";
import SaveIcon from "@mui/icons-material/Save";

import { convertFromEpoch } from "../../data/utils";
import { MO, SS } from "../../../common/const";
import { GeneralSettings } from "../../../common/Config";

const styles = (theme: Theme) =>
  createStyles({
    buttonGrid: {
      textAlign: "center",
    },
    chipGrid: {
      paddingTop: theme.spacing(1),
    },
    hideXS: {
      [theme.breakpoints.down("sm")]: {
        display: "none",
      },
    },
    showXS: {
      [theme.breakpoints.up("sm")]: {
        display: "none",
      },
    },
    snackbarIcon: {
      fontSize: 20,
      opacity: 0.9,
      marginRight: theme.spacing(1),
    },
    snackbarMessage: {
      display: "flex",
      alignItems: "center",
    },
    backupDays: {
      width: theme.spacing(16),
    },
  });

function TransitionUp(props: any) {
  return <Slide {...props} direction="up" />;
}

interface BackupCardProps {
  classes: any;
  settings: GeneralSettings;
  onBackup: () => void;
  onClean: () => void;
  onRestore: (backupFile: string) => void;
  onUpdateSettings: (fn: (settings: GeneralSettings) => void) => void;
}

interface BackupCardState {
  backups: Array<{ url: string; size: number }>;
  backup?: { url: string; size: number };
  openMenu?: string;
  snackbarOpen: boolean;
  snackbar?: string;
  snackbarSeverity?: string;
}

class BackupCard extends React.Component<BackupCardProps, BackupCardState> {
  constructor(props: BackupCardProps) {
    super(props);

    this.state = {
      backups: new Array<{ url: string; size: number }>(),
      snackbarOpen: false,
    };
  }

  render() {
    const classes = this.props.classes;
    const hasBackup = this.state.backups.length > 0;
    return (
      <React.Fragment>
        <Grid
          container
          spacing={2}
          alignItems="center"
          justifyContent="center"
          className={classes.chipGrid}
        >
          <Grid item xs="auto" className={classes.buttonGrid}>
            <FormControlLabel
              control={
                <Switch
                  checked={this.props.settings.autoBackup}
                  onChange={(e) => this.onBoolInput("autoBackup", e)}
                />
              }
              label="Auto Backup"
            />
          </Grid>
          <Grid item xs="auto" className={classes.buttonGrid}>
            <TextField
              className={classes.backupDays}
              disabled={!this.props.settings.autoBackup}
              variant="outlined"
              label="Every"
              margin="dense"
              value={this.props.settings.autoBackupDays}
              onChange={(e) => this.onIntInput("autoBackupDays", e)}
              onBlur={(e) => this.blurIntKey("autoBackupDays", e)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">Days</InputAdornment>
                ),
              }}
              inputProps={{
                min: 1,
                type: "number",
              }}
            />
          </Grid>
        </Grid>
        <Grid
          container
          spacing={2}
          alignItems="center"
          justifyContent="center"
          className={classes.chipGrid}
        >
          <Tooltip
            disableInteractive
            title="If enabled, backups will be automatically cleaned up. This algorithm will keep 1 backup for
           each of the configured periods."
          >
            <Grid item xs="auto" className={classes.buttonGrid}>
              <FormControlLabel
                control={
                  <Switch
                    checked={this.props.settings.autoCleanBackup}
                    onChange={(e) => this.onBoolInput("autoCleanBackup", e)}
                  />
                }
                label="Auto Clean"
              />
            </Grid>
          </Tooltip>
          <Grid item xs="auto" className={classes.buttonGrid}>
            <TextField
              className={classes.backupDays}
              disabled={!this.props.settings.autoCleanBackup}
              variant="outlined"
              label="Keep Last"
              margin="dense"
              value={this.props.settings.autoCleanBackupDays}
              onChange={(e) => this.onIntInput("autoCleanBackupDays", e)}
              onBlur={(e) => this.blurIntKey("autoCleanBackupDays", e)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">Days</InputAdornment>
                ),
              }}
              inputProps={{
                min: 1,
                type: "number",
              }}
            />
          </Grid>
          <Grid item xs="auto" className={classes.buttonGrid}>
            <TextField
              className={classes.backupDays}
              disabled={!this.props.settings.autoCleanBackup}
              variant="outlined"
              label="Keep Last"
              margin="dense"
              value={this.props.settings.autoCleanBackupWeeks}
              onChange={(e) => this.onIntInput("autoCleanBackupWeeks", e)}
              onBlur={(e) => this.blurIntKey("autoCleanBackupWeeks", e)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">Weeks</InputAdornment>
                ),
              }}
              inputProps={{
                min: 1,
                type: "number",
              }}
            />
          </Grid>
          <Grid item xs="auto" className={classes.buttonGrid}>
            <TextField
              className={classes.backupDays}
              disabled={!this.props.settings.autoCleanBackup}
              variant="outlined"
              label="Keep Last"
              margin="dense"
              value={this.props.settings.autoCleanBackupMonths}
              onChange={(e) => this.onIntInput("autoCleanBackupMonths", e)}
              onBlur={(e) => this.blurIntKey("autoCleanBackupMonths", e)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">Months</InputAdornment>
                ),
              }}
              inputProps={{
                min: 1,
                type: "number",
              }}
            />
          </Grid>
        </Grid>
        <Grid container spacing={2} alignItems="center" justifyContent="center">
          <Grid item xs="auto" className={classes.buttonGrid}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={this.onBackup}
              startIcon={<SaveIcon />}
            >
              Backup Data
            </Button>
          </Grid>
          <Grid item xs="auto" className={classes.buttonGrid}>
            <Button
              variant="contained"
              color="secondary"
              size="large"
              disabled={!hasBackup}
              onClick={this.onRestore}
              startIcon={<RestoreIcon />}
            >
              Restore Backup
            </Button>
          </Grid>
          <Grid item xs="auto" className={classes.buttonGrid}>
            <Button
              variant="contained"
              color="inherit"
              size="large"
              disabled={this.state.backups.length <= 1}
              onClick={this.onClean}
              startIcon={<DeleteIcon />}
            >
              Clean Backups
            </Button>
          </Grid>
        </Grid>
        <Grid
          container
          spacing={2}
          alignItems="center"
          justifyContent="center"
          className={classes.chipGrid}
        >
          <Grid item xs="auto" className={classes.buttonGrid}>
            <Chip
              label={`Backups: ${hasBackup ? this.state.backups.length : "--"}`}
              color="primary"
              variant="outlined"
            />
          </Grid>
          <Grid
            item
            xs="auto"
            className={clsx(classes.buttonGrid, classes.hideXS)}
          >
            <Chip
              label={`Latest: ${hasBackup ? convertFromEpoch(this.state.backups[0].url) + " (" + Math.round(this.state.backups[0].size / 1000) + " KB)" : "--"}`}
              color="secondary"
              variant="outlined"
            />
          </Grid>
          <Grid
            item
            xs="auto"
            className={clsx(classes.buttonGrid, classes.showXS)}
          >
            <Chip
              label={`Latest: ${hasBackup ? convertFromEpoch(this.state.backups[0].url) : "--"}`}
              color="secondary"
              variant="outlined"
            />
          </Grid>
        </Grid>
        <Dialog
          open={this.state.openMenu == MO.deleteAlert}
          onClose={this.onCloseDialog}
          aria-labelledby="remove-all-title"
          aria-describedby="remove-all-description"
        >
          <DialogTitle id="remove-all-title">Clean backups</DialogTitle>
          <DialogContent>
            {this.props.settings.autoCleanBackup && (
              <DialogContentText id="remove-all-description">
                You are about to clean your backups. Backups will be retained
                according to your Auto Clean configuration. A record will be
                kept for each of the last:{" "}
                {this.props.settings.autoCleanBackupDays} Days,{" "}
                {this.props.settings.autoCleanBackupWeeks} Weeks,{" "}
                {this.props.settings.autoCleanBackupMonths} Months.
              </DialogContentText>
            )}
            {!this.props.settings.autoCleanBackup && (
              <React.Fragment>
                <DialogContentText id="remove-all-description">
                  You are about to clean your backups. How many of the most
                  recent backups would you like to retain?
                </DialogContentText>
                {this.props.settings.cleanRetain != null && (
                  <TextField
                    variant="outlined"
                    label="Keep Last"
                    margin="dense"
                    value={this.props.settings.cleanRetain}
                    onChange={(e) => this.onIntInput("cleanRetain", e)}
                    onBlur={(e) => this.blurIntKey("cleanRetain", e)}
                    inputProps={{
                      min: 1,
                      type: "number",
                    }}
                  />
                )}
              </React.Fragment>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={this.onCloseDialog} color="secondary">
              Cancel
            </Button>
            <Button onClick={this.onFinishClean} color="primary">
              Continue
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog
          open={this.state.openMenu == MO.restore}
          onClose={this.onCloseDialog}
          aria-labelledby="restore-title"
          aria-describedby="restore-description"
        >
          <DialogTitle id="restore-title">Restore Backup</DialogTitle>
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
                      {convertFromEpoch(b.url)} ({Math.round(b.size / 1000)} KB)
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
        </Dialog>
        <Snackbar
          open={this.state.snackbarOpen}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          autoHideDuration={5000}
          onClose={this.onCloseDialog}
          TransitionComponent={TransitionUp}
        >
          <Alert
            onClose={this.onCloseDialog}
            severity={this.state.snackbarSeverity as AlertColor}
          >
            {this.state.snackbar}
          </Alert>
        </Snackbar>
      </React.Fragment>
    );
  }

  componentDidMount() {
    this.refreshBackups();
  }

  refreshBackups() {
    window.ipc.getBackups().then((backups) => {
      this.setState({ backups });
    });
  }

  onChangeBackup = (e: SelectChangeEvent<string>) => {
    const input = e.target;
    this.setState({
      backup: this.state.backups.find((b) => b.url == input.value),
    });
  };

  onBackup = () => {
    try {
      this.props.onBackup();
      this.setState({
        snackbarOpen: true,
        snackbar: "Backup success!",
        snackbarSeverity: SS.success,
      });
    } catch (err) {
      console.error(err);
      this.setState({
        snackbarOpen: true,
        snackbar: "Error: " + err,
        snackbarSeverity: SS.error,
      });
    }
    this.refreshBackups();
  };

  onClean = () => {
    this.setState({ backup: this.state.backups[0], openMenu: MO.deleteAlert });
  };

  onFinishClean = () => {
    this.onCloseDialog();
    try {
      this.props.onClean();
      this.setState({
        snackbarOpen: true,
        snackbar: "Clean success!",
        snackbarSeverity: SS.success,
      });
    } catch (err) {
      console.error(err);
      this.setState({
        snackbarOpen: true,
        snackbar: "Error: " + err,
        snackbarSeverity: SS.error,
      });
    }
    this.refreshBackups();
  };

  onRestore = () => {
    this.setState({ backup: this.state.backups[0], openMenu: MO.restore });
  };

  onFinishRestore = () => {
    this.onCloseDialog();
    if (this.state.backup?.url == null) {
      this.setState({
        snackbarOpen: true,
        snackbar: "Error: backup is undefined",
        snackbarSeverity: SS.error,
      });
      return;
    }

    window.ipc.getBackupFile(this.state.backup.url).then((backupFile) => {
      try {
        this.props.onRestore(backupFile);
        this.setState({
          snackbarOpen: true,
          snackbar: "Restore success!",
          snackbarSeverity: SS.success,
        });
      } catch (err) {
        console.error(err);
        this.setState({
          snackbarOpen: true,
          snackbar: "Error: " + err,
          snackbarSeverity: SS.error,
        });
      }
    });
  };

  onCloseDialog = () => {
    this.setState({ openMenu: undefined, snackbarOpen: false });
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

  onBoolInput = (key: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const checked = input.checked;
    this.changeKey(key, checked);
  };

  changeKey(key: string, value: any) {
    this.update((s) => (s[key] = value));
  }

  update(fn: (scene: any) => void) {
    this.props.onUpdateSettings(fn);
  }
}

(BackupCard as any).displayName = "BackupCard";
export default withStyles(styles)(BackupCard);
