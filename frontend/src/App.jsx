import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import AliasManager from "./pages/AliasManager";
import TrimManager from "./pages/TrimManager";

function App() {
  return (
    <Router>
      <nav style={{ padding: "1rem", background: "#ddd" }}>
        <Link to="/aliases" style={{ marginRight: "1rem" }}>Aliases</Link>
        <Link to="/trims">Trims</Link>
      </nav>

      <Routes>
        <Route path="/aliases" element={<AliasManager />} />
        <Route path="/trims" element={<TrimManager />} />
      </Routes>
    </Router>
  );
}

export default App;
