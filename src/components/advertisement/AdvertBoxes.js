import React from "react";

import './AdvertBoxes.css';

const AdvertBoxes = ({title, price}) => (
    <div  className="adv">
        <h4>{title}</h4>
        <p>{price}</p>
    </div>
)

export default AdvertBoxes;