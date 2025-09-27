import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { API_BASE } from '../config/api';

const LoginPage = () => {
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [userUsername, setUserUsername] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('user');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`/api/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          username: adminUsername,
          password: adminPassword
        }),
      });

      if (!response.ok) {
        throw new Error('Invalid admin credentials');
      }

      const data = await response.json();

      // Store user info in cookies
      Cookies.set('userId', data.user.id, { expires: 7 });
      Cookies.set('username', data.user.username, { expires: 7 });
      Cookies.set('isAdmin', 'true', { expires: 7 });
      
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleUserLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`/api/user/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          username: userUsername,
          password: userPassword
        }),
      });

      if (!response.ok) {
        throw new Error('Invalid user credentials');
      }

      const data = await response.json();

      // Store user info in cookies
      Cookies.set('userId', data.user.id, { expires: 7 });
      Cookies.set('username', data.user.username, { expires: 7 });
      Cookies.set('isAdmin', 'false', { expires: 7 });
      
      navigate('/');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <Header />
      {/* Start Banner Area */}
      <section className="banner-area organic-breadcrumb">
        <div className="container">
          <div className="breadcrumb-banner d-flex flex-wrap align-items-center justify-content-end">
            <div className="col-first">
              <h1>Login/Register</h1>
              <nav className="d-flex align-items-center">
                <a href="index.html">Home<span className="lnr lnr-arrow-right"></span></a>
                <a href="category.html">Login/Register</a>
              </nav>
            </div>
          </div>
        </div>
      </section>
      {/* End Banner Area */}

      {/*================Login Box Area =================*/}
      <section className="login_box_area section_gap">
        <div className="container">
          <div className="row">
            <div className="col-lg-6">
              <div className="login_box_img">
                <img className="img-fluid" src="img/login.jpg" alt="" />
                <div className="hover">
                  <h4>New to our website?</h4>
                  <p>There are advances being made in science and technology everyday, and a good example of this is the</p>
                  <a className="primary-btn" href="registration.html">Create an Account</a>
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="login_form_inner">
                <div className="login_tabs">
                  <button 
                    className={`tab-btn ${activeTab === 'user' ? 'active' : ''}`}
                    onClick={() => setActiveTab('user')}
                  >
                    User Login
                  </button>
                  <button 
                    className={`tab-btn ${activeTab === 'admin' ? 'active' : ''}`}
                    onClick={() => setActiveTab('admin')}
                  >
                    Admin Login
                  </button>
                </div>

                {error && <div className="alert alert-danger">{error}</div>}

                {activeTab === 'user' ? (
                  <>
                    <h3>User Login</h3>
                    <form className="row login_form" onSubmit={handleUserLogin}>
                      <div className="col-md-12 form-group">
                        <input 
                          type="text" 
                          className="form-control" 
                          placeholder="Username" 
                          value={userUsername}
                          onChange={(e) => setUserUsername(e.target.value)}
                          required
                        />
                      </div>
                      <div className="col-md-12 form-group">
                        <input 
                          type="password" 
                          className="form-control" 
                          placeholder="Password" 
                          value={userPassword}
                          onChange={(e) => setUserPassword(e.target.value)}
                          required
                        />
                      </div>
                      <div className="col-md-12 form-group">
                        <div className="creat_account">
                          <input type="checkbox" id="f-option2" name="selector" />
                          <label htmlFor="f-option2">Keep me logged in</label>
                        </div>
                      </div>
                      <div className="col-md-12 form-group">
                        <button 
                          type="submit" 
                          className="primary-btn"
                          disabled={loading}
                        >
                          {loading ? 'Logging in...' : 'Log In'}
                        </button>
                        <a href="#">Forgot Password?</a>
                      </div>
                    </form>
                  </>
                ) : (
                  <>
                    <h3>Admin Login</h3>
                    <form className="row login_form" onSubmit={handleAdminLogin}>
                      <div className="col-md-12 form-group">
                        <input 
                          type="text" 
                          className="form-control" 
                          placeholder="Admin Username" 
                          value={adminUsername}
                          onChange={(e) => setAdminUsername(e.target.value)}
                          required
                        />
                      </div>
                      <div className="col-md-12 form-group">
                        <input 
                          type="password" 
                          className="form-control" 
                          placeholder="Admin Password" 
                          value={adminPassword}
                          onChange={(e) => setAdminPassword(e.target.value)}
                          required
                        />
                      </div>
                      <div className="col-md-12 form-group">
                        <button 
                          type="submit" 
                          className="primary-btn"
                          disabled={loading}
                        >
                          {loading ? 'Logging in...' : 'Log In'}
                        </button>
                      </div>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
      {/*================End Login Box Area =================*/}

      <style jsx>{`
        .login_tabs {
          display: flex;
          margin-bottom: 20px;
          justify-content: center;
          border-bottom: 1px solid #eee;
        }
        .tab-btn {
          padding: 10px 20px;
          background: none;
          border: none;
          cursor: pointer;
          font-size: 16px;
          color: #555;
          position: relative;
        }
        .tab-btn.active {
          color: #ff6c00;
          font-weight: bold;
        }
        .tab-btn.active:after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 0;
          width: 100%;
          height: 2px;
          background: #ff6c00;
        }
        .alert-danger {
          color: #721c24;
          background-color: #f8d7da;
          border-color: #f5c6cb;
          padding: 10px;
          margin-bottom: 15px;
          border-radius: 4px;
        }
        button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
      `}</style>
    <Footer />
    </>
  );
};

export default LoginPage;
