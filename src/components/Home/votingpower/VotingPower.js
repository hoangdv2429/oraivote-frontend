import { result } from 'lodash';
import React, { useEffect, useState } from 'react'
import { contractAddr } from 'src/components/utils/Utils';
import CosmJsFactory from "src/lib/cosmjs-factory";
import Cosmos from "../../../lib/oraiwasmjs"
import { LoadingOutlined } from "@ant-design/icons";
import { Spin } from "antd";

import "./styles.css";

const VotingPower = () => {

  const keplrID = localStorage.getItem("keplrID");
  const [mnemonic, setMnemonic] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isInteractionLoading, setIsInteractionLoading] = useState(false);
  const [queryMessage, setQueryMessage] = useState("");
  const [resultJson, setResultJson] = useState({});
  const [votingPower, setVotingPower] = useState("");

  const antIcon = (
    <LoadingOutlined style={{ fontSize: 24, color: "#7954FF" }} spin />
  );

  const cosmJS = new Cosmos("http://3.143.254.222:1317", "Oraichain-testnet");
  cosmJS.setBech32MainPrefix("orai");

  const queryVotingPower = async () => {
    const data = {
      token_stake: {
        address: keplrID
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
      console.log(queryResult)
      setVotingPower(queryResult.token_balance);
      setResultJson({ data: queryResult });
      setIsInteractionLoading(false);
      return queryResult.token_balance;
    } catch (error) {
      setErrorMessage(String(error));
    }
    setIsInteractionLoading(false);
  }

  const onStakeToken = async () => {
    const token = document.getElementById("stake-token").value;
    console.log(token)
    await window.keplr.enable("Oraichain-testnet");
    const offlineSigner = window.keplr.getOfflineSigner("Oraichain-testnet");
    const rawInputs = [
      {
        contractAddr,
        message: Buffer.from(JSON.stringify({ stake_voting_tokens: {} })),
        sentFunds: [{ denom: "orai", amount: token }],
      },
    ];
    const block = await cosmJS.get("/blocks/latest");
    const timeoutHeight = parseInt(block.block.header.height) + 100;
    try {
      const response = await cosmJS.execute({
        signerOrChild: offlineSigner,
        rawInputs,
        gasLimits: "auto",
        fees: 0,
        timeoutHeight,
        timeoutIntervalCheck: 5000,
      });
      console.log(response);
    } catch (ex) {
      console.log(ex);
    }
  }

  const onWithdrawToken = async () => {
    const token = document.getElementById("withdraw-token").value;
    const data = {
      withdraw_voting_tokens: {
        amount: token
      }
    }
    setErrorMessage("");
    setIsInteractionLoading(true);
    let cosmJs = new CosmJsFactory(window.chainStore.current);
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
    } catch (error) {
      setErrorMessage(String(error));
    }
    setIsInteractionLoading(false);
  }

  useEffect(() => {
    queryVotingPower();
  }, [votingPower])

  return (
    <div>
      {
        isInteractionLoading
          ? <div className="align-center">< Spin indicator={antIcon} /></div >
          :
          <div className="voting-power-container">
            <div className="general-info">
              <div>
                <h2>Address</h2>
                <p>{keplrID}</p>
              </div>

              <div className="token-interaction">
                <h2>Stake token</h2>
                <input className="token-input" type="number" id="stake-token"></input>
                <button className="btn btn-primary" onClick={onStakeToken}>Stake Token</button>
              </div>
              <div>
                <h2>Voting Power</h2>
                <p>{votingPower} orai</p>
              </div>
              <div className="token-interaction">
                <h2>Stake token</h2>
                <input className="token-input" type="number" id="withdraw-token"></input>
                <button className="btn btn-secondary" onClick={onWithdrawToken}>Withdraw Token</button>
              </div>
            </div>
            <div className="proposal-info">
              <h2>Enrolled Proposals</h2>
              <h2>Your Proposals</h2>
            </div>
          </div>
      }
    </div>
  )
}

export default VotingPower