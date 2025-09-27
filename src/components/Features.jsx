import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Features = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // API Base Path
  const API_BASE = 'http://localhost:5000';

  // Fetch services from database
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/services`);
        // Make sure it's always an array
        setServices(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error('Error fetching services:', error);
        setError('Failed to load services');
        // Fallback to default services if API fails
        setServices([
          {
            id: 1,
            name: 'Free Delivery',
            details: 'Free Shipping on all order',
            image: 'img/features/f-icon1.png'
          },
          {
            id: 2,
            name: 'Return Policy',
            details: 'Free Shipping on all order',
            image: 'img/features/f-icon2.png'
          },
          {
            id: 3,
            name: '24/7 Support',
            details: 'Free Shipping on all order',
            image: 'img/features/f-icon3.png'
          },
          {
            id: 4,
            name: 'Secure Payment',
            details: 'Free Shipping on all order',
            image: 'img/features/f-icon4.png'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  if (loading) {
    return (
      <section className="features-area section_gap">
        <div className="container">
          <div className="row features-inner justify-content-center">
            <div className="col-12 text-center">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error && services.length === 0) {
    return (
      <section className="features-area section_gap">
        <div className="container">
          <div className="row features-inner justify-content-center">
            <div className="col-12 text-center">
              <p className="text-danger">{error}</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="features-area section_gap">
      <div className="container">
        <div className="row features-inner">
          {services.map((service) => (
            <div key={service.id} className="col-lg-3 col-md-6 col-sm-6">
              <div className="single-features">
                <div className="f-icon">
                  <img 
                    src={service.image.startsWith('http') || service.image.startsWith('/') 
                      ? `${service.image}` 
                      : service.image
                    } 
                    alt={service.name}
                    onError={(e) => {
                      // Fallback to default icon if image fails to load
                      e.target.src = `img/features/f-icon${service.id % 4 || 4}.png`;
                    }}
                  />
                </div>
                <h6>{service.name}</h6>
                <p>{service.details}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Features;
