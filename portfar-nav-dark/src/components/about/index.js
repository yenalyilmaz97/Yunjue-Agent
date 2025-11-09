import React from 'react'
import abimg from '../../images/about.jpg'
import sign from '../../images/signeture.png'
import DefaultModal from '../AboutModal'


const About = (props) => {

    return(
        <section id="about" className="tp-about-section">
            <div className="container">
                <div className="row align-items-center">
                    <div className="col-lg-6 col-md-12 col-12">
                        <div className="tp-about-wrap">
                        <div className="tp-about-img">
                            <img src={abimg} alt=""/>
                        </div>
                        </div>
                    </div>
                    <div className="col-lg-6 col-md-12 col-12">
                        <div className="tp-about-text">
                        <div className="tp-about-icon">
                            <i className="fi flaticon-web-design"></i>
                        </div>
                        <div className="tp-about-icon-content">
                            <h2>Professional And Dedicated Creative Designer</h2>
                            <p>Check out 10 Best Design's updates for the top web design  & development companies for your needs by reviewing our list & development companies! Find the best web design. Web Design Consulting. Comprehensive Directory. Top Reviewed Design Firms. Types: Enterprise Design Firms, Startup Design Firms, Custom Design Firms, eCommerce Design Firms, App Design Firms. Custom Web Solution. 24x7 Customer Support. Secure Payment Gateway. Get A Free Web Quote. 24/7 Chat Support. Services: Web Page Design, Landing Page Design, App development, Mobile Website Design</p>
                            <div className="signeture">
                                <span><img src={sign} alt=""/></span>
                                <p>Ceo Of Designlab IT</p>
                            </div>
                            <DefaultModal buttonClass={'template-btn'}/>
                        </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="white_svg svg_white">
                <svg x="0px" y="0px" viewBox="0 186.5 1920 113.5">
                    <polygon points="0,300 655.167,210.5 1432.5,300 1920,198.5 1920,300 "></polygon>
                </svg>
            </div>
        </section>
    )
}

export default About;