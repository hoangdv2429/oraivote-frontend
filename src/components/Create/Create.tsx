import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CosmJsFactory from "../../lib/cosmjs-factory";
import { contractAddr } from "../utils/Utils";
import "./styles.css";

const Create = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    end_height: 0,
    quorum_percentage: 0,
    start_height: 0,
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [isInteractionLoading, setIsInteractionLoading] = useState(false);
  const [mnemonic, setMnemonic] = useState("");
  const [resultJson, setResultJson] = useState({ data: "" });
  const navigate = useNavigate();
  const [duration, setDuration] = useState(0);

  const getCurrentBlockHeight = async ()  => {
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
      // setCurrentBlockHeight(
      //   parseInt(blockHeightResult.result.response.last_block_height)
      // );
      return Number(blockHeightResult.result.response.last_block_height);
    } catch (err) {
      console.log(err);
      return -1;
    }
  };

  const getDuration = async () => {
    let result = await (await fetch(`http://127.0.0.1:3001/poll/duration/${duration}`)).json();
    return result;
  }

  const onCreate = async () => {
    setErrorMessage("");
    setIsInteractionLoading(true);
    let cosmJs = new CosmJsFactory(window.chainStore.current);
    let fetchDuration = await getDuration();
    console.log(fetchDuration);
    setFormData((prev) => {
      let temp = prev;
      temp.start_height = fetchDuration.start_height;
      temp.end_height = fetchDuration.end_height;
      return temp;
    })
    const data = {
      create_poll: formData,
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
      console.log("query result: ", queryResult);
      setResultJson({ data: queryResult });
      navigate("/home");
    } catch (error) {
      setErrorMessage(String(error));
    }
    setIsInteractionLoading(false);
  };

  const onChange = (e) => {
    setFormData((prev) => {
      const result = {
        ...prev,
        [e.target.id]:
          e.target.id === "quorum_percentage"
            ? parseInt(e.target.value)
            : e.target.value,
      };
      return result;
    });
  };

  const onChangeDuration = (e) => {
    setDuration(parseInt(e.target.value));
  };

  return (
    <div className="create-container">
      <form className="create-form">
        <p>Title</p>
        <input
          type="text"
          placeholder="Please input proposal's title..."
          id="title"
          onChange={onChange}
          required
        ></input>
        <p>Description</p>
        <textarea
          placeholder="Please input proposal's description..."
          id="description"
          rows={13}
          onChange={onChange}
          required
        ></textarea>
        <p>Quorum Percentage</p>
        <input
          type="number"
          placeholder="Please input proposal's quorum percentage..."
          id="quorum_percentage"
          onChange={onChange}
          required
        ></input>
        <p>Duration</p>
        <input
          type="number"
          placeholder="Please input proposal's duration (minutes)..."
          id="quorum_percentage"
          onChange={onChangeDuration}
          required
        ></input>
        <button className="btn btn-primary" type="button" onClick={onCreate}>
          Submit
        </button>
      </form>
      <div className="rules">
        <h2>Proposal Rules</h2>
        <p>
          1. Before voting, voter has to stake an amount of tokens in order to
          gain voting power. These staken token can be easily withdraw back to
          your wallet
        </p>
        <p>
          2. While voting, voter has to lock an amount of tokens to the contract
          with their vote. The tokens locked can only be withdrawed when the
          proposal is finished
        </p>
        <p>3. Proposal tally rules:</p>
        <p>- Assume that:</p>
        <p>
          + <strong>yesVotes</strong> = total amount of tokens send with
          agreement with the proposal
        </p>
        <p>
          + <strong>noVotes</strong> = total amount of tokens send with
          disagreement with the proposal
        </p>
        <p>
          + <strong>totalStakeTokens</strong> = total amount of tokens voters
          have staken into the contract
        </p>
        <p>
          + <strong>totalVoteTokens</strong> = <strong>yesVotes</strong> +{" "}
          <strong>noVotes</strong> = total amount of tokens voters have send
          with the vote
        </p>
        <p>
          + <strong>resultQuorum</strong> = (<strong>totalVoteTokens</strong> /{" "}
          <strong>totalStakeTokens</strong>) * 100% = agreement percentage that
          the proposal has to achieve to get passed
        </p>
        <p>
          + <strong>pollQuorum</strong> = agreement percentage that the
          proposal achieve as the result
        </p>
        <p>- A passed proposal is a proposal achieves the below conditions:</p>
        <p>
          + <strong>totalVoteTokens</strong> &gt; 0: To assure that there are
          voters participate in voting the proposal
        </p>
        <p>
          + <strong>resultQuorum</strong> &gt; <strong>pollQuorum</strong>: To
          assure that more than <strong>pollQuorum</strong> of the total staked
          token participated in voting the proposal at the end
        </p>
        <p>
          + <strong>yesVotes</strong> &gt; <strong>totalVoteTokens</strong> / 2:
          To assure that more than 50% of the tokens that paritcipated in the
          vote need to agree with the proposal
        </p>
      </div>
    </div>
  );
};

export default Create;
