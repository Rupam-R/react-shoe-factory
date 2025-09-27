import React from 'react';
import Header from './Header';
import Footer from './Footer';

const Contact = () => {
  return (
    <>
      <Header />
      <section className="banner-area organic-breadcrumb">
        <div className="container">
          <div className="breadcrumb-banner d-flex flex-wrap align-items-center justify-content-end">
            <div className="col-first">
              <h1>Contact Us</h1>
              <nav className="d-flex align-items-center">
                <a href="#">Home<span className="lnr lnr-arrow-right"></span></a>
                <a href="#">Contact</a>
              </nav>
            </div>
          </div>
        </div>
      </section>
      
      <section className="contact_area section_gap_bottom">
        <div className="container">
          <div className="mapBox" style={{ marginBottom: '30px' }}>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d29424.506342114622!2d88.30079586053934!3d22.80011852159339!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39f89ab446e041e3%3A0xbc3add2b4c126a25!2sBaidyabati%2C%20West%20Bengal!5e0!3m2!1sen!2sin!4v1756295149257!5m2!1sen!2sin"
              width="100%"
              height="400"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Google Maps Location"
            ></iframe>
          </div>
          <div className="row">
            <div className="col-lg-3">
              <div className="contact_info">
                <div className="info_item">
                  <i className="lnr lnr-home"></i>
                  <h6>California, United States</h6>
                  <p>Santa monica bullevard</p>
                </div>
                <div className="info_item">
                  <i className="lnr lnr-phone-handset"></i>
                  <h6><a href="tel:+4409865562">00 (440) 9865 562</a></h6>
                  <p>Mon to Fri 9am to 6 pm</p>
                </div>
                <div className="info_item">
                  <i className="lnr lnr-envelope"></i>
                  <h6><a href="mailto:support@colorlib.com">support@colorlib.com</a></h6>
                  <p>Send us your query anytime!</p>
                </div>
              </div>
            </div>
            <div className="col-lg-9">
              <form className="row contact_form" id="contactForm" noValidate>
                <div className="col-md-6">
                  <div className="form-group">
                    <input 
                      type="text" 
                      className="form-control" 
                      id="name" 
                      name="name" 
                      placeholder="Enter your name" 
                      onFocus={(e) => e.target.placeholder = ''} 
                      onBlur={(e) => e.target.placeholder = 'Enter your name'}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <input 
                      type="email" 
                      className="form-control" 
                      id="email" 
                      name="email" 
                      placeholder="Enter email address" 
                      onFocus={(e) => e.target.placeholder = ''} 
                      onBlur={(e) => e.target.placeholder = 'Enter email address'}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <input 
                      type="text" 
                      className="form-control" 
                      id="subject" 
                      name="subject" 
                      placeholder="Enter Subject" 
                      onFocus={(e) => e.target.placeholder = ''} 
                      onBlur={(e) => e.target.placeholder = 'Enter Subject'}
                      required
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group">
                    <textarea 
                      className="form-control" 
                      name="message" 
                      id="message" 
                      rows="5" 
                      placeholder="Enter Message" 
                      onFocus={(e) => e.target.placeholder = ''} 
                      onBlur={(e) => e.target.placeholder = 'Enter Message'}
                      required
                    ></textarea>
                  </div>
                </div>
                <div className="col-md-12 text-right">
                  <button type="submit" value="submit" className="primary-btn">Send Message</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}

export default Contact;