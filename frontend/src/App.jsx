import { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './components/Pages/Home';
import ContactPage from './components/Pages/ContactPage';
import Marketplace from './components/Pages/Agents';
import AgentDetails from './components/Pages/Agents/AgentDetails';
import Layout3 from './components/Layout/Layout3';
import ErrorPage from './components/Pages/ErrorPage';
import MyAccountPage from "./components/Pages/MyAccountPage";
import {WalletProvider} from "./contexts/WalletContext";
import { ToastContainer, toast } from 'react-toastify';
import MyAgents from "./components/Pages/Agents/MyAgents";
import PricingPage from "./components/Pages/PricingPage";


function App() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return (
      <WalletProvider>
        <Routes>
          <Route path="/" element={<Layout darkMode />}>
            <Route path="/" element={<Home />} />
            <Route path="pricing" element={<PricingPage />} />
            <Route path="contact" element={<ContactPage />} />
            <Route path="my-account" element={<MyAccountPage />} />
          </Route>


          <Route path="/" element={<Layout3 darkMode />}>
          <Route path="agents" element={<Marketplace />} />
          <Route path="agents/:slug" element={<AgentDetails />} />
          <Route path="agents/my-agents" element={<MyAgents />} />
        </Route>

          {/* Start Light Mode */}
          <Route path="/light/" element={<Layout />}>
            <Route path="contact" element={<ContactPage />} />
            <Route path="pricing" element={<PricingPage />} />
            <Route path="my-account" element={<MyAccountPage />} />
          </Route>
          <Route path="/light/" element={<Layout3 />}>
            <Route path="agents" element={<Marketplace />} />
            <Route path="agents/:slug" element={<AgentDetails />} />
            <Route path="agents/my-agents" element={<MyAgents />} />
          </Route>
          {/* End Light Mode */}

      <Route path="*" element={<ErrorPage />} />
    </Routes>

        <ToastContainer />
      </WalletProvider>
  );
}

export default App;
