import React from "react";

import FormInput from "./FormInput";
import CustomButton from "../button/CustomButton";
import './Form.css';

class Form extends React.Component {
    constructor() {
        super();
    }

    render(){
        return(
            <form className="form">
                <div className="twoParts">
                    <div className="firstPart">
                        <label>სახელი *</label>
                        <FormInput type='text' name="firstName"/>
                        <label>ელ.ფოსტა</label>
                        <FormInput type="email" name="email"/>
                    </div>
                    <div className="secondPart">
                        <label>გვარი *</label>
                        <FormInput type="text" name="lastName"/>
                        <label>საკონტაქტო ტელ *</label>
                        <FormInput type="tel" name="tel"/> 
                    </div>
                </div>
                <label>მოგვიყევით თქვენი სქმიანობის შესახებ</label>
                <textarea type="text"></textarea>
                <CustomButton type="submit">გაგზავნა</CustomButton>
            </form>
        )
    }
}

export default Form;