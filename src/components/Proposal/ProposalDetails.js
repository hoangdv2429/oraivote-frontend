import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';
import CosmJsFactory from "src/lib/cosmjs-factory";
import { contractAddr } from '../utils/Utils';
import "./styles.css"

const PollDetails = () => {
  let blockHeight = 0;
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
      // setCurrentBlockHeight(parseInt(blockHeightResult.result.response.last_block_height));
      return parseInt(blockHeightResult.result.response.last_block_height);
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
      console.log(resultJson)
      document.location.reload(`/proposal/${id}`)
    } catch (error) {
      setErrorMessage(String(error));
    }
    setIsInteractionLoading(false);
  }

  const handleVote = async (e) => {
    blockHeight = await getCurrentBlockHeight();
    if (blockHeight > pollDetail.end_height) {
      displayResult();
    } else {
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
  }

  const onQuery = () => {
    fetch(`http://127.0.0.1:3001/poll/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })
      .then((res) => res.json())
      .then((res) => setPollDetail(res.data));
  }

  useEffect(() => {
    onQuery();
  }, [])

  const displayResult = () => {
    if (blockHeight > pollDetail.end_height) {
      return "The poll is expired";
    };
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

  return (
    <div className="poll-detail-wrapper">
      <div className="poll-detail-container">
        <div>
          <div className="vertical-flex-box">
            <h1>{pollDetail.title}</h1>
            {keplrID === pollDetail.creator && pollDetail.status === "InProgress" && <button className="btn btn-end-poll" onClick={onEndPoll}>End Poll</button>}
          </div>
          <p>Description: {pollDetail.description}</p>
          <p>Status: {pollDetail.status}</p>
          <p>Created by {pollDetail.creator}</p>
          <p>Start from block #{pollDetail.start_height} to block #{pollDetail.end_height}</p>
          <p>Quorum percentage: {pollDetail.quorum_percentage}</p>
          <div>{displayResult()}</div>
          {
            pollDetail.status === "InProgress"
              ? (
                <div>
                  <input className="weight-input" type="number" placeholder='Enter token weight...' min={1} id="token-input"></input>
                  <div className="vertical-flex-box btns">
                    <button className="btn btn-primary" id="yes" onClick={handleVote}>Yes</button>
                    <button className="btn btn-transparent" id="no" onClick={handleVote}>No</button>
                  </div>
                </div>
              )
              : (
                <div>The poll is {pollDetail.status === "Passed" ? "passed" : "rejected"}</div>
              )
          }
        </div>
      </div >
    </div>
  )
}

export default PollDetails