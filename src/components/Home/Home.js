import React, { useState, useEffect } from 'react'
import Header from "../Header/Header"
import Proposals from './proposals/Proposals';
import VotingPower from './votingpower/VotingPower';
import { LoadingOutlined } from "@ant-design/icons";
import { Spin } from "antd";
const Home = () => {

  const [selectingTab, setSelectingTab] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [isInteractionLoading, setIsInteractionLoading] = useState(false);
  const [queryMessage, setQueryMessage] = useState("");
  const [resultJson, setResultJson] = useState([]);
  const antIcon = (
    <LoadingOutlined style={{ fontSize: 24, color: "#7954FF" }} spin />
  );

  const getAllPolls = async () => {
    try {
      setIsInteractionLoading(true);
      await fetch(`http://127.0.0.1:3001/poll`, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      })
        .then((res) => res.json())
        .then((res) => {
          setResultJson(res);
        });
    setIsInteractionLoading(false);
    } catch (error) {
      setErrorMessage(String(error));
    }
  }

  useEffect(() => {
    getAllPolls();
  }, [])

  const selectTab = (e) => {
    const selectingTabID = parseInt(e.target.id[e.target.id.length - 1]);
    const currentSelectingTab = document.getElementById(`header-item-${selectingTab}`);
    if (selectingTab !== selectingTabID) {
      currentSelectingTab.setAttribute("class", "header-item");
      e.target.setAttribute("class", `${e.target.getAttribute("class")} header-selecting-item`);
      setSelectingTab(selectingTabID);
    }
  }

  const displayTab = () => {
    switch (selectingTab) {
      case 0: return <Proposals pollsData={resultJson} />
      case 1: return <VotingPower />
      default: return <Proposals pollsData={resultJson} />
    }
  }

  return (
    <div className="horizontal-flex-box">
      <Header selectingTab={selectingTab} onSelectingTab={selectTab} />
      {isInteractionLoading ? <div className="align-center"><Spin indicator={antIcon} /></div> : displayTab()}
    </div>
  )
}

export default Home