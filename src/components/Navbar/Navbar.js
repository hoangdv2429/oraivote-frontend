import React from 'react'
import { useNavigate } from 'react-router-dom'
import CosmJsFactory from "src/lib/cosmjs-factory";
import { SigningCosmosClient } from '@cosmjs/launchpad'

import logo from "../../assets/images/logo.svg"
import "./styles.css"
import { ConsoleSqlOutlined } from '@ant-design/icons';

const Navbar = ({ auth, setAuth }) => {

  const navigate = useNavigate();
  const keplrID = localStorage.getItem("keplrID");

  const onSignIn = async () => {

    const chainId = "Oraichain-testnet";
    await window.keplr.enable(chainId);
    const offlineSigner = window.keplr.getOfflineSigner(chainId);
    const account = await offlineSigner.getAccounts();
    localStorage.setItem("keplrID", account[0].address);
  }

  return (
    <div className="navbar vertical-flex-box">
      <div className="navbar-left vertical-flex-box">
        <div className="nav-item">
          <img src={logo} alt="logo" className="nav-logo" onClick={() => { navigate("/home") }} />
        </div>
        <ul className="vertical-flex-box">
          <li className="nav-item">ABOUT</li>
          <li className="nav-item">POLLS</li>
        </ul>
      </div>
      <div className="navbar-right vertical-flex-box">
        {
          localStorage.getItem("keplrID")
            ? <div>Hi, {keplrID.substring(0, 30)}...</div>
            : <button className="btn btn-primary" onClick={onSignIn}>SIGN IN</button>
        }
      </div>
    </div>
  )
}

export default Navbar