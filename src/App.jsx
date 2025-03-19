import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";

import ActivityLog from "./pages/ActivityLog/ActivityLog"; 
import View2 from "./pages/view2/View2";
import SLA from "./pages/SLA/SLA";
import HomePage from "./HomePage";
function App() {
  return (
    <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/ActivityLog" element={<ActivityLog />} />
          <Route path="/view-2" element={<View2 />} />
          <Route path="/SLA" element={<SLA />} />
        </Routes>
      
    </BrowserRouter>
  );
}

export default App;
