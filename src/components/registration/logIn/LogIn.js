import React from "react";
import { Link } from "react-router-dom";
import { auth } from "../../../firebase/FirebaseUtils";

import RegisterLogo from '../../../assets/images/avatar.svg';
import './LogIn.css';

const LogIn = ({currentUser}) => (

        <div className="enter-login">
            <img  src={RegisterLogo}  alt='reagistration logo' /> 
            {
                currentUser ?
                <div className="enter" onClick={ ()=> auth.signOut() }> გამოსვლა </div> 
                :
                <Link className="enter" to={'/signin'}>შესვლა</Link>
                
            }
        </div>
      
)



export default LogIn;