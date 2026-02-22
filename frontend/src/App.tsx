import { Outlet } from "react-router-dom";
import Navbar from "./components/navbar/Navbar";
import NextTopLoader from "nextjs-toploader";
import { Suspense } from "react";
import ScrollToTop from "./components/ScrollToTop";

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <ScrollToTop />

      <NextTopLoader color="#4f46e5" showSpinner={false} />

      <Navbar />

      {/* for router */}
      <main className="flex-1">
        <Suspense fallback={null}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
}

export default App;
