import React from 'react'
import { useNavigate } from 'react-router-dom'
import "./styles.css"

const Proposal = (data) => {
    // const {title, status, duration} = data;
    const navigate = useNavigate();

    const showProposalDetail = (e) => {
        navigate(`/proposal/${data.data.poll_id}`);
    }

    return (
        <div className="proposal-container" onClick={showProposalDetail}>
            <div className="vertical-flex-box">
                <p className="proposal-title">{data.data.title}</p>
            </div>
            <p className="proposal-description">created by {data.data.creator}</p>
            <div className="proposal-additional-info vertical-flex-box">
                <p className="proposal-status">{data.data.status ? "ACTIVE" : "CLOSED"}</p>
                <p className="proposal-duration"><i className="fa fa-clock-o"></i>&nbsp;Duration: From block {data.data.start_height} to block {data.data.end_height}</p>
            </div>
        </div>
    )
}

export default Proposal