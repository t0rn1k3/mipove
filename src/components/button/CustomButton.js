import React from "react";

import './CustomButton.css';

const CustomButton = ({ children, ...buttonProps }) => (
    <button className="form-input" {...buttonProps}>
        {children}
    </button>
)


export default CustomButton;