import React, { Component } from 'react';
import Logo from '../../images/logo.png';
import { Link } from 'react-router-dom'

class Footer extends Component {
    render() {
        return (
            <div className="footer-area text-center">
                <div className="container">
                    <div className="row">
                        <div className="col-12">
                            <div className="footer-image">
                                <Link to="/home">
                                    <img src={Logo} alt="" />
                                </Link>
                            </div>
                        </div>
                        <div className="col-12">
                            <div className="footer-menu">
                                <ul className="d-flex " >
                                    {/* <li><a target="_blank" rel="noopener noreferrer" href="https://www.facebook.com/"><i className="fa fa-facebook"></i></a></li>
                                <li><a target="_blank" rel="noopener noreferrer" href="https://twitter.com/"><i className="fa fa-twitter"></i></a></li>
                                <li><a target="_blank" rel="noopener noreferrer" href="https://www.linkedin.com/"><i className="fa fa-linkedin"></i></a></li>
                                <li><a target="_blank" rel="noopener noreferrer" href="https://www.pinterest.com/"><i className="fa fa-pinterest"></i></a></li>
                                <li><a target="_blank" rel="noopener noreferrer" href="https://www.skype.com/en/"><i className="fa fa-skype"></i></a></li> */}
                                    <li><a target="_blank" rel="noopener noreferrer" href="https://www.instagram.com/keciyibesle/"><i className="fa fa-instagram"></i></a></li>
                                </ul>
                            </div>
                        </div>
                        <div className="col-12">
                            <div className="footer-sub">
                                <p><i className="fa fa-copyright"></i> <span> 2025 Keçiyi Besle. Tüm hakları saklıdır.</span></p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default Footer;