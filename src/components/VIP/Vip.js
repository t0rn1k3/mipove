import React from "react";

import BoxesVip from "./BoxesVip";

import './Vip.css';

class Vip extends React.Component {
    constructor() {
        super();

        this.state = {
            vipUsers : [
                {
                    id: 1,
                    firstName: "სახელი",
                    lastName: 'გვარი',
                    profession: 'პროფესია',
                    phone: 'ტელეფონი',
                    image: ''
                },
                {
                    id: 2,
                    firstName: "სახელი",
                    lastName: 'გვარი',
                    profession: 'პროფესია',
                    phone: 'ტელეფონი',
                    image: ''
                },
                {
                    id: 3,
                    firstName: "სახელი",
                    lastName: 'გვარი',
                    profession: 'პროფესია',
                    phone: 'ტელეფონი',
                    image: ''
                },
                {
                    id: 4,
                    firstName: "სახელი",
                    lastName: 'გვარი',
                    profession: 'პროფესია',
                    phone: 'ტელეფონი',
                    image: ''
                },
                {
                    id: 5,
                    firstName: "სახელი",
                    lastName: 'გვარი',
                    profession: 'პროფესია',
                    phone: 'ტელეფონი',
                    image: ''
                },
                {
                    id: 6,
                    firstName: "სახელი",
                    lastName: 'გვარი',
                    profession: 'პროფესია',
                    phone: 'ტელეფონი',
                    image: ''
                },
                {
                    id: 7,
                    firstName: "სახელი",
                    lastName: 'გვარი',
                    profession: 'პროფესია',
                    phone: 'ტელეფონი',
                    image: ''
                },
                {
                    id: 8,
                    firstName: "სახელი",
                    lastName: 'გვარი',
                    profession: 'პროფესია',
                    phone: 'ტელეფონი',
                    image: ''
                }
            ]
        }
    }


    render(){
        return(
            <div>
                <h2 className="h2">VIP</h2>
                <div className="boxes">
                    {this.state.vipUsers.map(vipUser => 
                        <BoxesVip 
                            key={vipUser.id} 
                            firstName={vipUser.firstName} 
                            lastName={vipUser.lastName}
                            profession={vipUser.profession}
                            phone={vipUser.phone}
                        />       
                     )}
                </div>
            </div>
        )
    }

}


export default Vip;