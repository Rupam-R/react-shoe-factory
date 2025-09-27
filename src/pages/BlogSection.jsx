import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faEdit, faTrash, faPlus, faSearch, 
  faTimes, faSave, faSpinner, faEye,
  faCalendar, faTags, faUpload
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import './BlogSection.css';

const API_BASE_URL = import.meta.env.MODE === 'development' 
  ? 'http://localhost:5000'
  : '';

const BlogSection = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editBlog, setEditBlog] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    details: '',
    keywords: '',
    date: new Date().toISOString().split('T')[0],
    image: '',
    imagePreview: ''
  });

  const DEFAULT_PAGE_SIZE = 10;

  // Helper function to get full image path
  const getImagePath = (imageName) => {
    if (!imageName) return '/img/blog-placeholder.png';
    
    if (imageName.startsWith('http') || imageName.startsWith('/')) {
      return imageName;
    }
    
    return `backend/blog-img/${imageName}`;
  };

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await axios.get(
          `/api/admin/blogs`, 
          {
            params: {
              page: currentPage,
              limit: DEFAULT_PAGE_SIZE,
              search: searchTerm
            },
            withCredentials: true
          }
        );

        setBlogs(response.data.blogs || []);
        setTotalPages(response.data.pagination?.totalPages || 1);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch blogs');
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, [currentPage, searchTerm]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditClick = (blog) => {
    setEditBlog(blog);
    setFormData({
      name: blog.name,
      details: blog.details,
      keywords: blog.keywords,
      date: blog.date,
      image: blog.image || '',
      imagePreview: blog.image ? getImagePath(blog.image) : ''
    });
    setShowEditModal(true);
  };

  const handleViewClick = (blog) => {
    setSelectedBlog(blog);
    setShowViewModal(true);
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
        `/api/upload-blog-image`,
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

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      const response = await axios.put(
        `/api/admin/blogs/${editBlog.id}`,
        formData,
        { withCredentials: true }
      );

      setBlogs(blogs.map(blog => 
        blog.id === editBlog.id ? response.data.blog : blog
      ));
      setShowEditModal(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update blog');
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
        `/api/admin/blogs`,
        formData,
        { withCredentials: true }
      );

      setBlogs([response.data.blog, ...blogs]);
      setShowAddModal(false);
      // Reset form completely including image fields
      setFormData({
        name: '',
        details: '',
        keywords: '',
        date: new Date().toISOString().split('T')[0],
        image: '',
        imagePreview: ''
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add blog');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (blogId) => {
    if (window.confirm('Are you sure you want to delete this blog post?')) {
      try {
        setLoading(true);
        await axios.delete(
          `/api/admin/blogs/${blogId}`,
          { withCredentials: true }
        );
        
        setBlogs(blogs.filter(blog => blog.id !== blogId));
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete blog');
      } finally {
        setLoading(false);
      }
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading && !showEditModal && !showAddModal) {
    return (
      <div className="loading">
        <FontAwesomeIcon icon={faSpinner} spin /> Loading blogs...
      </div>
    );
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="manage-blogs-container">
      <div className="blogs-header">
        <h2>Manage Blog Posts</h2>
        <div className="blogs-actions">
          <div className="search-filter">
            <div className="search-box">
              <FontAwesomeIcon icon={faSearch} className="search-icon" />
              <input
                type="text"
                placeholder="Search blogs..."
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
            className="add-blog-btn"
          >
            <FontAwesomeIcon icon={faPlus} /> Add New Blog
          </button>
        </div>
      </div>

      <div className="blogs-table-wrapper">
        <table className="blogs-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Date</th>
              <th>Keywords</th>
              <th>Image</th>
              <th>Preview</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {blogs.length > 0 ? (
              blogs.map(blog => (
                <tr key={blog.id}>
                  <td className="blog-title">{blog.name}</td>
                  <td className="blog-date">
                    <FontAwesomeIcon icon={faCalendar} /> {formatDate(blog.date)}
                  </td>
                  <td className="blog-keywords">
                    <FontAwesomeIcon icon={faTags} /> {blog.keywords || 'No keywords'}
                  </td>
                  <td>
                    {blog.image && (
                      <img 
                        src={getImagePath(blog.image)}
                        alt={blog.name} 
                        className="blog-thumbnail"
                        onError={(e) => {
                          e.target.src = '/img/blog-placeholder.png';
                        }}
                      />
                    )}
                  </td>
                  <td className="blog-preview">
                    {blog.details.length > 100 
                      ? `${blog.details.substring(0, 100)}...` 
                      : blog.details}
                  </td>
                  <td className="actions">
                    <button 
                      onClick={() => handleViewClick(blog)} 
                      className="view-btn"
                      title="View Blog"
                    >
                      <FontAwesomeIcon icon={faEye} />
                    </button>
                    <button 
                      onClick={() => handleEditClick(blog)} 
                      className="edit-btn"
                      title="Edit Blog"
                      disabled={loading}
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button 
                      onClick={() => handleDelete(blog.id)} 
                      className="delete-btn"
                      title="Delete Blog"
                      disabled={loading}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="no-blogs">No blog posts found</td>
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

      {/* View Blog Modal */}
      {showViewModal && selectedBlog && (
        <div className="modal-overlay">
          <div className="blog-modal view-modal">
            <div className="modal-header">
              <h3>{selectedBlog.name}</h3>
              <button 
                onClick={() => setShowViewModal(false)} 
                className="close-btn"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            
            <div className="blog-view-content">
              {selectedBlog.image && (
                <div className="blog-image-container">
                  <img 
                    src={getImagePath(selectedBlog.image)}
                    alt={selectedBlog.name}
                    className="blog-image"
                    onError={(e) => {
                      e.target.src = '/img/blog-placeholder.png';
                    }}
                  />
                </div>
              )}
              
              <div className="blog-meta">
                <p><FontAwesomeIcon icon={faCalendar} /> {formatDate(selectedBlog.date)}</p>
                {selectedBlog.keywords && (
                  <p><FontAwesomeIcon icon={faTags} /> {selectedBlog.keywords}</p>
                )}
              </div>
              
              <div className="blog-content">
                {selectedBlog.details.split('\n').map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </div>
            
            <div className="modal-actions">
              <button 
                onClick={() => setShowViewModal(false)}
                className="close-modal-btn"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Blog Modal */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="blog-modal">
            <div className="modal-header">
              <h3>Edit Blog Post</h3>
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
                <label>Blog Title *</label>
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
                <label>Publish Date</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  disabled={loading}
                />
              </div>
              
              <div className="form-group">
                <label>Keywords (comma-separated)</label>
                <input
                  type="text"
                  name="keywords"
                  value={formData.keywords}
                  onChange={handleInputChange}
                  placeholder="fashion, shoes, trends"
                  disabled={loading}
                />
              </div>
              
              <div className="form-group">
                <label>Blog Image</label>
                {formData.imagePreview && (
                  <div className="image-preview-container">
                    <img 
                      src={formData.imagePreview}
                      alt="Blog preview" 
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
                  <label htmlFor="edit-blog-image-upload" className="image-upload-label">
                    <FontAwesomeIcon icon={faUpload} /> Upload Blog Image
                  </label>
                  <input
                    id="edit-blog-image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={loading}
                    className="image-upload-input"
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Blog Content *</label>
                <textarea
                  name="details"
                  value={formData.details}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                  rows="8"
                  placeholder="Write your blog content here..."
                />
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

      {/* Add Blog Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="blog-modal">
            <div className="modal-header">
              <h3>Add New Blog Post</h3>
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
                <label>Blog Title *</label>
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
                <label>Publish Date</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  disabled={loading}
                />
              </div>
              
              <div className="form-group">
                <label>Keywords (comma-separated)</label>
                <input
                  type="text"
                  name="keywords"
                  value={formData.keywords}
                  onChange={handleInputChange}
                  placeholder="fashion, shoes, trends"
                  disabled={loading}
                />
              </div>
              
              <div className="form-group">
                <label>Blog Image</label>
                {formData.imagePreview && (
                  <div className="image-preview-container">
                    <img 
                      src={formData.imagePreview}
                      alt="Blog preview" 
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
                  <label htmlFor="add-blog-image-upload" className="image-upload-label">
                    <FontAwesomeIcon icon={faUpload} /> Upload Blog Image
                  </label>
                  <input
                    id="add-blog-image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={loading}
                    className="image-upload-input"
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Blog Content *</label>
                <textarea
                  name="details"
                  value={formData.details}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                  rows="8"
                  placeholder="Write your blog content here..."
                />
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
                    <><FontAwesomeIcon icon={faPlus} /> Add Blog Post</>
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

export default BlogSection;
