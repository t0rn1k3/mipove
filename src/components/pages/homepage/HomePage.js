import React from "react";

import Banner from "../../banner/Banner";
import Vip from "../../VIP/Vip";
import About from "../../about/About";
import Footer from "../../footer/Footer";

import './HomePage.css';

const HomePage = () => (
    <div className="home-page">
        <Banner />
        <Vip />
        <About />
        <Footer />
    </div>
)

export default HomePage;