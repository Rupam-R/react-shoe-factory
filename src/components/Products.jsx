import React, { useRef, useState, useEffect } from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import axios from 'axios';

const Products = () => {
  const sliderRef = useRef(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [allProducts, setAllProducts] = useState([]);
  const [latestProducts, setLatestProducts] = useState([]);
  const [comingProducts, setComingProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSlide, setActiveSlide] = useState(0);

  const API_BASE_URL = import.meta.env.MODE === 'development' 
    ? 'http://localhost:5000'
    : '';

  // Static product data as fallback
  const staticProducts = [
    {
      id: 1,
      name: "Classic Running Shoes",
      description: "Comfortable running shoes for everyday wear",
      price: 89.99,
      category: "sneakers",
      stock: 50,
      image: "img/product/p1.jpg"
    },
    {
      id: 2,
      name: "Leather Boots",
      description: "Durable leather boots for outdoor activities",
      price: 129.99,
      category: "boots",
      stock: 30,
      image: "img/product/p2.jpg"
    },
    {
      id: 3,
      name: "Casual Loafers",
      description: "Stylish loafers for casual occasions",
      price: 69.99,
      category: "loafers",
      stock: 40,
      image: "img/product/p3.jpg"
    },
    {
      id: 4,
      name: "Athletic Sneakers",
      description: "High-performance sneakers for sports",
      price: 99.99,
      category: "athletic",
      stock: 25,
      image: "img/product/p4.jpg"
    },
    {
      id: 5,
      name: "Formal Dress Shoes",
      description: "Elegant dress shoes for formal events",
      price: 149.99,
      category: "formal",
      stock: 20,
      image: "img/product/p5.jpg"
    },
    {
      id: 6,
      name: "Comfort Sandals",
      description: "Breathable sandals for summer days",
      price: 49.99,
      category: "sandals",
      stock: 35,
      image: "img/product/p6.jpg"
    },
    {
      id: 7,
      name: "Hiking Boots",
      description: "Waterproof boots for hiking adventures",
      price: 159.99,
      category: "boots",
      stock: 15,
      image: "img/product/p7.jpg"
    },
    {
      id: 8,
      name: "Basketball Shoes",
      description: "High-top shoes for basketball players",
      price: 119.99,
      category: "athletic",
      stock: 22,
      image: "img/product/p8.jpg"
    }
  ];

  // Helper function to get full image path
  const getImagePath = (imageName) => {
    if (!imageName) return 'img/product.png';
    
    if (imageName.startsWith('http') || imageName.startsWith('/')) {
      return imageName;
    }
    
    return `backend/product-img/${imageName}`;
  };

  // Slider settings with custom arrows
  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    autoplay: true,
    autoplaySpeed: 5000,
    beforeChange: (current, next) => setActiveSlide(next)
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        
        // Fetch all products
        const response = await axios.get(`${API_BASE_URL}/api/products`);
        
        // Add image paths to all products
        const productsWithImages = response.data.products?.map(product => ({
          ...product,
          image: getImagePath(product.image)
        })) || [];

        setAllProducts(productsWithImages);
        
        // Split products into two equal parts for the two slides
        const halfLength = Math.ceil(productsWithImages.length / 2);
        const firstHalf = productsWithImages.slice(0, halfLength);
        const secondHalf = productsWithImages.slice(halfLength);
        
        setLatestProducts(firstHalf);
        setComingProducts(secondHalf);
        
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(err.response?.data?.message || 'Failed to fetch products from database');
        
        // Use static products as fallback
        const staticWithImages = staticProducts.map(product => ({
          ...product,
          image: product.image // Use the static image path directly
        }));
        
        setAllProducts(staticWithImages);
        
        const halfLength = Math.ceil(staticWithImages.length / 2);
        const firstHalf = staticWithImages.slice(0, halfLength);
        const secondHalf = staticWithImages.slice(halfLength);
        
        setLatestProducts(firstHalf);
        setComingProducts(secondHalf);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const openModal = (product) => {
    setSelectedImage(product.image);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedImage(null);
  };

  // Reusable product card component
  const ProductCard = ({ product }) => (
    <div className="col-lg-3 col-md-6">
      <div className="single-product">
        <img 
          className="img-fluid" 
          src={product.image} 
          alt={product.name} 
          onClick={() => openModal(product)}
          style={{ cursor: 'pointer' }}
          onError={(e) => {
            e.target.src = 'img/product.png';
          }}
        />
        <div className="product-details">
          <h6>{product.name}</h6>
          <div className="price">
            <h6>${product.price}</h6>
            {product.original_price && product.original_price > product.price && (
              <h6 className="l-through">${product.original_price}</h6>
            )}
          </div>
          <div className="prd-bottom">
            <a href="#add-to-bag" className="social-info">
              <span className="ti-bag"></span>
              <p className="hover-text">add to bag</p>
            </a>
            <a href="#wishlist" className="social-info">
              <span className="lnr lnr-heart"></span>
              <p className="hover-text">Wishlist</p>
            </a>
            <a href="#compare" className="social-info">
              <span className="lnr lnr-sync"></span>
              <p className="hover-text">compare</p>
            </a>
            <a href="#view-more" className="social-info">
              <span className="lnr lnr-move"></span>
              <p className="hover-text">view more</p>
            </a>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <section className="active-product-area section_gap">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-6 text-center">
              <div className="section-title">
                <h1>Loading Products...</h1>
                <p>Please wait while we load our products</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="active-product-area section_gap">
      <div className="container">
        {/* Show error message if products failed to load but still show static content */}
        {error && (
          <div className="row justify-content-center">
            <div className="col-lg-8 text-center">
              <div className="alert alert-warning mb-4" role="alert">
                {error} Showing demo products instead.
              </div>
            </div>
          </div>
        )}
        
        <div className="row justify-content-center">
          <div className="col-lg-6 text-center">
            <div className="section-title">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <button className="product-prev"
                  onClick={() => sliderRef.current.slickPrev()}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', marginRight: '15px' }}
                >
                  <img src="img/product/prev.png" alt="Previous" />
                </button>
                
                <h1>Our Products</h1>
                
                <button 
                  onClick={() => sliderRef.current.slickNext()}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', marginLeft: '15px' }}
                >
                  <img src="img/product/next.png" alt="Next" />
                </button>
              </div>
              <p>Browse our complete collection</p>
            </div>
          </div>
        </div>
      </div>

      <Slider ref={sliderRef} {...settings}>
        {/* First Half of Products Slide */}
        <div className="single-product-slider">
          <div className="container">
            <div className="row">
              {latestProducts.length > 0 ? (
                latestProducts.map((product) => (
                  <ProductCard key={`slide1-${product.id}`} product={product} />
                ))
              ) : (
                <div className="col-12 text-center">
                  <p>No products available</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Second Half of Products Slide */}
        <div className="single-product-slider">
          <div className="container">
            <div className="row">
              {comingProducts.length > 0 ? (
                comingProducts.map((product) => (
                  <ProductCard key={`slide2-${product.id}`} product={product} />
                ))
              ) : (
                <div className="col-12 text-center">
                  <p>No products available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </Slider>

      {/* Image Modal */}
      {isModalOpen && (
        <div className="modal" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            position: 'relative',
            maxWidth: '90%',
            maxHeight: '90%'
          }}>
            <img 
              src={selectedImage} 
              alt="Enlarged product view" 
              style={{
                maxWidth: '100%',
                maxHeight: '90vh',
                display: 'block'
              }}
              onError={(e) => {
                e.target.src = 'img/product.png';
              }}
            />
            <button 
              onClick={closeModal}
              style={{
                position: 'absolute',
                top: '-40px',
                right: '-40px',
                backgroundColor: 'transparent',
                border: 'none',
                color: 'white',
                fontSize: '30px',
                cursor: 'pointer'
              }}
            >
              ×
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default Products;