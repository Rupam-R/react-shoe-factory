import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import axios from 'axios';

const Banner = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // API Base Path
  const API_BASE = 'http://localhost:5000';

  // Static banner data as fallback
  const staticBanners = [
    {
      id: 1,
      name: "Summer Collection",
      details: "Step into style this season with our Summer Collection â€“ lightweight, trendy, and crafted for all-day comfort.",
      image: "img/banner/banner-img.png"
    },
    {
      id: 2,
      name: "New Arrivals",
      details: "Discover our latest shoe designs that combine comfort with cutting-edge style for every occasion.",
      image: "img/banner/banner-img-2.png"
    }
  ];

  // Fetch banners from database
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/banners`);
        setBanners(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error('Error fetching banners:', error);
        setError('Failed to load banners from database');
        // Use static banners as fallback
        setBanners(staticBanners);
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, []);

  // Slider settings
  const settings = {
    dots: true,
    infinite: banners.length > 1,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: false,
    fade: true,
    cssEase: 'linear'
  };

  if (loading) {
    return (
      <section className="banner-area" style={{ backgroundImage: "url('img/banner/banner-bg.jpg')" }}>
        <div className="container">
          <div className="row fullscreen align-items-center justify-content-center" style={{ height: '100vh' }}>
            <div className="text-center">
              <div className="spinner-border text-light" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="text-light mt-2">Loading banners...</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="banner-area" style={{ backgroundImage: "url('img/banner/banner-bg.jpg')" }}>
      <div className="container">
        <div className="row fullscreen align-items-center justify-content-start" style={{ height: '100vh' }}>
          <div className="col-lg-12">
            {/* Show error message if banners failed to load but still show static content */}
            {error && (
              <div className="alert alert-warning text-center mb-3" role="alert">
                {error} Showing static content instead.
              </div>
            )}
            
            <Slider {...settings} className="active-banner-slider">
              {banners.map((banner) => (
                <div key={banner.id} className="row single-slide align-items-center d-flex">
                  <div className="col-lg-5 col-md-6">
                    <div className="banner-content">
                      <h1>{banner.name}</h1>
                      <p>{banner.details}</p>
                      <div className="add-bag d-flex align-items-center">
                        <Link className="add-btn" to="/products">
                          <span className="lnr lnr-cross"></span>
                        </Link>
                        <span className="add-text text-uppercase">Add to Bag</span>
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-7">
                    <div className="banner-img">
                      <img 
                        className="img-fluid" 
                        // Use the image path directly for static banners, or construct the path for database banners
                        src={banner.image.startsWith('http') || banner.image.startsWith('/') ? 
                             `${banner.image.startsWith('/') ? API_BASE : ''}${banner.image}` : 
                             banner.image} 
                        alt={banner.name} 
                        onError={(e) => {
                          e.target.src = 'img/banner/banner-img.png'; // Fallback image
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </Slider>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Banner;
