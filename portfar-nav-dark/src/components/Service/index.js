import React, { useState } from 'react';
import ServiceSingle from '../ServiceSingle'
import { Button } from '@material-ui/core'
import s1 from '../../images/service-single/web-design/img-1.jpg'
import s2 from '../../images/service-single/web-design/img-2.jpg'
import s3 from '../../images/service-single/web-design/img-3.jpg'

import d1 from '../../images/service-single/development/img-1.jpg'
import d2 from '../../images/service-single/development/img-2.jpg'
import d3 from '../../images/service-single/development/img-3.jpg'

import c1 from '../../images/service-single/creative/img-1.jpg'
import c2 from '../../images/service-single/creative/img-2.jpg'
import c3 from '../../images/service-single/creative/img-3.jpg'

import r1 from '../../images/service-single/responsive/img-1.jpg'
import r2 from '../../images/service-single/responsive/img-2.jpg'
import r3 from '../../images/service-single/responsive/img-3.jpg'

import b1 from '../../images/service-single/branding/img-1.jpg'
import b2 from '../../images/service-single/branding/img-2.jpg'
import b3 from '../../images/service-single/branding/img-3.jpg'

import sp1 from '../../images/service-single/support/img-1.jpg'
import sp2 from '../../images/service-single/support/img-2.jpg'
import sp3 from '../../images/service-single/support/img-3.jpg'

const Service = () => {

    const [open, setOpen] = React.useState(false);

    function handleClose() {
        setOpen(false);
    }

    const [state,setState] = useState({
    })

    const handleClickOpen = (item) =>{
        setOpen(true);
        setState(item)
    }
    const service = [
        {
            Id:"1",
            sIcon:"fi flaticon-web-design",
            heading:"Net ve Hızlı Karar Verebilen Bir Zihin",
            Simg1:s1,
            Simg2:s2,
            Simg3:s3,
            des:'Web Design, Landing Page Design, App development, Mobile an Website Design an expert web designer and developer. Contrary to popular belief Lorem Ipsum is not simply random text. It has Design,'
        },
        {
            Id:"2",
            sIcon:"fi flaticon-laptop",
            heading:"Otorite Taşıyan Bir Duruş",
            Simg1:d1,
            Simg2:d2,
            Simg3:d3,
            des:'Design, Landing Page Design, App development, Mobile an Website Design an expert web designer and developer. Contrary to popular belief Lorem Ipsum is not simply random text. It has Design,'
            
        },
        {
            Id:"3",
            sIcon:"fi flaticon-paint-palette",
            heading:"Sosyal Ortamlarda Ağırlık Koyma Becerisi",
            Simg1:c1,
            Simg2:c2,
            Simg3:c3,
            des:'Web Development, Landing Page Design, App development, Mobile an Website Design an expert web designer and developer. Contrary to popular belief Lorem Ipsum is not simply random text. It has Design,'
        },
        {
            Id:"4",
            sIcon:"fi flaticon-smartphone",
            heading:"Stratejik İletişim",
            Simg1:r1,
            Simg2:r2,
            Simg3:r3,
            des:'Responsive Design, Landing Page Design, App development, Mobile an Website Design an expert web designer and developer. Contrary to popular belief Lorem Ipsum is not simply random text. It has Design,'
        },
        {
            Id:"5",
            sIcon:"fi flaticon-verified",
            heading:"Kişisel Disiplin",
            Simg1:b1,
            Simg2:b2,
            Simg3:b3,
            des:'Branding Identity, Landing Page Design, App development, Mobile an Website Design an expert web designer and developer. Contrary to popular belief Lorem Ipsum is not simply random text. It has Design,'
        },
        {
            Id:"6",
            sIcon:"fi flaticon-operator",
            heading:"Profesyonel Hayatta Rekabet Gücü",
            Simg1:sp1,
            Simg2:sp2,
            Simg3:sp3,
            des:'24/Support, Landing Page Design, App development, Mobile an Website Design an expert web designer and developer. Contrary to popular belief Lorem Ipsum is not simply random text. It has Design,'
        },
    ]

    return (
        <div id="service" className="service-area section-padding">
            <div className="borderd"></div>
            <div className="container">
                <div className="col-l2">
                    <div className="section-title section-title2 text-center">
                        {/* <span>What I am Expert In</span> */}
                        <h2>Eğitimlerimizde</h2>
                    </div>
                </div>
                <div className="row">
                    {service.map((serv, srv) => (
                        <div className="col-lg-4 col-md-6 col-sm-12" key={srv}>
                            <div className="service-section">
                                <div className="services-wrapper">
                                    <div className="services-icon-wrapper">
                                        <div className="service-dot">
                                            <div className="dots"></div>
                                            <div className="dots2"></div>
                                        </div>
                                        <i className={serv.sIcon}></i>
                                    </div>
                                    <div className="service-content">
                                        <h2>{serv.heading}</h2>
                                        <p>{serv.des}</p>
                                        <Button
                                            className="btn"
                                            onClick={()=> handleClickOpen(serv)}>
                                            Read More
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        ))}
                </div>
            </div>
            <div className="white_svg">
                <svg x="0px" y="0px" viewBox="0 186.5 1920 113.5">
                    <polygon points="0,300 655.167,210.5 1432.5,300 1920,198.5 1920,300 "></polygon>
                </svg>
            </div>
            <ServiceSingle open={open} onClose={handleClose} title={state.heading} doc={state.doc} image1={state.Simg1} image2={state.Simg2} image3={state.Simg3}/>
        </div>
    );
}
export default Service;