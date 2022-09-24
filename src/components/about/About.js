import React from "react";

import './About.css';

const About = () => {
 
    const unity = require('../../assets/images/unity.jpg')

    return (
        <div className="about">
            <div className="height">
                <div className="image">
                    <img src={unity} alt='unity' />
                </div>
                <div className="us">
                    <h2 className="resp2">ჩვენ შესახებ</h2>
                    <p>
                    <span className="bold">
                         MIPOVE.GE </span> 2021 წლიდან გთავაზობთ მარტივ გზას, დაუკავშირდეთ თქვენთვის სასურველი პროფესიის ადამიანებს უმოკლეს დროში. <span class="bold">MIPOVE.GE</span>  ასევე გაძლევთ განვითარებისა და წინსვლის საშუალებას. თუ თქვენი საქმიანობა ემთხვევა ჩვენს საიტზე არსებულ რომელიმე პროფესიას და გსურთ, თავადაც მოხვდეთ ამ სიაში, შეავსეთ განცხადება და გამოგვიგზავნეთ.
                    </p>
                </div>
            </div>
        </div>
    )
}

export default About;