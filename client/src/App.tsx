import { Outlet } from "react-router-dom";
import Navbar from "./components/Navbar";
import { Provider } from "react-redux";
import store from "./store/store";
import AuthLoader from "./AuthLoader";

const App = () => {
  return (
    <Provider store={store}>
      <AuthLoader>
        <div className="w-full p-6">
          <Navbar />
          <Outlet />
        </div>
      </AuthLoader>
    </Provider>
  );
};
export default App
