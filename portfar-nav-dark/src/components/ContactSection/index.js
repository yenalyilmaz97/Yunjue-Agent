import React from 'react';
import ContactForm from '../ContactFrom'

const ContactSection = () => {

    return(
        <section id="contact" className="tp-contact-pg-section section-padding">
            <div className="container">
                <div className="row">
                    <div className="col col-lg-10 offset-lg-1">
                        <div className="office-info">
                            <div className="row">
                                {/* <div className="col col-xl-4 col-lg-6 col-md-6 col-12">
                                    <div className="office-info-item">
                                        <div className="office-info-icon">
                                            <div className="info-icon">
                                                <i className="fi flaticon-pin"></i>
                                            </div>
                                        </div>
                                        <div className="office-info-text">
                                            <h2>Address</h2>
                                            <p>7 Green Lake Street Crawfordsville, IN 47933</p>
                                        </div>
                                    </div>
                                </div>  */}
                                <div className="col col-xl-6 col-lg-6 col-md-6 col-12">
                                    <div className="office-info-item">
                                        <div className="office-info-icon">
                                            <div className="info-icon">
                                                <i className="fi flaticon-mail"></i>
                                            </div>
                                        </div>
                                        <div className="office-info-text">
                                            <h2>Email</h2>
                                            <p>iletisim@keciyibesle.com</p>
                                        </div>
                                    </div>
                                </div> 
                                <div className="col col-xl-6 col-lg-6 col-md-6 col-12">
                                    <div className="office-info-item">
                                        <div className="office-info-icon">
                                            <div className="info-icon">
                                                 <i className="fi flaticon-phone-call"></i>
                                            </div>
                                        </div>
                                        <div className="office-info-text">
                                            <h2>Whatsapp</h2>
                                            {/* <p>+1 800 123 456 789</p>
                                            <p>+1 800 123 654 987</p> */}
                                        </div>
                                    </div>
                                </div> 
                            </div>
                        </div>
                        {/* <div className="section-title section-title2 text-center">
                            <span>Contact</span>
                            <h2>Have Any Question?</h2>
                        </div>
                        <div className="tp-contact-form-area">
                            <ContactForm/>
                        </div> */}
                    </div>                
                </div>
            </div> 
            <section className="tp-contact-map-section">
                <div className="tp-contact-map">
                    <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d200065.484971909!2d26.914910011316778!3d38.417828663955994!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14bbd862a762cacd%3A0x628cbba1a59ce8fe!2zxLB6bWly!5e0!3m2!1sen!2str!4v1763064362523!5m2!1sen!2str"> </iframe>
                </div>
            </section>
        </section>
     )
        
}

export default ContactSection;
