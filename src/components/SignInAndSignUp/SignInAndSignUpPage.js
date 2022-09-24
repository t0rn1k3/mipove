import React from "react";

import SignIn from "../sign-in/SignIn";
import SignUp from "../sign-up/SignUp";

import './SignInAndSignUpPage.css';

const SignInAndSignUpPage = () => (
    <div className="SignInAndSignUpPage">
        <SignIn />
        <SignUp />
    </div>
)

export default SignInAndSignUpPage;