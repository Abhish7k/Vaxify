import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./components/navbar/Navbar";
import NextTopLoader from "nextjs-toploader";
import { Suspense } from "react";
import { Footer } from "./components/landing/FooterSection";

function App() {
  const { pathname } = useLocation();

  const hideFooterOn = ["/centers"];
  const isCenterDetail = pathname.startsWith("/centers/");
  const shouldHideFooter = hideFooterOn.includes(pathname) || isCenterDetail;

  return (
    <div className="flex flex-col min-h-screen">
      <NextTopLoader color="#4f46e5" showSpinner={false} />

      <Navbar />

      {/* for router */}
      <main className="flex-1">
        <Suspense fallback={null}>
          <Outlet />
        </Suspense>
      </main>

      {!shouldHideFooter && <Footer />}
    </div>
  );
}

export default App;
