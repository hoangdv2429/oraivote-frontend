import React, { useState } from 'react'
import Proposal from './Proposal'
import { useNavigate } from 'react-router-dom'
import notFoundImage from "../../../assets/images/proposal-not-found.png"
import "./styles.css"

const Proposals = ({ pollsData }) => {
    const [searchValue, setSearchValue] = useState("");
    const searchResult = pollsData.filter((item) => item.description.includes(searchValue));
    const navigate = useNavigate();

    console.log(pollsData)

    const displayLiveSearchResult = (e) => {
        setSearchValue(e.target.value);
    }

    const createProposal = () => {
        navigate("/create");
    }

    return (
        <div>
            <div className="proposals-container">
                <div className="proposals-container-header">
                    <p>{pollsData.length} {pollsData.length === 1 ? "Proposal" : "Proposals"}</p >
                    <form>
                        <input className="input-field proposal-search" type="text" placeholder="Search for proposal..." onChange={displayLiveSearchResult} value={searchValue}></input>
                    </form>
                    <button className="btn btn-primary" onClick={createProposal}>SUBMIT A PROPOSAL</button>
                </div >
                <div className="proposals-container-content">
                    {
                        searchResult.length !== 0 ?
                            searchResult.map((item, i) => <Proposal data={item} key={i} />)
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