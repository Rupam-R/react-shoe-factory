import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faEdit, faTrash, faPlus, faSearch, 
  faTimes, faSave, faSpinner, faFilter,
  faCalendar, faTag, faReceipt
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import './DealSection.css';

// Use Netlify proxy with relative /api/* paths
const API_BASE_URL = '';

const DealSection = () => {
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
    deal_valid: '',
    product_name: '',
    product_details: '',
    product_image: '',
    product_price: '',
    date: new Date().toISOString().split('T')[0]
  });

  const filters = ['all', 'active', 'expired'];
  const DEFAULT_PAGE_SIZE = 10;

  // Helper function to get full image path
  const getImagePath = (imageName) => {
    if (!imageName) return '/img/deal.png';
    if (imageName.startsWith('http') || imageName.startsWith('/')) return imageName;
    return /deal-img/;
  };

  // Check if deal is still valid
  const isDealValid = (deal) => {
    if (!deal.deal_valid) return false;
    const validDate = new Date(deal.deal_valid);
    const today = new Date();
    return validDate >= today;
  };

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(
          /api/admin/deals,
          {
            params: {
              page: currentPage,
              limit: DEFAULT_PAGE_SIZE,
              search: searchTerm,
              filter: filters.includes(searchTerm) ? searchTerm : ''
            },
            withCredentials: true
          }
        );
        const dealsWithImagePaths = response.data.deals?.map(deal => ({
          ...deal,
          product_image: getImagePath(deal.product_image),
          is_valid: isDealValid(deal)
        })) || [];
        setDeals(dealsWithImagePaths);
        setTotalPages(response.data.pagination?.totalPages || 1);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch deals');
      } finally {
        setLoading(false);
      }
    };
    fetchDeals();
  }, [currentPage, searchTerm]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEditClick = (deal) => {
    setEditDeal(deal);
    setFormData({
      deal_name: deal.deal_name,
      deal_details: deal.deal_details,
      deal_valid: deal.deal_valid,
      product_name: deal.product_name,
      product_details: deal.product_details,
      product_image: deal.product_image ? deal.product_image.split('/').pop() : '',
      product_price: deal.product_price,
      date: deal.date
    });
    setShowEditModal(true);
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const response = await axios.put(
        /api/admin/deals/,
        formData,
        { withCredentials: true }
      );
      setDeals(deals.map(deal => 
        deal.id === editDeal.id ? {
          ...response.data.deal,
          product_image: getImagePath(response.data.deal.product_image),
          is_valid: isDealValid(response.data.deal)
        } : deal
      ));
      setShowEditModal(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update deal');
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
        /api/admin/deals,
        formData,
        { withCredentials: true }
      );
      setDeals([{ 
        ...response.data.deal,
        product_image: getImagePath(response.data.deal.product_image),
        is_valid: isDealValid(response.data.deal)
      }, ...deals]);
      setShowAddModal(false);
      setFormData({
        deal_name: '',
        deal_details: '',
        deal_valid: '',
        product_name: '',
        product_details: '',
        product_image: '',
        product_price: '',
        date: new Date().toISOString().split('T')[0]
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add deal');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (dealId) => {
    if (!window.confirm('Are you sure you want to delete this deal?')) return;
    try {
      setLoading(true);
      await axios.delete(/api/admin/deals/, { withCredentials: true });
      setDeals(deals.filter(deal => deal.id !== dealId));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete deal');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return setError('Please select an image file');
    if (file.size > 5 * 1024 * 1024) return setError('Image size should be less than 5MB');
    try {
      const previewUrl = URL.createObjectURL(file);
      const uploadFormData = new FormData();
      uploadFormData.append('image', file);
      const response = await axios.post(/api/upload-deal-image, uploadFormData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true
      });
      setFormData(prev => ({
        ...prev,
        product_image: response.data.filename,
        product_image_preview: previewUrl
      }));
    } catch (err) {
      setError('Failed to upload image');
    }
  };

  if (loading && !showEditModal && !showAddModal) {
    return (
      <div className="loading">
        <FontAwesomeIcon icon={faSpinner} spin /> Loading deals...
      </div>
    );
  }
  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="deal-section-container">
      <div className="deals-header">
        <h2>
          <FontAwesomeIcon icon={faTag} /> Manage Deals
        </h2>
        <div className="deals-actions">
          <div className="search-filter">
            <div className="search-box">
              <FontAwesomeIcon icon={faSearch} className="search-icon" />
              <input
                type="text"
                placeholder="Search deals..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <div className="filter-dropdown">
              <FontAwesomeIcon icon={faFilter} />
              <select
                value={filters.includes(searchTerm) ? searchTerm : 'all'}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              >
                {filters.map(filter => (
                  <option key={filter} value={filter}>
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button onClick={() => setShowAddModal(true)} className="add-deal-btn">
            <FontAwesomeIcon icon={faPlus} /> Add Deal
          </button>
        </div>
      </div>

      <div className="deals-table-wrapper">
        <table className="deals-table">
          <thead>
            <tr>
              <th>Product Image</th>
              <th>Deal Name</th>
              <th>Product Name</th>
              <th>Deal Details</th>
              <th>Price</th>
              <th>Valid Until</th>
              <th>Status</th>
              <th>Date Added</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {deals.length > 0 ? (
              deals.map(deal => (
                <tr key={deal.id} className={deal.is_valid ? 'active-deal' : 'expired-deal'}>
                  <td>
                    {deal.product_image && (
                      <img 
                        src={deal.product_image}
                        alt={deal.product_name} 
                        className="deal-thumbnail"
                        onError={(e) => { e.target.src = /img/deal.png; }}
                      />
                    )}
                  </td>
                  <td>{deal.deal_name}</td>
                  <td>{deal.product_name}</td>
                  <td className="details-cell">
                    {deal.deal_details?.length > 50 
                      ? ${deal.deal_details.substring(0, 50)}... 
                      : deal.deal_details}
                  </td>
                  <td></td>
                  <td>
                    <FontAwesomeIcon icon={faCalendar} /> {new Date(deal.deal_valid).toLocaleDateString()}
                  </td>
                  <td>
                    <span className={status-badge }>
                      {deal.is_valid ? 'Active' : 'Expired'}
                    </span>
                  </td>
                  <td>{new Date(deal.date).toLocaleDateString()}</td>
                  <td className="actions">
                    <button onClick={() => handleEditClick(deal)} className="edit-btn" disabled={loading}>
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button onClick={() => handleDelete(deal.id)} className="delete-btn" disabled={loading}>
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="no-deals">
                  <div className="no-deals-content">
                    <FontAwesomeIcon icon={faTag} size="3x" />
                    <p>No deals found</p>
                  </div>
                </td>
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

      {/* Edit Deal Modal */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="deal-modal">
            <div className="modal-header">
              <h3>
                <FontAwesomeIcon icon={faEdit} /> Edit Deal
              </h3>
              <button 
                onClick={() => {
                  setShowEditModal(false);
                  if (formData.product_image_preview?.startsWith('blob:')) {
                    URL.revokeObjectURL(formData.product_image_preview);
                  }
                }} 
                className="close-btn"
                disabled={loading}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <form onSubmit={handleSubmitEdit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Deal Name</label>
                  <input type="text" name="deal_name" value={formData.deal_name} onChange={handleInputChange} required disabled={loading} />
                </div>
                <div className="form-group">
                  <label>Product Name</label>
                  <input type="text" name="product_name" value={formData.product_name} onChange={handleInputChange} required disabled={loading} />
                </div>
              </div>
              <div className="form-group">
                <label>Deal Details</label>
                <textarea name="deal_details" value={formData.deal_details} onChange={handleInputChange} required disabled={loading} rows="3" />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Product Price ($)</label>
                  <input type="number" name="product_price" value={formData.product_price} onChange={handleInputChange} required min="0" step="0.01" disabled={loading} />
                </div>
                <div className="form-group">
                  <label>Valid Until</label>
                  <input type="date" name="deal_valid" value={formData.deal_valid} onChange={handleInputChange} required disabled={loading} />
                </div>
              </div>
              <div className="form-group">
                <label>Product Details</label>
                <textarea name="product_details" value={formData.product_details} onChange={handleInputChange} required disabled={loading} rows="3" />
              </div>
              <div className="form-group">
                <label>Product Image</label>
                {formData.product_image_preview && (
                  <div className="image-preview-container">
                    <img src={formData.product_image_preview} alt="Product preview" className="image-preview" />
                    <button type="button" className="remove-image-btn" onClick={() => {
                      if (formData.product_image_preview?.startsWith('blob:')) URL.revokeObjectURL(formData.product_image_preview);
                      setFormData(prev => ({ ...prev, product_image: '', product_image_preview: '' }));
                    }}>
                      <FontAwesomeIcon icon={faTimes} />
                    </button>
                  </div>
                )}
                <input type="file" accept="image/*" onChange={handleImageUpload} disabled={loading} className="image-upload-input" />
                <div className="image-upload-hint">Supported formats: JPG, PNG, WEBP. Max size: 5MB</div>
              </div>
              <div className="form-actions">
                <button type="button" onClick={() => {
                  setShowEditModal(false);
                  if (formData.product_image_preview?.startsWith('blob:')) URL.revokeObjectURL(formData.product_image_preview);
                }} disabled={loading}>Cancel</button>
                <button type="submit" className="save-btn" disabled={loading}>
                  {loading ? (<><FontAwesomeIcon icon={faSpinner} spin /> Saving...</>) : (<><FontAwesomeIcon icon={faSave} /> Save Changes</>)}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Deal Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="deal-modal">
            <div className="modal-header">
              <h3><FontAwesomeIcon icon={faPlus} /> Add New Deal</h3>
              <button onClick={() => {
                setShowAddModal(false);
                if (formData.product_image_preview?.startsWith('blob:')) URL.revokeObjectURL(formData.product_image_preview);
              }} className="close-btn" disabled={loading}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <form onSubmit={handleSubmitAdd}>
              <div className="form-row">
                <div className="form-group">
                  <label>Deal Name</label>
                  <input type="text" name="deal_name" value={formData.deal_name} onChange={handleInputChange} required disabled={loading} />
                </div>
                <div className="form-group">
                  <label>Product Name</label>
                  <input type="text" name="product_name" value={formData.product_name} onChange={handleInputChange} required disabled={loading} />
                </div>
              </div>
              <div className="form-group">
                <label>Deal Details</label>
                <textarea name="deal_details" value={formData.deal_details} onChange={handleInputChange} required disabled={loading} rows="3" />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Product Price ($)</label>
                  <input type="number" name="product_price" value={formData.product_price} onChange={handleInputChange} required min="0" step="0.01" disabled={loading} />
                </div>
                <div className="form-group">
                  <label>Valid Until</label>
                  <input type="date" name="deal_valid" value={formData.deal_valid} onChange={handleInputChange} required disabled={loading} />
                </div>
              </div>
              <div className="form-group">
                <label>Product Details</label>
                <textarea name="product_details" value={formData.product_details} onChange={handleInputChange} required disabled={loading} rows="3" />
              </div>
              <div className="form-group">
                <label>Product Image</label>
                {formData.product_image_preview && (
                  <div className="image-preview-container">
                    <img src={formData.product_image_preview} alt="Product preview" className="image-preview" />
                    <button type="button" className="remove-image-btn" onClick={() => {
                      if (formData.product_image_preview?.startsWith('blob:')) URL.revokeObjectURL(formData.product_image_preview);
                      setFormData(prev => ({ ...prev, product_image: '', product_image_preview: '' }));
                    }}>
                      <FontAwesomeIcon icon={faTimes} />
                    </button>
                  </div>
                )}
                <input type="file" accept="image/*" onChange={handleImageUpload} disabled={loading} className="image-upload-input" />
                <div className="image-upload-hint">Supported formats: JPG, PNG, WEBP. Max size: 5MB</div>
              </div>
              <div className="form-actions">
                <button type="button" onClick={() => {
                  setShowAddModal(false);
                  if (formData.product_image_preview?.startsWith('blob:')) URL.revokeObjectURL(formData.product_image_preview);
                }} disabled={loading}>Cancel</button>
                <button type="submit" className="save-btn" disabled={loading}>
                  {loading ? (<><FontAwesomeIcon icon={faSpinner} spin /> Adding...</>) : (<><FontAwesomeIcon icon={faPlus} /> Add Deal</>)}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DealSection;
