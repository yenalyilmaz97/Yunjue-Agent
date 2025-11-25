import React, {Fragment} from 'react';
import Hero from '../../components/Hero';
import About from '../../components/about';
import Service from '../../components/Service';
import PricingPlan from '../../components/Pricing';
import BlogSection from '../../components/BlogSection';
import ContactSection from '../../components/ContactSection';
import Footer from '../../components/Footer';
import Testimonial from '../../components/Testimonials';
import Portfolio from '../../components/portfolio';
import Scrollbar from '../../components/Scroolbar'
import Navbar from '../../components/Navbar';
import 'bootstrap/dist/css/bootstrap.min.css';
import {Element} from 'react-scroll'


const HomePage =() => {
    return(
        <Fragment>
            <Navbar />
            <Element name='home'>
                <Hero/>
            </Element>
            <Element name='about'>
                 <About/>
            </Element>
            <Element name="service">
                <Service/>
            </Element>
            <Element name="portfolio">
                <Portfolio/>
            </Element>
            <Element name="testimonials">
            <Testimonial/>
            </Element>
            <PricingPlan/>
            {/* <Element name="blog">
                <BlogSection/>
            </Element> */}
            <Element name="contact">
                <ContactSection/>
            </Element>
            <Footer/>
            <Scrollbar/>
        </Fragment>
    )
};
export default HomePage;


