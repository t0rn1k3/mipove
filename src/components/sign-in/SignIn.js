import React from "react";
import { auth, signWithGoogle } from "../../firebase/FirebaseUtils";
import FormInput from "../form/FormInput";
import CustomButton from "../button/CustomButton";
import './SignIn.css';

class SignIn extends React.Component {
    constructor(props){
        super(props);

        this.state = {
            email : '',
            password: ''
        }
    }

    submitHandler = async e => {
        e.preventDefault();

        const { email, password } = this.state;

        try {
            await auth.signInWithEmailAndPassword(email, password);

        this.setState({ email: '', password: '' });

        }catch(error) {
            console.log(error)
        }

    }


    ChangeHandler = (e) => {
        const { value, name } = e.target;

        this.setState({ [name]: value })
    }

    render() {
        return(
            <div>
                <h2>ავტორიზაცია</h2>
                <form className="signin-form" onSubmit={this.submitHandler}>
                <label>ელ.ფოსტა</label>
                <FormInput 
                    className="form-input"
                    type='email' 
                    name="email"  
                    value={this.state.email} 
                    ChangeHandler={this.ChangeHandler}
                    required
                />
                <label>პაროლი</label>
                <FormInput 
                    className="form-input"
                    type='password' 
                    name="password" 
                    value={this.state.password} 
                    ChangeHandler={this.ChangeHandler}
                    required
                />

                <CustomButton type='submit' > შესვლა </CustomButton>
                <CustomButton onClick={signWithGoogle}>
                    {''}
                     შესვლა გუგლით {''}
                </CustomButton>
                
            </form>
            </div>
        )
    }
}
export default SignIn;  