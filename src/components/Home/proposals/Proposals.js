import React, { useEffect, useState } from 'react'
import Proposal from './Proposal'
import { useNavigate } from 'react-router-dom'
import notFoundImage from "../../../assets/images/proposal-not-found.png"
import "./styles.css"

const Proposals = ({ pollsData }) => {
    const [searchValue, setSearchValue] = useState("");
    const [currentBlockHeight, setCurrentBlockHeight] = useState(0);
    const searchResult = pollsData.filter((item) => item.description.includes(searchValue));
    const navigate = useNavigate();

    const displayLiveSearchResult = (e) => {
        setSearchValue(e.target.value);
    }

    const createProposal = () => {
        navigate("/create");
    }

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
            setCurrentBlockHeight((await blockHeightResponse.json()).result.response.last_block_height);
        } catch (err) {
            console.log(err);
        }
    };

    useEffect(() => {
        getCurrentBlockHeight();
    }, [])


    return (
        <div>
            <div className="proposals-container">
                <div className="proposals-container-header">
                    <p className="proposals-total">{pollsData.length} {pollsData.length === 1 ? "Proposal" : "Proposals"}</p >
                    <form>
                        <input className="input-field proposal-search" type="text" placeholder="Search for proposal..." onChange={displayLiveSearchResult} value={searchValue}></input>
                    </form>
                    <button className="btn btn-primary" onClick={createProposal}>SUBMIT A PROPOSAL</button>
                </div >
                <div className="proposals-container-content scrollable-element">
                    {
                        searchResult.length !== 0 ?
                            searchResult.map((item, i) => <Proposal data={item} currentBlockHeight={currentBlockHeight} key={i} />)
                            :
                            <div className="proposals-search-not-found">
                                <img src={notFoundImage} alt="not-found"></img>
                                <p>No search result!</p>
                            </div>
                    }
                </div>
            </div >
        </div>
    )
}

export default Proposals