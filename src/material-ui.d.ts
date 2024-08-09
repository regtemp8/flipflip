import "@mui/material/styles/createPalette";

declare module "@mui/material/styles/createPalette" {
  export interface TypeText {
    hint?: string
  }
}