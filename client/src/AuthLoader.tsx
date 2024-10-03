import { useNavigate } from "react-router-dom";
import { useAppSelector } from "./store/hooks";
import { selectAuthenticated } from "./store/auth/selectors";
import { PropsWithChildren, useEffect } from "react";
import { isAuthenticated } from "./api";

const AuthLoader = ({children}: PropsWithChildren) => {
  const navigate = useNavigate()
  const authenticated = useAppSelector(selectAuthenticated())

  useEffect(() => {
    if(authenticated == null) {
      isAuthenticated(navigate)
    }
  }, [authenticated])

  return authenticated != null ? children : null
};
export default AuthLoader
