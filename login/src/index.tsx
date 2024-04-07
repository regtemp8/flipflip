/// <reference path="./global.d.ts" />
import ReactDOM from "react-dom/client";
import Login from "./Login";

ReactDOM.hydrateRoot(
  document.getElementById("login") as Element,
  <Login theme={window.flipflipTheme} nonce={window.flipflipNonce} />,
);
