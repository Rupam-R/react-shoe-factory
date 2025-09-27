import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Brands.css';

const API_BASE_URL = import.meta.env.MODE === 'development' 
  ? 'http://localhost:5000'
  : '';

const Brands = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Static brand data as fallback
  const staticBrands = [
    {
      id: 1,
      name: "Nike",
      details: "Just Do It",
      image: "img/brand/1.png"
    },
    {
      id: 2,
      name: "Adidas",
      details: "Impossible is Nothing",
      image: "img/brand/2.png"
    },
    {
      id: 3,
      name: "Puma",
      details: "Forever Faster",
      image: "img/brand/3.png"
    },
    {
      id: 4,
      name: "Reebok",
      details: "I Am What I Am",
      image: "img/brand/4.png"
    },
    {
      id: 5,
      name: "New Balance",
      details: "Fearlessly Independent",
      image: "img/brand/5.png"
    }
  ];

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/brands`);
        
        // Add image paths to brands
        const brandsWithImages = (response.data.brands || []).map(brand => ({
          ...brand,
          image: getImagePath(brand.image)
        }));
        
        setBrands(brandsWithImages);
      } catch (err) {
        console.error('Error fetching brands:', err);
        setError(err.response?.data?.message || 'Failed to fetch brands from database');
        
        // Use static brands as fallback
        setBrands(staticBrands);
      } finally {
        setLoading(false);
      }
    };

    fetchBrands();
  }, []);

  // Auto-slide functionality
  useEffect(() => {
    if (brands.length <= 5) return; // No need for auto-slide if all brands fit
    
    const interval = setInterval(() => {
      setCurrentIndex(prevIndex => 
        prevIndex >= brands.length - 5 ? 0 : prevIndex + 1
      );
    }, 3000); // Change slide every 3 seconds

    return () => clearInterval(interval);
  }, [brands.length]);

  // Helper function to get full image path
  const getImagePath = (imageName) => {
    if (!imageName) return '/img/brand.png';
    
    if (imageName.startsWith('http') || imageName.startsWith('/')) {
      return imageName;
    }
    
    return `/brand-img/${imageName}`;
  };

  if (loading) {
    return (
      <section className="brand-area section_gap">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-12 text-center">
              <p>Loading brands...</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="brand-area section_gap">
      <div className="container">
        {/* Show error message if brands failed to load but still show static content */}
        {error && (
          <div className="row justify-content-center">
            <div className="col-lg-8 text-center">
              <div className="alert alert-warning mb-4" role="alert">
                {error} Showing demo brands instead.
              </div>
            </div>
          </div>
        )}
        
        {/* If we have 5 or fewer brands, display them all without slider */}
        {brands.length <= 5 ? (
          <div className="row">
            {brands.map((brand) => (
              <div className="col" key={brand.id}>
                <div className="single-brand">
                  <img 
                    className="img-fluid d-block mx-auto" 
                    src={brand.image} 
                    alt={brand.name}
                    onError={(e) => {
                      e.target.src = '/img/brand.png';
                    }}
                  />
                  {brand.details && (
                    <p className="brand-details">{brand.details}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* For more than 5 brands, show as slider */
          <>
            <div className="brand-slider-container">
              <div 
                className="brand-slider-track"
                style={{ 
                  transform: `translateX(-${currentIndex * (100 / 5)}%)` 
                }}
              >
                {brands.map((brand) => (
                  <div className="brand-slide" key={brand.id}>
                    <div className="single-brand">
                      <img 
                        className="img-fluid d-block mx-auto" 
                        src={brand.image} 
                        alt={brand.name}
                        onError={(e) => {
                          e.target.src = '/img/brand.png';
                        }}
                      />
                      {brand.details && (
                        <p className="brand-details">{brand.details}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Dots indicator */}
            <div className="brand-slider-dots">
              {Array.from({ length: Math.ceil(brands.length / 5) }, (_, i) => (
                <span
                  key={i}
                  className={currentIndex === i * 5 ? 'active' : ''}
                  onClick={() => setCurrentIndex(i * 5)}
                ></span>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default Brands;
