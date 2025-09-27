import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faEdit, faTrash, faPlus, faSearch, 
  faTimes, faSave, faSpinner, faFilter
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import './ManageProducts.css';
import { API_BASE } from '../config/api';

const ManageProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
{{ ... }}
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await axios.get(
          `${API_BASE}/api/admin/products`, 
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
{{ ... }}
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      const response = await axios.put(
        `${API_BASE}/api/admin/products/${editProduct.id}`,
        formData,
        { withCredentials: true }
      );

      setProducts(products.map(product => 
        product.id === editProduct.id ? {
          ...response.data.product,
          image: getImagePath(response.data.product.image)
{{ ... }}
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      const response = await axios.post(
        `${API_BASE}/api/admin/products`,
        formData,
        { withCredentials: true }
      );

      setProducts([{
        ...response.data.product,
        image: getImagePath(response.data.product.image)
      }, ...products]);
{{ ... }}

  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        setLoading(true);
        await axios.delete(
          `${API_BASE}/api/admin/products/${productId}`,
          { withCredentials: true }
        );
        
        setProducts(products.filter(product => product.id !== productId));
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete product');
      } finally {
{{ ... }}
      const previewUrl = URL.createObjectURL(file);
      
      const uploadFormData = new FormData();
      uploadFormData.append('image', file);

      const response = await axios.post(
        `${API_BASE}/api/upload-product-image`,
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
{{ ... }}
                      <img 
                        src={product.image}
                        alt={product.name} 
                        className="product-thumbnail"
                        onError={(e) => {
                          e.target.src = `${API_BASE}/img/product.png`;
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