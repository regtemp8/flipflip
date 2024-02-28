/// <reference path="./global.d.ts" />
import {
  Avatar,
  Card,
  Container,
  CssBaseline,
  createTheme,
  ThemeOptions,
  CardContent,
  Typography,
  CircularProgress,
} from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import { CacheProvider } from "@emotion/react";
import { CenteredBox } from "./CenteredBox";
import { createEmotionCache } from "./server/renderer";
import { useEffect, useState } from "react";
import login from "./LoginService";
import { LC } from "flipflip-common";

export interface LoginProps {
  theme?: ThemeOptions;
  nonce?: string;
}

export default function Login(props: LoginProps) {
  const [code, setCode] = useState<string>();

  useEffect(() => {
    const controller = new AbortController();
    login().addListener(
      LC.redirect,
      (url: string) => (window.location.href = url),
      controller,
    );
    login().getLoginCode().then(setCode);
  }, []);

  return (
    <CacheProvider value={createEmotionCache(props.nonce)}>
      <ThemeProvider theme={createTheme(props.theme ?? {})}>
        <CssBaseline />
        <Container component="main" maxWidth="sm">
          <Card sx={{ p: 1, mt: 3 }}>
            <CardContent>
              <CenteredBox>
                <Avatar
                  src="/img/flipflip_logo.png"
                  sx={{ height: 72, width: 72, mb: 1, my: "auto" }}
                />
              </CenteredBox>
              <CenteredBox sx={{ mt: 3 }}>
                {code != null ? (
                  <>
                    <Typography
                      component="div"
                      sx={{
                        mt: 3,
                        mb: 2,
                        fontSize: {
                          xs: "1rem",
                          sm: "1.25rem",
                        },
                      }}
                    >
                      Type this code in the FlipFlip app.
                    </Typography>
                    <Typography
                      component="div"
                      marginBottom={2}
                      sx={{
                        mb: 2,
                        letterSpacing: "0.25em",
                        fontWeight: "bold",
                        fontSize: {
                          xs: "2.25rem",
                          sm: "3.75rem",
                        },
                      }}
                    >
                      {code}
                    </Typography>
                  </>
                ) : (
                  <CircularProgress />
                )}
              </CenteredBox>
            </CardContent>
          </Card>
        </Container>
      </ThemeProvider>
    </CacheProvider>
  );
}
