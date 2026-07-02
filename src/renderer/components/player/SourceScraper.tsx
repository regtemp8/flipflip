import * as React from "react";
import { v4 as uuidv4 } from "uuid";
import { Dialog, DialogContent } from "@mui/material";

import { randomizeList } from "../../data/utils";
import Config from "../../../common/Config";
import { SOF } from "../../../common/const";
import LibrarySource from "../../../common/LibrarySource";
import Scene from "../../../common/Scene";
import Audio from "../../../common/Audio";
import ChildCallbackHack from "./ChildCallbackHack";
import ImagePlayer from "./ImagePlayer";
import content from "./ContentLookup";

interface SourceScraperProps {
  config: Config;
  scene: Scene;
  currentAudio: Audio;
  opacity: number;
  isPlaying: boolean;
  gridView: boolean;
  hasStarted: boolean;
  historyOffset: number;
  advanceHack: ChildCallbackHack;
  deleteHack?: ChildCallbackHack;
  gridCoordinates?: Array<number>;
  isOverlay?: boolean;
  nextScene?: Scene;
  strobeLayer?: string;
  setHistoryOffset(historyOffset: number): void;
  setHistoryPaths(historyPaths: Array<any>): void;
  firstImageLoaded(): void;
  finishedLoading(empty: boolean): void;
  setProgress(total: number, current: number, message: string[]): void;
  setVideo(video: HTMLVideoElement): void;
  setCount(sourceURL: string, count: number, countComplete: boolean): void;
  cache(i: HTMLImageElement | HTMLVideoElement): void;
  systemMessage(message: string): void;
  onEndScene?(): void;
  setTimeToNextFrame?(timeToNextFrame: number): void;
  setSceneCopy?(children: React.ReactNode): void;
  playNextScene?(): void;
}

interface SourceScraperState {
  contentLookupKey?: string;
  restart: boolean;
  preload: boolean;
  videoVolume: number;
  captcha: any;
  load: boolean;
}

export default class SourceScraper extends React.Component<
  SourceScraperProps,
  SourceScraperState
> {
  constructor(props: SourceScraperProps) {
    super(props);

    this.state = {
      restart: false,
      preload: false,
      videoVolume: props.scene.videoVolume,
      captcha: null as any,
      load: false,
    };
  }

  _isMounted = false;
  _backForth: number = null;
  _sourceQueue: Array<{
    source: LibrarySource;
    helpers: { next: any; count: number; retries: number };
  }> = null;
  _promiseQueue: Array<{
    source: LibrarySource;
    helpers: { next: any; count: number; retries: number };
  }> = null;
  _nextPromiseQueue: Array<{
    source: LibrarySource;
    helpers: { next: any; count: number; retries: number };
  }> = null;
  _nextContentLookupKey: string = null;
  _sourceTimeoutID: number = null;
  _promiseTimeoutID: number = null;
  _nextSourceTimeoutID: number = null;
  _totalSources: number = 0;

  render() {
    let style: any = { opacity: this.props.opacity };
    if (this.props.gridView) {
      style = {
        ...style,
        position: "absolute",
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: this.props.isOverlay ? 4 : "auto",
      };
    }
    return (
      <div style={style}>
        {this.state.restart == false && (
          <ImagePlayer
            config={this.props.config}
            scene={this.props.scene}
            currentAudio={this.props.currentAudio}
            isOverlay={this.props.isOverlay}
            isPlaying={this.props.isPlaying}
            gridView={this.props.gridView}
            historyOffset={this.props.historyOffset}
            setHistoryOffset={this.props.setHistoryOffset}
            setHistoryPaths={this.props.setHistoryPaths}
            advanceHack={this.props.advanceHack}
            deleteHack={this.props.deleteHack}
            strobeLayer={this.props.strobeLayer}
            hasStarted={this.props.hasStarted}
            onLoaded={this.props.firstImageLoaded.bind(this)}
            setVideo={this.props.setVideo}
            cache={this.props.cache}
            onEndScene={this.props.onEndScene}
            playNextScene={this.props.playNextScene}
            gridCoordinates={this.props.gridCoordinates}
            setSceneCopy={this.props.setSceneCopy}
            setTimeToNextFrame={this.props.setTimeToNextFrame}
            contentLookupKey={this.state.contentLookupKey}
          />
        )}
        {this.state.captcha != null && (
          <Dialog open={true} onClose={this.onCloseDialog.bind(this)}>
            <DialogContent style={{ height: 600 }}>
              <iframe
                sandbox="allow-forms"
                src={this.state.captcha.captcha}
                height={"100%"}
                onLoad={this.onIFrameLoad.bind(this)}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>
    );
  }

  onIFrameLoad() {
    if (this.state.load) {
      this.onCloseDialog();
    } else {
      this.setState({ load: true });
    }
  }

  onCloseDialog() {
    this.setState({ captcha: null, load: false });
  }

  async componentDidMount(restart = false) {
    this._isMounted = true;
    // Create an instance of your worker
    if (!restart) {
      this._sourceQueue = new Array<{
        source: LibrarySource;
        helpers: { next: any; count: number; retries: number };
      }>();
      this._promiseQueue = new Array<{
        source: LibrarySource;
        helpers: { next: any; count: number; retries: number };
      }>();
      this._nextPromiseQueue = new Array<{
        source: LibrarySource;
        helpers: { next: any; count: number; retries: number };
      }>();
      this._nextContentLookupKey = uuidv4();
      content().initContent(this._nextContentLookupKey);
      const contentLookupKey = uuidv4();
      content().initContent(contentLookupKey);
      this.setState({ contentLookupKey });
    }

    const sourceLoop = () => {
      if (!this._isMounted || this._sourceQueue.length == 0) return;

      const d = this._sourceQueue.shift();

      let message = d ? [d.source.url] : [""];
      if (this.props.isOverlay) {
        message = ["Loading '" + this.props.scene.name + "'", ...message];
      }
      this.props.setProgress(
        this._totalSources,
        this._totalSources - this._sourceQueue.length,
        message,
      );

      if (!this.props.scene.playVideoClips && d.source.clips) {
        d.source.clips = [];
      }

      window.ipc.scrapeFiles(
        this.props.config,
        d.source,
        this.props.scene.imageTypeFilter,
        this.props.scene.weightFunction,
        d.helpers,
        this.state.contentLookupKey,
        (object: any) => {
          if (object?.captcha != null && this.state.captcha == null) {
            this.setState({
              captcha: {
                captcha: object.captcha,
                source: object?.source,
                helpers: object?.helpers,
              },
            });
          }

          if (object?.error != null) {
            console.error(
              "Error retrieving " +
                object?.source?.url +
                (object?.helpers?.next > 0
                  ? " Page " + object.helpers.next
                  : ""),
            );
            console.error(object.error);
          }

          if (object?.warning != null) {
            console.warn(object.warning);
          }

          if (object?.systemMessage != null) {
            this.props.systemMessage(object.systemMessage);
          }

          if (object?.source) {
            this.props.setCount(
              object.source.url,
              object.helpers.count,
              object.helpers.next == null,
            );

            // Just add the new urls to the end of the list
            if (object?.allURLs) {
              content().addURLs(object.uuid, object.allURLs);
              content().addPosts(object.uuid, object.allPosts);

              // If this is a remote URL, queue up the next promise
              if (object.helpers.next != null) {
                this._promiseQueue.push({
                  source: object.source,
                  helpers: object.helpers,
                });
              }
            }

            if (this._sourceQueue.length > 0) {
              const timeout = object?.timeout ?? 1000;
              this._sourceTimeoutID = window.setTimeout(sourceLoop, timeout);
            } else {
              if (this._promiseQueue.length == 0) {
                content().setSingleImage(object.uuid);
              }
              this.props.finishedLoading(
                content().isEmpty(object.uuid),
              );
              this._promiseTimeoutID = window.setTimeout(promiseLoop, 1000);
              if (this.props.nextScene && this.props.playNextScene) {
                this._nextSourceTimeoutID = window.setTimeout(
                  nextSourceLoop,
                  1000,
                );
              }
            }
          }
        },
      );
    };

    const nextSourceLoop = () => {
      if (!this._isMounted || this._nextPromiseQueue.length == 0) {
        return;
      }

      const promiseData = this._nextPromiseQueue.shift();
      if (!this.props.nextScene.playVideoClips && promiseData.source.clips) {
        promiseData.source.clips = [];
      }

      window.ipc.scrapeFiles(
        this.props.config,
        promiseData.source,
        this.props.nextScene.imageTypeFilter,
        this.props.nextScene.weightFunction,
        promiseData.helpers,
        this._nextContentLookupKey,
        (object: any) => {
          if (object?.error != null) {
            console.error(
              "Error retrieving " +
                object?.source?.url +
                (object?.helpers?.next > 0
                  ? " Page " + object.helpers.next
                  : ""),
            );
            console.error(object.error);
          }

          if (object?.warning != null) {
            console.warn(object.warning);
          }

          if (object?.systemMessage != null) {
            this.props.systemMessage(object.systemMessage);
          }

          if (object?.source) {
            this.props.setCount(
              object.source.url,
              object.helpers.count,
              object.helpers.next == null,
            );

            // Just add the new urls to the end of the list
            if (object?.allURLs != null) {
              content().addURLs(object.uuid, object.allURLs);
              content().addPosts(object.uuid, object.allPosts);

              // If this is a remote URL, queue up the next promise
              if (object.helpers.next != null) {
                this._nextPromiseQueue.push({
                  source: object.source,
                  helpers: object.helpers,
                });
              }
            }

            this._nextSourceTimeoutID = window.setTimeout(
              nextSourceLoop,
              object.timeout ?? 1000,
            );
          }
        },
      );
    };

    const promiseLoop = () => {
      if (this.state.captcha != null && this._promiseQueue.length == 0) {
        this._promiseTimeoutID = window.setTimeout(promiseLoop, 2000);
      }
      // Process until queue is empty or player has been stopped
      if (!this._isMounted || this._promiseQueue.length == 0) {
        return;
      }

      const promiseData = this._promiseQueue.shift();
      window.ipc.scrapeFiles(
        this.props.config,
        promiseData.source,
        this.props.scene.imageTypeFilter,
        this.props.scene.weightFunction,
        promiseData.helpers,
        this.state.contentLookupKey,
        (object: any) => {
          if (object?.captcha != null && this.state.captcha == null) {
            this.setState({
              captcha: {
                captcha: object.captcha,
                source: object?.source,
                helpers: object?.helpers,
              },
            });
          }

          if (object?.error != null) {
            console.error(
              "Error retrieving " +
                object?.source?.url +
                (object?.helpers?.next > 0
                  ? " Page " + object.helpers.next
                  : ""),
            );
            console.error(object.error);
          }

          if (object?.warning != null) {
            console.warn(object.warning);
          }

          if (object?.systemMessage != null) {
            this.props.systemMessage(object.systemMessage);
          }

          // If we are not at the end of a source
          if (object?.source) {
            this.props.setCount(
              object.source.url,
              object.helpers.count,
              object.helpers.next == null,
            );

            if (object?.allURLs) {
              content().addURLs(object.uuid, object.allURLs);
              content().addPosts(object.uuid, object.allPosts);

              // Add the next promise to the queue
              if (object.helpers.next != null) {
                this._promiseQueue.push({
                  source: object.source,
                  helpers: object.helpers,
                });
              }
            }

            this._promiseTimeoutID = window.setTimeout(
              promiseLoop,
              object?.timeout ?? 1000,
            );
          }
        },
      );
    };

    if (this._sourceTimeoutID != null) {
      window.clearTimeout(this._sourceTimeoutID);
    }
    if (this._promiseTimeoutID != null) {
      window.clearTimeout(this._promiseTimeoutID);
    }
    if (this._nextSourceTimeoutID != null) {
      window.clearTimeout(this._nextSourceTimeoutID);
    }
    if (this.state.preload) {
      this.setState({ preload: false });
      promiseLoop();
      if (
        this.props.nextScene &&
        content().isEmpty(this._nextContentLookupKey)
      ) {
        nextSourceLoop();
      }
    } else {
      if (this.props.nextScene) {
        let nextSources = await window.ipc.getScraperSources(
          this.props.nextScene.sources,
        );
        if (this.props.nextScene.sourceOrderFunction === SOF.random) {
          nextSources = randomizeList(nextSources);
        }

        this._nextPromiseQueue = nextSources.map((source) => ({
          source,
          helpers: { next: -1, count: 0, retries: 0 },
        }));
      }

      let sources = await window.ipc.getScraperSources(
        this.props.scene.sources,
      );
      if (this.props.scene.sourceOrderFunction === SOF.random) {
        sources = randomizeList(sources);
      }

      this._sourceQueue = sources.map((source) => ({
        source,
        helpers: { next: -1, count: 0, retries: 0 },
      }));
      this._totalSources = this._sourceQueue.length;

      sourceLoop();
    }
  }

  shouldComponentUpdate(props: any, state: any): boolean {
    return (
      props.scene !== this.props.scene ||
      (props.nextScene &&
        this.props.nextScene &&
        props.nextScene.id !== this.props.nextScene.id) ||
      props.historyOffset !== this.props.historyOffset ||
      props.isPlaying !== this.props.isPlaying ||
      props.opacity !== this.props.opacity ||
      props.strobeLayer !== this.props.strobeLayer ||
      props.hasStarted !== this.props.hasStarted ||
      props.gridView !== this.props.gridView ||
      state.captcha !== this.state.captcha ||
      state.contentLookupKey !== this.state.contentLookupKey ||
      state.restart !== this.state.restart
    );
  }

  componentDidUpdate(props: any, state: any) {
    if (this.props.scene.videoVolume !== this.state.videoVolume) {
      this.setState({ videoVolume: this.props.scene.videoVolume });
    }
    if (props.scene.id !== this.props.scene.id) {
      if (
        props.nextScene != null &&
        this.props.scene.id === props.nextScene.id
      ) {
        // If the next scene has been played
        if (
          this.props.nextScene &&
          this.props.nextScene.id === props.scene.id
        ) {
          // Just swap values if we're coming back to this scene again
          const newContentLookupKey = this._nextContentLookupKey;
          const temp = this._nextPromiseQueue;
          this._nextPromiseQueue = this._promiseQueue;
          this._promiseQueue = temp;
          this._nextContentLookupKey = state.contentLookupKey;
          this.setState({
            contentLookupKey: newContentLookupKey,
            preload: true,
            restart: true,
          });
        } else {
          // Replace values
          this._promiseQueue = this._nextPromiseQueue;
          this.setState({
            contentLookupKey: this._nextContentLookupKey,
            preload: true,
            restart: true,
          });
          this._nextPromiseQueue = Array<{
            source: LibrarySource;
            helpers: {
              next: any;
              count: number;
              retries: number;
            };
          }>();
          this._nextContentLookupKey = uuidv4();
          content().initContent(this._nextContentLookupKey);
        }
      } else {
        this._promiseQueue = Array<{
          source: LibrarySource;
          helpers: { next: any; count: number; retries: number };
        }>();
        this.setState({
          preload: false,
          restart: true,
        });
      }

      this._sourceQueue = Array<{
        source: LibrarySource;
        helpers: { next: any; count: number; retries: number };
      }>();
    }
    if (this.state.restart == true) {
      this.setState({ restart: false });
      this.componentDidMount(true);
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
    this._sourceQueue = null;
    this._promiseQueue = null;
    this._nextPromiseQueue = null;
    content().delete(this.state.contentLookupKey);
    content().delete(this._nextContentLookupKey);
    window.clearTimeout(this._backForth);
    this._backForth = null;
  }
}

(SourceScraper as any).displayName = "SourceScraper";
