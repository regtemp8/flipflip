import PasswordLogin from "./PasswordLogin";
import TokenLogin from "./TokenLogin";

export default function Login() {
    return (
      <>
        <h3 className="text-lg font-semibold p-4">Login</h3>
        <PasswordLogin/>
        <TokenLogin/>
      </>
    );
  }