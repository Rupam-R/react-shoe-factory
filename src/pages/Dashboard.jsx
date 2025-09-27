import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import "./Dashboard.css";
import { 
  faTachometerAlt, faUser, faBox, faChartLine, 
  faCog, faSignOutAlt, faUsers, faShoppingCart,
  faStore, faTags, faEnvelope,faPager,faGears,faBlog 
} from '@fortawesome/free-solid-svg-icons';
import ProfileSection from './ProfileSection';
import BannerSection from './BannerSection';
import ServicesSection from './ServicesSection';
import CategorySection from './CategorySection';
import DealSection from './DealSection';
import WeekdealSection from './WeekdealSection';
import BlogSection from './BlogSection';
import BrandSection from './BrandSection';
import ManageUsers from './ManageUsers';
import ManageProducts from './ManageProducts';
import Cookies from 'js-cookie';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [userType, setUserType] = useState('user'); // 'admin' or 'user'
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  // Check authentication on component mount
  useEffect(() => {
    const isAdmin = Cookies.get('isAdmin') === 'true';
    const userId = Cookies.get('userId');
    const username = Cookies.get('username');
    
    if (!userId) {
      navigate('/login');
    } else {
      setUserType(isAdmin ? 'admin' : 'user');
      setUsername(username || (isAdmin ? 'Admin' : 'User'));
    }
  }, [navigate]);

  const handleLogout = () => {
    // Remove all cookies
    Cookies.remove('userId');
    Cookies.remove('username');
    Cookies.remove('isAdmin');
    navigate('/login');
  };

  // Dashboard content based on user type
  const renderDashboardContent = () => {
    switch(activeTab) {
      case 'dashboard':
        return userType === 'admin' ? <AdminDashboard /> : <UserDashboard />;
      case 'profile':
        return <ProfileSection />;
      case 'banner':
        return <BannerSection />;
      case 'services':
        return <ServicesSection />;
      case 'category':
        return <CategorySection />;
      case 'deals':
        return <DealSection />;
      case 'weekdeal':
        return <WeekdealSection />;
      case 'blog':
        return <BlogSection />;
      case 'brand':
        return <BrandSection />;
      case 'orders':
        return <OrdersSection />;
      case 'products':
        return userType === 'admin' ? <ManageProducts /> : <MyProducts />;
      case 'analytics':
        return <AnalyticsSection />;
      case 'messages':
        return <MessagesSection />;
      case 'settings':
        return <SettingsSection />;
      case 'users':
        return <ManageUsers />;
      default:
        return <UserDashboard />;
    }
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <div className="dashboard-sidebar">
        <div className="sidebar-header">
          <h2>{userType === 'admin' ? 'Admin Panel' : 'My Account'}</h2>
        </div>
        
        <ul className="sidebar-menu">
          {/* Common tabs for both user types */}
          <li 
            className={activeTab === 'dashboard' ? 'active' : ''}
            onClick={() => setActiveTab('dashboard')}
          >
            <FontAwesomeIcon icon={faTachometerAlt} />
            <span>Dashboard</span>
          </li>
          
          <li 
            className={activeTab === 'profile' ? 'active' : ''}
            onClick={() => setActiveTab('profile')}
          >
            <FontAwesomeIcon icon={faUser} />
            <span>Profile</span>
          </li>
          <li 
            className={activeTab === 'banner' ? 'active' : ''}
            onClick={() => setActiveTab('banner')}
          >
            <FontAwesomeIcon icon={faPager} />
            <span>Banner Section</span>
          </li>
          <li 
            className={activeTab === 'services' ? 'active' : ''}
            onClick={() => setActiveTab('services')}
          >
            <FontAwesomeIcon icon={faGears} />
            <span>services Section</span>
          </li>
          <li 
            className={activeTab === 'category' ? 'active' : ''}
            onClick={() => setActiveTab('category')}
          >
           <FontAwesomeIcon icon="fa-solid fa-layer-group" />
            <span>Category Section</span>
          </li>
          <li 
            className={activeTab === 'deals' ? 'active' : ''}
            onClick={() => setActiveTab('deals')}
          >
          <FontAwesomeIcon icon="fa-solid fa-dollar-sign" />
            <span>Exclusive Deals Section</span>
          </li>
          <li 
            className={activeTab === 'weekdeal' ? 'active' : ''}
            onClick={() => setActiveTab('weekdeal')}
          >
          <FontAwesomeIcon icon="fa-solid fa-circle-dollar-to-slot" />
            <span>Week Deals Section</span>
          </li>
          <li 
            className={activeTab === 'blog' ? 'active' : ''}
            onClick={() => setActiveTab('blog')}
          >
          <FontAwesomeIcon icon={faBlog} />
            <span>Blog Section</span>
          </li>
          <li 
            className={activeTab === 'brand' ? 'active' : ''}
            onClick={() => setActiveTab('brand')}
          >
         <FontAwesomeIcon icon="fa-solid fa-copyright" />
            <span>Top Brands Section</span>
          </li>
          
          <li 
            className={activeTab === 'orders' ? 'active' : ''}
            onClick={() => setActiveTab('orders')}
          >
            <FontAwesomeIcon icon={faShoppingCart} />
            <span>{userType === 'admin' ? 'All Orders' : 'My Orders'}</span>
          </li>
          
          <li 
            className={activeTab === 'products' ? 'active' : ''}
            onClick={() => setActiveTab('products')}
          >
            <FontAwesomeIcon icon={faBox} />
            <span>{userType === 'admin' ? 'Manage Products' : 'My Products'}</span>
          </li>
          
          {/* Admin-only tabs */}
          {userType === 'admin' && (
            <>
              <li 
                className={activeTab === 'users' ? 'active' : ''}
                onClick={() => setActiveTab('users')}
              >
                <FontAwesomeIcon icon={faUsers} />
                <span>Manage Users</span>
              </li>
              
              <li 
                className={activeTab === 'analytics' ? 'active' : ''}
                onClick={() => setActiveTab('analytics')}
              >
                <FontAwesomeIcon icon={faChartLine} />
                <span>Analytics</span>
              </li>
            </>
          )}
          
          <li 
            className={activeTab === 'messages' ? 'active' : ''}
            onClick={() => setActiveTab('messages')}
          >
            <FontAwesomeIcon icon={faEnvelope} />
            <span>Messages</span>
          </li>
          
          <li 
            className={activeTab === 'settings' ? 'active' : ''}
            onClick={() => setActiveTab('settings')}
          >
            <FontAwesomeIcon icon={faCog} />
            <span>Settings</span>
          </li>
        </ul>
        
        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-btn">
            <FontAwesomeIcon icon={faSignOutAlt} />
            <span>Logout</span>
          </button>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="dashboard-content">
        <div className="content-header">
          <h1>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1>
          <div className="user-info">
            <span>Welcome, {username}</span>
          </div>
        </div>
        
        <div className="content-body">
          {renderDashboardContent()}
        </div>
      </div>
    </div>
  );
};

// Dashboard Components (keep these the same as before)
const AdminDashboard = () => {
  const navigate = useNavigate();
  
  const stats = [
    { title: 'Total Users', value: '1,234', change: '+12%', trend: 'up' },
    { title: 'Total Products', value: '567', change: '+5%', trend: 'up' },
    { title: 'Total Orders', value: '890', change: '-3%', trend: 'down' },
    { title: 'Revenue', value: '$12,345', change: '+18%', trend: 'up' },
  ];

  return (
    <div className="admin-dashboard">
      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div className="stat-card" key={index}>
            <h3>{stat.title}</h3>
            <div className="stat-value">{stat.value}</div>
            <div className={`stat-change ${stat.trend}`}>
              {stat.change} <span>{stat.trend === 'up' ? '↑' : '↓'}</span>
            </div>
          </div>
        ))}
      </div>
      
      <div className="dashboard-row">
        <div className="recent-orders">
          <h2>Recent Orders</h2>
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4, 5].map(order => (
                <tr key={order}>
                  <td>#ORD{1000 + order}</td>
                  <td>Customer {order}</td>
                  <td>2023-06-{10 + order}</td>
                  <td>${(100 + order * 25).toFixed(2)}</td>
                  <td>
                    <span className={`status ${order % 3 === 0 ? 'shipped' : order % 3 === 1 ? 'pending' : 'delivered'}`}>
                      {order % 3 === 0 ? 'Shipped' : order % 3 === 1 ? 'Pending' : 'Delivered'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="action-buttons">
            <button className="action-btn" onClick={() => navigate('/add-user')}>
              <FontAwesomeIcon icon={faUser} /> Add User
            </button>
            <button className="action-btn">
              <FontAwesomeIcon icon={faBox} /> Add Product
            </button>
            <button className="action-btn">
              <FontAwesomeIcon icon={faTags} /> Create Discount
            </button>
            <button className="action-btn">
              <FontAwesomeIcon icon={faStore} /> Manage Inventory
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const UserDashboard = () => {
  return (
    <div className="user-dashboard">
      <div className="welcome-banner">
        <h2>Welcome Back!</h2>
        <p>You have 3 new messages and 2 pending orders</p>
      </div>
      
      <div className="user-stats">
        <div className="stat-card">
          <h3>Orders</h3>
          <div className="stat-value">12</div>
          <div className="stat-desc">5 pending</div>
        </div>
        
        <div className="stat-card">
          <h3>Wishlist</h3>
          <div className="stat-value">8</div>
          <div className="stat-desc">3 on sale</div>
        </div>
        
        <div className="stat-card">
          <h3>Rewards</h3>
          <div className="stat-value">1,250</div>
          <div className="stat-desc">points</div>
        </div>
      </div>
      
      <div className="recent-activity">
        <h2>Recent Activity</h2>
        <ul>
          <li>
            <span className="activity-icon">✓</span>
            <div>
              <p>Order #1234 shipped</p>
              <small>2 days ago</small>
            </div>
          </li>
          <li>
            <span className="activity-icon">!</span>
            <div>
              <p>New message from support</p>
              <small>3 days ago</small>
            </div>
          </li>
          <li>
            <span className="activity-icon">★</span>
            <div>
              <p>Product review requested</p>
              <small>5 days ago</small>
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
};

// Other section components would go here
const OrdersSection = () => <div>Orders Section Content</div>;
// const ManageProducts = () => <div>Manage Products Content</div>;
const MyProducts = () => <div>My Products Content</div>;
const AnalyticsSection = () => <div>Analytics Section Content</div>;
const MessagesSection = () => <div>Messages Section Content</div>;
const SettingsSection = () => <div>Settings Section Content</div>;
// const ManageUsers = () => <div>Manage Users Content</div>;

export default Dashboard;