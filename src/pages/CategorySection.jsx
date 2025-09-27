import React, { useState, useEffect } from 'react';
import axios from 'axios';

function CategorySection() {
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    details: '',
    image: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [editingId, setEditingId] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // API Base Path
  const API_BASE = 'http://localhost:5000';

  // Check admin status on mount + fetch categories
  useEffect(() => {
    const adminStatus = document.cookie.split('; ').find(row => row.startsWith('isAdmin='));
    setIsAdmin(adminStatus ? adminStatus.split('=')[1] === 'true' : false);
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get(`${API_BASE}/api/categories`);
      // Make sure it's always an array
      setCategories(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setError('Failed to fetch categories');
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle input for fields
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle file upload and preview
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImagePreview(URL.createObjectURL(file));

    const data = new FormData();
    data.append('image', file);

    try {
      setError('');
      const res = await axios.post(`${API_BASE}/api/upload-category-image`, data, {
        headers: { 
          'Content-Type': 'multipart/form-data',
        }
      });
      // Save the full path in database
      setFormData(prev => ({ ...prev, image: res.data.path }));
    } catch (error) {
      console.error('Error uploading image:', error);
      setError('Failed to upload image');
    }
  };

  // Handle submit (add/edit)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setLoading(true);
      
      // Prepare the data to send
      const submitData = {
        ...formData,
        // Ensure date is in correct format
        date: formData.date || new Date().toISOString().split('T')[0]
      };

      if (editingId) {
        await axios.put(`${API_BASE}/api/admin/categories/${editingId}`, submitData, {
          withCredentials: true
        });
      } else {
        await axios.post(`${API_BASE}/api/admin/categories`, submitData, {
          withCredentials: true
        });
      }
      resetForm();
      fetchCategories();
    } catch (error) {
      console.error('Error saving category:', error);
      setError(error.response?.data?.message || 'Failed to save category');
    } finally {
      setLoading(false);
    }
  };

  // Handle editing
  const handleEdit = (category) => {
    setFormData({
      name: category.name,
      details: category.details,
      image: category.image,
      date: category.date ? category.date.split('T')[0] : new Date().toISOString().split('T')[0]
    });
    setEditingId(category.id);
    setImagePreview(category.image ? `${"backend"}${category.image}` : null);
  };

  // Delete category
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        setError('');
        await axios.delete(`${API_BASE}/api/admin/categories/${id}`, {
          withCredentials: true
        });
        fetchCategories();
      } catch (error) {
        console.error('Error deleting category:', error);
        setError(error.response?.data?.message || 'Failed to delete category');
      }
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      details: '',
      image: '',
      date: new Date().toISOString().split('T')[0]
    });
    setEditingId(null);
    setImagePreview(null);
    setError('');
  };

  return (
    <div className="container mt-4">
      <h1 className="mb-4">Category Management</h1>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {isAdmin && (
        <div className="card mb-4">
          <div className="card-header bg-primary text-white">
            {editingId ? 'Edit Category' : 'Add New Category'}
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              {/* Name Field */}
              <div className="mb-3">
                <label htmlFor="name" className="form-label">Name</label>
                <input
                  type="text"
                  className="form-control"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {/* Details Field */}
              <div className="mb-3">
                <label htmlFor="details" className="form-label">Details</label>
                <textarea
                  className="form-control"
                  id="details"
                  name="details"
                  value={formData.details}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {/* Image Upload */}
              <div className="mb-3">
                <label htmlFor="image" className="form-label">Image</label>
                <input
                  type="file"
                  className="form-control"
                  id="image"
                  name="image"
                  onChange={handleImageUpload}
                  accept="image/*"
                  required={!editingId && !formData.image}
                />
                {imagePreview && (
                  <div className="mt-2">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      style={{ maxWidth: '100%', maxHeight: '200px' }}
                      className="img-thumbnail"
                    />
                  </div>
                )}
                {formData.image && !imagePreview && (
                  <div className="mt-2">
                    <img
                      src={`${"backend"}${formData.image}`}
                      alt="Current"
                      style={{ maxWidth: '100%', maxHeight: '200px' }}
                      className="img-thumbnail"
                    />
                  </div>
                )}
              </div>

              {/* Date Field */}
              <div className="mb-3">
                <label htmlFor="date" className="form-label">Date</label>
                <input
                  type="date"
                  className="form-control"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {/* Save/Cancel Buttons */}
              <div className="d-flex justify-content-between">
                <div>
                  <button 
                    type="submit" 
                    className="btn btn-primary me-2"
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : (editingId ? 'Update' : 'Save')}
                  </button>
                  {editingId && (
                    <button 
                      type="button" 
                      className="btn btn-secondary" 
                      onClick={resetForm}
                      disabled={loading}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category List Table */}
      <div className="card">
        <div className="card-header bg-secondary text-white">
          Category List
        </div>
        <div className="card-body">
          {loading ? (
            <div className="text-center">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (!categories || categories.length === 0) ? (
            <p>No categories found.</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped table-hover">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Details</th>
                    <th>Image</th>
                    <th>Date</th>
                    {isAdmin && <th>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category) => (
                    <tr key={category.id}>
                      <td>{category.id}</td>
                      <td>{category.name}</td>
                      <td>{category.details}</td>
                      <td>
                        {category.image && (
                          <img
                            src={`${"backend"}${category.image}`}
                            alt={category.name}
                            style={{ maxWidth: '150px', maxHeight: '80px' }}
                            className="img-thumbnail"
                          />
                        )}
                      </td>
                      <td>{category.date}</td>
                      {isAdmin && (
                        <td>
                          <button
                            className="btn btn-sm btn-warning me-2"
                            onClick={() => handleEdit(category)}
                            disabled={loading}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDelete(category.id)}
                            disabled={loading}
                          >
                            Delete
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CategorySection;