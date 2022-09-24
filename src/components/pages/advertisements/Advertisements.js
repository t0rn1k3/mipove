import React from "react";
import DocumentLogo from '../../../assets/images/document.svg';
import { Link } from "react-router-dom";

import './Advertisements.css';

const Advertisements = () => {
    return (
        <div>
            <h2>განცხადებები</h2>
            <div className="documents">
                <div className="doc">
                    <Link to="/#">
                        <span>კომპიუტერის მაგიდა</span>
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default Advertisements;