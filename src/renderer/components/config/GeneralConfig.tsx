import * as React from "react";

import { Card, CardContent, Grid } from "@mui/material";

import Config, {
  CacheSettings,
  DisplaySettings,
  GeneralSettings,
  RemoteSettings,
} from "../../../common/Config";
import { Theme } from "../../../common/theme";
import Tag from "../../../common/Tag";
import LibrarySource from "../../../common/LibrarySource";
import PlayerBoolCard from "../configGroups/PlayerBoolCard";
import PlayerBoolCard2 from "../configGroups/PlayerBoolCard2";
import PlayerNumCard from "../configGroups/PlayerNumCard";
import CacheCard from "../configGroups/CacheCard";
import BackupCard from "../configGroups/BackupCard";
import APICard from "../configGroups/APICard";
import ThemeCard from "../configGroups/ThemeCard";
import WatermarkCard from "../configGroups/WatermarkCard";
import Masonry from "@mui/lab/Masonry";

interface GeneralConfigProps {
  config: Config;
  library: Array<LibrarySource>;
  tags: Array<Tag>;
  theme: Theme;
  onBackup: () => void;
  onChangeThemeColor: (colorTheme: any, primary: boolean) => void;
  onClean: (config: Config) => void;
  onPortableOverride: () => void;
  onRestore: (backupFile: string) => void;
  onToggleDarkMode: () => void;
  onUpdateCachingSettings: (fn: (settings: CacheSettings) => void) => void;
  onUpdateDisplaySettings: (fn: (settings: DisplaySettings) => void) => void;
  onUpdateGeneralSettings: (fn: (settings: GeneralSettings) => void) => void;
  onUpdateRemoteSettings: (fn: (settings: RemoteSettings) => void) => void;
  onUpdateConfig: (fn: (config: Config) => void) => void;
}

export default class GeneralConfig extends React.Component<GeneralConfigProps> {
  constructor(props: GeneralConfigProps) {
    super(props);
  }

  render() {
    return (
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Masonry columns={{ xs: 1, sm: 2, md: 3, lg: 4 }} spacing={2}>
            <Card>
              <CardContent>
                <PlayerBoolCard
                  displaySettings={this.props.config.displaySettings}
                  onUpdateDisplaySettings={this.props.onUpdateDisplaySettings}
                />
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <PlayerBoolCard2
                  generalSettings={this.props.config.generalSettings}
                  onPortableOverride={this.props.onPortableOverride}
                  onUpdateGeneralSettings={this.props.onUpdateGeneralSettings}
                />
              </CardContent>
            </Card>

            <Card style={{ overflow: "visible" }}>
              <CardContent>
                <PlayerNumCard
                  library={this.props.library}
                  tags={this.props.tags}
                  settings={this.props.config.displaySettings}
                  onUpdateSettings={this.props.onUpdateDisplaySettings}
                />
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <CacheCard
                  config={this.props.config}
                  onUpdateSettings={this.props.onUpdateCachingSettings}
                />
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <APICard
                  settings={this.props.config.remoteSettings}
                  onUpdateSettings={this.props.onUpdateRemoteSettings}
                  onUpdateConfig={this.props.onUpdateConfig}
                />
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <WatermarkCard
                  settings={this.props.config.generalSettings}
                  onUpdateSettings={this.props.onUpdateGeneralSettings}
                />
              </CardContent>
            </Card>
          </Masonry>
        </Grid>

        <Grid item xs={12} sm="auto">
          <Card>
            <CardContent>
              <BackupCard
                settings={this.props.config.generalSettings}
                onBackup={this.props.onBackup}
                onRestore={this.props.onRestore}
                onClean={() => this.props.onClean(this.props.config)}
                onUpdateSettings={this.props.onUpdateGeneralSettings}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm="auto">
          <Card>
            <CardContent>
              <ThemeCard
                theme={this.props.theme}
                onChangeThemeColor={this.props.onChangeThemeColor}
                onToggleDarkMode={this.props.onToggleDarkMode}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  }
}
