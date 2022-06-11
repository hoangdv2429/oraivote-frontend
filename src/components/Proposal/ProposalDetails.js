import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';
import CosmJsFactory from "src/lib/cosmjs-factory";
import { contractAddr } from '../utils/Utils';
import "./styles.css"

const PollDetails = () => {
  const [currentBlockHeight, setCurrentBlockHeight] = useState(0);
  const [mnemonic, setMnemonic] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isInteractionLoading, setIsInteractionLoading] = useState(false);
  const [queryMessage, setQueryMessage] = useState("");
  const [resultJson, setResultJson] = useState({});
  const [isVoted, setIsVoted] = useState("");
  const { id } = useParams();
  const keplrID = localStorage.getItem("keplrID");

  const [pollDetail, setPollDetail] = useState({
    creator: "",
    title: "",
    description: "",
    quorum_percentage: "",
    status: "",
    end_height: "",
    start_height: "",
    poll_id: "",
  })

  const getCurrentBlockHeight = async () => {
    try {
      const blockHeightResponse = await fetch(
        "http://3.143.254.222:26657/abci_info",
        {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        }
      );
      if (!blockHeightResponse.ok) {
        throw new Error(`Error! status: ${blockHeightResponse.status}`);
      }
      const blockHeightResult = await blockHeightResponse.json();
      setCurrentBlockHeight(
        parseInt(blockHeightResult.result.response.last_block_height)
      );
    } catch (err) {
      console.log(err);
    }
  };


  const onEndPoll = async () => {
    setErrorMessage("");
    setIsInteractionLoading(true);
    let cosmJs = new CosmJsFactory(window.chainStore.current);
    const data = {
      end_poll: {
        poll_id: pollDetail.poll_id,
      }
    };
    console.log(data)
    try {
      let finalMessage;
      if (data) finalMessage = JSON.stringify(data);
      const queryResult = await cosmJs.current.execute({
        mnemonic,
        address: contractAddr,
        handleMsg: finalMessage,
        gasAmount: { amount: "0.0025", denom: "orai" },
        gasLimits: undefined,
        handleOptions: { funds: Array(0) },
      });
      setResultJson({ data: queryResult });
      document.location.reload(`/proposal/${id}`)
    } catch (error) {
      setErrorMessage(String(error));
    }
    setIsInteractionLoading(false);
  }

  const handleVote = async (e) => {
    await getCurrentBlockHeight();
    if (currentBlockHeight > pollDetail.end_height) {
      displayResult();
      return;
    }
    setErrorMessage("");
    setIsInteractionLoading(true);
    let cosmJs = new CosmJsFactory(window.chainStore.current);
    const data = {
      cast_vote: {
        poll_id: pollDetail.poll_id,
        vote: e.target.id,
        weight: document.getElementById("token-input").value
      }
    };
    console.log(data);
    try {
      let finalMessage;
      if (data) finalMessage = JSON.stringify(data);
      const queryResult = await cosmJs.current.execute({
        mnemonic,
        address: contractAddr,
        handleMsg: finalMessage,
        gasAmount: { amount: "0.0025", denom: "orai" },
        gasLimits: undefined,
        handleOptions: { funds: Array(0) },
      });
      setIsVoted(e.target.id);
      console.log(queryResult)
      setResultJson({ data: queryResult });
    } catch (error) {
      setErrorMessage(String(error));
    }
    setIsInteractionLoading(false);
  }

  const onQuery = async () => {
    const data = {
      poll: {
        poll_id: parseInt(id)
      }
    }
    console.log(data);
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
      setPollDetail({ ...queryResult, poll_id: parseInt(id) });
      setResultJson({ data: queryResult });
    } catch (error) {
      setErrorMessage(String(error));
    }
    setIsInteractionLoading(false);
  };

  const displayResult = () => {
    if (currentBlockHeight > pollDetail.end_height) return "The poll is expired";
    if (errorMessage) {
      console.log(errorMessage);
      if (errorMessage.search("has not expired") !== -1) {
        return "The poll is not expired";
      }
      if (errorMessage.search("already voted") !== -1) {
        return "You have voted for this poll";
      }
    } else {
      return isVoted && `You've voted ${isVoted}`
    }
  }

  useEffect(() => {
    onQuery().then(() => console.log(pollDetail));
  }, [queryMessage])

  return (
    <div className="poll-detail-container">
      <div>
        <h1>{pollDetail.title}</h1>
        <p>Description: {pollDetail.description}</p>
        <p>Status: {pollDetail.status}</p>
        <p>Created by {pollDetail.creator}</p>
        <p>Start from block #{pollDetail.start_height} to block #{pollDetail.end_height}</p>
        <p>Quorum percentage: {pollDetail.quorum_percentage}</p>
        <div>{displayResult()}</div>
        {
          pollDetail.status === "InProgress"
            ? (
              keplrID === pollDetail.creator
                ? <div className="vertical-flex-box btns">
                  <input className="token-input" type="number" min={1} id="token-input"></input>
                  <button className="btn btn-primary" id="yes" onClick={handleVote}>Yes</button>
                  <button className="btn btn-secondary" id="no" onClick={handleVote}>No</button>
                  <button className="btn btn-primary" onClick={onEndPoll}>End Poll</button>
                </div>
                : <div className="vertical-flex-box btns">
                  <input className="token-input" type="number" min={1} id="token-input"></input>
                  <button className="btn btn-primary" id="yes" onClick={handleVote}>Yes</button>
                  <button className="btn btn-secondary" id="no" onClick={handleVote}>No</button>
                </div>
            )
            : (
              <div>The poll is {pollDetail.status === "Passed" ? "passed" : "rejected"}</div>
            )
        }
      </div>
    </div >
  )
}

export default PollDetails