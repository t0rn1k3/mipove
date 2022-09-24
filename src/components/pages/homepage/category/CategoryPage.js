import React from "react";
import { Link } from "react-router-dom";

import './CategoryPage.css';


class CategoryPage extends React.Component {
    constructor(){
        super();

        this.state = {
            categories : [
                {
                    id:1,
                    name: 'ავეჯის დამზადება / შეკეთება',
                    users : [
                        {
                            id: 1,
                            name: 'თორნიკე ბურჯანაძე'
                        }
                    ],
                    linkUrl: '/furniture'
                },
                {
                    id:2,
                    name: 'მხატვრობა',
                    linkUrl: '/painting'
                },
                {
                    id:3,
                    name: 'ბიჟუტერია',
                    linkUrl: '/jewelry'
                },
                {
                    id:4,
                    name: 'გასაღების დამზადება',
                    linkUrl: '/keys'
                },
                {
                    id:5,
                    name: 'საათების  შეკეთება',
                    linkUrl: '/watches'
                },
                {
                    id: 6,
                    name: 'სათვალის შეკეთება',
                    linkUrl: '/glasses'
                },
                {
                    id:7,
                    name: 'ოქრომჭედელი',
                    linkUrl: '/goldsmith'
                },
                {
                    id:8,
                    name: 'ტანსაცმლის კერვა / გადაკეთება',
                    linkUrl: '/clothes'
                },
                {
                    id:9,
                    name: 'ჯანმრთელობა',
                    linkUrl: '/health'
                },
                {
                    id:10,
                    name: 'ტყავის ნივთების დამზადება',
                    linkUrl: '/leather'
                },
                {
                    id:11,
                    name: 'ფეხსაცმლის კერვა / შეკეთება',
                    linkUrl: '/shoes'
                },
                {
                    id:12,
                    name: 'ქვის დამუშავება',
                    linkUrl: '/rock-art'
                },
                {
                    id:13,
                    name: 'ქრომირება / მონიკელება',
                    linkUrl: '/chrome'
                },
                {
                    id:14,
                    name: 'ჩანთების დამზადება / შეკეთება',
                    linkUrl: '/bags'
                },
                {
                    id:15,
                    name: 'ჩემოდნების შეკეთება',
                    linkUrl: '/suitcase'
                }
            ]
        }
    }

    render () {
        return (
            <div className="category-container">
                {this.state.categories.map(category => 
                    <div key={category.id} className="category">
                        <Link target='_blank' to={category.linkUrl}>{category.name}</Link>
                    </div>
                )}
            </div>
        )
    }
}


export default CategoryPage;