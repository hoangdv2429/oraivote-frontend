// hot reload
import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./components/Home/Home";
import Create from "./components/Create/Create";
import Navbar from "./components/Navbar/Navbar";
import "./App.css";
import PollDetails from "./components/Proposal/ProposalDetails";

const App = () => {
  const [authStatus, setAuthStatus] = useState(false);

  window.addEventListener("keplr_keystorechange", async () => {
    const chainId = "Oraichain-testnet";
    const offlineSigner = window.keplr.getOfflineSigner(chainId);
    console.log(offlineSigner);
    const account = await offlineSigner.getAccounts();
    // console.log(account);
    localStorage.setItem("keplrID", account[0].address);
    document.location.reload();
  });

  return (
    <BrowserRouter>
      <Navbar auth={authStatus} setAuth={setAuthStatus} />
      <Routes>
        <Route path="/" element={<Navigate replace to="/home" />} />
        <Route path="/home" element={<Home />} />
        <Route path="/create" element={<Create />} />
        <Route path="/proposal/:id" element={<PollDetails />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
