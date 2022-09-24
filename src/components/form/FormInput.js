import React from "react";

import './FormInput.css';

const FormInput = ({ ChangeHandler, label, ...inputProps }) => (
    <div>
        <input className="form-input" onChange={ChangeHandler} {...inputProps} />
        {
            label ? 
            (<label className="form-label">
                {label}
            </label>)
            :null
        }
    </div>
)

export default FormInput;