import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import DashboardLayout from './components/DashboardLayout';
import Dashboard from './pages/Dashboard';
import PostProject from './pages/PostProject';
import ProjectFeed from './pages/ProjectFeed';
import UserProfile from './pages/UserProfile';
import ManageUsers from './pages/ManageUsers';
import ReportIssue from './pages/ReportIssue';
import ViewReports from './pages/ViewReports';
import Mailbox from './pages/Mailbox';
import ProjectWorkspace from './pages/ProjectWorkspace';
import SupervisorCommand from './pages/SupervisorCommand';
import ModuleLeaderGrading from './pages/ModuleLeaderGrading';
import ProjectResults from './pages/ProjectResults';

export default function App() {
  return (
    // We wrap everything in BrowserRouter so React knows how to change pages!
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* EVERYTHING INSIDE HERE USES THE DASHBOARD LAYOUT */}
        <Route element={<DashboardLayout />}>
          {/* The 'index' means this loads exactly at /dashboard */}
          <Route path="/dashboard" index element={<Dashboard />} />
          {/* This loads at /dashboard/post-project */}
          <Route path="/dashboard/post-project" element={<PostProject />} />
          <Route path="/dashboard/feed" element={<ProjectFeed />} />
          <Route path="/dashboard/profile" element={<UserProfile />} />
          <Route path="/dashboard/manage-users" element={<ManageUsers />} />
          <Route path="/dashboard/report-issue" element={<ReportIssue />} />
          <Route path="/dashboard/reports" element={<ViewReports />} />
          <Route path="/dashboard/mail" element={<Mailbox />} />
          <Route path="/dashboard/workspace" element={<ProjectWorkspace />} />
          <Route path="/dashboard/command" element={<SupervisorCommand />} />
          <Route path="/dashboard/grading" element={<ModuleLeaderGrading />} />
          <Route path="/dashboard/results/:projectId" element={<ProjectResults />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}