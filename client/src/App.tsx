import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Services from "@/pages/Services";
import Products from "@/pages/Products";
import Sales from "@/pages/Sales";
import BookOnline from "./pages/BookOnline";
import Appointments from "./pages/Appointments";
import Queue from "./pages/Queue";
import POS from "./pages/POS";
import TimeClock from "./pages/TimeClock";
import Settings from "./pages/Settings";
import Customers from "./pages/Customers";
import QueueTV from "./pages/QueueTV";
import Tidsstempling from "./pages/Tidsstempling";
import Reports from "./pages/Reports";
import Staff from "./pages/Staff";
import FikenSyncHistory from "./pages/FikenSyncHistory";
import Landing from "./pages/Landing";
import DashboardLogin from "./pages/DashboardLogin";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Landing} />
      <Route path={"/dashboard-login"} component={DashboardLogin} />
      <Route path={"/dashboard"} component={Home} />
      <Route path={"/book-online"} component={BookOnline} />
      <Route path={"/services"} component={Services} />
        <Route path="/products" component={Products} />
        <Route path="/sales" component={Sales} />
      <Route path={"/book"} component={BookOnline} />
      <Route path={"/appointments"} component={Appointments} />
      <Route path={"/queue"} component={Queue} />
      <Route path={"/queue-tv"} component={QueueTV} />
      <Route path={"/pos"} component={POS} />
      <Route path={"/time-clock"} component={TimeClock} />
      <Route path={"/tidsstempling"} component={Tidsstempling} />
      <Route path={"/customers"} component={Customers} />
      <Route path={"/reports"} component={Reports} />
      <Route path={"/staff"} component={Staff} />
      <Route path={"/fiken-sync-history"} component={FikenSyncHistory} />
      <Route path={"/settings"} component={Settings} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
