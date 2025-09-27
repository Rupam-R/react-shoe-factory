import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Category = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // API Base Path
  const API_BASE = 'http://localhost:5000';

  // Fetch categories from database
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE}/api/categories`);
        // Make sure it's always an array
        const fetchedCategories = Array.isArray(response.data) ? response.data : [];
        setCategories(fetchedCategories);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setError('Failed to load categories');
        // Fallback to default categories if API fails
        setCategories([
          {
            id: 1,
            name: 'Sneaker for Sports',
            image: 'img/category/c1.jpg',
            colClass: 'col-lg-8 col-md-8'
          },
          {
            id: 2,
            name: 'Sneaker for Sports',
            image: 'img/category/c2.jpg',
            colClass: 'col-lg-4 col-md-4'
          },
          {
            id: 3,
            name: 'Product for Couple',
            image: 'img/category/c3.jpg',
            colClass: 'col-lg-4 col-md-4'
          },
          {
            id: 4,
            name: 'Sneaker for Sports',
            image: 'img/category/c4.jpg',
            colClass: 'col-lg-8 col-md-8'
          },
          {
            id: 5,
            name: 'Sneaker for Sports',
            image: 'img/category/c5.jpg',
            colClass: 'col-lg-12'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const openModal = (image) => {
    setSelectedImage(image);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedImage(null);
  };

  // Determine column classes based on index for dynamic layout
  const getColClass = (index, total) => {
    if (total === 0) return '';
    
    const colClasses = [
      'col-lg-8 col-md-8',
      'col-lg-4 col-md-4',
      'col-lg-4 col-md-4',
      'col-lg-8 col-md-8',
      'col-lg-12'
    ];
    
    // Use predefined pattern or default to col-lg-4 for additional items
    return colClasses[index] || 'col-lg-4 col-md-4';
  };

  if (loading) {
    return (
      <section className="category-area">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-12 text-center">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading categories...</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error && categories.length === 0) {
    return (
      <section className="category-area">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-12 text-center">
              <p className="text-danger">{error}</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Split categories into two groups for the layout
  const leftColumnCategories = categories.slice(0, 4);
  const rightColumnCategories = categories.slice(4, 5); // Only take the 5th item if it exists

  return (
    <section className="category-area">
      <div className="container">
        <div className="row justify-content-center">
          {/* Left Column - Grid of 4 items */}
          <div className="col-lg-8 col-md-12">
            <div className="row">
              {leftColumnCategories.map((category, index) => (
                <div className={getColClass(index, categories.length)} key={category.id}>
                  <div className="single-deal">
                    <div className="overlay"></div>
                    <img 
                      className="img-fluid w-100" 
                      src={category.image.startsWith('http') || category.image.startsWith('/') 
                        ? `${"backend"}${category.image}` 
                        : category.image
                      } 
                      alt={category.name}
                      onClick={() => openModal(category.image.startsWith('http') || category.image.startsWith('/') 
                        ? `${"backend"}${category.image}` 
                        : category.image
                      )}
                      onError={(e) => {
                        // Fallback to default image if category image fails to load
                        e.target.src = `img/category/c${(index % 5) + 1}.jpg`;
                      }}
                      style={{ cursor: 'pointer' }}
                    />
                    <div className="deal-details" onClick={() => openModal(category.image.startsWith('http') || category.image.startsWith('/') 
                        ? `${"backend"}${category.image}` 
                        : category.image
                      )}>
                      <h6 className="deal-title">{category.name}</h6>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Single item (5th category or empty) */}
          <div className="col-lg-4 col-md-6">
            {rightColumnCategories.length > 0 ? (
              <div className="single-deal">
                <div className="overlay"></div>
                <img 
                  className="img-fluid w-100" 
                  src={rightColumnCategories[0].image.startsWith('http') || rightColumnCategories[0].image.startsWith('/') 
                    ? `${"backend"}${rightColumnCategories[0].image}` 
                    : rightColumnCategories[0].image
                  } 
                  alt={rightColumnCategories[0].name}
                  onClick={() => openModal(rightColumnCategories[0].image.startsWith('http') || rightColumnCategories[0].image.startsWith('/') 
                    ? `${"backend"}${rightColumnCategories[0].image}` 
                    : rightColumnCategories[0].image
                  )}
                  onError={(e) => {
                    e.target.src = 'img/category/c5.jpg';
                  }}
                  style={{ cursor: 'pointer' }}
                />
                <div className="deal-details" onClick={() => openModal(rightColumnCategories[0].image.startsWith('http') || rightColumnCategories[0].image.startsWith('/') 
                    ? `${"backend"}${rightColumnCategories[0].image}` 
                    : rightColumnCategories[0].image
                  )}>
                  <h6 className="deal-title">{rightColumnCategories[0].name}</h6>
                </div>
              </div>
            ) : categories.length > 4 ? (
              // If we have more than 4 categories but the 5th is missing
              <div className="single-deal">
                <div className="overlay"></div>
                <img 
                  className="img-fluid w-100" 
                  src="img/category/c5.jpg" 
                  alt="Default Category"
                  onClick={() => openModal('img/category/c5.jpg')}
                  style={{ cursor: 'pointer' }}
                />
                <div className="deal-details" onClick={() => openModal('img/category/c5.jpg')}>
                  <h6 className="deal-title">Featured Category</h6>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

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
              alt="Enlarged view" 
              style={{
                maxWidth: '100%',
                maxHeight: '90vh',
                display: 'block'
              }}
            />
            <button 
              onClick={closeModal}
              style={{
                position: 'absolute',
                top: '-60px',
                right: '7px',
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

export default Category;