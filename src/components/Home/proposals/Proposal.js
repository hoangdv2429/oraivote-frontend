import React from 'react'
import { useNavigate } from 'react-router-dom'
import "./styles.css"

const Proposal = ({data, currentBlockHeight}) => {
    const navigate = useNavigate();
    const showProposalDetail = (e) => {
        navigate(`/proposal/${data.poll_id}`);
    }

    return (
        <div className="proposal-container" onClick={showProposalDetail}>
            <div className="vertical-flex-box">
                <p className="proposal-title">{data.title}</p>
            </div>
            <p className="proposal-description">created by {data.creator}</p>
            <div className="proposal-additional-info vertical-flex-box">
                <p className={`proposal-status ${currentBlockHeight > data.end_height ? "proposal-active" : "proposal-closed"}`}>{currentBlockHeight > data.end_height ? "CLOSED" : "ACTIVE"}</p>
                {data.status !== "InProgress" && <p className={`proposal-status ${data.status === "Passed" ? "proposal-active" : "proposal-closed"}`}>{data.status === "Passed" ? "PASSED" : "REJECTED"}</p>}
                <p className="proposal-duration"><i className="fa fa-clock-o"></i>&nbsp;Duration: From block {data.start_height} to block {data.end_height}</p>
            </div>
        </div>
    )
}

export default Proposal