import React, { useEffect, useRef, useState } from 'react'
import wretch from 'wretch'
import Sound from 'react-sound'

import captionProgramDefaults, {
  CancelablePromise,
  getDuration,
  getMsTimestampValue,
  getRandomListItem,
  getTimingFromString,
  htmlEntities
} from '../../data/utils'
import { RP, TF } from 'flipflip-common'
import type ChildCallbackHack from './ChildCallbackHack'
import { Box, CircularProgress } from '@mui/material'
import { setRouteGoBack } from '../../store/app/thunks'
import { nextScene } from '../../store/scene/thunks'
import { selectCurrentImageTags } from '../../store/librarySource/selectors'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import {
  selectCaptionScriptUrl,
  selectCaptionScriptScript,
  selectCaptionScriptStopAtEnd,
  selectCaptionScriptNextSceneAtEnd,
  selectCaptionScriptSyncWithAudio,
  selectCaptionScriptFontSettingsBlink,
  selectCaptionScriptFontSettingsCaption,
  selectCaptionScriptFontSettingsCaptionBig,
  selectCaptionScriptFontSettingsCount,
  selectCaptionScriptOpacity
} from '../../store/captionScript/selectors'
import { selectAudioBPM } from '../../store/audio/selectors'
import flipflip from '../../FlipFlipService'
import { RootState } from '../../store/store'

const splitFirstWord = function (s: string) {
  const firstSpaceIndex = s.indexOf(' ')
  if (firstSpaceIndex > 0 && firstSpaceIndex < s.length - 1) {
    const first = s.substring(0, firstSpaceIndex)
    const rest = s.substring(firstSpaceIndex + 1)
    return [first, rest]
  } else {
    return [s, null]
  }
}

const getFirstWord = function (s: string) {
  return splitFirstWord(s)[0]
}

const getRest = function (s: string) {
  return splitFirstWord(s)[1]
}

export interface CaptionProgramProps {
  sceneID: number
  captionScriptID: number
  currentAudio?: number
  currentImage?: HTMLImageElement | HTMLVideoElement | HTMLIFrameElement
  persist: boolean
  repeat: string
  scale: number
  singleTrack: boolean
  timeToNextFrame?: number
  jumpToHack?: ChildCallbackHack
  advance?: () => void
  getCurrentTimestamp?: () => number
  nextTrack?: () => void
  onError?: (e: string) => void
}

export default function CaptionProgram(props: CaptionProgramProps) {
  const timeToNextFrame = props.timeToNextFrame ?? 0
  const dispatch = useAppDispatch()
  const currentImageTags = useAppSelector(
    selectCurrentImageTags(props.currentImage)
  )
  const url = useAppSelector(selectCaptionScriptUrl(props.captionScriptID))
  const script = useAppSelector(
    selectCaptionScriptScript(props.captionScriptID)
  )
  const stopAtEnd = useAppSelector(
    selectCaptionScriptStopAtEnd(props.captionScriptID)
  )
  const nextSceneAtEnd = useAppSelector(
    selectCaptionScriptNextSceneAtEnd(props.captionScriptID)
  )
  const syncWithAudio = useAppSelector(
    selectCaptionScriptSyncWithAudio(props.captionScriptID)
  )
  const fsBlink = useAppSelector(
    selectCaptionScriptFontSettingsBlink(props.captionScriptID)
  )
  const fsCaption = useAppSelector(
    selectCaptionScriptFontSettingsCaption(props.captionScriptID)
  )
  const fsCaptionBig = useAppSelector(
    selectCaptionScriptFontSettingsCaptionBig(props.captionScriptID)
  )
  const fsCount = useAppSelector(
    selectCaptionScriptFontSettingsCount(props.captionScriptID)
  )
  const opacity = useAppSelector(
    selectCaptionScriptOpacity(props.captionScriptID)
  )

  const bpmSelector =
    props.currentAudio != null
      ? selectAudioBPM(props.currentAudio)
      : (state: RootState) => 0
  const bpm = useAppSelector(bpmSelector)

  const [state, setState] = useState({
    ...captionProgramDefaults,
    countColors: new Map<number, string>(),
    countColor: '#FFFFFF',
    countProgress: false,
    countCurrent: 0,
    countTotal: 0,
    countChild: 0
  })

  const _el = useRef<HTMLDivElement>()
  const _runningPromise = useRef<CancelablePromise>()
  const _timeout = useRef<any>()
  const _sceneCommand = useRef<Function>()
  const _timeStarted = useRef<Date>()
  const _nextTimestamp = useRef<number>()
  const _lastTimestamp = useRef<number>()
  const _timestampTimeout = useRef<number>()

  useEffect(() => {
    start()
    if (props.jumpToHack) {
      props.jumpToHack.listener = (args) => {
        if (args && args.length > 0) {
          setState({ ...state, programCounter: args[0] })
        }
      }
    }

    return () => {
      reset()
      stop()
      if (props.jumpToHack) {
        props.jumpToHack.listener = undefined
      }
    }
  }, [])

  useEffect(() => {
    if (_sceneCommand.current != null) {
      const command = _sceneCommand.current
      _sceneCommand.current = undefined
      command()
    }
  }, [props.currentImage])

  useEffect(() => {
    if (_el.current) {
      stop()
      reset()
      start()
    }
  }, [props.captionScriptID])

  useEffect(() => {
    if (props.getCurrentTimestamp == null) {
      stop()
      reset()
      start()
    }
  }, [props.getCurrentTimestamp])

  const reset = () => {
    setState({
      ...captionProgramDefaults,
      phrases: new Map<number, string[]>(),
      audios: new Array<{
        alias: string
        file: string
        playing: boolean
        volume: number
      }>(),
      timestampFn: new Map<number, Function[]>(),
      countColors: new Map<number, string>(),
      countColor: '#FFFFFF',
      countProgress: false,
      countCurrent: 0,
      countTotal: 0,
      countChild: 0
    })
  }

  const stop = () => {
    captionProgramDefaults.phrases = new Map<number, string[]>()
    captionProgramDefaults.audios = new Array<{
      alias: string
      file: string
      playing: boolean
      volume: number
    }>()
    captionProgramDefaults.timestampFn = new Map<number, Function[]>()
    setState({ ...state, countProgress: false })
    if (_el.current) {
      _el.current.style.opacity = '0'
    }
    if (_runningPromise.current) {
      _runningPromise.current.cancel()
      _runningPromise.current = undefined
    }
    if (_timeout.current) {
      clearTimeout(_timeout.current)
      _timeout.current = undefined
    }
    _sceneCommand.current = undefined
    _timeStarted.current = undefined
    _lastTimestamp.current = undefined
    _nextTimestamp.current = undefined
    if (_timestampTimeout.current) {
      clearTimeout(_timestampTimeout.current)
      _timestampTimeout.current = undefined
    }
  }

  const start = () => {
    _runningPromise.current = new CancelablePromise((resolve, reject) => {
      if (script != null) {
        resolve({ data: [script] })
      } else {
        wretch(url)
          .get()
          .error(503, (error) => {
            console.warn(
              'Unable to access ' + url + ' - Service is unavailable'
            )
          })
          .text((data) => {
            resolve({ data: [data] })
          })
      }
    })
    _runningPromise.current.then(async (data) => {
      let error = null
      const newProgram = new Array<Function>()
      const newTimestamps = new Map<number, Function[]>()
      let index = 0
      let containsTimestampAction = false
      let containsAction = false

      for (let line of data.data[0].split('\n')) {
        index++
        line = line.trim()

        if (line.length === 0 || line[0] === '#') continue
        let command = getFirstWord(line)
        let value = getRest(line)

        const timestamp = command ? getMsTimestampValue(command) : undefined
        if (timestamp != null && value != null && value.length > 0) {
          line = value
          command = getFirstWord(line)
          value = getRest(line)
        }

        let fn, ms
        switch (command) {
          case 'advance':
            if (value != null) {
              error =
                'Error: {' + index + "} '" + line + "' - extra parameter(s)"
              break
            }
            if (timestamp != null) {
              containsTimestampAction = true
              const actions = newTimestamps.get(timestamp)
              if (actions) {
                actions.push(advance())
              } else {
                newTimestamps.set(timestamp, [advance()])
              }
            } else {
              containsAction = true
              newProgram.push(advance())
            }
            break
          case 'count':
            if (value == null) {
              error =
                'Error: {' + index + "} '" + line + "' - missing parameters"
              break
            }
            const split = value.split(' ')
            if (split.length < 2) {
              error =
                'Error: {' +
                index +
                "} '" +
                line +
                "' - missing second parameter"
              break
            }
            if (split.length > 2) {
              error =
                'Error: {' + index + "} '" + line + "' - extra parameter(s)"
              break
            }
            const start = parseInt(split[0])
            const end = parseInt(split[1])
            if (
              /^\d+\s*$/.exec(split[0]) == null ||
              /^\d+\s*$/.exec(split[1]) == null ||
              isNaN(start) ||
              isNaN(end) ||
              start < 0 ||
              end < 0
            ) {
              error =
                'Error: {' + index + "} '" + line + "' - invalid count command"
              break
            }
            if (timestamp != null) {
              containsTimestampAction = true
              const actions = newTimestamps.get(timestamp)
              if (actions) {
                actions.push(commands.count(start, end, true))
              } else {
                newTimestamps.set(timestamp, [commands.count(start, end, true)])
              }
            } else {
              containsAction = true
              newProgram.push(commands.count(start, end))
            }
            break
          case 'blink':
          case 'cap':
          case 'bigcap':
            if (value == null) {
              error =
                'Error: {' + index + "} '" + line + "' - missing parameter"
              break
            }
            let rr
            if (command === 'blink') {
              rr = /(?:^|[\/\s])(\$RANDOM_PHRASE|\$\d)(?:[\/\s]|$)/g
            } else {
              rr = /(?:^|\s)(\$RANDOM_PHRASE|\$\d)(?:\s|$)/g
            }
            let rrE
            while ((rrE = rr.exec(value))) {
              let register
              if (rrE[1] === '$RANDOM_PHRASE') {
                register = 0
              } else {
                register = parseInt(rrE[1].substring(1, 2))
              }
              if (!state.phrases.has(register)) {
                error =
                  'Error: {' +
                  index +
                  "} '" +
                  line +
                  "' - no phrases stored" +
                  (register === 0 ? '' : ' in group ' + register)
                break
              }
            }
            if (error != null) break
            if (timestamp != null) {
              containsTimestampAction = true
              const actions = newTimestamps.get(timestamp)
              if (actions) {
                actions.push(commands[command](value, true))
              } else {
                newTimestamps.set(timestamp, [commands[command](value, true)])
              }
            } else {
              containsAction = true
              newProgram.push(commands[command](value))
            }
            break
          case 'storephrase':
          case 'storePhrase':
            if (value == null) {
              error =
                'Error: {' + index + "} '" + line + "' - missing parameter"
              break
            }
            const newPhrases = state.phrases
            const registerRegex = /^\$(\d)\s.*$/.exec(value)
            if (registerRegex != null) {
              const register = parseInt(registerRegex[1])
              if (register !== 0) {
                value = value.replace('$' + register + ' ', '')
                const phrases = newPhrases.get(register)
                if (phrases) {
                  phrases.push(value)
                } else {
                  newPhrases.set(register, [])
                }
              }
            }

            const phrases = newPhrases.get(0)
            if (phrases) {
              phrases.push(value)
            } else {
              newPhrases.set(0, [])
            }
            setState({ ...state, phrases: newPhrases })
            break
          case 'storeAudio':
            if (value == null) {
              error =
                'Error: {' + index + "} '" + line + "' - missing parameters"
              break
            }
            const audioSplit = value.split(' ')
            if (audioSplit.length < 2) {
              error =
                'Error: {' + index + "} '" + line + "' - missing parameter"
              break
            }
            let file: string, alias: string
            if (audioSplit[0].startsWith("'")) {
              file = audioSplit[0].substring(1)
              if (file.endsWith("'")) {
                file = file.substring(0, file.length - 1)
                alias = audioSplit[audioSplit.length - 1]
              } else {
                for (let s = 1; s < audioSplit.length; s++) {
                  if (audioSplit[s].endsWith("'")) {
                    file +=
                      ' ' + audioSplit[s].substring(0, audioSplit[s].length - 1)
                    if (audioSplit.length === s + 1) {
                      error =
                        'Error: {' +
                        index +
                        "} '" +
                        line +
                        "' - missing parameter"
                    } else if (audioSplit.length > s + 2) {
                      error =
                        'Error: {' +
                        index +
                        "} '" +
                        line +
                        "' - extra parameter"
                    } else {
                      alias = audioSplit[audioSplit.length - 1]
                    }
                    break
                  } else if (s === audioSplit.length - 1) {
                    error =
                      'Error: {' + index + "} '" + line + "' - invalid command"
                    break
                  } else {
                    file += ' ' + audioSplit[s]
                  }
                }
              }
              if (error != null) break
              alias = audioSplit[audioSplit.length - 1]
            } else if (audioSplit[0].startsWith('"')) {
              file = audioSplit[0].substring(1)
              if (file.endsWith('"')) {
                file = file.substring(0, file.length - 1)
              } else {
                for (let s = 1; s < audioSplit.length; s++) {
                  if (audioSplit[s].endsWith('"')) {
                    file +=
                      ' ' + audioSplit[s].substring(0, audioSplit[s].length - 1)
                    if (s < audioSplit.length - 2) {
                      error =
                        'Error: {' +
                        index +
                        "} '" +
                        line +
                        "' - missing parameter"
                    } else {
                      alias = audioSplit[audioSplit.length - 1]
                    }
                    break
                  } else if (s === audioSplit.length - 1) {
                    error =
                      'Error: {' + index + "} '" + line + "' - invalid command"
                    break
                  } else {
                    file += ' ' + audioSplit[s]
                  }
                }
              }
              if (error != null) break
              alias = audioSplit[audioSplit.length - 1]
            } else {
              file = audioSplit[0]
              alias = audioSplit[1]
            }
            if (
              !file.startsWith('http') &&
              !(await flipflip().api.pathExists(file))
            ) {
              error =
                'Error: {' +
                index +
                "} '" +
                line +
                "' - file '" +
                file +
                "' does not exist"
              break
            }
            if (state.audios.find((a) => a.alias === alias) != null) {
              error =
                'Error: {' + index + "} '" + line + "' - alias already used"
              break
            }
            setState({
              ...state,
              audios: state.audios.concat([
                { alias, file, playing: false, volume: 100 }
              ])
            })
            break
          case 'playAudio':
            if (value == null) {
              error =
                'Error: {' + index + "} '" + line + "' - missing parameters"
              break
            }
            const pSplit = value.split(' ')
            if (pSplit.length > 2) {
              error =
                'Error: {' + index + "} '" + line + "' - extra parameter(s)"
              break
            }
            if (state.audios.find((a) => a.alias === pSplit[0]) == null) {
              error =
                'Error: {' +
                index +
                "} '" +
                line +
                "' - no audio not stored for '" +
                pSplit[0] +
                "'"
              break
            }
            let volume = 100
            if (pSplit.length > 1) {
              volume = parseInt(pSplit[1])
              if (
                /^\d+$/.exec(pSplit[1]) == null ||
                volume < 0 ||
                volume > 100
              ) {
                error =
                  'Error: {' +
                  index +
                  "} '" +
                  line +
                  "' - invalid volume (0 - 100)"
                break
              }
            }
            fn = commands[command](pSplit[0], volume)
            if (timestamp != null) {
              containsTimestampAction = true
              const actions = newTimestamps.get(timestamp)
              if (actions) {
                actions.push(fn)
              } else {
                newTimestamps.set(timestamp, [fn])
              }
            } else {
              containsAction = true
              newProgram.push(fn)
            }
            break
          case 'setBlinkDuration':
          case 'setBlinkDelay':
          case 'setBlinkGroupDelay':
          case 'setCaptionDuration':
          case 'setCaptionDelay':
          case 'setCountDuration':
          case 'setCountDelay':
          case 'setCountGroupDelay':
            if (value == null) {
              error =
                'Error: {' + index + "} '" + line + "' - missing parameters"
              break
            } else if (value.split(' ').length > 2) {
              error =
                'Error: {' + index + "} '" + line + "' - extra parameter(s)"
              break
            } else if (/^\d+\s*\d*\s*$/.exec(value) == null) {
              error = 'Error: {' + index + "} '" + line + "' - invalid command"
              break
            }
            const numbers: any[] = value.split(' ')
            let invalid = false
            for (let n = 0; n < numbers.length; n++) {
              ms = parseInt(numbers[n])
              if (isNaN(ms)) {
                error =
                  'Error: {' + index + "} '" + line + "' - invalid command"
                invalid = true
                break
              }
              numbers[n] = ms
            }
            if (invalid) break
            fn = commands[command](numbers)
            if (timestamp != null) {
              const actions = newTimestamps.get(timestamp)
              if (actions) {
                actions.push(fn)
              } else {
                newTimestamps.set(timestamp, [fn])
              }
            } else {
              newProgram.push(fn)
            }
            break
          case 'setBlinkWaveRate':
          case 'setBlinkBPMMulti':
          case 'setBlinkDelayWaveRate':
          case 'setBlinkDelayBPMMulti':
          case 'setBlinkGroupDelayWaveRate':
          case 'setBlinkGroupDelayBPMMulti':
          case 'setBlinkOpacity':
          case 'setBlinkX':
          case 'setBlinkY':
          case 'setCaptionWaveRate':
          case 'setCaptionBPMMulti':
          case 'setCaptionDelayWaveRate':
          case 'setCaptionDelayBPMMulti':
          case 'setCaptionOpacity':
          case 'setCaptionX':
          case 'setBigCaptionX':
          case 'setCaptionY':
          case 'setBigCaptionY':
          case 'setCountWaveRate':
          case 'setCountBPMMulti':
          case 'setCountDelayWaveRate':
          case 'setCountDelayBPMMulti':
          case 'setCountGroupDelayWaveRate':
          case 'setCountGroupDelayBPMMulti':
          case 'setCountOpacity':
          case 'setCountX':
          case 'setCountY':
          case 'setCountProgressScale':
          case 'wait':
            if (value == null) {
              error =
                'Error: {' + index + "} '" + line + "' - missing parameter"
              break
            } else if (value.includes(' ')) {
              error =
                'Error: {' + index + "} '" + line + "' - extra parameter(s)"
              break
            } else if (/^-?\d+\s*$/.exec(value) == null) {
              error = 'Error: {' + index + "} '" + line + "' - invalid command"
              break
            }
            ms = parseInt(value)
            if (isNaN(ms)) {
              error = 'Error: {' + index + "} '" + line + "' - invalid command"
              break
            }
            fn = commands[command](ms)
            if (timestamp != null) {
              const actions = newTimestamps.get(timestamp)
              if (actions) {
                actions.push(fn)
              } else {
                newTimestamps.set(timestamp, [fn])
              }
            } else {
              newProgram.push(fn)
            }
            break
          case 'setBlinkTF':
          case 'setBlinkDelayTF':
          case 'setBlinkGroupDelayTF':
          case 'setCaptionTF':
          case 'setCaptionDelayTF':
          case 'setCountTF':
          case 'setCountDelayTF':
          case 'setCountGroupDelayTF':
            if (value == null) {
              error =
                'Error: {' + index + "} '" + line + "' - missing parameter"
              break
            }
            const tf = getTimingFromString(value)
            if (tf == null) {
              error =
                'Error: {' +
                index +
                "} '" +
                line +
                "' - invalid timing function"
              break
            }
            fn = commands[command](tf)
            if (timestamp != null) {
              const actions = newTimestamps.get(timestamp)
              if (actions) {
                actions.push(fn)
              } else {
                newTimestamps.set(timestamp, [fn])
              }
            } else {
              newProgram.push(fn)
            }
            break
          case 'setShowCountProgress':
          case 'setCountProgressOffset':
          case 'setCountColorMatch':
            if (value == null) {
              error =
                'Error: {' + index + "} '" + line + "' - missing parameter"
              break
            }
            value = value.toLowerCase()
            if (
              value !== 'true' &&
              value !== 'false' &&
              value !== 't' &&
              value !== 'f'
            ) {
              error =
                'Error: {' + index + "} '" + line + "' - invalid parameter"
              break
            }
            fn = commands[command](value === 'true' || value === 't')
            if (timestamp != null) {
              const actions = newTimestamps.get(timestamp)
              if (actions) {
                actions.push(fn)
              } else {
                newTimestamps.set(timestamp, [fn])
              }
            } else {
              newProgram.push(fn)
            }
            break
          case 'setCountProgressColor':
            if (value == null) {
              error =
                'Error: {' + index + "} '" + line + "' - missing parameters"
              break
            } else if (value.split(' ').length > 2) {
              error =
                'Error: {' + index + "} '" + line + "' - extra parameter(s)"
              break
            } else if (/^\d+\s*#([a-f0-9]{3}){1,2}\s*$/i.exec(value) == null) {
              error = 'Error: {' + index + "} '" + line + "' - invalid command"
              break
            }
            const args: any[] = value.split(' ')
            ms = parseInt(args[0])
            if (isNaN(ms)) {
              error = 'Error: {' + index + "} '" + line + "' - invalid command"
              break
            }
            args[0] = ms
            fn = commands[command](args)
            if (timestamp != null) {
              const actions = newTimestamps.get(timestamp)
              if (actions) {
                actions.push(fn)
              } else {
                newTimestamps.set(timestamp, [fn])
              }
            } else {
              newProgram.push(fn)
            }
            break
          default:
            error = 'Error: {' + index + "} '" + line + "' - unknown command"
        }
        if (error != null) {
          break
        }
      }

      if (error == null && (containsAction || containsTimestampAction)) {
        if (
          newTimestamps.size > 0 &&
          containsAction &&
          containsTimestampAction
        ) {
          setState({
            ...state,
            program: newProgram,
            timestampFn: newTimestamps,
            timestamps: Array.from(newTimestamps.keys()).sort((a, b) => {
              if (a > b) {
                return 1
              } else if (a < b) {
                return -1
              } else {
                return 0
              }
            })
          })
          _timeStarted.current = new Date()
          timestampLoop()
          captionLoop()
        } else if (newTimestamps.size > 0 && containsTimestampAction) {
          setState({
            ...state,
            timestampFn: newTimestamps,
            timestamps: Array.from(newTimestamps.keys()).sort((a, b) => {
              if (a > b) {
                return 1
              } else if (a < b) {
                return -1
              } else {
                return 0
              }
            })
          })
          _timeStarted.current = new Date()
          timestampLoop()
        } else if (containsAction) {
          setState({ ...state, program: newProgram })
          captionLoop()
        }
      } else if (error != null) {
        if (props.onError) {
          props.onError(error)
        } else {
          console.error(error)
        }
      }
    })
  }

  const timestampLoop = () => {
    const doLoop = (passed: number): number => {
      let index = state.timestampCounter
      let fns
      while (
        state.timestamps.length >= index &&
        passed > state.timestamps[index + 1]
      ) {
        index++
      }
      fns = state.timestampFn.get(state.timestamps[index]) as Function[]
      _nextTimestamp.current = state.timestamps[index + 1]

      for (const fn of fns) {
        fn(() => {
          const newCounter = index
          if (newCounter >= state.timestamps.length - 1) {
            if (stopAtEnd) {
              dispatch(setRouteGoBack())
              return
            }
            if (nextSceneAtEnd) {
              dispatch(nextScene(props.sceneID))
              return
            }
            if (
              ((props.repeat === RP.all && !props.singleTrack) ||
                props.repeat === RP.none) &&
              props.nextTrack
            ) {
              props.nextTrack()
              return
            }
          }
          setState({ ...state, timestampCounter: newCounter })
        })
      }
      return index
    }

    if (props.getCurrentTimestamp && syncWithAudio) {
      const passed = props.getCurrentTimestamp()
      if (
        _lastTimestamp.current == null ||
        Math.abs(_lastTimestamp.current - passed) > 1000
      ) {
        // Timestamp has changed, reset
        let index = 0
        if (passed > state.timestamps[0]) {
          while (
            state.timestamps.length >= index &&
            passed > state.timestamps[index + 1]
          ) {
            const actions = state.timestampFn.get(state.timestamps[index]) || []
            for (const fn of actions) {
              if (/const command = \(\)/g.exec(fn.toString()) == null) {
                fn(() => {})
              }
            }
            index++
          }
          _nextTimestamp.current = state.timestamps[index + 1]
        } else {
          _nextTimestamp.current = state.timestamps[index]
        }
        setState({ ...state, timestampCounter: index })
      } else if (passed > (_nextTimestamp.current as number)) {
        const index = doLoop(passed)
        if (index >= state.timestamps.length - 1) {
          _nextTimestamp.current = 99999999
        }
      }
      _lastTimestamp.current = passed
      _timestampTimeout.current = window.setTimeout(timestampLoop, 100)
    } else {
      if (_nextTimestamp.current == null) {
        _nextTimestamp.current = state.timestamps[state.timestampCounter]
      }
      const passed = new Date().getTime() - _timeStarted.current!.getTime()
      if (passed > _nextTimestamp.current) {
        const index = doLoop(passed)
        if (index >= state.timestamps.length - 1) {
          return
        }
      }
      _timestampTimeout.current = window.setTimeout(timestampLoop, 100)
    }
  }

  const captionLoop = () => {
    if (state.program[state.programCounter]) {
      state.program[state.programCounter](() => {
        let newCounter = state.programCounter + 1
        if (newCounter >= state.program.length) {
          if (stopAtEnd) {
            dispatch(setRouteGoBack())
            return
          }
          if (nextSceneAtEnd) {
            dispatch(nextScene(props.sceneID))
            if (!props.persist) return
          }
          if (
            ((props.repeat === RP.all && !props.singleTrack) ||
              props.repeat === RP.none) &&
            props.nextTrack
          ) {
            props.nextTrack()
            return
          }
          newCounter = 0
        }
        setState({
          ...state,
          programCounter: newCounter,
          countChild: state.countChild === 0 ? 1 : 0
        })
        captionLoop()
      })
    }
  }

  const getPhrase = (value: string) => {
    const registerRegex = /^\$(\d)$/.exec(value)
    if (value === '$RANDOM_PHRASE') {
      return getRandomListItem(state.phrases.get(0) as string[])
    } else if (registerRegex != null) {
      const register = parseInt(registerRegex[1])
      return getRandomListItem(state.phrases.get(register) as string[])
    } else if (value === '$TAG_PHRASE') {
      if (props.currentImage) {
        const tag = getRandomListItem(currentImageTags)
        if (tag) {
          const phraseString = tag.phraseString
          return getRandomListItem(phraseString.split('\n'))
        }
      }
      return ''
    } else {
      return value
    }
  }

  const showText = (value: string, ms: number, opacity: number) => {
    return (nextCommand: Function) => {
      const element = _el.current as HTMLDivElement
      element.style.opacity = (opacity / 100).toString()
      element.innerHTML = htmlEntities(value)
      const waitFn = commands.wait(ms)
      waitFn(() => {
        element.style.opacity = '0'
        nextCommand()
      })
    }
  }

  const advance = () => {
    return (nextCommand: Function) => {
      if (props.advance) {
        props.advance()
      }
      const waitFn = commands.wait(0)
      waitFn(() => nextCommand())
    }
  }

  const commands = {
    wait: (ms: number) => {
      return (nextCommand: Function) => {
        clearTimeout(_timeout.current)
        _timeout.current = window.setTimeout(nextCommand, ms)
      }
    },
    cap: (value: string, timestamp = false) => {
      return (nextCommand: Function) => {
        const command = () => {
          if (state.countProgress) {
            setState({ ...state, countProgress: false })
          }
          const duration = getDuration(
            {
              timingFunction: state.captionTF,
              time: state.captionDuration[0],
              timeMin: state.captionDuration[0],
              timeMax: state.captionDuration[1],
              sinRate: state.captionWaveRate,
              bpmMulti: state.captionBPMMulti
            },
            timeToNextFrame,
            bpm
          )
          const showTextFn = showText(
            getPhrase(value),
            duration,
            state.captionOpacity
          )
          const delay = timestamp
            ? 0
            : getDuration(
                {
                  timingFunction: state.captionDelayTF,
                  time: state.captionDelay[0],
                  timeMin: state.captionDelay[0],
                  timeMax: state.captionDelay[1],
                  sinRate: state.captionDelayWaveRate,
                  bpmMulti: state.captionDelayBPMMulti
                },
                timeToNextFrame,
                bpm
              )
          const waitFn = commands.wait(delay)
          const element = _el.current as HTMLDivElement
          element.style.color = fsCaption.color
          element.style.fontSize = fsCaption.fontSize * props.scale + 'vmin'
          element.style.fontFamily = fsCaption.fontFamily
          element.style.display = 'table-cell'
          element.style.textAlign = 'center'
          element.style.verticalAlign = 'bottom'
          const yPos = (14 + state.captionY) * props.scale
          if (yPos > 0) {
            element.style.paddingBottom = yPos + 'vmin'
            element.style.paddingTop = 'unset'
          } else {
            element.style.paddingBottom = 'unset'
            element.style.paddingTop = yPos * -1 + 'vmin'
          }
          const xPos = state.captionX * props.scale
          if (xPos > 0) {
            element.style.paddingLeft = xPos + 'vmin'
            element.style.paddingRight = 'unset'
          } else {
            element.style.paddingLeft = 'unset'
            element.style.paddingRight = xPos * -1 + 'vmin'
          }
          // _el.current.style.transition = 'opacity 0.5s ease-in-out';
          if (fsCaption.border) {
            element.style.webkitTextStroke =
              fsCaption.borderpx * props.scale + 'px ' + fsCaption.borderColor
          } else {
            element.style.webkitTextStroke = 'unset'
          }
          if (state.captionDelayTF === TF.scene && !timestamp) {
            showTextFn(() => nextCommand())
          } else {
            showTextFn(() => {
              waitFn(nextCommand)
            })
          }
        }
        if (state.captionDelayTF === TF.scene && !timestamp) {
          _sceneCommand.current = command
        } else {
          command()
        }
      }
    },
    bigcap: (value: string, timestamp = false) => {
      return (nextCommand: Function) => {
        const command = () => {
          if (state.countProgress) {
            setState({ ...state, countProgress: false })
          }
          const duration = getDuration(
            {
              timingFunction: state.captionTF,
              time: state.captionDuration[0],
              timeMin: state.captionDuration[0],
              timeMax: state.captionDuration[1],
              sinRate: state.captionWaveRate,
              bpmMulti: state.captionBPMMulti
            },
            timeToNextFrame,
            bpm
          )
          const showTextFn = showText(
            getPhrase(value),
            duration,
            state.captionOpacity
          )
          const delay = timestamp
            ? 0
            : getDuration(
                {
                  timingFunction: state.captionDelayTF,
                  time: state.captionDelay[0],
                  timeMin: state.captionDelay[0],
                  timeMax: state.captionDelay[1],
                  sinRate: state.captionDelayWaveRate,
                  bpmMulti: state.captionDelayBPMMulti
                },
                timeToNextFrame,
                bpm
              )
          const waitFn = commands.wait(delay)
          const element = _el.current as HTMLDivElement
          element.style.color = fsCaptionBig.color
          element.style.fontSize = fsCaptionBig.fontSize * props.scale + 'vmin'
          element.style.fontFamily = fsCaptionBig.fontFamily
          element.style.display = 'table-cell'
          element.style.textAlign = 'center'
          element.style.verticalAlign = 'middle'
          const yPos = state.bigCaptionY * props.scale
          if (yPos > 0) {
            element.style.paddingBottom = yPos + 'vmin'
            element.style.paddingTop = 'unset'
          } else {
            element.style.paddingBottom = 'unset'
            element.style.paddingTop = yPos * -1 + 'vmin'
          }
          const xPos = state.bigCaptionX * props.scale
          if (xPos > 0) {
            element.style.paddingLeft = xPos + 'vmin'
            element.style.paddingRight = 'unset'
          } else {
            element.style.paddingLeft = 'unset'
            element.style.paddingRight = xPos * -1 + 'vmin'
          }
          element.style.transition = 'opacity 0.1s ease-out'
          if (fsCaptionBig.border) {
            element.style.webkitTextStroke =
              fsCaptionBig.borderpx * props.scale +
              'px ' +
              fsCaptionBig.borderColor
          } else {
            element.style.webkitTextStroke = 'unset'
          }
          if (state.captionDelayTF === TF.scene && !timestamp) {
            showTextFn(() => nextCommand())
          } else {
            showTextFn(() => {
              waitFn(nextCommand)
            })
          }
        }
        if (state.captionDelayTF === TF.scene && !timestamp) {
          _sceneCommand.current = command
        } else {
          command()
        }
      }
    },
    blink: (value: string, timestamp = false) => {
      return (nextCommand: Function) => {
        const command = () => {
          if (state.countProgress) {
            setState({ ...state, countProgress: false })
          }
          const fns = new Array<Function>()
          let i = 0
          const phrase = getPhrase(value).split('/')
          const length = phrase.length
          for (let word of phrase) {
            word = getPhrase(word.trim())
            const j = i
            i += 1
            fns.push(() => {
              const duration = getDuration(
                {
                  timingFunction: state.blinkTF,
                  time: state.blinkDuration[0],
                  timeMin: state.blinkDuration[0],
                  timeMax: state.blinkDuration[1],
                  sinRate: state.blinkWaveRate,
                  bpmMulti: state.blinkBPMMulti
                },
                timeToNextFrame,
                bpm
              )
              const showTextFn = showText(word, duration, state.blinkOpacity)
              if (
                j === length - 1 &&
                (state.blinkDelayTF === TF.scene ||
                  state.blinkGroupDelayTF === TF.scene ||
                  timestamp)
              ) {
                showTextFn(() => nextCommand())
              } else if (state.blinkDelayTF === TF.scene) {
                showTextFn(() => (_sceneCommand.current = fns[j + 1]))
              } else {
                const delay = getDuration(
                  {
                    timingFunction: state.blinkDelayTF,
                    time: state.blinkDelay[0],
                    timeMin: state.blinkDelay[0],
                    timeMax: state.blinkDelay[1],
                    sinRate: state.blinkDelayWaveRate,
                    bpmMulti: state.blinkDelayBPMMulti
                  },
                  timeToNextFrame,
                  bpm
                )
                const waitFn = commands.wait(delay)
                showTextFn(() => {
                  waitFn(fns[j + 1])
                })
              }
            })
          }

          if (
            state.blinkGroupDelayTF !== TF.scene &&
            state.blinkDelayTF !== TF.scene &&
            !timestamp
          ) {
            const delay = getDuration(
              {
                timingFunction: state.blinkGroupDelayTF,
                time: state.blinkGroupDelay[0],
                timeMin: state.blinkGroupDelay[0],
                timeMax: state.blinkGroupDelay[1],
                sinRate: state.blinkGroupDelayWaveRate,
                bpmMulti: state.blinkGroupDelayBPMMulti
              },
              timeToNextFrame,
              bpm
            )
            const lastWaitFn = commands.wait(delay)
            fns.push(() => {
              lastWaitFn(nextCommand)
            })
          }

          const element = _el.current as HTMLDivElement
          element.style.color = fsBlink.color
          element.style.fontSize = fsBlink.fontSize * props.scale + 'vmin'
          element.style.fontFamily = fsBlink.fontFamily
          element.style.display = 'table-cell'
          element.style.textAlign = 'center'
          element.style.verticalAlign = 'middle'
          const yPos = state.blinkY * props.scale
          if (yPos > 0) {
            element.style.paddingBottom = yPos + 'vmin'
            element.style.paddingTop = 'unset'
          } else {
            element.style.paddingBottom = 'unset'
            element.style.paddingTop = yPos * -1 + 'vmin'
          }
          const xPos = state.blinkX * props.scale
          if (xPos > 0) {
            element.style.paddingLeft = xPos + 'vmin'
            element.style.paddingRight = 'unset'
          } else {
            element.style.paddingLeft = 'unset'
            element.style.paddingRight = xPos * -1 + 'vmin'
          }
          element.style.transition = 'opacity 0.1s ease-out'
          if (fsBlink.border) {
            element.style.webkitTextStroke =
              fsBlink.borderpx * props.scale + 'px ' + fsBlink.borderColor
          } else {
            element.style.webkitTextStroke = 'unset'
          }
          fns[0]()
        }
        if (
          (state.blinkGroupDelayTF === TF.scene ||
            state.blinkDelayTF === TF.scene) &&
          !timestamp
        ) {
          _sceneCommand.current = command
        } else {
          command()
        }
      }
    },
    count: (start: number, end: number, timestamp = false) => {
      const values = Array<number>()
      const origStart = start
      const origEnd = end
      do {
        values.push(start)
        if (start === end) {
          break
        } else if (start < end) {
          start += 1
        } else if (start > end) {
          start -= 1
        }
      } while (true)

      return (nextCommand: Function) => {
        const command = () => {
          let offset = 0
          if (state.showCountProgress) {
            offset = state.countProgressOffset
              ? Math.min(origStart, origEnd)
              : 0
            setState({
              ...state,
              countProgress: true,
              countCurrent: origStart - offset,
              countTotal: Math.max(origStart, origEnd) - offset,
              countColor: fsCount.color
            })
          } else if (state.countProgress) {
            setState({ ...state, countProgress: false })
          }
          const fns = new Array<Function>()
          let i = 0
          const length = values.length
          for (const val of values) {
            const j = i
            i += 1
            fns.push(() => {
              const duration = getDuration(
                {
                  timingFunction: state.countTF,
                  time: state.countDuration[0],
                  timeMin: state.countDuration[0],
                  timeMax: state.countDuration[1],
                  sinRate: state.countWaveRate,
                  bpmMulti: state.countBPMMulti
                },
                timeToNextFrame,
                bpm
              )
              if (state.showCountProgress) {
                if (state.countColors.has(val)) {
                  const countColor = state.countColors.get(val) as string
                  setState({
                    ...state,
                    countCurrent: val - offset,
                    countColor
                  })
                  if (state.countColorMatch) {
                    const element = _el.current as HTMLDivElement
                    element.style.color = countColor
                  }
                } else {
                  setState({ ...state, countCurrent: val - offset })
                }
              } else {
                if (state.countColorMatch) {
                  const element = _el.current as HTMLDivElement
                  element.style.color = state.countColors.get(val) as string
                }
              }
              const showTextFn = showText(
                val.toString(),
                duration,
                state.countOpacity
              )
              if (
                j === length - 1 &&
                (state.countDelayTF === TF.scene ||
                  state.countGroupDelayTF === TF.scene ||
                  timestamp)
              ) {
                showTextFn(() => nextCommand())
              } else if (state.countDelayTF === TF.scene) {
                showTextFn(() => (_sceneCommand.current = fns[j + 1]))
              } else {
                const delay = getDuration(
                  {
                    timingFunction: state.countDelayTF,
                    time: state.countDelay[0],
                    timeMin: state.countDelay[0],
                    timeMax: state.countDelay[1],
                    sinRate: state.countDelayWaveRate,
                    bpmMulti: state.countDelayBPMMulti
                  },
                  timeToNextFrame,
                  bpm
                )
                const waitFn = commands.wait(delay)
                showTextFn(() => {
                  waitFn(fns[j + 1])
                })
              }
            })
          }

          if (
            state.countGroupDelayTF !== TF.scene &&
            state.countDelayTF !== TF.scene &&
            !timestamp
          ) {
            const delay = getDuration(
              {
                timingFunction: state.countGroupDelayTF,
                time: state.countGroupDelay[0],
                timeMin: state.countGroupDelay[0],
                timeMax: state.countGroupDelay[1],
                sinRate: state.countGroupDelayWaveRate,
                bpmMulti: state.countGroupDelayBPMMulti
              },
              timeToNextFrame,
              bpm
            )
            const lastWaitFn = commands.wait(delay)
            fns.push(() => {
              lastWaitFn(nextCommand)
            })
          }

          const element = _el.current as HTMLDivElement
          element.style.color = fsCount.color
          element.style.fontSize = fsCount.fontSize * props.scale + 'vmin'
          element.style.fontFamily = fsCount.fontFamily
          element.style.display = 'table-cell'
          element.style.textAlign = 'center'
          element.style.verticalAlign = 'middle'
          const yPos = state.countY * props.scale
          if (yPos > 0) {
            element.style.paddingBottom = yPos + 'vmin'
            element.style.paddingTop = 'unset'
          } else {
            element.style.paddingBottom = 'unset'
            element.style.paddingTop = yPos * -1 + 'vmin'
          }
          const xPos = state.countX * props.scale
          if (xPos > 0) {
            element.style.paddingLeft = xPos + 'vmin'
            element.style.paddingRight = 'unset'
          } else {
            element.style.paddingLeft = 'unset'
            element.style.paddingRight = xPos * -1 + 'vmin'
          }
          element.style.transition = 'opacity 0.1s ease-out'
          if (fsCount.border) {
            element.style.webkitTextStroke =
              fsCount.borderpx * props.scale + 'px ' + fsCount.borderColor
          } else {
            element.style.webkitTextStroke = 'unset'
          }
          fns[0]()
        }
        if (
          (state.countGroupDelayTF === TF.scene ||
            state.countDelayTF === TF.scene) &&
          !timestamp
        ) {
          _sceneCommand.current = command
        } else {
          command()
        }
      }
    },
    playAudio: (alias: string, volume: number) => {
      return (nextCommand: Function) => {
        const newAudios = Array.from(state.audios)
        const audio = newAudios.find((a) => a.alias === alias)
        if (audio) {
          audio.playing = true
          audio.volume = volume
          setState({ ...state, audios: newAudios })
        }

        nextCommand()
      }
    },
    setBlinkY: (relYPos: number) => {
      return (nextCommand: Function) => {
        setState({ ...state, blinkY: relYPos })
        nextCommand()
      }
    },
    setCaptionY: (relYPos: number) => {
      return (nextCommand: Function) => {
        setState({ ...state, captionY: relYPos })
        nextCommand()
      }
    },
    setBigCaptionY: (relYPos: number) => {
      return (nextCommand: Function) => {
        setState({ ...state, bigCaptionY: relYPos })
        nextCommand()
      }
    },
    setCountY: (relYPos: number) => {
      return (nextCommand: Function) => {
        setState({ ...state, countY: relYPos })
        nextCommand()
      }
    },
    setBlinkX: (relXPos: number) => {
      return (nextCommand: Function) => {
        setState({ ...state, blinkX: relXPos })
        nextCommand()
      }
    },
    setCaptionX: (relXPos: number) => {
      return (nextCommand: Function) => {
        setState({ ...state, captionX: relXPos })
        nextCommand()
      }
    },
    setBigCaptionX: (relXPos: number) => {
      return (nextCommand: Function) => {
        setState({ ...state, bigCaptionX: relXPos })
        nextCommand()
      }
    },
    setCountX: (relXPos: number) => {
      return (nextCommand: Function) => {
        setState({ ...state, countX: relXPos })
        nextCommand()
      }
    },
    /* Blink */
    setBlinkDuration: (ms: number[]) => {
      return (nextCommand: Function) => {
        if (ms.length === 1) {
          ms.push(state.blinkDuration[1])
        }
        setState({ ...state, blinkDuration: ms })
        nextCommand()
      }
    },
    setBlinkWaveRate: (waveRate: number) => {
      return (nextCommand: Function) => {
        setState({ ...state, blinkWaveRate: waveRate })
        nextCommand()
      }
    },
    setBlinkBPMMulti: (bpmMulti: number) => {
      return (nextCommand: Function) => {
        setState({ ...state, blinkBPMMulti: bpmMulti })
        nextCommand()
      }
    },
    setBlinkTF: (tf: string) => {
      return (nextCommand: Function) => {
        setState({ ...state, blinkTF: tf })
        nextCommand()
      }
    },
    /* Blink Delay */
    setBlinkDelay: (ms: number[]) => {
      return (nextCommand: Function) => {
        if (ms.length === 1) {
          ms.push(state.blinkDelay[1])
        }
        setState({ ...state, blinkDelay: ms })
        nextCommand()
      }
    },
    setBlinkDelayWaveRate: (waveRate: number) => {
      return (nextCommand: Function) => {
        setState({ ...state, blinkDelayWaveRate: waveRate })
        nextCommand()
      }
    },
    setBlinkDelayBPMMulti: (bpmMulti: number) => {
      return (nextCommand: Function) => {
        setState({ ...state, blinkDelayBPMMulti: bpmMulti })
        nextCommand()
      }
    },
    setBlinkDelayTF: (tf: string) => {
      return (nextCommand: Function) => {
        setState({ ...state, blinkDelayTF: tf })
        nextCommand()
      }
    },
    /* Blink Group Delay */
    setBlinkGroupDelay: (ms: number[]) => {
      return (nextCommand: Function) => {
        if (ms.length === 1) {
          ms.push(state.blinkGroupDelay[1])
        }
        setState({ ...state, blinkGroupDelay: ms })
        nextCommand()
      }
    },
    setBlinkGroupDelayWaveRate: (waveRate: number) => {
      return (nextCommand: Function) => {
        setState({ ...state, blinkGroupDelayWaveRate: waveRate })
        nextCommand()
      }
    },
    setBlinkGroupDelayBPMMulti: (bpmMulti: number) => {
      return (nextCommand: Function) => {
        setState({ ...state, blinkGroupDelayBPMMulti: bpmMulti })
        nextCommand()
      }
    },
    setBlinkGroupDelayTF: (tf: string) => {
      return (nextCommand: Function) => {
        setState({ ...state, blinkGroupDelayTF: tf })
        nextCommand()
      }
    },
    /* Caption */
    setCaptionDuration: (ms: number[]) => {
      return (nextCommand: Function) => {
        if (ms.length === 1) {
          ms.push(state.captionDuration[1])
        }
        setState({ ...state, captionDuration: ms })
        nextCommand()
      }
    },
    setCaptionWaveRate: (waveRate: number) => {
      return (nextCommand: Function) => {
        setState({ ...state, captionWaveRate: waveRate })
        nextCommand()
      }
    },
    setCaptionBPMMulti: (bpmMulti: number) => {
      return (nextCommand: Function) => {
        setState({ ...state, captionBPMMulti: bpmMulti })
        nextCommand()
      }
    },
    setCaptionTF: (tf: string) => {
      return (nextCommand: Function) => {
        setState({ ...state, captionTF: tf })
        nextCommand()
      }
    },
    /* Caption Delay */
    setCaptionDelay: (ms: number[]) => {
      return (nextCommand: Function) => {
        if (ms.length === 1) {
          ms.push(state.captionDelay[1])
        }
        setState({ ...state, captionDelay: ms })
        nextCommand()
      }
    },
    setCaptionDelayWaveRate: (waveRate: number) => {
      return (nextCommand: Function) => {
        setState({ ...state, captionDelayWaveRate: waveRate })
        nextCommand()
      }
    },
    setCaptionDelayBPMMulti: (bpmMulti: number) => {
      return (nextCommand: Function) => {
        setState({ ...state, captionDelayBPMMulti: bpmMulti })
        nextCommand()
      }
    },
    setCaptionDelayTF: (tf: string) => {
      return (nextCommand: Function) => {
        setState({ ...state, captionDelayTF: tf })
        nextCommand()
      }
    },
    /* Count */
    setCountDuration: (ms: number[]) => {
      return (nextCommand: Function) => {
        if (ms.length === 1) {
          ms.push(state.countDuration[1])
        }
        setState({ ...state, countDuration: ms })
        nextCommand()
      }
    },
    setCountWaveRate: (waveRate: number) => {
      return (nextCommand: Function) => {
        setState({ ...state, countWaveRate: waveRate })
        nextCommand()
      }
    },
    setCountBPMMulti: (bpmMulti: number) => {
      return (nextCommand: Function) => {
        setState({ ...state, countBPMMulti: bpmMulti })
        nextCommand()
      }
    },
    setCountTF: (tf: string) => {
      return (nextCommand: Function) => {
        setState({ ...state, countTF: tf })
        nextCommand()
      }
    },
    /* Count Delay */
    setCountDelay: (ms: number[]) => {
      return (nextCommand: Function) => {
        if (ms.length === 1) {
          ms.push(state.countDelay[1])
        }
        setState({ ...state, countDelay: ms })
        nextCommand()
      }
    },
    setCountDelayWaveRate: (waveRate: number) => {
      return (nextCommand: Function) => {
        setState({ ...state, countDelayWaveRate: waveRate })
        nextCommand()
      }
    },
    setCountDelayBPMMulti: (bpmMulti: number) => {
      return (nextCommand: Function) => {
        setState({ ...state, countDelayBPMMulti: bpmMulti })
        nextCommand()
      }
    },
    setCountDelayTF: (tf: string) => {
      return (nextCommand: Function) => {
        setState({ ...state, countDelayTF: tf })
        nextCommand()
      }
    },
    /* Count Group Delay */
    setCountGroupDelay: (ms: number[]) => {
      return (nextCommand: Function) => {
        if (ms.length === 1) {
          ms.push(state.countGroupDelay[1])
        }
        setState({ ...state, countGroupDelay: ms })
        nextCommand()
      }
    },
    setCountGroupDelayWaveRate: (waveRate: number) => {
      return (nextCommand: Function) => {
        setState({ ...state, countGroupDelayWaveRate: waveRate })
        nextCommand()
      }
    },
    setCountGroupDelayBPMMulti: (bpmMulti: number) => {
      return (nextCommand: Function) => {
        setState({ ...state, countGroupDelayBPMMulti: bpmMulti })
        nextCommand()
      }
    },
    setCountGroupDelayTF: (tf: string) => {
      return (nextCommand: Function) => {
        setState({ ...state, countGroupDelayTF: tf })
        nextCommand()
      }
    },
    setShowCountProgress: (show: boolean) => {
      return (nextCommand: Function) => {
        setState({ ...state, showCountProgress: show })
        nextCommand()
      }
    },
    setCountProgressScale: (scale: number) => {
      return (nextCommand: Function) => {
        setState({ ...state, countProgressScale: scale })
        nextCommand()
      }
    },
    setCountProgressColor: (args: any[]) => {
      return (nextCommand: Function) => {
        const newColors = state.countColors
        newColors.set(args[0], args[1])
        setState({ ...state, countColors: newColors })
        nextCommand()
      }
    },
    setCountProgressOffset: (offset: boolean) => {
      return (nextCommand: Function) => {
        setState({ ...state, countProgressOffset: offset })
        nextCommand()
      }
    },
    setCountColorMatch: (match: boolean) => {
      return (nextCommand: Function) => {
        setState({ ...state, countColorMatch: match })
        nextCommand()
      }
    },
    setBlinkOpacity: (opacity: number) => {
      return (nextCommand: Function) => {
        setState({ ...state, blinkOpacity: opacity })
        nextCommand()
      }
    },
    setCaptionOpacity: (opacity: number) => {
      return (nextCommand: Function) => {
        setState({ ...state, captionOpacity: opacity })
        nextCommand()
      }
    },
    setCountOpacity: (opacity: number) => {
      return (nextCommand: Function) => {
        setState({ ...state, countOpacity: opacity })
        nextCommand()
      }
    }
  }

  const countXPos = state.countX * props.scale
  const countYPos = state.countY * props.scale
  let countXStyle = {}
  let countYStyle = {}
  if (state.showCountProgress) {
    if (countXPos > 0) {
      countXStyle = {
        marginLeft: countXPos + 'vmin',
        marginRight: 'unset'
      }
    } else {
      countXStyle = {
        marginLeft: 'unset',
        marginRight: countXPos * -1 + 'vmin'
      }
    }
    if (countYPos > 0) {
      countYStyle = {
        marginBottom: countYPos + 'vmin',
        marginTop: 'unset'
      }
    } else {
      countYStyle = {
        marginBottom: 'unset',
        marginTop: countYPos * -1 + 'vmin'
      }
    }
  }
  return (
    <React.Fragment>
      <div
        style={{
          zIndex: 6,
          pointerEvents: 'none',
          display: 'table',
          width: '100%',
          height: '100%',
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          overflow: 'hidden',
          opacity: opacity / 100
        }}
      >
        <Box component="div" ref={_el} />
      </div>
      {state.audios.map((a) => {
        return (
          <Sound
            key={a.alias}
            url={a.file}
            playStatus={
              a.playing
                ? (Sound as any).status.PLAYING
                : (Sound as any).status.PAUSED
            }
            volume={a.volume}
            onFinishedPlaying={() => {
              const newAudios = Array.from(state.audios)
              const audio = newAudios.find((au) => a.alias === au.alias)
              if (audio) {
                audio.playing = false
                setState({ ...state, audios: newAudios })
              }
            }}
          />
        )
      })}
      {state.countProgress && (
        <div
          style={{
            zIndex: 6,
            pointerEvents: 'none',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
            height: '100%',
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            overflow: 'hidden',
            opacity: opacity / 100
          }}
        >
          {state.countChild === 0 && (
            <CircularProgress
              style={{
                ...countXStyle,
                ...countYStyle,
                color: state.countColor
              }}
              size={state.countProgressScale * props.scale}
              value={Math.round((state.countCurrent / state.countTotal) * 100)}
              variant="determinate"
            />
          )}
          {state.countChild === 1 && (
            <CircularProgress
              style={{
                ...countXStyle,
                ...countYStyle,
                color: state.countColor
              }}
              size={state.countProgressScale * props.scale}
              value={Math.round((state.countCurrent / state.countTotal) * 100)}
              variant="determinate"
            />
          )}
        </div>
      )}
    </React.Fragment>
  )
}

;(CaptionProgram as any).displayName = 'CaptionProgram'
