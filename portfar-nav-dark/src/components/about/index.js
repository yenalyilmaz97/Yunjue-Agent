import React from 'react'
import abimg from '../../images/about.jpg'
import sign from '../../images/signeture.png'
import DefaultModal from '../AboutModal'


const About = (props) => {

    return (
        <section id="about" className="tp-about-section">
            <div className="container">
                <div className="row align-items-center">
                    <div className="col-lg-6 col-md-12 col-12">
                        <div className="tp-about-wrap">
                            <div className="tp-about-img">
                                <img src={abimg} alt="" />
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-6 col-md-12 col-12">
                        <div className="tp-about-text">
                            {/* <div className="tp-about-icon">
                                <i className="fi flaticon-web-design"></i>
                            </div> */}
                            <div className="tp-about-icon-content">
                                <h2>Keçiyi Besle, erkeğe zihinsel netlik, stratejik düşünce ve sosyal güç kazandırır.</h2>
                                <p>Keçiyi Besle, erkeğe zihinsel netlik, stratejik düşünme kapasitesi ve sosyal hayatta gerçek bir avantaj kazandıran kapsamlı bir gelişim sistemidir. Modern dünyada erkekler sürekli dikkat dağıtıcıların, karışık beklentilerin ve zayıflatıcı alışkanlıkların içine sıkışıyor. Biz bu gürültüyü kesip; odaklanmış, disiplinli ve güçlü bir erkeğin nasıl inşa edileceğini adım adım gösteriyoruz.</p>
                                <br />
                                <p> Burada amaç yüzeysel motivasyon değil; zihinsel keskinlik, davranışsal güç ve sosyal çevrede etkin bir pozisyon kazanmaktır. Keçiyi Besle, ilişkilerden iş dünyasına kadar hayatın her alanındaki dinamikleri analiz ederek, erkeğe stratejik avantaj sağlayan pratik teknikler sunar.  Her erkek aynı yollardan geçmez; bu yüzden yaklaşımımız kişiye özel, hedef odaklı ve sonuç garantili yöntemlerle ilerler.</p>
                                <div className="signeture">
                                    <span>
                                        <img 
                                            src={sign} 
                                            alt="" 
                                            style={{ 
                                                maxWidth: '150px', 
                                                width: '100%', 
                                                height: 'auto' 
                                            }} 
                                        />
                                    </span>
                                    <p>Ramazan Mert Durak</p>
                                </div>
                                <DefaultModal buttonClass={'template-btn'} />
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