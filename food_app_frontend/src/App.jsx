import { useState, useEffect } from 'react';
import { Search, User, ShoppingBag, Utensils } from 'lucide-react';
import './App.css';
import KitchenDashboard from './components/KitchenDashboard';
import AdminDashboard from './components/AdminDashboard';

function App() {
  // --- CORE STATES ---
  const [activeTab, setActiveTab] = useState('menu');
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  
  // --- SEARCH STATE ---
  const [searchQuery, setSearchQuery] = useState('');

  // --- CART STATES ---
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [specialInstructions, setSpecialInstructions] = useState('');
  
  // --- AUTH & PROFILE STATES ---
  const [token, setToken] = useState(localStorage.getItem('access_token'));
  const [userProfile, setUserProfile] = useState(null);
  const [orders, setOrders] = useState([]); 

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false); 
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authFirstName, setAuthFirstName] = useState('');
  const [authLastName, setAuthLastName] = useState('');
  const [authError, setAuthError] = useState('');
  const [otpStep, setOtpStep] = useState(false);
  const [enteredOtp, setEnteredOtp] = useState('');

  // --- API FETCHING ---
  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/menu/')
      .then(res => res.json())
      .then(data => {
        setCategories(data);
        if (data.length > 0) setActiveCategory(data[0].id);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const fetchMenu = () => {
      fetch('http://127.0.0.1:8000/api/menu/')
        .then(res => res.json())
        .then(data => {
          setCategories(data);
          setLoading(false);
        });
    };

    fetchMenu(); 
    const intervalId = setInterval(fetchMenu, 10000); 
    return () => clearInterval(intervalId); 
  }, []);

  useEffect(() => {
    if (token) {
      fetch('http://127.0.0.1:8000/api/users/profile/', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => {
        if (res.ok) return res.json();
        throw new Error('Token expired');
      })
      .then(data => setUserProfile(data))
      .catch(() => handleLogout());

      const fetchOrders = () => {
        fetch('http://127.0.0.1:8000/api/orders/', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setOrders(data);
          else setOrders([]); 
        })
        .catch(err => console.error("Error fetching orders:", err));
      };

      fetchOrders();
      const orderInterval = setInterval(fetchOrders, 10000); 
      return () => clearInterval(orderInterval);
    }
  }, [token]);

  // --- AUTH HANDLERS ---
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      const response = await fetch('http://127.0.0.1:8000/api/users/send-otp/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: authEmail })
      });
      if (!response.ok) throw new Error('Failed to send OTP email.');
      setOtpStep(true); 
    } catch (err) {
      setAuthError(err.message);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      const response = await fetch('http://127.0.0.1:8000/api/users/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: authEmail, password: authPassword, first_name: authFirstName, last_name: authLastName })
      });
      if (!response.ok) throw new Error('Registration failed. Check password length (min 8).');
      await handleLogin(e); 
    } catch (err) {
      setAuthError(err.message);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      const response = await fetch('http://127.0.0.1:8000/api/token/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: authEmail, password: authPassword })
      });
      if (!response.ok) throw new Error('Invalid email or password');
      const data = await response.json();
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);
      setToken(data.access);
      setShowLoginModal(false);
    } catch (err) {
      setAuthError(err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setToken(null);
    setUserProfile(null);
    setOrders([]);
    setActiveTab('menu');
    setIsGuest(false);
  };

  // --- CART HANDLERS ---
  const addToCart = (item) => {
    setCart(prev => {
      const existing = prev.find(c => c.id === item.id);
      if (existing) return prev.map(c => c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c);
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const updateQuantity = (id, delta) => {
    setCart(prev => prev.map(item => item.id === id ? { ...item, quantity: item.quantity + delta } : item).filter(i => i.quantity > 0));
  };

  const handleCheckout = async () => {
    if (!token) {
      alert("Please login from the Profile tab to place an order.");
      setIsCartOpen(false);
      setShowLoginModal(true);
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        cart_items: cart.map(item => ({ id: item.id, quantity: item.quantity })),
        delivery_address: "Saved Address",
        special_instructions: specialInstructions 
      };

      const response = await fetch('http://127.0.0.1:8000/api/checkout/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setOrderSuccess(true);
        setCart([]);
        setSpecialInstructions('');
        
        fetch('http://127.0.0.1:8000/api/orders/', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(data => { if (Array.isArray(data)) setOrders(data); });

        setTimeout(() => {
          setOrderSuccess(false);
          setIsCartOpen(false);
        }, 3000);
      } else {
        alert("Failed to place order.");
      }
    } catch (err) {
      alert("Network error.");
    }
    setIsSubmitting(false);
  };

  // --- TRAFFIC CONTROLLER (ADMIN/KITCHEN) ---
  if (userProfile && userProfile.role === 'kitchen') {
    return <KitchenDashboard onLogout={handleLogout} token={token} />;
  }

  if (userProfile && userProfile.role === 'admin') {
    return <AdminDashboard onLogout={handleLogout} token={token} />;
  }

  // --- DERIVED STATE & SEARCH LOGIC ---
  const cartTotalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const currentCategoryData = categories.find(c => c.id === activeCategory);

  let displayedItems = currentCategoryData?.items || [];

  if (searchQuery) {
    displayedItems = displayedItems.filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }

  if (loading) return <div className="status-screen">Preparing your menu...</div>;

  return (
    <div className="app-wrapper">
      
      {/* LANDING GATEWAY */}
      {!token && !isGuest ? (
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#3E2723', padding: '20px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '3.5rem', margin: '0 0 10px 0', color: '#EFEBE0', fontFamily: 'serif' }}>Royal Crave</h1>
          <p style={{ fontSize: '1.2rem', color: '#BCAAA4', marginBottom: '50px' }}>Your premium dining experience.</p>
          
          <button className="checkout-btn" onClick={() => { setIsRegistering(false); setShowLoginModal(true); }} style={{ width: '100%', maxWidth: '300px', marginBottom: '15px', background: '#EFEBE0', color: '#3E2723' }}>
            Log In
          </button>
          
          <button className="checkout-btn" onClick={() => { setIsRegistering(true); setShowLoginModal(true); }} style={{ width: '100%', maxWidth: '300px', marginBottom: '25px', background: '#B46B54', color: '#FFF' }}>
            Create an Account
          </button>

          <button onClick={() => setIsGuest(true)} style={{ background: 'transparent', border: 'none', color: '#BCAAA4', textDecoration: 'underline', fontSize: '1rem', cursor: 'pointer' }}>
            Continue as Guest
          </button>
        </div>
      ) : (
        /* STANDARD CUSTOMER APP */
        <div className="mobile-container">
          <header className="app-header">
            <div className="header-text">
              <h1>{activeTab === 'profile' ? 'My Profile' : 'Royal Crave'}</h1>
            </div>
            <div style={{display: 'flex', gap: '15px', alignItems: 'center'}}>
              <button className="icon-btn" onClick={() => activeTab === 'profile' ? setActiveTab('menu') : setActiveTab('profile')} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#EFEBE0' }}>
                {activeTab === 'profile' ? <Utensils size={24} /> : <User size={24} />}
              </button>
              {activeTab === 'menu' && (
                <button className="icon-btn cart" onClick={() => setIsCartOpen(true)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#EFEBE0', position: 'relative' }}>
                  <ShoppingBag size={24} />
                  {cartTotalItems > 0 && <span className="cart-badge">{cartTotalItems}</span>}
                </button>
              )}
            </div>
          </header>

          {/* STICKY SEARCH BAR */}
          {activeTab === 'menu' && (
            <div className="search-filter-section">
              <div className="search-bar-container">
                <Search size={18} color="#8D6E63" />
                <input 
                  type="text" 
                  placeholder="Search for your crave..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
              </div>
            </div>
          )}

          {activeTab === 'menu' ? (
            <>
              <div className="category-scroll">
                {categories.map(category => (
                  <button key={category.id} className={`category-pill ${activeCategory === category.id ? 'active' : ''}`} onClick={() => setActiveCategory(category.id)}>
                    {category.name}
                  </button>
                ))}
              </div>
              <main className="items-list">
                {displayedItems.map(item => {
                  const q = cart.find(c => c.id === item.id)?.quantity || 0;
                  return (
                    <div key={item.id} className="premium-card">
                      <div className="card-image-container">
                        <img src={item.image || "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80"} alt={item.name} className="card-image"/>
                      </div>
                      <div className="card-content">
                        <div className="card-header-row">
                          <h3 className="item-title">{item.name}</h3>
                          <span className="item-price">₹{item.price}</span>
                        </div>
                        {item.description && (
                          <p style={{ fontSize: '0.85rem', color: '#888', margin: '4px 0 10px 0', lineHeight: '1.4' }}>
                            {item.description}
                          </p>
                        )}
                        <div className="card-footer">
                          {q === 0 ? <button className="add-btn" onClick={() => addToCart(item)}>Add</button> : 
                          <div className="quantity-selector"><button onClick={() => updateQuantity(item.id, -1)}>-</button><span>{q}</span><button onClick={() => updateQuantity(item.id, 1)}>+</button></div>}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {displayedItems.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '40px 20px', color: '#888' }}>
                    <Search size={40} color="#555" style={{ marginBottom: '15px' }} />
                    <p>No items found matching your search.</p>
                  </div>
                )}
              </main>
            </>
          ) : (
            <div className="profile-view">
              {!token ? (
                <div className="auth-prompt">
                  <h2>Sign in to see your royal rewards and order history.</h2>
                  <button className="checkout-btn" onClick={() => setShowLoginModal(true)}>Login / Register</button>
                </div>
              ) : userProfile ? (
                <div className="profile-dashboard">
                  <div className="profile-avatar">{userProfile.first_name ? userProfile.first_name[0] : 'U'}</div>
                  <h2 className="profile-name">{userProfile.first_name} {userProfile.last_name}</h2>
                  <p className="profile-email">{userProfile.email}</p>

                  <div className="rewards-card">
                    <div>
                      <p className="rewards-title">Royal Rewards</p>
                      <h3 className="rewards-points">2,450 Points</h3>
                    </div>
                    <span className="rewards-icon">🏅</span>
                  </div>

                  <div className="orders-section">
                    <div className="section-header-row">
                      <h3 className="section-subtitle">Recent Orders</h3>
                      <button className="logout-text-btn" onClick={handleLogout}>Sign Out</button>
                    </div>

                    {!Array.isArray(orders) || orders.length === 0 ? (
                      <p className="empty-text">No royal orders placed yet.</p>
                    ) : (
                      orders.map(order => (
                        <div key={order.id} className="order-history-card">
                          <div className="order-history-header">
                            <span className="order-date">{order.created_at_formatted || 'Recently'}</span>
                            <span className={`order-status ${order.status.toLowerCase()}`}>{order.status}</span>
                          </div>
                          <div className="order-history-items">
                            {order.items && order.items.map((item, idx) => (
                              <div key={idx} className="history-item-row">
                                <span>{item.quantity}x {item.item_name || item.name}</span>
                                <span>₹{item.price}</span>
                              </div>
                            ))}
                          </div>
                          <div className="order-history-footer">
                            <span>Total</span>
                            <span>₹{order.total_amount}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ) : (
                <p style={{textAlign: 'center', marginTop: '20px'}}>Loading profile...</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* CART MODAL */}
      <div className={`cart-overlay ${isCartOpen ? 'open' : ''}`}>
        <div className="cart-modal">
          <div className="cart-header">
            <h2>Your Royal Order</h2>
            <button className="close-btn" onClick={() => setIsCartOpen(false)}>✕</button>
          </div>
          
          <div className="cart-items">
            {orderSuccess ? (
              <div className="success-message" style={{textAlign: 'center', padding: '40px 20px'}}>
                <h3 style={{color: '#2E7D32', fontSize: '1.5rem', marginBottom: '10px'}}>🎉 Order Received!</h3>
                <p style={{color: '#8D6E63'}}>The kitchen is preparing your crave.</p>
              </div>
            ) : cart.length === 0 ? (
              <p className="empty-cart">Your cart is feeling a bit light.</p>
            ) : (
              <>
                {cart.map(item => (
                  <div key={item.id} className="cart-item-row">
                    <div className="cart-item-info">
                      <h4>{item.name}</h4>
                      <p>₹{item.price}</p>
                    </div>
                    <div className="quantity-selector mini">
                      <button onClick={() => updateQuantity(item.id, -1)}>-</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, 1)}>+</button>
                    </div>
                  </div>
                ))}
                <div className="instruction-box" style={{ marginTop: '20px' }}>
                  <textarea 
                    placeholder="Any cooking instructions? (e.g., strictly veg, no onion, no garlic)"
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                  ></textarea>
                </div>
              </>
            )}
          </div>

          {cart.length > 0 && !orderSuccess && (
            <div className="cart-footer">
              <div className="total-row">
                <span>Total</span>
                <span>₹{cartTotalPrice.toFixed(2)}</span>
              </div>
              <button className="checkout-btn" onClick={handleCheckout} disabled={isSubmitting} style={{ opacity: isSubmitting ? 0.7 : 1 }}>
                {isSubmitting ? 'Processing...' : 'Proceed to Checkout'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* AUTH MODAL */}
      <div className={`cart-overlay ${showLoginModal ? 'open' : ''}`}>
        <div className="cart-modal">
          <div className="cart-header">
            <h2>{isRegistering ? 'Join Royal Crave' : 'Welcome Back'}</h2>
            <button className="close-btn" onClick={() => setShowLoginModal(false)}>✕</button>
          </div>
          
          <form className="login-form" onSubmit={otpStep ? handleRegister : (isRegistering ? handleRequestOtp : handleLogin)}>
            {authError && <p className="error-text" style={{color: 'red', fontSize: '0.9rem'}}>{authError}</p>}
            
            {isRegistering && !otpStep && (
              <>
                <div style={{display: 'flex', gap: '10px', marginBottom: '10px'}}>
                  <input type="text" placeholder="First Name" required value={authFirstName} onChange={e => setAuthFirstName(e.target.value)} />
                  <input type="text" placeholder="Last Name" value={authLastName} onChange={e => setAuthLastName(e.target.value)} />
                </div>
                <input type="email" placeholder="Email Address" required value={authEmail} onChange={e => setAuthEmail(e.target.value)} style={{marginBottom: '10px'}} />
                <button type="submit" className="checkout-btn" style={{marginTop: '10px'}}>Send Verification OTP</button>
              </>
            )}

            {isRegistering && otpStep && (
              <>
                <p style={{color: '#BCAAA4', fontSize: '0.9rem', marginBottom: '10px'}}>Enter the 6-digit code sent to {authEmail}</p>
                <input type="text" placeholder="Enter 6-digit OTP" required value={enteredOtp} onChange={e => setEnteredOtp(e.target.value)} style={{marginBottom: '10px'}} />
                <input type="password" placeholder="Choose Password (min 8 chars)" required value={authPassword} onChange={e => setAuthPassword(e.target.value)} style={{marginBottom: '10px'}} />
                <button type="submit" className="checkout-btn" style={{marginTop: '10px'}}>Verify & Complete Registration</button>
              </>
            )}

            {!isRegistering && (
              <>
                <input type="email" placeholder="Email Address" required value={authEmail} onChange={e => setAuthEmail(e.target.value)} style={{marginBottom: '10px'}}/>
                <input type="password" placeholder="Password" required value={authPassword} onChange={e => setAuthPassword(e.target.value)} />
                <button type="submit" className="checkout-btn" style={{marginTop: '20px'}}>Sign In</button>
              </>
            )}
          </form>

          <div style={{textAlign: 'center', marginTop: '20px'}}>
            <p style={{color: '#8D6E63', fontSize: '0.9rem'}}>
              {isRegistering ? 'Already have an account? ' : 'New to Royal Crave? '}
              <button onClick={() => { setIsRegistering(!isRegistering); setAuthError(''); }} style={{background: 'none', border: 'none', color: '#B46B54', fontWeight: 'bold', cursor: 'pointer'}}>
                {isRegistering ? 'Sign In' : 'Create an Account'}
              </button>
            </p>
          </div>

        </div>
      </div>

    </div>
  )
}

export default App;