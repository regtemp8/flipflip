import React, { ChangeEvent, MouseEvent, useEffect, useState } from 'react'
import { cx } from '@emotion/css'

import {
  Avatar,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  Menu,
  Radio,
  RadioGroup,
  Slider,
  type Theme,
  Typography
} from '@mui/material'
import { makeStyles } from 'tss-react/mui'

import AddIcon from '@mui/icons-material/Add'
import AdjustIcon from '@mui/icons-material/Adjust'
import ArrowLeftIcon from '@mui/icons-material/ArrowLeft'
import ArrowRightIcon from '@mui/icons-material/ArrowRight'
import CheckIcon from '@mui/icons-material/Check'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import NotInterestedIcon from '@mui/icons-material/NotInterested'

import { en, SDGT, TT } from 'flipflip-common'
import { arrayMove } from '../../data/utils'
import type WeightGroup from '../../store/scene/WeightGroup'
import LibrarySearch from '../library/LibrarySearch'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { selectAppTutorial } from '../../store/app/selectors'
import { doneTutorial } from '../../store/app/thunks'
import { selectSceneGeneratorWeights } from '../../store/scene/selectors'
import { setSceneGeneratorWeights } from '../../store/scene/slice'
import { selectLibrarySources } from '../../store/librarySource/selectors'

const useStyles = makeStyles()((theme: Theme) => ({
  listElement: {
    paddingTop: 0,
    paddingBottom: '0 !important'
  },
  cardAvatar: {
    backgroundColor: theme.palette.primary.light,
    color: theme.palette.primary.contrastText
  },
  cardAvatarButton: {
    padding: 0,
    fontSize: '1.125rem'
  },
  cardAvatarError: {
    backgroundColor: theme.palette.error.main,
    color: theme.palette.error.contrastText
  },
  editSlider: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(1),
    height: '100%'
  },
  editRadios: {
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(2)
  },
  editList: {
    display: 'flex',
    padding: theme.spacing(1),
    overflow: 'hidden'
  },
  fullHeight: {
    height: '100%'
  },
  slider: {
    height: 'auto',
    transform: 'scaleY(1)',
    zIndex: theme.zIndex.modal + 1,
    transition: theme.transitions.create('transform', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen
    })
  },
  sliderClose: {
    transform: 'scaleY(0)',
    zIndex: 'auto',
    transition: theme.transitions.create('transform', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    })
  },
  editDialogPaper: {
    width: 400
  },
  noAlignSelf: {
    alignSelf: 'unset'
  },
  tagMenu: {
    minHeight: 365,
    minWidth: 250
  },
  backdropTop: {
    zIndex: `${theme.zIndex.modal + 1} !important` as any
  },
  highlight: {
    borderWidth: 2,
    borderColor: theme.palette.secondary.main,
    borderStyle: 'solid'
  },
  disable: {
    pointerEvents: 'none'
  },
  valueLabel: {
    top: theme.spacing(2.75),
    right: 'unset',
    left: theme.spacing(4),
    '&:before': {
      left: '0%',
      right: 'unset'
    }
  }
}))

export interface SceneGeneratorProps {
  sceneID: number
}

function SceneGenerator(props: SceneGeneratorProps) {
  const dispatch = useAppDispatch()
  const tutorial = useAppSelector(selectAppTutorial())
  const library = useAppSelector(selectLibrarySources())
  const generatorWeights = useAppSelector(
    selectSceneGeneratorWeights(props.sceneID)
  )

  const [isWeighingIndex, setIsWeighingIndex] = useState(-1)
  const [isEditingIndex, setIsEditingIndex] = useState(-1)
  const [addRule, setAddRule] = useState(false)
  const [advRule, setAdvRule] = useState(false)
  const [menuAnchorEl, setMenuAnchorEl] = useState<any>()

  useEffect(() => {
    if (
      generatorWeights &&
      generatorWeights.length > 0 &&
      generatorWeights.length > generatorWeights.length
    ) {
      const lastIndex = generatorWeights.length - 1
      const lastWG = generatorWeights[lastIndex]
      if (lastWG.rules) {
        setIsEditingIndex(lastIndex)
      }
    }
  }, [generatorWeights])

  const areRulesValid = (wg: WeightGroup) => {
    const rules = wg.rules as WeightGroup[]
    const orRules = rules.filter((r) => r.type === TT.or)
    const weightRules = rules.filter((r) => r.type === TT.weight)
    let rulesRemaining = 100
    for (const rule of weightRules) {
      rulesRemaining = rulesRemaining - (rule.percent as number)
    }
    return (
      rules.length > 0 &&
      (orRules.length === 0 ||
        (orRules.length + weightRules.length === rules.length &&
          rulesRemaining === 0) ||
        orRules.length === rules.length) &&
      (rulesRemaining === 0 ||
        (rulesRemaining === 100 && weightRules.length === 0))
    )
  }

  const getRemainingPercent = (): number => {
    let remaining = 100
    const weights = generatorWeights as WeightGroup[]
    if (isEditingIndex === -1) {
      for (const wg of weights) {
        if (wg.type === TT.weight) {
          remaining = remaining - (wg.percent as number)
        }
      }
    } else {
      const rules = weights[isEditingIndex].rules as WeightGroup[]
      for (const wg of rules) {
        if (wg.type === TT.weight) {
          remaining = remaining - (wg.percent as number)
        }
      }
    }
    return remaining
  }

  const onCloseDialog = () => {
    setIsWeighingIndex(-1)
    setIsEditingIndex(-1)
    setAddRule(false)
    setMenuAnchorEl(null)
    setAdvRule(false)
  }

  const onCloseMenu = () => {
    if (isEditingIndex === -1) {
      onCloseDialog()
    } else {
      setIsWeighingIndex(-1)
      setMenuAnchorEl(null)
    }
  }

  const onAddRule = (filters: string[]) => {
    const weights = generatorWeights as WeightGroup[]
    const wg = weights[isEditingIndex]
    for (const search of filters) {
      const rules = wg.rules as WeightGroup[]
      if (
        search.length > 0 &&
        rules.find((wg) => wg.search === search) == null
      ) {
        const newWG: WeightGroup = {
          percent: 0,
          type: TT.weight,
          search
        }

        wg.rules = rules.concat([newWG])
      }
    }
    changeGeneratorWeights(weights)
  }

  const onClickAddRule = (e: MouseEvent) => {
    setMenuAnchorEl(e.currentTarget)
    setAddRule(true)
  }

  const onCloseAddRule = () => {
    setMenuAnchorEl(null)
    setAddRule(false)
  }

  const onWeighRule = (index: number, e: MouseEvent) => {
    setIsWeighingIndex(index)
    setMenuAnchorEl(e.currentTarget)
    setAdvRule(true)
  }

  const onDeleteRule = (index: number) => {
    const weights = generatorWeights as WeightGroup[]
    const wg = weights[isEditingIndex]
    wg.rules!.splice(index, 1)
    changeGeneratorWeights(weights)
  }

  const getSearchText = (search: string) => {
    if (
      (search.startsWith('[') && search.endsWith(']')) ||
      (search.startsWith('{') && search.endsWith('}'))
    ) {
      search = search.substring(1, search.length - 1)
    }
    return search
  }

  const getRuleName = (wg: WeightGroup) => {
    if (!wg) return 'ERROR'
    if (wg.rules) {
      if (wg.rules.length === 0) return 'New Adv Rule'
      if (!areRulesValid(wg)) return 'ERROR'

      let title = ''
      const allRules = wg.rules
        .filter((r) => r.type === TT.all)
        .map((r) => getSearchText(r.search as string))
      if (allRules.length > 0) {
        title += allRules.join(' ')
      }
      const orRules = wg.rules
        .filter((r) => r.type === TT.or)
        .map((r) => getSearchText(r.search as string))
      if (orRules.length > 0) {
        if (title !== '') {
          title += ', '
        }
        title += orRules.join(' OR ')
      }
      const noRules = wg.rules
        .filter((r) => r.type === TT.none)
        .map((r) => getSearchText(r.search as string))
      if (noRules.length > 0) {
        if (title !== '') {
          title += ', '
        }
        title += 'NO ' + noRules.join(' ')
      }
      const weightRules = wg.rules.filter((r) => r.type === TT.weight)
      if (weightRules.length > 0) {
        for (const r of weightRules) {
          if (title !== '') {
            title += ', '
          }
          title += r.percent + '% ' + getSearchText(r.search as string)
        }
      }

      return title
    } else {
      return getSearchText(wg.search as string)
    }
  }

  const onWeighGroup = (index: number, e: MouseEvent) => {
    if (tutorial === SDGT.edit1) {
      dispatch(doneTutorial(SDGT.edit1))
    }
    setIsWeighingIndex(index)
    setMenuAnchorEl(e.currentTarget)
    setAdvRule(false)
  }

  const onEditGroup = (index: number) => {
    setIsEditingIndex(index)
  }

  const onDeleteGroup = (index: number) => {
    const weights = generatorWeights as WeightGroup[]
    weights.splice(index, 1)
    changeGeneratorWeights(weights)
  }

  const onGroupSliderChange = (
    index: number,
    key: string,
    value: number | number[]
  ) => {
    if (Array.isArray(value)) {
      value = value[0]
    }

    const weights = generatorWeights as WeightGroup[]
    if (isEditingIndex === -1) {
      const wg = weights[index]
      ;(wg as any)[key] = value
    } else {
      const wg = weights[isEditingIndex]
      const rule = wg.rules![index]
      ;(rule as any)[key] = value
    }
    changeGeneratorWeights(weights)
  }

  const onGroupInput = (
    index: number,
    key: string,
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value
    const weights = generatorWeights as WeightGroup[]
    if (isEditingIndex === -1) {
      const wg = weights[index]
      ;(wg as any)[key] = value
    } else {
      const wg = weights[isEditingIndex]
      const rule = wg.rules![index]
      ;(rule as any)[key] = value
    }
    if (tutorial === SDGT.edit2) {
      if (weights.find((wg) => wg.type !== TT.all) == null) {
        dispatch(doneTutorial(SDGT.edit2))
        onCloseDialog()
      }
    }
    changeGeneratorWeights(weights)
  }

  const onMoveRight = (index: number) => {
    const weights = generatorWeights as WeightGroup[]
    arrayMove(weights, index, index + 1)
    dispatch(setSceneGeneratorWeights({ id: props.sceneID, value: weights }))
  }

  const onMoveLeft = (index: number) => {
    const weights = generatorWeights as WeightGroup[]
    arrayMove(weights, index, index - 1)
    dispatch(setSceneGeneratorWeights({ id: props.sceneID, value: weights }))
  }

  const changeGeneratorWeights = (weights: WeightGroup[]) => {
    for (const wg of weights) {
      wg.max = undefined
      wg.chosen = undefined
    }

    dispatch(setSceneGeneratorWeights({ id: props.sceneID, value: weights }))
  }

  const { classes } = useStyles()
  const weights = generatorWeights as WeightGroup[]
  const isWeighing: WeightGroup | undefined =
    isWeighingIndex === -1
      ? undefined
      : isEditingIndex === -1
        ? weights[isWeighingIndex]
        : weights[isEditingIndex].rules![isWeighingIndex]
  const isEditing: WeightGroup | undefined =
    isEditingIndex === -1 ? undefined : weights[isEditingIndex]

  const grid = Array<any[]>()
  for (let w = 0; w < weights.length; w++) {
    if (!grid[w % 4]) {
      grid[w % 4] = []
    }
    grid[w % 4].push(weights[w])
  }
  return (
    <Grid container spacing={1}>
      {grid.map((c, x) => (
        <Grid
          key={x}
          item
          xs={12}
          sm={6}
          md={4}
          lg={3}
          className={cx(
            (tutorial === SDGT.edit1 || tutorial === SDGT.edit2) &&
              classes.backdropTop
          )}
        >
          <Grid container spacing={1}>
            {c.map((wg: WeightGroup, y) => (
              <Grid key={y} xs={12} item>
                <Card>
                  <CardHeader
                    classes={{ action: classes.noAlignSelf }}
                    avatar={
                      <IconButton
                        className={cx(
                          classes.cardAvatarButton,
                          tutorial === SDGT.edit1 && classes.highlight
                        )}
                        onClick={(e: MouseEvent) => onWeighGroup(y * 4 + x, e)}
                        size="large"
                      >
                        {wg.type === TT.weight && (
                          <Avatar
                            className={cx(
                              classes.cardAvatar,
                              wg.rules &&
                                !areRulesValid(wg) &&
                                classes.cardAvatarError
                            )}
                          >
                            {wg.percent}
                          </Avatar>
                        )}
                        {wg.type === TT.all && (
                          <Avatar
                            className={cx(
                              classes.cardAvatar,
                              wg.rules &&
                                !areRulesValid(wg) &&
                                classes.cardAvatarError
                            )}
                          >
                            <CheckIcon />
                          </Avatar>
                        )}
                        {wg.type === TT.none && (
                          <Avatar
                            className={cx(
                              classes.cardAvatar,
                              wg.rules &&
                                !areRulesValid(wg) &&
                                classes.cardAvatarError
                            )}
                          >
                            <NotInterestedIcon />
                          </Avatar>
                        )}
                      </IconButton>
                    }
                    action={
                      <React.Fragment>
                        {wg.chosen && (
                          <Chip
                            label={wg.chosen + '/' + wg.max}
                            color="secondary"
                            size="small"
                          />
                        )}
                        {wg.rules && (
                          <IconButton
                            size="small"
                            onClick={() => onEditGroup(y * 4 + x)}
                          >
                            <EditIcon />
                          </IconButton>
                        )}
                        <IconButton
                          size="small"
                          onClick={() => onMoveLeft(y * 4 + x)}
                          disabled={y * 4 + x === 0}
                        >
                          <ArrowLeftIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => onMoveRight(y * 4 + x)}
                          disabled={y * 4 + x === weights.length - 1}
                        >
                          <ArrowRightIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          className={cx(
                            (tutorial === SDGT.edit1 ||
                              tutorial === SDGT.edit2) &&
                              classes.disable
                          )}
                          onClick={() => onDeleteGroup(y * 4 + x)}
                        >
                          <DeleteIcon color="error" />
                        </IconButton>
                      </React.Fragment>
                    }
                    title={getRuleName(wg)}
                  />
                  {wg.rules && (
                    <React.Fragment>
                      <Divider />
                      <CardContent className={classes.listElement}>
                        <List>
                          {wg.rules.map((wg, i) => (
                            <ListItem key={i}>
                              <ListItemIcon>
                                <React.Fragment>
                                  {wg.type === TT.weight && (
                                    <Avatar>{wg.percent}</Avatar>
                                  )}
                                  {wg.type === TT.all && (
                                    <Avatar>
                                      <CheckIcon />
                                    </Avatar>
                                  )}
                                  {wg.type === TT.none && (
                                    <Avatar>
                                      <NotInterestedIcon />
                                    </Avatar>
                                  )}
                                  {wg.type === TT.or && (
                                    <Avatar>
                                      <AdjustIcon />
                                    </Avatar>
                                  )}
                                </React.Fragment>
                              </ListItemIcon>
                              <ListItemText
                                primary={getSearchText(wg.search as string)}
                              />
                            </ListItem>
                          ))}
                        </List>
                      </CardContent>
                    </React.Fragment>
                  )}
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>
      ))}
      <Menu
        id="edit-menu"
        elevation={1}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left'
        }}
        anchorEl={menuAnchorEl}
        keepMounted
        className={cx(
          (isEditingIndex !== -1 || tutorial === SDGT.edit2) &&
            classes.backdropTop
        )}
        classes={{
          list: classes.editList,
          paper: cx(
            isEditingIndex !== -1 && classes.backdropTop,
            tutorial === SDGT.edit2 && classes.highlight
          )
        }}
        open={isWeighingIndex !== -1}
        onClose={onCloseMenu}
      >
        {isWeighingIndex !== -1 && (
          <div
            className={cx(
              classes.slider,
              weights[isWeighingIndex].type !== TT.weight && classes.sliderClose
            )}
          >
            <Slider
              className={classes.editSlider}
              classes={{
                valueLabel: classes.valueLabel
              }}
              max={
                getRemainingPercent() +
                (weights[isWeighingIndex].percent as number)
              }
              defaultValue={weights[isWeighingIndex].percent}
              onChangeCommitted={(e, value) =>
                onGroupSliderChange(isWeighingIndex, 'percent', value)
              }
              valueLabelDisplay={'auto'}
              valueLabelFormat={(v) => v + '%'}
              orientation="vertical"
            />
          </div>
        )}
        {isWeighingIndex !== -1 && (
          <RadioGroup
            className={classes.editRadios}
            value={weights[isWeighingIndex].type}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              onGroupInput(isWeighingIndex, 'type', e)
            }
          >
            {Object.values(TT)
              .filter((tt) => advRule || tt !== TT.or)
              .map((tt) => (
                <FormControlLabel
                  key={tt}
                  value={tt}
                  control={
                    <Radio
                      className={cx(
                        tutorial === SDGT.edit2 &&
                          tt === TT.all &&
                          classes.highlight
                      )}
                    />
                  }
                  label={en.get(tt)}
                />
              ))}
          </RadioGroup>
        )}
      </Menu>
      <Dialog
        classes={{ paper: classes.editDialogPaper }}
        open={isEditingIndex !== -1}
        onClose={onCloseDialog}
        aria-labelledby="adv-rule-title"
        aria-describedby="adv-rule-description"
      >
        <DialogTitle id="adv-rule-title">
          {getRuleName(weights[isEditingIndex])}
        </DialogTitle>
        <DialogContent>
          {isEditingIndex !== -1 && (
            <div>
              <div style={{ display: 'flex' }}>
                <Typography variant={'overline'} style={{ flexGrow: 1 }}>
                  Create advanced rule:
                </Typography>
                <IconButton onClick={onClickAddRule} size="large">
                  <AddIcon />
                </IconButton>
              </div>
              <List disablePadding>
                {weights[isEditingIndex].rules!.map((wg, i) => (
                  <ListItem key={i} disableGutters>
                    <ListItemIcon>
                      <IconButton
                        className={classes.cardAvatarButton}
                        onClick={(e: MouseEvent) => onWeighRule(i, e)}
                        size="large"
                      >
                        {wg.type === TT.weight && (
                          <Avatar className={classes.cardAvatar}>
                            {wg.percent}
                          </Avatar>
                        )}
                        {wg.type === TT.all && (
                          <Avatar className={classes.cardAvatar}>
                            <CheckIcon />
                          </Avatar>
                        )}
                        {wg.type === TT.none && (
                          <Avatar className={classes.cardAvatar}>
                            <NotInterestedIcon />
                          </Avatar>
                        )}
                        {wg.type === TT.or && (
                          <Avatar className={classes.cardAvatar}>
                            <AdjustIcon />
                          </Avatar>
                        )}
                      </IconButton>
                    </ListItemIcon>
                    <ListItemText
                      primary={getSearchText(wg.search as string)}
                    />
                    <ListItemSecondaryAction>
                      <IconButton size="small" onClick={() => onDeleteRule(i)}>
                        <DeleteIcon color="error" />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
              <Menu
                elevation={1}
                anchorOrigin={{
                  vertical: 'center',
                  horizontal: 'center'
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right'
                }}
                anchorEl={menuAnchorEl}
                keepMounted
                classes={{ paper: classes.tagMenu }}
                open={addRule}
                onClose={onCloseAddRule}
              >
                {addRule && (
                  <LibrarySearch
                    displaySources={library}
                    filters={weights[isEditingIndex]
                      .rules!.filter((wg) => !wg.rules)
                      .map((wg) => wg.search)}
                    placeholder={'Search ...'}
                    autoFocus
                    isCreatable
                    fullWidth
                    onlyUsed
                    menuIsOpen
                    controlShouldRenderValue={false}
                    onUpdateFilters={onAddRule}
                  />
                )}
              </Menu>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Grid>
  )
}

;(SceneGenerator as any).displayName = 'SceneGenerator'
export default SceneGenerator
