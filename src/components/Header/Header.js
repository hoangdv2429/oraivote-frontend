import React from 'react'
import "./styles.css"

const Header = ({ selectingTab, onSelectingTab }) => {

    const tabs = ["Proposals", "Account"];

    return (
        <ul className="header vertical-flex-box">
            {
                tabs.map((item, i) => {
                    if (i === selectingTab) return <li className="header-item header-selecting-item" key={i} id={`header-item-${i}`} onClick={onSelectingTab}>{item}</li>
                    else return <li className="header-item" key={i} id={`header-item-${i}`} onClick={onSelectingTab}>{item}</li>
                })
            }
        </ul>
    )
}

export default Header