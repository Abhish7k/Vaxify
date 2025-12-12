import { Outlet } from "react-router-dom";

function App() {
  return (
    <div>
      <h1>hello from app</h1>

      {/* for router */}
      <Outlet />
    </div>
  );
}

export default App;
