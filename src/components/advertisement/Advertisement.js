import React from "react";
import { Link } from "react-router-dom";

import AdvertBoxes from "./AdvertBoxes";

import './Advertisement.css';

class Advertisement extends React.Component{
    constructor(){
        super();

        this.state = {
            advertisements : [
                {
                    id: 1,
                    title: 'სათაური',
                    price: 'ფასი'
                },
                {
                    id: 2,
                    title: 'სათაური',
                    price: 'ფასი'
                },
                {
                    id: 3,
                    title: 'სათაური',
                    price: 'ფასი'
                },
                {
                    id: 4,
                    title: 'სათაური',
                    price: 'ფასი'
                },
                {
                    id: 5,
                    title: 'სათაური',
                    price: 'ფასი'
                },
                {
                    id: 6,
                    title: 'სათაური',
                    price: 'ფასი'
                },
                {
                    id: 7,
                    title: 'სათაური',
                    price: 'ფასი'
                },
                {
                    id: 8,
                    title: 'სათაური',
                    price: 'ფასი'
                },
                {
                    id: 9,
                    title: 'სათაური',
                    price: 'ფასი'
                },
            ]
        }
    }

    render() {
        return (
            <div className="advert">
                <h2 className="h2">განცხადებები</h2>
                <div className="boxes">
                    {this.state.advertisements.map(({id, title, price}) => 
                        <AdvertBoxes 
                            key={id}
                            title={title}
                            price={price}
                        />
                    )}
                </div>
                <div className="more">
                    <Link to='./advertisements'>იხილეთ მეტი</Link>
                </div>
            </div>
            
        )
    }
}

export default Advertisement;