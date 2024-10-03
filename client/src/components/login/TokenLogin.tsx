import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { tokenLogin } from "../../api";

export default function TokenLogin() {
    const [token, setToken] = useState<string>("");
    const navigate = useNavigate();
  
    // These methods will update the state properties.
    function updateToken(value: string) {
      return setToken(value)
    }
  
    // This function will handle the submission.
    async function onSubmit(e: FormEvent<HTMLFormElement>) {
      e.preventDefault();
      try {
        tokenLogin(token, navigate)
      } catch (error) {
        console.error('A problem occurred with your fetch operation: ', error);
      } finally {
        setToken("");
      }
    }
  
    // This following section will display the form that takes the input from the user.
    return (
      <form
        onSubmit={onSubmit}
        className="border rounded-lg overflow-hidden p-4"
      >
        <div className="grid grid-cols-1 gap-x-8 gap-y-10 border-b border-slate-900/10 pb-12 md:grid-cols-2">
          <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 ">
            <div className="sm:col-span-4">
              <label
                htmlFor="token"
                className="block text-sm font-medium leading-6 text-slate-900"
              >
                Token
              </label>
              <div className="mt-2">
                <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-slate-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md">
                  <input
                    type="text"
                    name="token"
                    id="token"
                    className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-slate-900 placeholder:text-slate-400 focus:ring-0 sm:text-sm sm:leading-6"
                    placeholder="000000"
                    value={token}
                    onChange={(e) => updateToken(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <input
          type="submit"
          value="Login"
          className="inline-flex items-center justify-center whitespace-nowrap text-md font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-slate-100 hover:text-accent-foreground h-9 rounded-md px-3 cursor-pointer mt-4"
        />
      </form>
    );
  }