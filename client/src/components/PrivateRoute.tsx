import { PropsWithChildren } from "react";
import { Navigate } from "react-router-dom";
import { useAppSelector } from "../store/hooks";
import { selectAuthenticated } from "../store/auth/selectors";

export default function PrivateRoute({ children }: PropsWithChildren) {
    const authenticated = useAppSelector(selectAuthenticated())
    return authenticated ? children : <Navigate to='/login' />
}