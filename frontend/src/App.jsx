import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/pages/auth/Login";
import Register from "./components/pages/auth/Register";
import Home from "./components/pages/Home";

import Footer from "./components/layout/Footer";
import Navbar from "./components/layout/Navbar";
import Container from './components/layout/Container'

function App() {
  return (
    <Router>
      <Navbar />
      <Container>
        <Routes>
          <Route path="/login" element={<Login />}></Route>
          <Route path="/register" element={<Register />}></Route>
          <Route path="/" element={<Home />}></Route>
        </Routes>
      </Container>
      <Footer />
    </Router>
  );
}

export default App;
