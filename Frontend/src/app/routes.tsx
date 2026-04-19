import { createBrowserRouter, redirect } from "react-router";
import { AppLayout } from "./components/layout/AppLayout";
import { LandingPage } from "./components/marketing/LandingPage";
import { Dashboard } from "./components/dashboard/Dashboard";
import { StakeholdersPage } from "./components/stakeholders/StakeholdersPage";
import { CommunicationPage } from "./components/communication/CommunicationPage";
import { DocumentsPage } from "./components/documents/DocumentsPage";
import { FeedbackPage } from "./components/feedback/FeedbackPage";
import { LearningPage } from "./components/learning/LearningPage";
import { AnalyticsPage } from "./components/analytics/AnalyticsPage";
import { SettingsPage } from "./components/settings/SettingsPage";
import { ClientsPage } from "./components/clients/ClientsPage";
import { ClientDetailPage } from "./components/clients/ClientDetailPage";
import { ProgramsPage } from "./components/programs/ProgramsPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: LandingPage,
  },
  {
    path: "/app",
    Component: AppLayout,
    children: [
      {
        index: true,
        loader: () => redirect("/app/dashboard"),
      },
      { path: "dashboard", Component: Dashboard },
      { path: "clients", Component: ClientsPage },
      { path: "clients/:clientId", Component: ClientDetailPage },
      { path: "programs", Component: ProgramsPage },
      { path: "stakeholders", Component: StakeholdersPage },
      { path: "communication", Component: CommunicationPage },
      { path: "documents", Component: DocumentsPage },
      { path: "feedback", Component: FeedbackPage },
      { path: "learning", Component: LearningPage },
      { path: "analytics", Component: AnalyticsPage },
      { path: "settings", Component: SettingsPage },
    ],
  },
]);
