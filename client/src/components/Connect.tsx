import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { connect } from "../api";
import { IToken } from "../types/token";

export default function Connect() {
  const [token, setToken] = useState<IToken>();
  const navigate = useNavigate();

  // This method fetches the records from the database.
  useEffect(() => {
    connect(navigate).then((value?: IToken) => setToken(value))
  }, []);


  // This following section will display the table with the records of individuals.
  return (
    <>
      <h3 className="text-lg font-semibold p-4">Connect</h3>
      <div className="border rounded-lg overflow-hidden">
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b">
              <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
                  Token
                </th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
                  {token?.token}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}