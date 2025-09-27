import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFacebook, faTwitter, faDribbble, faBehance } from '@fortawesome/free-brands-svg-icons'
import { faHeart, faLongArrowAltRight } from '@fortawesome/free-solid-svg-icons'

const Footer = () => {
  return (
    <footer className="footer-area section_gap">
      <div className="container">
        <div className="row">
          <div className="col-lg-3 col-md-6 col-sm-6">
            <div className="single-footer-widget">
              <h6>About Us</h6>
              <p style={{ color: "white" }}>
                Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore dolore
                magna aliqua.
              </p>
            </div>
          </div>
          <div className="col-lg-4 col-md-6 col-sm-6">
            <div className="single-footer-widget">
              <h6>Newsletter</h6>
              <p style={{ color: "white" }}>Stay update with our latest</p>
              <div id="mc_embed_signup">
                <form
                  target="_blank"
                  noValidate
                  action="https://spondonit.us12.list-manage.com/subscribe/post?u=1462626880ade1ac87bd9c93a&amp;id=92a4423d01"
                  method="get"
                  className="form-inline"
                >
                  <div className="d-flex flex-row">
                    <input
                      className="form-control"
                      name="EMAIL"
                      placeholder="Enter Email"
                      onFocus={(e) => (e.target.placeholder = '')}
                      onBlur={(e) => (e.target.placeholder = 'Enter Email')}
                      required
                      type="email"
                    />
                    <button className="click-btn btn btn-default" type="submit">
                      <FontAwesomeIcon icon={faLongArrowAltRight} />
                    </button>
                    <div style={{ position: 'absolute', left: '-5000px' }}>
                      <input name="b_36c4fd991d266f23781ded980_aefe40901a" tabIndex="-1" defaultValue="" type="text" />
                    </div>
                  </div>
                  <div className="info"></div>
                </form>
              </div>
            </div>
          </div>
          <div className="col-lg-3 col-md-6 col-sm-6">
            <div className="single-footer-widget mail-chimp">
              <h6 className="mb-20">Instagram Feed</h6>
              <ul className="instafeed d-flex flex-wrap">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
                  <li key={item}><img src={`img/i${item}.jpg`} alt="" /></li>
                ))}
              </ul>
            </div>
          </div>
          <div className="col-lg-2 col-md-6 col-sm-6">
            <div className="single-footer-widget">
              <h6>Follow Us</h6>
              <p style={{ color: "white" }}>Let us be social</p>
              <div className="footer-social d-flex align-items-center">
                <a href="#"><FontAwesomeIcon icon={faFacebook} /></a>
                <a href="#"><FontAwesomeIcon icon={faTwitter} /></a>
                <a href="#"><FontAwesomeIcon icon={faDribbble} /></a>
                <a href="#"><FontAwesomeIcon icon={faBehance} /></a>
              </div>
            </div>
          </div>
        </div>
        <div className="footer-bottom d-flex justify-content-center align-items-center flex-wrap">
          <p style={{ color: "white" }} className="footer-text m-0">
            Copyright &copy;{new Date().getFullYear()} All rights reserved | This template is made with{" "}
            <FontAwesomeIcon icon={faHeart} /> by <a href="https://sstechnoweb.com/rupam-roy/" target="_blank" rel="noopener noreferrer">Rupam Roy</a>
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer

