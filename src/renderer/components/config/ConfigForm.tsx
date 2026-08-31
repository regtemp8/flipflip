import * as React from "react";

import {
  Alert,
  AppBar,
  Box,
  Button,
  Collapse,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Drawer,
  IconButton,
  ListItem,
  ListItemIcon,
  ListItemText,
  Slide,
  Snackbar,
  Tab,
  Tabs,
  Theme as MuiTheme,
  Toolbar,
  Tooltip,
  Typography,
  ListItemButton,
} from "@mui/material";
import { styled } from "@mui/material/styles";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import BuildIcon from "@mui/icons-material/Build";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import LiveHelpIcon from "@mui/icons-material/LiveHelp";
import MenuIcon from "@mui/icons-material/Menu";
import PhotoFilterIcon from "@mui/icons-material/PhotoFilter";
import RestoreIcon from "@mui/icons-material/Restore";
import SettingsIcon from "@mui/icons-material/Settings";

import { MO } from "../../../common/const";
import { Theme } from "../../../common/theme";
import Config, {
  CacheSettings,
  DisplaySettings,
  GeneralSettings,
  RemoteSettings,
  SceneSettings,
} from "../../../common/Config";
import LibrarySource from "../../../common/LibrarySource";
import Scene from "../../../common/Scene";
import SceneGrid from "../../../common/SceneGrid";
import Tag from "../../../common/Tag";
import GeneralConfig from "./GeneralConfig";
import SceneOptions from "../sceneDetail/SceneOptions";
import SceneEffects from "../sceneDetail/SceneEffects";

const drawerWidth = 240;

const Root = styled("div")(() => ({
  display: "flex",
}));

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  zIndex: theme.zIndex.drawer + 1,
}));

const appBarSpacerWrapperSx = {
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  padding: "0 8px",
  minHeight: 64,
};

const AppBarSpacer = styled("div")(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  padding: "0 8px",
  minHeight: 64,
}));

const StyledDrawer = styled(Drawer)({
  position: "absolute",
});

const DrawerSpacer = styled("div")(({ theme }) => ({
  minWidth: theme.spacing(7),
  [theme.breakpoints.up("sm")]: {
    minWidth: theme.spacing(9),
  },
}));

const getDrawerPaperSx = (theme: MuiTheme) => ({
  position: "relative",
  whiteSpace: "nowrap",
  overflowX: "hidden",
  height: "100vh",
  width: drawerWidth,
  zIndex: theme.zIndex.drawer + 2,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
});

const getDrawerPaperCloseSx = (theme: MuiTheme) => {
  const base = getDrawerPaperSx(theme);
  return {
    ...base,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    zIndex: theme.zIndex.drawer,
    width: theme.spacing(7),
    [theme.breakpoints.up("sm")]: {
      width: theme.spacing(9),
    },
  };
};

const DrawerButton = styled(ListItem)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  minHeight: theme.spacing(6),
  [theme.breakpoints.down("sm")]: {
    paddingLeft: 0,
    paddingRight: 0,
  },
}));

const DrawerIcon = styled("span")(({ theme }) => ({
  color: theme.palette.primary.contrastText,
}));

const StyledTabs = styled(Tabs)(({ theme }) => ({
  borderRight: `1px solid ${theme.palette.divider}`,
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  width: drawerWidth,
  height: theme.spacing(12),
  transition: theme.transitions.create(
    ["width", "margin", "background", "opacity"],
    {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    },
  ),
  "&:hover": {
    backgroundColor: "rgba(0, 0, 0, 0.08)",
    opacity: 1,
    transition: theme.transitions.create(["background", "opacity"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
}));

const getTabCloseSx = (theme: MuiTheme) => ({
  minWidth: 0,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  width: theme.spacing(7),
  [theme.breakpoints.up("sm")]: {
    width: theme.spacing(9),
  },
});

const TabPanelDiv = styled("div")(() => ({
  display: "flex",
  height: "100%",
}));

const DeleteItem = styled(ListItemButton)(({ theme }) => ({
  color: theme.palette.error.main,
}));

const Content = styled("main")(({ theme }) => ({
  display: "flex",
  flexGrow: 1,
  flexDirection: "column",
  height: "100vh",
  backgroundColor: theme.palette.background.default,
}));

const ContentContainer = styled(Container)(({ theme }) => ({
  height: "100%",
  padding: theme.spacing(0),
  overflowY: "auto",
}));

const Fill = styled("div")(() => ({
  flexGrow: 1,
}));

function TransitionUp(props: any) {
  return <Slide {...props} direction="up" />;
}

interface ConfigFormProps {
  config: Config;
  library: Array<LibrarySource>;
  scenes: Array<Scene>;
  sceneGrids: Array<SceneGrid>;
  tags: Array<Tag>;
  theme: Theme;
  goBack(): void;
  onBackup(): void;
  onChangeThemeColor(colorTheme: any, primary: boolean): void;
  onClean(): void;
  onDefault(): void;
  onResetTutorials(): void;
  onRestore(backupFile: string): void;
  onToggleDarkMode(): void;
  onUpdateConfig(config: Config): void;
}

interface ConfigFormState {
  changeMade: boolean;
  config: Config;
  drawerOpen: boolean;
  openMenu: string;
  openTab: number;
  errorSnackOpen: boolean;
  errorSnack: string;
}

class ConfigForm extends React.Component<ConfigFormProps, ConfigFormState> {
  constructor(props: ConfigFormProps) {
    super(props);

    this.state = {
      changeMade: false,
      config: JSON.parse(JSON.stringify(props.config)), // Make a copy
      drawerOpen: false,
      openMenu: null as string,
      openTab: 2,
      errorSnackOpen: false,
      errorSnack: null as string,
    };
  }

  render() {
    const open = this.state.drawerOpen;

    return (
      <Root>
        <StyledAppBar enableColorOnDark position="absolute">
          <Toolbar>
            <Tooltip disableInteractive title="Back" placement="right-end">
              <IconButton
                edge="start"
                color="inherit"
                aria-label="Back"
                onClick={this.goBack.bind(this)}
                size="large"
              >
                <ArrowBackIcon />
              </IconButton>
            </Tooltip>

            <Fill />
            <Typography
              component="h1"
              variant="h4"
              color="inherit"
              noWrap
              sx={{ textAlign: "center" }}
            >
              Settings
            </Typography>
            <Fill />

            <Tooltip disableInteractive title="Confirm Settings">
              <IconButton
                edge="start"
                color="inherit"
                aria-label="Confirm"
                onClick={this.onConfirmConfig.bind(this)}
                size="large"
              >
                <CheckCircleIcon fontSize="large" />
              </IconButton>
            </Tooltip>
          </Toolbar>
        </StyledAppBar>

        <StyledDrawer
          variant="permanent"
          PaperProps={{ sx: open ? getDrawerPaperSx : getDrawerPaperCloseSx }}
          open={this.state.drawerOpen}
        >
          <Box sx={!open ? appBarSpacerWrapperSx : undefined}>
            <Collapse in={!open}>
              <AppBarSpacer />
            </Collapse>
          </Box>

          <DrawerButton>
            <IconButton onClick={this.onToggleDrawer.bind(this)} size="large">
              <DrawerIcon>
                <MenuIcon />
              </DrawerIcon>
            </IconButton>
          </DrawerButton>

          <Divider />

          <div>
            <StyledTabs
              orientation="vertical"
              value={this.state.openTab}
              onChange={this.onChangeTab.bind(this)}
              aria-label="scene detail tabs"
            >
              <StyledTab
                id="vertical-tab-0"
                aria-controls="vertical-tabpanel-0"
                icon={<BuildIcon />}
                label={open ? "Default Options" : ""}
                sx={!open ? getTabCloseSx : undefined}
              />
              <StyledTab
                id="vertical-tab-1"
                aria-controls="vertical-tabpanel-1"
                icon={<PhotoFilterIcon />}
                label={open ? "Default Effects" : ""}
                sx={!open ? getTabCloseSx : undefined}
              />
              <StyledTab
                id="vertical-tab-2"
                aria-controls="vertical-tabpanel-2"
                icon={<SettingsIcon />}
                label={open ? "General Settings" : ""}
                sx={!open ? getTabCloseSx : undefined}
              />
            </StyledTabs>
          </div>
          <Fill />

          <div>
            <Tooltip
              disableInteractive
              title={this.state.drawerOpen ? "" : "Reset Tutorials"}
            >
              <DeleteItem
                disabled={
                  this.props.config.tutorials.scenePicker == null &&
                  this.props.config.tutorials.sceneDetail == null &&
                  this.props.config.tutorials.player == null &&
                  this.props.config.tutorials.library == null &&
                  this.props.config.tutorials.audios == null &&
                  this.props.config.tutorials.scripts == null &&
                  this.props.config.tutorials.scriptor == null &&
                  this.props.config.tutorials.sceneGenerator == null &&
                  this.props.config.tutorials.sceneGrid == null &&
                  this.props.config.tutorials.videoClipper == null
                }
                onClick={this.props.onResetTutorials.bind(this)}
              >
                <ListItemIcon>
                  <LiveHelpIcon color="error" />
                </ListItemIcon>
                <ListItemText primary="Reset Tutorials" />
              </DeleteItem>
            </Tooltip>
            <Tooltip
              disableInteractive
              title={this.state.drawerOpen ? "" : "Restore Defaults"}
            >
              <DeleteItem onClick={this.onRestoreDefaults.bind(this)}>
                <ListItemIcon>
                  <RestoreIcon color="error" />
                </ListItemIcon>
                <ListItemText primary="Restore Defaults" />
              </DeleteItem>
            </Tooltip>
            <Dialog
              open={this.state.openMenu == MO.deleteAlert}
              onClose={this.onCloseDialog.bind(this)}
              aria-labelledby="delete-title"
              aria-describedby="delete-description"
            >
              <DialogTitle id="Delete-title">Restore Defaults</DialogTitle>
              <DialogContent>
                <DialogContentText id="delete-description">
                  Are you sure you want to restore all settings to their
                  defaults? This will also reset any configured APIs.
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button
                  onClick={this.onCloseDialog.bind(this)}
                  color="secondary"
                >
                  Cancel
                </Button>
                <Button
                  onClick={this.onFinishRestoreDefaults.bind(this)}
                  color="primary"
                >
                  OK
                </Button>
              </DialogActions>
            </Dialog>
          </div>
        </StyledDrawer>

        <Content>
          <AppBarSpacer />
          <ContentContainer maxWidth={false}>
            {this.state.openTab === 0 && (
              <Typography component="div">
                <TabPanelDiv>
                  <DrawerSpacer />
                  <Box p={2} sx={{ flexGrow: 1 }}>
                    <SceneOptions
                      allScenes={this.props.scenes}
                      allSceneGrids={this.props.sceneGrids}
                      scene={this.state.config.defaultScene}
                      isConfig
                      onUpdateScene={this.onUpdateDefaultScene.bind(this)}
                    />
                  </Box>
                </TabPanelDiv>
              </Typography>
            )}

            {this.state.openTab === 1 && (
              <Typography component="div">
                <TabPanelDiv>
                  <DrawerSpacer />
                  <Box p={2} sx={{ flexGrow: 1 }}>
                    <SceneEffects
                      easingControls={
                        this.state.config.displaySettings.easingControls
                      }
                      scene={this.state.config.defaultScene}
                      onUpdateScene={this.onUpdateDefaultScene.bind(this)}
                    />
                  </Box>
                </TabPanelDiv>
              </Typography>
            )}

            {this.state.openTab === 2 && (
              <Typography component="div">
                <TabPanelDiv>
                  <DrawerSpacer />
                  <Box p={2} sx={{ flexGrow: 1 }}>
                    <GeneralConfig
                      config={this.state.config}
                      library={this.props.library}
                      tags={this.props.tags}
                      theme={this.props.theme}
                      onBackup={this.props.onBackup.bind(this)}
                      onChangeThemeColor={this.props.onChangeThemeColor.bind(
                        this,
                      )}
                      onClean={this.props.onClean.bind(this)}
                      onPortableOverride={this.onPortableOverride.bind(this)}
                      onRestore={this.onRestore.bind(this)}
                      onToggleDarkMode={this.props.onToggleDarkMode.bind(this)}
                      onUpdateCachingSettings={this.onUpdateCachingSettings.bind(
                        this,
                      )}
                      onUpdateConfig={this.onUpdateConfig.bind(this)}
                      onUpdateGeneralSettings={this.onUpdateGeneralSettings.bind(
                        this,
                      )}
                      onUpdateDisplaySettings={this.onUpdateDisplaySettings.bind(
                        this,
                      )}
                      onUpdateRemoteSettings={this.onUpdateRemoteSettings.bind(
                        this,
                      )}
                    />
                  </Box>
                </TabPanelDiv>
              </Typography>
            )}
          </ContentContainer>
        </Content>

        <Dialog
          open={this.state.openMenu == MO.error}
          onClose={this.onCloseDialog.bind(this)}
          aria-labelledby="back-title"
          aria-describedby="back-description"
        >
          <DialogTitle id="back-title">Save Changes?</DialogTitle>
          <DialogContent>
            <DialogContentText id="back-description">
              You have unsaved changes. Would you like to save?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.props.goBack.bind(this)} color="inherit">
              Back - Don't Save
            </Button>
            <Button onClick={this.onCloseDialog.bind(this)} color="secondary">
              Cancel
            </Button>
            <Button onClick={this.onConfirmConfig.bind(this)} color="primary">
              Save Changes
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={this.state.errorSnackOpen}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          autoHideDuration={20000}
          onClose={this.onCloseErrorSnack.bind(this)}
          TransitionComponent={TransitionUp}
        >
          <Alert onClose={this.onCloseErrorSnack.bind(this)} severity="error">
            Error: {this.state.errorSnack}
          </Alert>
        </Snackbar>
      </Root>
    );
  }

  componentDidUpdate(props: any, state: any) {
    if (this.props.config !== props.config) {
      this.setState({ config: JSON.parse(JSON.stringify(this.props.config)) });
    }
  }

  goBack() {
    if (this.state.changeMade) {
      this.setState({ openMenu: MO.error });
    } else {
      this.props.goBack();
    }
  }

  onConfirmConfig() {
    window.ipc.validateConfig(this.state.config).then((errorMessage) => {
      if (errorMessage.length == 0) {
        this.props.onUpdateConfig(this.state.config);
        this.props.goBack();
      } else {
        console.error(errorMessage);
        this.setState({ errorSnackOpen: true, errorSnack: errorMessage });
      }
    });
  }

  onPortableOverride() {
    this.onRestore(window.constants.portablePath);
  }

  onRestore(backupFile: string) {
    this.setState({ changeMade: false });
    this.props.onRestore(backupFile);
  }

  onUpdateConfig(fn: (config: Config) => void) {
    const newConfig = this.props.config;
    fn(newConfig);
    this.props.onUpdateConfig(newConfig);
    this.setState({ config: newConfig, changeMade: false });
  }

  onUpdateDefaultScene(
    defualtScene: SceneSettings,
    fn: (settings: SceneSettings) => void,
  ) {
    const newConfig = this.state.config;
    fn(newConfig.defaultScene);
    this.setState({ config: newConfig, changeMade: true });
  }

  onUpdateGeneralSettings(fn: (keys: GeneralSettings) => void) {
    const newConfig = this.state.config;
    fn(newConfig.generalSettings);
    this.setState({ config: newConfig, changeMade: true });
  }

  onUpdateDisplaySettings(fn: (keys: DisplaySettings) => void) {
    const newConfig = this.state.config;
    fn(newConfig.displaySettings);
    this.setState({ config: newConfig, changeMade: true });
  }

  onUpdateCachingSettings(fn: (settings: CacheSettings) => void) {
    const newConfig = this.state.config;
    fn(newConfig.caching);
    this.setState({ config: newConfig, changeMade: true });
  }

  onUpdateRemoteSettings(fn: (keys: RemoteSettings) => void) {
    const newConfig = this.state.config;
    fn(newConfig.remoteSettings);
    this.setState({ config: newConfig });
  }

  onToggleDrawer() {
    this.setState({ drawerOpen: !this.state.drawerOpen });
  }

  onChangeTab(e: any, newTab: number) {
    this.setState({ openTab: newTab });
  }

  onRestoreDefaults() {
    this.setState({ openMenu: MO.deleteAlert });
  }

  onFinishRestoreDefaults() {
    this.props.onDefault();
  }

  onCloseDialog() {
    this.setState({ openMenu: null, drawerOpen: false });
  }

  onCloseErrorSnack() {
    this.setState({ errorSnackOpen: false });
  }
}

export default ConfigForm;
