import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
 // Import HomePage
import View1 from "./pages/view1/View1"; // Ensure the path is correct
import View2 from "./pages/view2/View2";
import SLA from "./pages/SLA/SLA";
import HomePage from "./HomePage";
function App() {
  return (
    <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/view-1" element={<View1 />} />
          <Route path="/view-2" element={<View2 />} />
          <Route path="/SLA" element={<SLA />} />
        </Routes>
      
    </BrowserRouter>
  );
}

export default App;
