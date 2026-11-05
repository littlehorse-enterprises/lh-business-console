import Footer from "./components/footer";
import Header from "./components/header";
import Navigation from "./components/navigation";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-dvh flex-col bg-background">
      <a
        href="#console-main"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-background focus:p-3"
      >
        Skip to content
      </a>
      <Header />
      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        <Navigation />
        <main
          id="console-main"
          className="min-w-0 flex-1 overflow-y-auto p-4 md:p-6"
        >
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
      <Footer />
    </div>
  );
}
