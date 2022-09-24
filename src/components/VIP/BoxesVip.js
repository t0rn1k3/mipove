import React from "react";

import './BoxesVip.css';

const BoxesVip = (props) => {

    const bgi = require('../../assets/images/bgi.jpg')

    return(
        <div className="box">
            <div className="picture">
                <img src={bgi} alt=""/>
                <div className="hovers">
                    <div className="names"> 
                        <h4>{props.firstName}</h4>    
                        <p>{props.profession}</p>
                    </div>
                    <div className="adress">
                        <p>
                            <span>{props.phone}</span> 
                        </p>
                    </div>
                </div>
            </div>
        </div> 
    )
}





export default BoxesVip;