import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faEdit, faTrash, faPlus, faSearch, 
  faTimes, faSave, faSpinner, faFilter,
  faUpload
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import './BrandSection.css';

const API_BASE_URL = import.meta.env.MODE === 'development' 
  ? 'http://localhost:5000'
  : '';

const BrandSection = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editBrand, setEditBrand] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    details: '',
    image: '',
    imagePreview: ''
  });

  const DEFAULT_PAGE_SIZE = 10;

  // Helper function to get full image path
  const getImagePath = (imageName) => {
    if (!imageName) return '/img/brand.png';
    
    if (imageName.startsWith('http') || imageName.startsWith('/')) {
      return imageName;
    }
    
    return `backend/brand-img/${imageName}`;
  };

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await axios.get(
          `${API_BASE_URL}/api/admin/brands`, 
          {
            params: {
              page: currentPage,
              limit: DEFAULT_PAGE_SIZE,
              search: searchTerm
            },
            withCredentials: true
          }
        );

        const brandsWithImagePaths = response.data.brands?.map(brand => ({
          ...brand,
          image: getImagePath(brand.image)
        })) || [];

        setBrands(brandsWithImagePaths);
        setTotalPages(response.data.pagination?.totalPages || 1);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch brands');
      } finally {
        setLoading(false);
      }
    };

    fetchBrands();
  }, [currentPage, searchTerm]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditClick = (brand) => {
    setEditBrand(brand);
    setFormData({
      name: brand.name,
      details: brand.details,
      image: brand.image ? brand.image.split('/').pop() : '',
      imagePreview: brand.image
    });
    setShowEditModal(true);
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      const response = await axios.put(
        `${API_BASE_URL}/api/admin/brands/${editBrand.id}`,
        formData,
        { withCredentials: true }
      );

      setBrands(brands.map(brand => 
        brand.id === editBrand.id ? {
          ...response.data.brand,
          image: getImagePath(response.data.brand.image)
        } : brand
      ));
      setShowEditModal(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update brand');
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
        `${API_BASE_URL}/api/admin/brands`,
        formData,
        { withCredentials: true }
      );

      setBrands([{
        ...response.data.brand,
        image: getImagePath(response.data.brand.image)
      }, ...brands]);
      setShowAddModal(false);
      setFormData({
        name: '',
        details: '',
        image: '',
        imagePreview: ''
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add brand');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (brandId) => {
    if (window.confirm('Are you sure you want to delete this brand? All products associated with this brand will also be deleted.')) {
      try {
        setLoading(true);
        await axios.delete(
          `${API_BASE_URL}/api/admin/brands/${brandId}`,
          { withCredentials: true }
        );
        
        setBrands(brands.filter(brand => brand.id !== brandId));
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete brand');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleImageUpload = async (e) => {
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
        `${API_BASE_URL}/api/upload-brand-image`,
        uploadFormData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          withCredentials: true
        }
      );

      setFormData(prev => ({
        ...prev,
        image: response.data.filename,
        imagePreview: previewUrl
      }));
    } catch (err) {
      setError('Failed to upload image');
    }
  };

  // Clean up object URLs when component unmounts or modals close
  useEffect(() => {
    return () => {
      if (formData.imagePreview && formData.imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(formData.imagePreview);
      }
    };
  }, [formData.imagePreview]);

  if (loading && !showEditModal && !showAddModal) {
    return (
      <div className="loading">
        <FontAwesomeIcon icon={faSpinner} spin /> Loading brands...
      </div>
    );
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="manage-brands-container">
      <div className="brands-header">
        <h2>Manage Brands</h2>
        <div className="brands-actions">
          <div className="search-filter">
            <div className="search-box">
              <FontAwesomeIcon icon={faSearch} className="search-icon" />
              <input
                type="text"
                placeholder="Search brands..."
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
            className="add-brand-btn"
          >
            <FontAwesomeIcon icon={faPlus} /> Add Brand
          </button>
        </div>
      </div>

      <div className="brands-table-wrapper">
        <table className="brands-table">
          <thead>
            <tr>
              <th>Logo</th>
              <th>Name</th>
              <th>Details</th>
              <th>Added Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {brands.length > 0 ? (
              brands.map(brand => (
                <tr key={brand.id}>
                  <td>
                    {brand.image && (
                      <img 
                        src={brand.image}
                        alt={brand.name} 
                        className="brand-thumbnail"
                        onError={(e) => {
                          e.target.src = `${API_BASE_URL}/img/brand.png`;
                        }}
                      />
                    )}
                  </td>
                  <td>{brand.name}</td>
                  <td className="details-cell">
                    {brand.details.length > 50 
                      ? `${brand.details.substring(0, 50)}...` 
                      : brand.details}
                  </td>
                  <td>{new Date(brand.created_at).toLocaleDateString()}</td>
                  <td className="actions">
                    <button 
                      onClick={() => handleEditClick(brand)} 
                      className="edit-btn"
                      disabled={loading}
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button 
                      onClick={() => handleDelete(brand.id)} 
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
                <td colSpan="5" className="no-brands">No brands found</td>
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

      {/* Edit Brand Modal */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="brand-modal">
            <div className="modal-header">
              <h3>Edit Brand</h3>
              <button 
                onClick={() => {
                  setShowEditModal(false);
                  if (formData.imagePreview && formData.imagePreview.startsWith('blob:')) {
                    URL.revokeObjectURL(formData.imagePreview);
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
                <label>Brand Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                />
              </div>
              
              <div className="form-group">
                <label>Description/Details</label>
                <textarea
                  name="details"
                  value={formData.details}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                  rows="3"
                />
              </div>
              
              <div className="form-group">
                <label>Brand Logo</label>
                {formData.imagePreview && (
                  <div className="image-preview-container">
                    <img 
                      src={formData.imagePreview}
                      alt="Brand preview" 
                      className="image-preview"
                    />
                    <button
                      type="button"
                      className="remove-image-btn"
                      onClick={() => {
                        if (formData.imagePreview && formData.imagePreview.startsWith('blob:')) {
                          URL.revokeObjectURL(formData.imagePreview);
                        }
                        setFormData(prev => ({
                          ...prev,
                          image: '',
                          imagePreview: ''
                        }));
                      }}
                    >
                      <FontAwesomeIcon icon={faTimes} />
                    </button>
                  </div>
                )}
                <div className="image-upload-area">
                  <label htmlFor="edit-brand-image-upload" className="image-upload-label">
                    <FontAwesomeIcon icon={faUpload} /> Upload Image
                  </label>
                  <input
                    id="edit-brand-image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={loading}
                    className="image-upload-input"
                  />
                </div>
                <div className="image-upload-hint">Supported formats: JPG, PNG, WEBP. Max size: 5MB</div>
              </div>
              
              <div className="form-actions">
                <button 
                  type="button" 
                  onClick={() => {
                    setShowEditModal(false);
                    if (formData.imagePreview && formData.imagePreview.startsWith('blob:')) {
                      URL.revokeObjectURL(formData.imagePreview);
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

      {/* Add Brand Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="brand-modal">
            <div className="modal-header">
              <h3>Add New Brand</h3>
              <button 
                onClick={() => {
                  setShowAddModal(false);
                  if (formData.imagePreview && formData.imagePreview.startsWith('blob:')) {
                    URL.revokeObjectURL(formData.imagePreview);
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
                <label>Brand Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                />
              </div>
              
              <div className="form-group">
                <label>Description/Details</label>
                <textarea
                  name="details"
                  value={formData.details}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                  rows="3"
                />
              </div>
              
              <div className="form-group">
                <label>Brand Logo</label>
                {formData.imagePreview && (
                  <div className="image-preview-container">
                    <img 
                      src={formData.imagePreview}
                      alt="Brand preview" 
                      className="image-preview"
                    />
                    <button
                      type="button"
                      className="remove-image-btn"
                      onClick={() => {
                        if (formData.imagePreview && formData.imagePreview.startsWith('blob:')) {
                          URL.revokeObjectURL(formData.imagePreview);
                        }
                        setFormData(prev => ({
                          ...prev,
                          image: '',
                          imagePreview: ''
                        }));
                      }}
                    >
                      <FontAwesomeIcon icon={faTimes} />
                    </button>
                  </div>
                )}
                <div className="image-upload-area">
                  <label htmlFor="add-brand-image-upload" className="image-upload-label">
                    <FontAwesomeIcon icon={faUpload} /> Upload Image
                  </label>
                  <input
                    id="add-brand-image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={loading}
                    className="image-upload-input"
                  />
                </div>
                <div className="image-upload-hint">Supported formats: JPG, PNG, WEBP. Max size: 5MB</div>
              </div>
              
              <div className="form-actions">
                <button 
                  type="button" 
                  onClick={() => {
                    setShowAddModal(false);
                    if (formData.imagePreview && formData.imagePreview.startsWith('blob:')) {
                      URL.revokeObjectURL(formData.imagePreview);
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
                    <><FontAwesomeIcon icon={faPlus} /> Add Brand</>
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

export default BrandSection;