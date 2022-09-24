import './Banner.css';

const Banner = () => {
    const Wallpaper = require('../../assets/images/WIX.jpg')

    return (
        <div className='banner'>
            <img src={Wallpaper} alt='wallpaper'/>
        </div>
    )

}

export default Banner;