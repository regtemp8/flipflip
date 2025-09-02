# Environment Variables

## Server
| Variable | Description | Default Value |
|----------------|----------------|----------------|
| `FF_PORT`   | Port the server listens on   | `5050`   |
| `FF_HOST`   | IP Address the server listens on.<br/>Use `0.0.0.0` to listen on all network interfaces.  | `localhost`   |


## Migrate data
| Variable | Description | Default |
|----------------|----------------|----------------|
`FF3_DATA_DIR` | Explicitly set the path to the FlipFlip v3 data directory. | FlipFlip v4 will try to find the FlipFlip v3 data directory automatically.

## Directories
| Variable | Description | Default Value |
|----------------|----------------|----------------|
`FF_SAVE_DIR` | Directory to save FlipFlip data (logs, cache, etc.) | Current working directory, `process.env.cwd()`.
`FF_SCRIPT_DIR` | Caption script file picker initial directory. | `FF_SAVE_DIR`
`FF_AUDIO_DIR` | Audio library file picker initial directory. | `FF_SAVE_DIR`
`FF_CONTENT_DIR` | Directory sources file picker initial directory. | `FF_SAVE_DIR`
`FF_VIDEO_DIR` | Video sources file picker initial directory. | `FF_SAVE_DIR`