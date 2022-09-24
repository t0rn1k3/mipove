import React from "react";

import ContactForm from "../contact/ContactForm";
import Contact from "../contact/Contact";

import './Footer.css';

const Footer = () => (
    <div className="footer">
        <div className="foot">
            <Contact />
            <ContactForm />
        </div>
    </div>
)

export default Footer;