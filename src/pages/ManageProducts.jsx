import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faEdit, faTrash, faPlus, faSearch, 
  faTimes, faSave, faSpinner, faFilter
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import './ManageProducts.css';

const API_BASE_URL = import.meta.env.MODE === 'development' 
  ? 'http://localhost:5000'
  : '';

const ManageProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editProduct, setEditProduct] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    image: '',
    imagePreview: ''
  });

  const categories = ['all', 'sneakers', 'boots', 'sandals', 'loafers', 'heels', 'athletic'];
  const DEFAULT_PAGE_SIZE = 10;

  // Helper function to get full image path
// Helper function to get full image path
const getImagePath = (imageName) => {
  if (!imageName) return '/img/product.png';
  
  if (imageName.startsWith('http') || imageName.startsWith('/')) {
    return imageName;
  }
  
  return `backend/product-img/${imageName}`;
};

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await axios.get(
          `${API_BASE_URL}/api/admin/products`, 
          {
            params: {
              page: currentPage,
              limit: DEFAULT_PAGE_SIZE,
              search: searchTerm,
              category: selectedCategory === 'all' ? '' : selectedCategory
            },
            withCredentials: true
          }
        );

        const productsWithImagePaths = response.data.products?.map(product => ({
          ...product,
          image: getImagePath(product.image)
        })) || [];

        setProducts(productsWithImagePaths);
        setTotalPages(response.data.pagination?.totalPages || 1);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [currentPage, searchTerm, selectedCategory]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditClick = (product) => {
    setEditProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      stock: product.stock,
      image: product.image ? product.image.split('/').pop() : '',
      imagePreview: product.image
    });
    setShowEditModal(true);
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      const response = await axios.put(
        `${API_BASE_URL}/api/admin/products/${editProduct.id}`,
        formData,
        { withCredentials: true }
      );

      setProducts(products.map(product => 
        product.id === editProduct.id ? {
          ...response.data.product,
          image: getImagePath(response.data.product.image)
        } : product
      ));
      setShowEditModal(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update product');
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
        `${API_BASE_URL}/api/admin/products`,
        formData,
        { withCredentials: true }
      );

      setProducts([{
        ...response.data.product,
        image: getImagePath(response.data.product.image)
      }, ...products]);
      setShowAddModal(false);
      setFormData({
        name: '',
        description: '',
        price: '',
        category: '',
        stock: '',
        image: '',
        imagePreview: ''
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add product');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        setLoading(true);
        await axios.delete(
          `${API_BASE_URL}/api/admin/products/${productId}`,
          { withCredentials: true }
        );
        
        setProducts(products.filter(product => product.id !== productId));
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete product');
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
        `${API_BASE_URL}/api/upload-product-image`,
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
        <FontAwesomeIcon icon={faSpinner} spin /> Loading products...
      </div>
    );
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="manage-products-container">
      <div className="products-header">
        <h2>Manage Products</h2>
        <div className="products-actions">
          <div className="search-filter">
            <div className="search-box">
              <FontAwesomeIcon icon={faSearch} className="search-icon" />
              <input
                type="text"
                placeholder="Search products..."
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
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setCurrentPage(1);
                }}
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="add-product-btn"
          >
            <FontAwesomeIcon icon={faPlus} /> Add Product
          </button>
        </div>
      </div>

      <div className="products-table-wrapper">
        <table className="products-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Description</th>
              <th>Price</th>
              <th>Category</th>
              <th>Stock</th>
              <th>Added</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.length > 0 ? (
              products.map(product => (
                <tr key={product.id}>
                  <td>
                    {product.image && (
                      <img 
                        src={product.image}
                        alt={product.name} 
                        className="product-thumbnail"
                        onError={(e) => {
                          e.target.src = `${API_BASE_URL}/img/product.png`;
                        }}
                      />
                    )}
                  </td>
                  <td>{product.name}</td>
                  <td className="description-cell">
                    {product.description.length > 50 
                      ? `${product.description.substring(0, 50)}...` 
                      : product.description}
                  </td>
                  <td>${product.price}</td>
                  <td>{product.category}</td>
                  <td>{product.stock}</td>
                  <td>{new Date(product.created_at).toLocaleDateString()}</td>
                  <td className="actions">
                    <button 
                      onClick={() => handleEditClick(product)} 
                      className="edit-btn"
                      disabled={loading}
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button 
                      onClick={() => handleDelete(product.id)} 
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
                <td colSpan="8" className="no-products">No products found</td>
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

      {/* Edit Product Modal */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="product-modal">
            <div className="modal-header">
              <h3>Edit Product</h3>
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
                <label>Name</label>
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
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                  rows="3"
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Price ($)</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.01"
                    disabled={loading}
                  />
                </div>
                
                <div className="form-group">
                  <label>Stock</label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    required
                    min="0"
                    disabled={loading}
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                >
                  {categories.filter(c => c !== 'all').map(category => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label>Image</label>
                {formData.imagePreview && (
                  <div className="image-preview-container">
                    <img 
                      src={formData.imagePreview}
                      alt="Product preview" 
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
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={loading}
                  className="image-upload-input"
                />
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

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="product-modal">
            <div className="modal-header">
              <h3>Add New Product</h3>
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
                <label>Name</label>
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
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                  rows="3"
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Price ($)</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.01"
                    disabled={loading}
                  />
                </div>
                
                <div className="form-group">
                  <label>Stock</label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    required
                    min="0"
                    disabled={loading}
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                >
                  <option value="">Select a category</option>
                  {categories.filter(c => c !== 'all').map(category => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label>Image</label>
                {formData.imagePreview && (
                  <div className="image-preview-container">
                    <img 
                      src={formData.imagePreview}
                      alt="Product preview" 
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
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={loading}
                  className="image-upload-input"
                />
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
                    <><FontAwesomeIcon icon={faPlus} /> Add Product</>
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

export default ManageProducts;