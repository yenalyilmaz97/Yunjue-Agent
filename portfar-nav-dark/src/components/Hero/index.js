import React, { Component } from 'react';
import AnchorLink from 'react-anchor-link-smooth-scroll'
import Slides from '../../images/slide-3.jpg';


class Hero extends Component {
    render() {
        return(
            <section id="home" className="hero hero-slider-wrapper hero-style-1">
                <div className="hero-slider">
                    <div className="slide" style={{ backgroundImage: `url(${Slides})` }}>
                        <div className="container">
                            <div className="row">
                                <div className="col col-md-10 col-sm-12 slide-caption">
                                    <div className="slide-subtitle">
                                        <h4>Karanlığını yönetmeyi öğrenmeyen adam, başkalarının oyuncağı olur. Burada kontrolü geri alırsın.</h4>
                                    </div>
                                    <div className="slide-title">
                                        <h2>Zayıf erkeklerin kaybolduğu yerde, biz güç inşa ediyoruz.</h2>
                                    </div>
                                    <div className="btns">
                                        <AnchorLink href="#contact" className="template-btn go-contact-area">Keçiyi Besle</AnchorLink>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="social-links">
                    <div className="overlay"></div>
                    <ul>
                        <li><a target="_blank" rel="noopener noreferrer" href="https://www.facebook.com/"><i className="fa fa-facebook"></i></a></li>
                        <li><a target="_blank" rel="noopener noreferrer" href="https://twitter.com/"><i className="fa fa-twitter"></i></a></li>
                        <li><a target="_blank" rel="noopener noreferrer" href="https://www.linkedin.com/"><i className="fa fa-linkedin"></i></a></li>
                        <li><a target="_blank" rel="noopener noreferrer" href="https://www.pinterest.com/"><i className="fa fa-pinterest"></i></a></li>
                    </ul>
                </div>
                <div className="white_svg">
                    <svg x="0px" y="0px" viewBox="0 186.5 1920 113.5">
                        <polygon points="0,300 655.167,210.5 1432.5,300 1920,198.5 1920,300 "></polygon>
                    </svg>
                </div>
            </section>
        )
    }
}

export default Hero;