import React, { useState, useEffect } from 'react';

const Deals = () => {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Static week deal data as fallback
  const staticWeekDeals = [
    {
      id: 1,
      deal_name: "Weekend Special - 30% Off!",
      deal_details: "Enjoy massive discounts on selected items",
      product_name: "Casual Sneakers",
      product_details: "Comfortable everyday sneakers",
      product_price: "89.99",
      product_image: "img/product/p1.jpg",
      deal_image: "img/category/c5.jpg"
    },
    {
      id: 2,
      deal_name: "Flash Sale - Limited Stock",
      deal_details: "Grab these deals before they're gone",
      product_name: "Running Shoes",
      product_details: "High-performance running shoes",
      product_price: "119.99",
      product_image: "img/product/p2.jpg"
    },
    {
      id: 3,
      deal_name: "Summer Collection Sale",
      deal_details: "Perfect for summer adventures",
      product_name: "Beach Sandals",
      product_details: "Comfortable beach wear",
      product_price: "49.99",
      product_image: "img/product/p3.jpg"
    },
    {
      id: 4,
      deal_name: "Premium Collection",
      deal_details: "Luxury meets comfort",
      product_name: "Leather Boots",
      product_details: "Durable leather construction",
      product_price: "159.99",
      product_image: "img/product/p4.jpg"
    },
    {
      id: 5,
      deal_name: "Athletic Gear Sale",
      deal_details: "Performance enhancing footwear",
      product_name: "Basketball Shoes",
      product_details: "Designed for court performance",
      product_price: "129.99",
      product_image: "img/product/p5.jpg"
    },
    {
      id: 6,
      deal_name: "Formal Collection",
      deal_details: "Elegance for special occasions",
      product_name: "Dress Shoes",
      product_details: "Classic formal footwear",
      product_price: "179.99",
      product_image: "img/product/p6.jpg",
      deal_image: "img/category/c5.jpg"
    }
  ];

  useEffect(() => {
    const fetchWeekDeals = async () => {
      try {
        setLoading(true);
        // Adjust the API_BASE_URL according to your environment
        const API_BASE_URL = import.meta.env.MODE === 'development' 
          ? 'http://localhost:5000'
          : '';
        
        const response = await fetch(`/api/weekdeals`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch week deals');
        }
        
        const data = await response.json();
        const dealsWithImages = (data.deals || []).map(deal => ({
          ...deal,
          product_image: getImagePath(deal.product_image),
          deal_image: getImagePath(deal.deal_image)
        }));
        setDeals(dealsWithImages);
      } catch (err) {
        console.error('Error fetching week deals:', err);
        setError(err.message);
        
        // Use static deals as fallback
        setDeals(staticWeekDeals);
      } finally {
        setLoading(false);
      }
    };

    fetchWeekDeals();
  }, []);

  // Helper function to get full image path
  const getImagePath = (imageName) => {
    if (!imageName) return null;
    
    if (imageName.startsWith('http') || imageName.startsWith('/')) {
      return imageName;
    }
    
    const API_BASE_URL = import.meta.env.MODE === 'development' 
      ? 'http://localhost:5000'
      : '';
    
    return `/weekdeal-img/${imageName}`;
  };

  if (loading) {
    return (
      <section className="related-product-area section_gap_bottom">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-12 text-center">
              <div className="loading-spinner"></div>
              <p>Loading deals...</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="related-product-area section_gap_bottom">
      <div className="container">
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
        
        <div className="row justify-content-center">
          <div className="col-lg-6 text-center">
            <div className="section-title">
              <h1>Deals of the Week</h1>
              <p>Don't miss out on our exclusive weekly offers. Limited time only!</p>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-lg-9">
            {deals.length > 0 ? (
              <div className="row related-products-container">
                {deals.map((deal) => (
                  <div className="col-lg-4 col-md-4 col-sm-6 col-6 mb-20" key={deal.id}>
                    <div className="single-related-product d-flex">
                      <a href="#">
                        <img
                          className="img-fluid week-deal-img product-thumb"
                          src={deal.product_image}
                          alt={deal.product_name}
                          onError={(e) => {
                            e.target.src = 'img/product.png';
                          }}
                        />
                      </a>
                      <div className="desc">
                        <a href="#" className="title">{deal.product_name}</a>
                        <div className="price">
                          <h6>${deal.product_price}</h6>
                          {deal.oldPrice && (
                            <h6 className="l-through">${deal.oldPrice}</h6>
                          )}
                        </div>
                        {deal.deal_details && (
                          <p className="deal-details">{deal.deal_details}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="row justify-content-center">
                <div className="col-12 text-center">
                  <p>No deals available this week. Check back soon!</p>
                </div>
              </div>
            )}
          </div>
          <div className="col-lg-3 d-none d-lg-block">
            <div className="ctg-right">
              <a href="#" target="_blank" rel="noopener noreferrer">
                <img 
                  className="img-fluid d-block mx-auto" 
                  src={deals.length > 0 && deals[0]?.deal_image ? deals[0].deal_image : "img/category/c5.jpg"} 
                  alt="Special Deal" 
                  onError={(e) => {
                    e.target.src = 'img/category/c5.jpg';
                  }}
                />
              </a>
              {deals.length > 0 && deals[0]?.deal_name && (
                <div className="deal-banner-caption">
                  <h3>{deals[0].deal_name}</h3>
                  <p>{deals[0].deal_details}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Deals;
