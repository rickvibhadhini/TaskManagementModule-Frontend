import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";

import ActivityLog from "./pages/ActivityLog/ActivityLog"; 
import ActorMetrics from "./pages/ActorMetrics/ActorMetrics";
import SLA from "./pages/SLA/SLA";
import HomePage from "./HomePage";
function App() {
  return (
    <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/activityLog" element={<ActivityLog />} />
          <Route path="/actorMetrics" element={<ActorMetrics />} />
          <Route path="/SLA" element={<SLA />} />
        </Routes>
      
    </BrowserRouter>
  );
}

export default App;
