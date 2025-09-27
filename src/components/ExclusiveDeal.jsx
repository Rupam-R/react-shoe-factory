import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const ExclusiveDeal = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: 20,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  const [currentSlide, setCurrentSlide] = useState(0);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const sliderRef = useRef(null);
  const slideInterval = useRef(null);

  const API_BASE_URL = import.meta.env.MODE === 'development' 
    ? 'http://localhost:5000'
    : '';

  // Static deal data as fallback
  const staticDeals = [
    {
      id: 1,
      deal_name: "Summer Sale - Limited Time Offer!",
      deal_details: "Get amazing discounts on our premium collection",
      deal_valid: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
      product_name: "Premium Running Shoes",
      product_details: "High-quality running shoes with advanced cushioning",
      product_image: "img/product/e-p1.png",
      product_price: "149.99"
    },
    {
      id: 2,
      deal_name: "Flash Sale - Ending Soon!",
      deal_details: "Don't miss out on our exclusive flash sale items",
      deal_valid: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 days from now
      product_name: "Casual Sneakers",
      product_details: "Comfortable everyday sneakers for all occasions",
      product_image: "img/product/e-p2.png",
      product_price: "89.99"
    }
  ];

  // Helper function to get full image path
  const getImagePath = (imageName) => {
    if (!imageName) return 'img/product/e-p1.png';
    
    if (imageName.startsWith('http') || imageName.startsWith('/')) {
      return imageName;
    }
    
    return `/deal-img/${imageName}`;
  };

  useEffect(() => {
    fetchDeals();
  }, []);

  const fetchDeals = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/deals`);
      
      // Filter only active deals (where deal_valid is in the future)
      const activeDeals = response.data.deals?.filter(deal => {
        const validDate = new Date(deal.deal_valid);
        return validDate >= new Date();
      }) || [];

      // Add image paths to deals
      const dealsWithImages = activeDeals.map(deal => ({
        ...deal,
        product_image: getImagePath(deal.product_image)
      }));

      setDeals(dealsWithImages);

      // Set timer for the first deal if available
      if (dealsWithImages.length > 0) {
        setCountdownTimer(dealsWithImages[0].deal_valid);
      }
    } catch (err) {
      console.error('Error fetching deals:', err);
      setError(err.response?.data?.message || 'Failed to fetch deals from database');
      
      // Use static deals as fallback
      setDeals(staticDeals);
      
      // Set timer for the first static deal
      if (staticDeals.length > 0) {
        setCountdownTimer(staticDeals[0].deal_valid);
      }
    } finally {
      setLoading(false);
    }
  };

  const setCountdownTimer = (dealValidDate) => {
    const targetDate = new Date(dealValidDate);
    const now = new Date();
    
    const difference = targetDate - now;
    
    if (difference <= 0) {
      setTimeLeft({ days: 20, hours: 10, minutes: 10, seconds: 0 });
      return;
    }
    
    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);
    
    setTimeLeft({ days, hours, minutes, seconds });
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prevTime => {
        const { days, hours, minutes, seconds } = prevTime;
        
        if (seconds > 0) {
          return { ...prevTime, seconds: seconds - 1 };
        } else if (minutes > 0) {
          return { ...prevTime, minutes: minutes - 1, seconds: 59 };
        } else if (hours > 0) {
          return { ...prevTime, hours: hours - 1, minutes: 59, seconds: 59 };
        } else if (days > 0) {
          return { ...prevTime, days: days - 1, hours: 23, minutes: 59, seconds: 59 };
        } else {
          clearInterval(timer);
          return prevTime;
        }
      });
    }, 1000);

    if (deals.length > 0) {
      startAutoSlide();
    }

    return () => {
      clearInterval(timer);
      stopAutoSlide();
    };
  }, [deals]);

  const startAutoSlide = () => {
    stopAutoSlide();
    slideInterval.current = setInterval(() => {
      goToNextSlide();
    }, 5000);
  };

  const stopAutoSlide = () => {
    if (slideInterval.current) {
      clearInterval(slideInterval.current);
    }
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
    // Update countdown timer for the selected deal
    if (deals[index]) {
      setCountdownTimer(deals[index].deal_valid);
    }
    startAutoSlide();
  };

  const goToPrevSlide = () => {
    const newIndex = (currentSlide - 1 + deals.length) % deals.length;
    setCurrentSlide(newIndex);
    setCountdownTimer(deals[newIndex]?.deal_valid);
    startAutoSlide();
  };

  const goToNextSlide = () => {
    const newIndex = (currentSlide + 1) % deals.length;
    setCurrentSlide(newIndex);
    setCountdownTimer(deals[newIndex]?.deal_valid);
    startAutoSlide();
  };

  if (loading) {
    return (
      <section className="exclusive-deal-area">
        <div className="container-fluid">
          <div className="row justify-content-center align-items-center">
            <div className="col-12 text-center py-5">
              <p>Loading deals...</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const currentDeal = deals[currentSlide];

  return (
    <section className="exclusive-deal-area">
      <div className="container-fluid">
        {/* Show error message if deals failed to load but still show static content */}
        {error && (
          <div className="row justify-content-center">
            <div className="col-lg-8 text-center">
              <div className="alert alert-warning mb-4" role="alert">
                {error} Showing demo deals instead.
              </div>
            </div>
          </div>
        )}
        
        <div className="row justify-content-center align-items-center">
          <div className="col-lg-6 no-padding exclusive-left" style={{ backgroundImage: "url('img/exclusive.jpg')" }}>
            <div className="row clock_sec clockdiv" id="clockdiv">
              <div className="col-lg-12">
                <h1>{currentDeal?.deal_name || "Special Offer"}</h1>
                <p>{currentDeal?.deal_details || "Limited time exclusive deal"}</p>
              </div>
              <div className="col-lg-12">
                <div className="row clock-wrap">
                  <div className="col clockinner1 clockinner">
                    <h1 className="days">{timeLeft.days}</h1>
                    <span className="smalltext">Days</span>
                  </div>
                  <div className="col clockinner clockinner1">
                    <h1 className="hours">{timeLeft.hours}</h1>
                    <span className="smalltext">Hours</span>
                  </div>
                  <div className="col clockinner clockinner1">
                    <h1 className="minutes">{timeLeft.minutes}</h1>
                    <span className="smalltext">Mins</span>
                  </div>
                  <div className="col clockinner clockinner1">
                    <h1 className="seconds">{timeLeft.seconds}</h1>
                    <span className="smalltext">Secs</span>
                  </div>
                </div>
              </div>
            </div>
            <a href="#" className="primary-btn">Shop Now</a>
          </div>
          <div className="col-lg-6 no-padding exclusive-right">
            <div className="active-exclusive-product-slider" ref={sliderRef}>
              <div className="slider-container">
                <button className="slider-arrow prev" onClick={goToPrevSlide}>
                  <img alt="Previous" src="img/product/prev.png"/>       
                </button>
                
                <div className="slider-wrapper">
                  {deals.length > 0 ? (
                    deals.map((deal, index) => (
                      <div 
                        className={`single-exclusive-slider ${index === currentSlide ? 'active' : ''}`} 
                        key={deal.id || index}
                      >
                        <img 
                          className="img-fluid" 
                          src={deal.product_image} 
                          alt={deal.product_name}
                          onError={(e) => {
                            e.target.src = 'img/product/e-p1.png';
                          }}
                        />
                        <div className="product-details">
                          <div className="price">
                            <h6>${deal.product_price}</h6>
                            <h6 className="l-through">${Math.round(parseFloat(deal.product_price || 0) * 1.4)}.00</h6>
                          </div>
                          <h4>{deal.product_name}</h4>
                          <p className="product-description">{deal.product_details}</p>
                          <div className="add-bag d-flex align-items-center justify-content-center">
                            <a className="add-btn" href="#"><span className="ti-bag"></span></a>
                            <span className="add-text text-uppercase">Add to Bag</span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="single-exclusive-slider active">
                      <img 
                        className="img-fluid" 
                        src="img/product/e-p1.png" 
                        alt="No deals available"
                      />
                      <div className="product-details">
                        <h4>No Active Deals</h4>
                        <p>Check back later for new offers</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <button className="slider-arrow next" onClick={goToNextSlide}>
                  <img alt="Next" src="img/product/next.png"/>
                </button>
              </div>
              
              {deals.length > 1 && (
                <div className="slider-dots">
                  {deals.map((_, index) => (
                    <button
                      key={index}
                      className={`slider-dot ${index === currentSlide ? 'active' : ''}`}
                      onClick={() => goToSlide(index)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ExclusiveDeal;
