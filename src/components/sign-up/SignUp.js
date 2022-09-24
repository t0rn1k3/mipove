import React from "react";

import FormInput from "../form/FormInput";
import CustomButton from "../button/CustomButton";

import './SignUp.css';

import { createUserProfileDocument, auth } from "../../firebase/FirebaseUtils";


class SignUp extends React.Component {
    constructor(){
        super();


        this.state = {
            displayName:  '',
            email: '',
            password: '',
            confirmPassword:''
        }
    }

    submitHandler = async e => {
        e.preventDefault();

        const {displayName, email, password, confirmPassword} =  this.state;

        if (password !== confirmPassword )  {
            alert("პაროლები არ ემთხვევა")
            return;
        }

        try{
            const {user} = auth.createUserWithEmailAndPassword(email, password)

            await createUserProfileDocument(user, {displayName})

            this.setState({
                displayName:  '',
                email: '',
                password: '',
                confirmPassword:''
            })
        } catch(error) {
            console.error(error)
        }

    }

    changeHandler = e => {
        const {value, name} = e.target;
        

        this.setState({[name] : value})
    }

    render() {
        const {displayName, email, password, confirmPassword} =  this.state;
        return (
            <div>
                <h2>გაიარეთ რეგისტრაცია</h2>               
                <form className="sign-up" onSubmit={this.submitHandler}>
                <label>სახელი*</label>
                <FormInput
                    type='text'
                    name='displayName'
                    value={displayName}
                    onChange={this.changeHandler}
                    required
                />
                <label>ელ.ფოსტა*</label>
                <FormInput
                    type='email'
                    name='email'
                    value={email}
                    onChange={this.changeHandler}
                    required
                />
                <label>პაროლი*</label>
                <FormInput
                    type='password'
                    name='password'
                    value={password}
                    onChange={this.changeHandler}
                    required
                />
                <label>გაიმეორეთ პაროლი*</label>
                <FormInput
                    type='password'
                    name='confirmPassword'
                    value={confirmPassword}
                    onChange={this.changeHandler}
                    required
                />
                <CustomButton type='submit'> რეგისტრაცია </CustomButton>
            </form>
            </div>
        )
    }
}


export default SignUp;