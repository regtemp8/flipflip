import { ThemeOptions } from "@mui/material";

declare global {
  interface Window {
    flipflipTheme?: ThemeOptions;
    flipflipNonce?: string;
    flipflipCode?: string;
  }
}
