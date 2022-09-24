import React from "react";
import { Link } from 'react-router-dom';

import "./Navbar.css";


const NavBar = () =>{


    return (
            <nav className="nav">
                <ul>
                    <li><Link to={'/'}>მთავარი</Link></li>
                    <li><Link to={"/category"}>კატეგორიები</Link></li>
                    <li><Link to="/advertisements">განცხადებები</Link></li>
                    <li><Link to="#">კონტაქტი</Link></li>
                </ul>
            </nav>
        
    )
}

export default NavBar;