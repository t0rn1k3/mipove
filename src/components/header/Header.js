import React from 'react';
import { Link  } from 'react-router-dom';


import NavBar from '../navbar/Navbar';
import LogIn from '../registration/logIn/LogIn';

import './Header.css';


const Header = ({currentUser}) => {
    const logo = require('../../assets/images/logo2.png');

    return (
        <header>
                <Link className='logo' to='/'>
                    <img src={logo} alt='logo'/>
                </Link>
                <NavBar />
                <LogIn currentUser={currentUser} />
                
        </header>
    )
}

export default Header;