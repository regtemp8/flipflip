import * as React from "react";

import {
  Avatar,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  Menu,
  Theme,
  Typography,
} from "@mui/material";
import createStyles from "@mui/styles/createStyles";
import withStyles from "@mui/styles/withStyles";

import AddIcon from "@mui/icons-material/Add";
import AdjustIcon from "@mui/icons-material/Adjust";
import CheckIcon from "@mui/icons-material/Check";
import DeleteIcon from "@mui/icons-material/Delete";
import NotInterestedIcon from "@mui/icons-material/NotInterested";

import { TT } from "../../../common/const";
import WeightGroup from "../../../common/WeightGroup";
import LibrarySearch from "../library/LibrarySearch";

const styles = (theme: Theme) =>
  createStyles({
    listElement: {
      paddingTop: 0,
      paddingBottom: "0 !important",
    },
    cardAvatar: {
      backgroundColor: theme.palette.primary.light,
      color: theme.palette.primary.contrastText,
    },
    cardAvatarButton: {
      padding: 0,
      fontSize: "1.125rem",
    },
    cardAvatarError: {
      backgroundColor: theme.palette.error.main,
      color: theme.palette.error.contrastText,
    },
    editSlider: {
      paddingLeft: theme.spacing(2),
      paddingRight: theme.spacing(1),
      height: "100%",
    },
    editRadios: {
      paddingLeft: theme.spacing(1),
      paddingRight: theme.spacing(2),
    },
    editList: {
      display: "flex",
      padding: theme.spacing(1),
      overflow: "hidden",
    },
    fullHeight: {
      height: "100%",
    },
    slider: {
      height: "auto",
      transform: "scaleY(1)",
      zIndex: theme.zIndex.modal + 1,
      transition: theme.transitions.create("transform", {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
    },
    sliderClose: {
      transform: "scaleY(0)",
      zIndex: "auto",
      transition: theme.transitions.create("transform", {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
    },
    editDialogPaper: {
      width: 400,
    },
    noAlignSelf: {
      alignSelf: "unset",
    },
    tagMenu: {
      minHeight: 365,
      minWidth: 250,
    },
    backdropTop: {
      zIndex: `${theme.zIndex.modal + 1} !important` as any,
    },
    highlight: {
      borderWidth: 2,
      borderColor: theme.palette.secondary.main,
      borderStyle: "solid",
    },
    disable: {
      pointerEvents: "none",
    },
    valueLabel: {
      top: theme.spacing(2.75),
      right: "unset",
      left: theme.spacing(4),
      "&:before": {
        left: "0%",
        right: "unset",
      },
    },
  });

interface SceneGeneratorProps {
  classes: any;
  generatorWeights: Array<WeightGroup>;
  isEditing: number;
  onClickAddRule: () => void
  onWeighRule: () => void
  getSearchText: () => void
  onDeleteRule: () => void
  onAddRule: () => void
}

class SceneGeneratorEditing extends React.Component<SceneGeneratorProps> {
  constructor(props: SceneGeneratorProps) {
    super(props);
  }

  render() {
    const classes = this.props.classes;
    const isEditing: WeightGroup | null =
      this.props.isEditing == -1
        ? null
        : this.props.generatorWeights[this.props.isEditing];

    if (isEditing == null) {
      return null;
    }

    return (
      <div>
        <div style={{ display: "flex" }}>
          <Typography variant={"overline"} style={{ flexGrow: 1 }}>
            Create advanced rule:
          </Typography>
          <IconButton onClick={this.props.onClickAddRule} size="large">
            <AddIcon />
          </IconButton>
        </div>
        <List disablePadding>
          {isEditing.rules.map((wg, i) => (
            <ListItem key={i} disableGutters>
              <ListItemIcon>
                <IconButton
                  className={classes.cardAvatarButton}
                  onClick={this.props.onWeighRule}
                  size="large"
                >
                  {wg.type == TT.weight && (
                    <Avatar className={classes.cardAvatar}>{wg.percent}</Avatar>
                  )}
                  {wg.type == TT.all && (
                    <Avatar className={classes.cardAvatar}>
                      <CheckIcon />
                    </Avatar>
                  )}
                  {wg.type == TT.none && (
                    <Avatar className={classes.cardAvatar}>
                      <NotInterestedIcon />
                    </Avatar>
                  )}
                  {wg.type == TT.or && (
                    <Avatar className={classes.cardAvatar}>
                      <AdjustIcon />
                    </Avatar>
                  )}
                </IconButton>
              </ListItemIcon>
              <ListItemText primary={this.props.getSearchText} />
              <ListItemSecondaryAction>
                <IconButton
                  size="small"
                  onClick={this.props.onDeleteRule}
                >
                  <DeleteIcon color="error" />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
        <Menu
          elevation={1}
          anchorOrigin={{
            vertical: "center",
            horizontal: "center",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          anchorEl={this.state.menuAnchorEl}
          keepMounted
          classes={{ paper: classes.tagMenu }}
          open={this.state.addRule}
          onClose={this.onCloseAddRule.bind(this)}
        >
          {this.state.addRule && (
            <LibrarySearch
              displaySources={this.props.library}
              filters={this.props.generatorWeights[this.state.isEditing].rules
                .filter((wg) => !wg.rules)
                .map((wg) => wg.search)}
              tags={this.props.tags}
              placeholder={"Search ..."}
              autoFocus
              isCreatable
              fullWidth
              onlyUsed
              menuIsOpen
              controlShouldRenderValue={false}
              onUpdateFilters={this.props.onAddRule}
            />
          )}
        </Menu>
      </div>
    );
  }
}

(SceneGeneratorEditing as any).displayName = "SceneGeneratorEditing";
export default withStyles(styles)(SceneGeneratorEditing as any);
