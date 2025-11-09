import React, { Component } from 'react';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import testimonialImg_1 from '../../images/testimonial/1.jpg';
import testimonialImg_2 from '../../images/testimonial/2.jpg';
import testimonialImg_3 from '../../images/testimonial/3.jpg';

class Testimonial extends Component {
    render() {
        const settings = {
            dots: false,
            infinite: true,
            arrows: true,
            fade: true,
            speed: 500,
            slidesToShow: 1,
            slidesToScroll: 1,
            centerPadding: 30,
            focusOnSelect: false,
            responsive: [
                {
                    breakpoint: 1024,
                    settings: {
                        slidesToShow: 1,
                        slidesToScroll: 1,
                        infinite: true,
                        dots: true
                    }
                },
                {
                    breakpoint: 600,
                    settings: {
                        slidesToShow: 1,
                        slidesToScroll: 2,
                        initialSlide: 2
                    }
                },
                {
                    breakpoint: 480,
                    settings: {
                        slidesToShow: 1,
                        slidesToScroll: 1
                    }
                }
            ]
        };
        return (
            <div className="testimonial-area">
                <div className="container">
                    <div className="testimonial-active">
                        <div className="testimonial-wrap">
                            <Slider {...settings}>
                                <div className="testimonial-item">
                                    <div className="testimonial-content">
                                        <div className="testimonial-img">
                                            <img src={testimonialImg_1} alt="" />
                                        </div>
                                        <div className="testimonial-content">
                                            <h4>David Warner</h4>
                                            <span>SEO of digita</span>
                                            <p>It uses a dictionary of over 200 Latin words, combined with a handful of model sentence structures, to generate Lorem Ipsum which looks reasonable. The generated Lorem Ipsum is the therefore always free from repetition, injected humour,sure there embarrassing the middle of text. All the Lorem Ipsum generators on the Internet tend to repeat predefined Lorem Ipsum is therefore always free from repetition.</p>
                                        </div>
                                        <div className="testimonial-icon">
                                            <i className="fi flaticon-right-quote"></i>
                                        </div>
                                    </div>
                                </div>
                                <div className="testimonial-item">
                                    <div className="testimonial-content">
                                        <div className="testimonial-img">
                                            <img src={testimonialImg_2} alt="" />
                                        </div>
                                        <div className="testimonial-content">
                                            <h4>Lily Watson</h4>
                                            <span>SEO of Art</span>
                                            <p>It uses a dictionary of over 200 Latin words, combined with a handful of model sentence structures, to generate Lorem Ipsum which looks reasonable. The generated Lorem Ipsum is the therefore always free from repetition, injected humour,sure there embarrassing the middle of text. All the Lorem Ipsum generators on the Internet tend to repeat predefined Lorem Ipsum is therefore always free from repetition.</p>
                                        </div>
                                        <div className="testimonial-icon">
                                            <i className="fi flaticon-right-quote"></i>
                                        </div>
                                    </div>
                                </div>
                                <div className="testimonial-item">
                                    <div className="testimonial-content">
                                        <div className="testimonial-img">
                                            <img src={testimonialImg_3} alt="" />
                                        </div>
                                        <div className="testimonial-content">
                                            <h4>Martin Gaptil</h4>
                                            <span>SEO of Alka</span>
                                            <p>It uses a dictionary of over 200 Latin words, combined with a handful of model sentence structures, to generate Lorem Ipsum which looks reasonable. The generated Lorem Ipsum is the therefore always free from repetition, injected humour,sure there embarrassing the middle of text. All the Lorem Ipsum generators on the Internet tend to repeat predefined Lorem Ipsum is therefore always free from repetition.</p>
                                        </div>
                                        <div className="testimonial-icon">
                                            <i className="fi flaticon-right-quote"></i>
                                        </div>
                                    </div>
                                </div>
                            </Slider>
                        </div>
                    </div>
                </div>
                <div className="white_svg">
                    <svg x="0px" y="0px" viewBox="0 186.5 1920 113.5">
                        <polygon points="0,300 655.167,210.5 1432.5,300 1920,198.5 1920,300 "></polygon>
                    </svg>
                </div>
            </div>




        );
    }
}

export default Testimonial;