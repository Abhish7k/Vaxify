import { Outlet } from "react-router-dom";
import Navbar from "./components/navbar/Navbar";
import { Suspense, useEffect } from "react";
import ScrollToTop from "./components/ScrollToTop";
import { warmUpBackend } from "./api/warmup";
import { RouteSpinner } from "./components/ui/route-spinner";
import DocumentTitle from "./components/DocumentTitle";

function App() {
  useEffect(() => {
    warmUpBackend();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <DocumentTitle />
      <ScrollToTop />

      <Navbar />

      {/* for router */}
      <main className="flex-1">
        <Suspense fallback={<RouteSpinner />}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
}

export default App;
