import React, { useState, useEffect } from 'react'
import Header from "../Header/Header"
import Proposals from './proposals/Proposals';
import VotingPower from './votingpower/VotingPower';
import CosmJsFactory from "src/lib/cosmjs-factory";
import { contractAddr } from "../utils/Utils"
import { LoadingOutlined } from "@ant-design/icons";
import { Spin } from "antd";
const Home = () => {

  const [selectingTab, setSelectingTab] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [isInteractionLoading, setIsInteractionLoading] = useState(false);
  const [queryMessage, setQueryMessage] = useState("");
  const [resultJson, setResultJson] = useState({});
  const [pollsData, setPollsData] = useState([]);
  const antIcon = (
    <LoadingOutlined style={{ fontSize: 24, color: "#7954FF" }} spin />
  );
  let pollCounts;

  const getPollCounts = async () => {
    let data = {
      config: {}
    }
    setErrorMessage("");
    let cosmJs = new CosmJsFactory(window.chainStore.current);
    try {
      let finalMessage = queryMessage;
      if (data) finalMessage = JSON.stringify(data);
      let queryResult = await cosmJs.current.query(
        contractAddr,
        finalMessage
      );
      pollCounts = queryResult.poll_count;
    } catch (error) {
      setErrorMessage(String(error));
    }
  }

  const getPolls = async () => {
    for (let i = 0; i <= pollCounts; i++) {
      const data = {
        poll: {
          poll_id: i
        }
      }
      setErrorMessage("");
      setIsInteractionLoading(true);
      let cosmJs = new CosmJsFactory(window.chainStore.current);
      try {
        let finalMessage = queryMessage;
        if (data) finalMessage = JSON.stringify(data);
        const queryResult = await cosmJs.current.query(
          contractAddr,
          finalMessage
        );
        setPollsData(prev => [...prev, { ...queryResult, poll_id: i }]);
        setResultJson({ data: queryResult });
      } catch (error) {
        setErrorMessage(String(error));
      }
      setIsInteractionLoading(false);
    }
  }

  useEffect(() => {
    getPollCounts().then(() => getPolls())
  }, [queryMessage])

  const selectTab = (e) => {
    const selectingTabID = e.target.id[e.target.id.length - 1];
    const currentSelectingTab = document.getElementById(`header-item-${selectingTab}`);

    if (selectingTab !== selectingTabID) {
      currentSelectingTab.setAttribute("class", "header-item");
      e.target.setAttribute("class", `${e.target.getAttribute("class")} header-selecting-item`);
      setSelectingTab(selectingTabID);
    }
  }

  const displayTab = () => {
    switch (selectingTab) {
      case "0": return <Proposals pollsData={pollsData} />
      case "1": return <VotingPower />
      default: return <Proposals pollsData={pollsData} />
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