import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faEdit, faTrash, faPlus, faSearch, 
  faTimes, faSave, faSpinner, faFilter,
  faUpload, faImage
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import './WeekdealSection.css';

const API_BASE_URL = import.meta.env.MODE === 'development' 
  ? 'http://localhost:5000'
  : '';

const WeekdealSection = () => {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editDeal, setEditDeal] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  
  const [formData, setFormData] = useState({
    deal_name: '',
    deal_details: '',
    product_name: '',
    product_details: '',
    product_price: '',
    product_image: '',
    deal_image: '',
    productImagePreview: '',
    dealImagePreview: ''
  });

  const DEFAULT_PAGE_SIZE = 10;

  // Helper function to get full image path
  const getImagePath = (imageName) => {
    if (!imageName) return '/img/product.png';
    
    if (imageName.startsWith('http') || imageName.startsWith('/')) {
      return imageName;
    }
    
    return `backend/weekdeal-img/${imageName}`;
  };

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await axios.get(
          `${API_BASE_URL}/api/admin/weekdeals`, 
          {
            params: {
              page: currentPage,
              limit: DEFAULT_PAGE_SIZE,
              search: searchTerm
            },
            withCredentials: true
          }
        );

        const dealsWithImagePaths = response.data.deals?.map(deal => ({
          ...deal,
          product_image: getImagePath(deal.product_image),
          deal_image: getImagePath(deal.deal_image)
        })) || [];

        setDeals(dealsWithImagePaths);
        setTotalPages(response.data.pagination?.totalPages || 1);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch week deals');
      } finally {
        setLoading(false);
      }
    };

    fetchDeals();
  }, [currentPage, searchTerm]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditClick = (deal) => {
    setEditDeal(deal);
    setFormData({
      deal_name: deal.deal_name,
      deal_details: deal.deal_details,
      product_name: deal.product_name,
      product_details: deal.product_details,
      product_price: deal.product_price,
      product_image: deal.product_image ? deal.product_image.split('/').pop() : '',
      deal_image: deal.deal_image ? deal.deal_image.split('/').pop() : '',
      productImagePreview: deal.product_image,
      dealImagePreview: deal.deal_image
    });
    setShowEditModal(true);
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      const response = await axios.put(
        `${API_BASE_URL}/api/admin/weekdeals/${editDeal.id}`,
        formData,
        { withCredentials: true }
      );

      setDeals(deals.map(deal => 
        deal.id === editDeal.id ? {
          ...response.data.deal,
          product_image: getImagePath(response.data.deal.product_image),
          deal_image: getImagePath(response.data.deal.deal_image)
        } : deal
      ));
      setShowEditModal(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update week deal');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAdd = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      const response = await axios.post(
        `${API_BASE_URL}/api/admin/weekdeals`,
        formData,
        { withCredentials: true }
      );

      setDeals([{
        ...response.data.deal,
        product_image: getImagePath(response.data.deal.product_image),
        deal_image: getImagePath(response.data.deal.deal_image)
      }, ...deals]);
      setShowAddModal(false);
      setFormData({
        deal_name: '',
        deal_details: '',
        product_name: '',
        product_details: '',
        product_price: '',
        product_image: '',
        deal_image: '',
        productImagePreview: '',
        dealImagePreview: ''
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add week deal');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (dealId) => {
    if (window.confirm('Are you sure you want to delete this week deal?')) {
      try {
        setLoading(true);
        await axios.delete(
          `${API_BASE_URL}/api/admin/weekdeals/${dealId}`,
          { withCredentials: true }
        );
        
        setDeals(deals.filter(deal => deal.id !== dealId));
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete week deal');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleImageUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }

    try {
      const previewUrl = URL.createObjectURL(file);
      
      const uploadFormData = new FormData();
      uploadFormData.append('image', file);

      const response = await axios.post(
        `${API_BASE_URL}/api/upload-weekdeal-image`,
        uploadFormData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          withCredentials: true
        }
      );

      if (type === 'product') {
        setFormData(prev => ({
          ...prev,
          product_image: response.data.filename,
          productImagePreview: previewUrl
        }));
      } else if (type === 'deal') {
        setFormData(prev => ({
          ...prev,
          deal_image: response.data.filename,
          dealImagePreview: previewUrl
        }));
      }
    } catch (err) {
      setError('Failed to upload image');
    }
  };

  // Clean up object URLs when component unmounts or modals close
  useEffect(() => {
    return () => {
      if (formData.productImagePreview && formData.productImagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(formData.productImagePreview);
      }
      if (formData.dealImagePreview && formData.dealImagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(formData.dealImagePreview);
      }
    };
  }, [formData.productImagePreview, formData.dealImagePreview]);

  if (loading && !showEditModal && !showAddModal) {
    return (
      <div className="loading">
        <FontAwesomeIcon icon={faSpinner} spin /> Loading week deals...
      </div>
    );
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="manage-weekdeals-container">
      <div className="weekdeals-header">
        <h2>Manage Week Deals</h2>
        <div className="weekdeals-actions">
          <div className="search-filter">
            <div className="search-box">
              <FontAwesomeIcon icon={faSearch} className="search-icon" />
              <input
                type="text"
                placeholder="Search week deals..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="add-weekdeal-btn"
          >
            <FontAwesomeIcon icon={faPlus} /> Add Week Deal
          </button>
        </div>
      </div>

      <div className="weekdeals-table-wrapper">
        <table className="weekdeals-table">
          <thead>
            <tr>
              <th>Product Image</th>
              <th>Deal Image</th>
              <th>Deal Name</th>
              <th>Deal Details</th>
              <th>Product Name</th>
              <th>Product Details</th>
              <th>Price</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {deals.length > 0 ? (
              deals.map(deal => (
                <tr key={deal.id}>
                  <td>
                    {deal.product_image && (
                      <img 
                        src={deal.product_image}
                        alt={deal.product_name} 
                        className="weekdeal-thumbnail"
                        onError={(e) => {
                          e.target.src = `${API_BASE_URL}/img/product.png`;
                        }}
                      />
                    )}
                  </td>
                  <td>
                    {deal.deal_image && (
                      <img 
                        src={`${deal.deal_image ? deal.deal_image : "backend/weekdeal-img/1755947699000-662985707.jpg"}`}

                        alt={`${deal.deal_name} deal`} 
                        className="weekdeal-banner-thumbnail"
                        onError={(e) => {
                          e.target.src = `backend/weekdeal-img/1755947699000-662985707.jpg`;
                        }}
                      />
                    )}
                  </td>
                  <td>{`${deal.deal_name ?? "No Name Provided"}`}</td>
                  <td>{`${deal.deal_details ?? "No Details Provided"}`}</td>
                  <td>{deal.product_name}</td>
                  <td className="details-cell">
                    {deal.product_details.length > 50 
                      ? `${deal.product_details.substring(0, 50)}...` 
                      : deal.product_details}
                  </td>
                  <td>${deal.product_price}</td>
                  <td className="actions">
                    <button 
                      onClick={() => handleEditClick(deal)} 
                      className="edit-btn"
                      disabled={loading}
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button 
                      onClick={() => handleDelete(deal.id)} 
                      className="delete-btn"
                      disabled={loading}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="no-weekdeals">No week deals found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button 
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1 || loading}
          >
            Previous
          </button>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={currentPage === page ? 'active' : ''}
              disabled={loading}
            >
              {page}
            </button>
          ))}
          
          <button 
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages || loading}
          >
            Next
          </button>
        </div>
      )}

      {/* Edit Week Deal Modal */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="weekdeal-modal">
            <div className="modal-header">
              <h3>Edit Week Deal</h3>
              <button 
                onClick={() => {
                  setShowEditModal(false);
                  if (formData.productImagePreview && formData.productImagePreview.startsWith('blob:')) {
                    URL.revokeObjectURL(formData.productImagePreview);
                  }
                  if (formData.dealImagePreview && formData.dealImagePreview.startsWith('blob:')) {
                    URL.revokeObjectURL(formData.dealImagePreview);
                  }
                }} 
                className="close-btn"
                disabled={loading}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            
            <form onSubmit={handleSubmitEdit}>
              <div className="form-group">
                <label>Deal Name</label>
                <input
                  type="text"
                  name="deal_name"
                  value={formData.deal_name}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                />
              </div>
              
              <div className="form-group">
                <label>Deal Details</label>
                <textarea
                  name="deal_details"
                  value={formData.deal_details}
                  onChange={handleInputChange}
                  disabled={loading}
                  rows="3"
                />
              </div>
              
              <div className="form-group">
                <label>Product Name</label>
                <input
                  type="text"
                  name="product_name"
                  value={formData.product_name}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                />
              </div>
              
              <div className="form-group">
                <label>Product Details</label>
                <textarea
                  name="product_details"
                  value={formData.product_details}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                  rows="3"
                />
              </div>
              
              <div className="form-group">
                <label>Price ($)</label>
                <input
                  type="number"
                  name="product_price"
                  value={formData.product_price}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.01"
                  disabled={loading}
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Product Image</label>
                  {formData.productImagePreview && (
                    <div className="image-preview-container">
                      <img 
                        src={formData.productImagePreview}
                        alt="Product preview" 
                        className="image-preview"
                      />
                      <button
                        type="button"
                        className="remove-image-btn"
                        onClick={() => {
                          if (formData.productImagePreview && formData.productImagePreview.startsWith('blob:')) {
                            URL.revokeObjectURL(formData.productImagePreview);
                          }
                          setFormData(prev => ({
                            ...prev,
                            product_image: '',
                            productImagePreview: ''
                          }));
                        }}
                      >
                        <FontAwesomeIcon icon={faTimes} />
                      </button>
                    </div>
                  )}
                  <div className="image-upload-area">
                    <label htmlFor="edit-product-image-upload" className="image-upload-label">
                      <FontAwesomeIcon icon={faUpload} /> Upload Product Image
                    </label>
                    <input
                      id="edit-product-image-upload"
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'product')}
                      disabled={loading}
                      className="image-upload-input"
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Deal Image</label>
                  {formData.dealImagePreview && (
                    <div className="image-preview-container">
                      <img 
                        src={formData.dealImagePreview}
                        alt="Deal preview" 
                        className="image-preview"
                      />
                      <button
                        type="button"
                        className="remove-image-btn"
                        onClick={() => {
                          if (formData.dealImagePreview && formData.dealImagePreview.startsWith('blob:')) {
                            URL.revokeObjectURL(formData.dealImagePreview);
                          }
                          setFormData(prev => ({
                            ...prev,
                            deal_image: '',
                            dealImagePreview: ''
                          }));
                        }}
                      >
                        <FontAwesomeIcon icon={faTimes} />
                      </button>
                    </div>
                  )}
                  <div className="image-upload-area">
                    <label htmlFor="edit-deal-image-upload" className="image-upload-label">
                      <FontAwesomeIcon icon={faUpload} /> Upload Deal Image
                    </label>
                    <input
                      id="edit-deal-image-upload"
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'deal')}
                      disabled={loading}
                      className="image-upload-input"
                    />
                  </div>
                </div>
              </div>
              
              <div className="form-actions">
                <button 
                  type="button" 
                  onClick={() => {
                    setShowEditModal(false);
                    if (formData.productImagePreview && formData.productImagePreview.startsWith('blob:')) {
                      URL.revokeObjectURL(formData.productImagePreview);
                    }
                    if (formData.dealImagePreview && formData.dealImagePreview.startsWith('blob:')) {
                      URL.revokeObjectURL(formData.dealImagePreview);
                    }
                  }}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="save-btn"
                  disabled={loading}
                >
                  {loading ? (
                    <><FontAwesomeIcon icon={faSpinner} spin /> Saving...</>
                  ) : (
                    <><FontAwesomeIcon icon={faSave} /> Save Changes</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Week Deal Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="weekdeal-modal">
            <div className="modal-header">
              <h3>Add New Week Deal</h3>
              <button 
                onClick={() => {
                  setShowAddModal(false);
                  if (formData.productImagePreview && formData.productImagePreview.startsWith('blob:')) {
                    URL.revokeObjectURL(formData.productImagePreview);
                  }
                  if (formData.dealImagePreview && formData.dealImagePreview.startsWith('blob:')) {
                    URL.revokeObjectURL(formData.dealImagePreview);
                  }
                }} 
                className="close-btn"
                disabled={loading}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            
            <form onSubmit={handleSubmitAdd}>
              <div className="form-group">
                <label>Deal Name</label>
                <input
                  type="text"
                  name="deal_name"
                  value={formData.deal_name}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                />
              </div>
              
              <div className="form-group">
                <label>Deal Details</label>
                <textarea
                  name="deal_details"
                  value={formData.deal_details}
                  onChange={handleInputChange}
                  disabled={loading}
                  rows="3"
                />
              </div>
              
              <div className="form-group">
                <label>Product Name</label>
                <input
                  type="text"
                  name="product_name"
                  value={formData.product_name}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                />
              </div>
              
              <div className="form-group">
                <label>Product Details</label>
                <textarea
                  name="product_details"
                  value={formData.product_details}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                  rows="3"
                />
              </div>
              
              <div className="form-group">
                <label>Price ($)</label>
                <input
                  type="number"
                  name="product_price"
                  value={formData.product_price}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.01"
                  disabled={loading}
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Product Image</label>
                  {formData.productImagePreview && (
                    <div className="image-preview-container">
                      <img 
                        src={formData.productImagePreview}
                        alt="Product preview" 
                        className="image-preview"
                      />
                      <button
                        type="button"
                        className="remove-image-btn"
                        onClick={() => {
                          if (formData.productImagePreview && formData.productImagePreview.startsWith('blob:')) {
                            URL.revokeObjectURL(formData.productImagePreview);
                          }
                          setFormData(prev => ({
                            ...prev,
                            product_image: '',
                            productImagePreview: ''
                          }));
                        }}
                      >
                        <FontAwesomeIcon icon={faTimes} />
                      </button>
                    </div>
                  )}
                  <div className="image-upload-area">
                    <label htmlFor="add-product-image-upload" className="image-upload-label">
                      <FontAwesomeIcon icon={faUpload} /> Upload Product Image
                    </label>
                    <input
                      id="add-product-image-upload"
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'product')}
                      disabled={loading}
                      className="image-upload-input"
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Deal Image</label>
                  {formData.dealImagePreview && (
                    <div className="image-preview-container">
                      <img 
                        src={formData.dealImagePreview}
                        alt="Deal preview" 
                        className="image-preview"
                      />
                      <button
                        type="button"
                        className="remove-image-btn"
                        onClick={() => {
                          if (formData.dealImagePreview && formData.dealImagePreview.startsWith('blob:')) {
                            URL.revokeObjectURL(formData.dealImagePreview);
                          }
                          setFormData(prev => ({
                            ...prev,
                            deal_image: '',
                            dealImagePreview: ''
                          }));
                        }}
                      >
                        <FontAwesomeIcon icon={faTimes} />
                      </button>
                    </div>
                  )}
                  <div className="image-upload-area">
                    <label htmlFor="add-deal-image-upload" className="image-upload-label">
                      <FontAwesomeIcon icon={faUpload} /> Upload Deal Image
                    </label>
                    <input
                      id="add-deal-image-upload"
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'deal')}
                      disabled={loading}
                      className="image-upload-input"
                    />
                  </div>
                </div>
              </div>
              
              <div className="form-actions">
                <button 
                  type="button" 
                  onClick={() => {
                    setShowAddModal(false);
                    if (formData.productImagePreview && formData.productImagePreview.startsWith('blob:')) {
                      URL.revokeObjectURL(formData.productImagePreview);
                    }
                    if (formData.dealImagePreview && formData.dealImagePreview.startsWith('blob:')) {
                      URL.revokeObjectURL(formData.dealImagePreview);
                    }
                  }}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="save-btn"
                  disabled={loading}
                >
                  {loading ? (
                    <><FontAwesomeIcon icon={faSpinner} spin /> Adding...</>
                  ) : (
                    <><FontAwesomeIcon icon={faPlus} /> Add Week Deal</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeekdealSection;