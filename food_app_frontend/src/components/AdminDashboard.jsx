import { useState, useEffect } from 'react';

export default function AdminDashboard({ onLogout, token }) {
  const [activeSubTab, setActiveSubTab] = useState('inventory'); 
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [allUsers, setAllUsers] = useState([]); 
  
  // New Item State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState('');
  const [categoryId, setCategoryId] = useState('');
  
  // Edit Modal State
  const [editingItem, setEditingItem] = useState(null);

  // New User State
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState('customer');
  const [newUserFirstName, setNewUserFirstName] = useState('');

  const fetchAdminData = () => {
    // 1. Fetch Menu with token so admin sees out-of-stock items too
    fetch('http://127.0.0.1:8000/api/menu/', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setCategories(data);
          if (data.length > 0 && !categoryId) setCategoryId(data[0].id);
          const allItems = data.flatMap(cat => cat.items.map(item => ({ ...item, categoryName: cat.name })));
          setMenuItems(allItems);
        }
      });

    // 2. Fetch ALL Orders
    fetch('http://127.0.0.1:8000/api/admin/orders/', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => { if (Array.isArray(data)) setAllOrders(data); });

    // 3. Fetch ALL Users
    fetch('http://127.0.0.1:8000/api/users/', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => { if (Array.isArray(data)) setAllUsers(data); });
  };

  useEffect(() => {
    fetchAdminData();
    const adminInterval = setInterval(fetchAdminData, 10000); // Auto-refreshes every 10 seconds
    return () => clearInterval(adminInterval);
  }, [token]);

  // Handle Full Item Edit (Name, Description, Price, Image, Availability)
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/menu/manage/${editingItem.id}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          name: editingItem.name,
          description: editingItem.description,
          price: editingItem.price,
          image: editingItem.image,
          category: editingItem.category || categories[0]?.id,
          is_available: editingItem.is_available
        })
      });
      if (res.ok) {
        setEditingItem(null);
        fetchAdminData();
      } else {
        alert('Failed to update item.');
      }
    } catch (err) { console.error(err); }
  };

  // Handle Create User
  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://127.0.0.1:8000/api/users/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newUserEmail, password: newUserPassword, first_name: newUserFirstName, role: newUserRole })
      });
      if (res.ok) {
        alert('User created successfully!');
        setNewUserEmail(''); setNewUserPassword(''); setNewUserFirstName('');
        fetchAdminData(); 
      } else {
        alert('Failed to create user. Check password length (min 8).');
      }
    } catch (err) { alert('Network error.'); }
  };

  // FINANCIAL LOGIC: Filter for TODAY'S delivered/completed orders
  const todayString = new Date().toISOString().split('T')[0]; // Gets 'YYYY-MM-DD'
  
  const todaysCompletedOrders = allOrders.filter(o => 
    (o.status === 'Delivered' || o.status === 'Completed') && 
    o.created_at && o.created_at.startsWith(todayString)
  );
  
  const todaysRevenue = todaysCompletedOrders.reduce((sum, order) => sum + parseFloat(order.total_amount || 0), 0);
  const pendingOrdersCount = allOrders.filter(o => o.status === 'Pending' || o.status === 'Preparing').length;

  return (
    <div style={{ padding: '30px', background: '#121212', minHeight: '100vh', color: '#E0E0E0', fontFamily: 'sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '2px solid #333', paddingBottom: '20px' }}>
        <div>
          <h1 style={{ margin: 0, color: '#FFF' }}>📊 Restaurant Admin Portal</h1>
          <p style={{ margin: '5px 0 0 0', color: '#888' }}>Full System & Financial Control</p>
        </div>
        <button onClick={onLogout} style={{ background: '#CF6679', color: '#121212', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Sign Out</button>
      </header>

      {/* Admin Navigation Tabs */}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '30px' }}>
        <button onClick={() => setActiveSubTab('inventory')} style={{ background: activeSubTab === 'inventory' ? '#FFB74D' : '#2A2A2A', color: activeSubTab === 'inventory' ? '#000' : '#FFF', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Menu Inventory</button>
        <button onClick={() => setActiveSubTab('reports')} style={{ background: activeSubTab === 'reports' ? '#FFB74D' : '#2A2A2A', color: activeSubTab === 'reports' ? '#000' : '#FFF', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Financial & Reports</button>
        <button onClick={() => setActiveSubTab('users')} style={{ background: activeSubTab === 'users' ? '#FFB74D' : '#2A2A2A', color: activeSubTab === 'users' ? '#000' : '#FFF', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>User Management</button>
      </div>

      {/* TAB 1: INVENTORY & FULL EDIT */}
      {activeSubTab === 'inventory' && (
        <div>
          <div style={{ background: '#1E1E1E', padding: '25px', borderRadius: '12px', border: '1px solid #333', marginBottom: '30px' }}>
            <h3 style={{ margin: '0 0 20px 0', color: '#FFB74D' }}>➕ Add New Menu Item</h3>
            <form onSubmit={async (e) => {
              e.preventDefault();
              await fetch('http://127.0.0.1:8000/api/menu/manage/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ name, description, price, image, category: categoryId, is_available: true })
              });
              setName(''); setDescription(''); setPrice(''); setImage(''); fetchAdminData();
            }} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
              <input type="text" placeholder="Item Name" required value={name} onChange={e => setName(e.target.value)} style={{ padding: '10px', borderRadius: '6px', background: '#2A2A2A', border: '1px solid #444', color: '#FFF' }} />
              <input type="text" placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} style={{ padding: '10px', borderRadius: '6px', background: '#2A2A2A', border: '1px solid #444', color: '#FFF' }} />
              <input type="number" step="0.01" placeholder="Price (₹)" required value={price} onChange={e => setPrice(e.target.value)} style={{ padding: '10px', borderRadius: '6px', background: '#2A2A2A', border: '1px solid #444', color: '#FFF' }} />
              <input type="text" placeholder="Image URL (optional)" value={image} onChange={e => setImage(e.target.value)} style={{ padding: '10px', borderRadius: '6px', background: '#2A2A2A', border: '1px solid #444', color: '#FFF' }} />
              <select value={categoryId} onChange={e => setCategoryId(e.target.value)} style={{ padding: '10px', borderRadius: '6px', background: '#2A2A2A', border: '1px solid #444', color: '#FFF' }}>
                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
              </select>
              <button type="submit" style={{ background: '#4CAF50', color: '#FFF', border: 'none', padding: '10px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Add Item</button>
            </form>
          </div>

          {/* Edit Modal Popup */}
          {editingItem && (
            <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
              <div style={{ background: '#1E1E1E', padding: '30px', borderRadius: '12px', width: '400px', border: '1px solid #444' }}>
                <h3 style={{ color: '#FFB74D', marginTop: 0 }}>Edit Menu Item</h3>
                <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <label style={{ fontSize: '0.85rem', color: '#888' }}>Name</label>
                  <input type="text" value={editingItem.name} onChange={e => setEditingItem({...editingItem, name: e.target.value})} style={{ padding: '10px', background: '#2A2A2A', border: '1px solid #444', color: '#FFF', borderRadius: '6px' }} />
                  
                  <label style={{ fontSize: '0.85rem', color: '#888' }}>Description</label>
                  <input type="text" value={editingItem.description || ''} onChange={e => setEditingItem({...editingItem, description: e.target.value})} style={{ padding: '10px', background: '#2A2A2A', border: '1px solid #444', color: '#FFF', borderRadius: '6px' }} />
                  
                  <label style={{ fontSize: '0.85rem', color: '#888' }}>Price (₹)</label>
                  <input type="number" step="0.01" value={editingItem.price} onChange={e => setEditingItem({...editingItem, price: e.target.value})} style={{ padding: '10px', background: '#2A2A2A', border: '1px solid #444', color: '#FFF', borderRadius: '6px' }} />
                  
                  <label style={{ fontSize: '0.85rem', color: '#888' }}>Image URL</label>
                  <input type="text" value={editingItem.image || ''} onChange={e => setEditingItem({...editingItem, image: e.target.value})} style={{ padding: '10px', background: '#2A2A2A', border: '1px solid #444', color: '#FFF', borderRadius: '6px' }} />

                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#FFF', cursor: 'pointer' }}>
                    <input type="checkbox" checked={editingItem.is_available} onChange={e => setEditingItem({...editingItem, is_available: e.target.checked})} />
                    Available in Stock
                  </label>

                  <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    <button type="submit" style={{ flex: 1, background: '#4CAF50', color: '#FFF', border: 'none', padding: '10px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Save Changes</button>
                    <button type="button" onClick={() => setEditingItem(null)} style={{ flex: 1, background: '#555', color: '#FFF', border: 'none', padding: '10px', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <div style={{ background: '#1E1E1E', padding: '25px', borderRadius: '12px', border: '1px solid #333' }}>
            <h3 style={{ margin: '0 0 20px 0', color: '#4DB6AC' }}>📋 Menu Inventory & Full Control</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #333', color: '#888' }}>
                  <th style={{ padding: '12px' }}>Name</th>
                  <th style={{ padding: '12px' }}>Category</th>
                  <th style={{ padding: '12px' }}>Price</th>
                  <th style={{ padding: '12px' }}>Status</th>
                  <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {menuItems.map(item => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #2A2A2A' }}>
                    <td style={{ padding: '12px', color: '#FFF', fontWeight: 'bold' }}>{item.name}</td>
                    <td style={{ padding: '12px', color: '#888' }}>{item.categoryName}</td>
                    <td style={{ padding: '12px', color: '#81C784' }}>₹{item.price}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', background: item.is_available ? '#1B5E20' : '#B71C1C', color: '#FFF' }}>
                        {item.is_available ? 'Available' : 'Out of Stock'}
                      </span>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>
                      <button onClick={() => setEditingItem(item)} style={{ background: '#2196F3', color: '#FFF', border: 'none', padding: '6px 12px', borderRadius: '4px', marginRight: '10px', cursor: 'pointer', fontWeight: 'bold' }}>Edit</button>
                      <button onClick={async () => { await fetch(`http://127.0.0.1:8000/api/menu/manage/${item.id}/`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } }); fetchAdminData(); }} style={{ background: '#CF6679', color: '#121212', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: FINANCIAL REPORTS & ITEM-LEVEL AUDIT TRAIL */}
      {activeSubTab === 'reports' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
            <div style={{ background: '#1E1E1E', padding: '20px', borderRadius: '12px', border: '1px solid #333' }}>
              <p style={{ margin: '0 0 10px 0', color: '#888' }}>Today's Revenue (Delivered Only)</p>
              <h2 style={{ margin: 0, color: '#81C784', fontSize: '2rem' }}>₹{todaysRevenue.toFixed(2)}</h2>
            </div>
            <div style={{ background: '#1E1E1E', padding: '20px', borderRadius: '12px', border: '1px solid #333' }}>
              <p style={{ margin: '0 0 10px 0', color: '#888' }}>Pending Active Orders</p>
              <h2 style={{ margin: 0, color: '#FFB74D', fontSize: '2rem' }}>{pendingOrdersCount}</h2>
            </div>
          </div>

          <div style={{ background: '#1E1E1E', padding: '25px', borderRadius: '12px', border: '1px solid #333' }}>
            <h3 style={{ margin: '0 0 20px 0', color: '#4DB6AC' }}>📑 Detailed Order Audit Trail</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {allOrders.map(order => (
                <div key={order.id} style={{ background: '#2A2A2A', padding: '15px', borderRadius: '8px', border: '1px solid #444' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', borderBottom: '1px solid #333', paddingBottom: '8px' }}>
                    <div>
                      <span style={{ color: '#FFB74D', fontWeight: 'bold', display: 'block' }}>Order #{order.id}</span>
                      <span style={{ color: '#FFF', fontSize: '0.9rem' }}>👤 {order.customer_name || 'Guest'}</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ color: '#888', fontSize: '0.85rem', display: 'block', marginBottom: '4px' }}>{order.created_at_formatted}</span>
                      <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', background: order.status === 'Delivered' || order.status === 'Completed' ? '#1B5E20' : '#E65100', color: '#FFF' }}>{order.status}</span>
                      <span style={{ color: '#81C784', fontWeight: 'bold', marginLeft: '10px' }}>₹{order.total_amount}</span>
                    </div>
                  </div>

                  {/* Itemized breakdown */}
                  <div style={{ fontSize: '0.9rem', color: '#DDD', marginBottom: '5px' }}>
                    <strong>Items Ordered:</strong>
                    <ul style={{ margin: '5px 0 0 20px', padding: 0 }}>
                      {order.items && order.items.map((item, idx) => (
                        <li key={idx}>
                          {item.quantity}x {item.item_name} (₹{item.price})
                        </li>
                      ))}
                    </ul>
                  </div>

                  {order.special_instructions && (
                    <p style={{ margin: '8px 0 0 0', fontSize: '0.85rem', color: '#FF8A80', fontStyle: 'italic' }}>
                      <strong>Note:</strong> {order.special_instructions}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: USER CREATOR & DIRECTORY */}
      {activeSubTab === 'users' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
          
          {/* Form Panel */}
          <div style={{ background: '#1E1E1E', padding: '25px', borderRadius: '12px', border: '1px solid #333' }}>
            <h3 style={{ margin: '0 0 20px 0', color: '#FFB74D' }}>➕ Create Account</h3>
            <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <input type="text" placeholder="First Name" required value={newUserFirstName} onChange={e => setNewUserFirstName(e.target.value)} style={{ padding: '10px', borderRadius: '6px', background: '#2A2A2A', border: '1px solid #444', color: '#FFF' }} />
              <input type="email" placeholder="Email Address" required value={newUserEmail} onChange={e => setNewUserEmail(e.target.value)} style={{ padding: '10px', borderRadius: '6px', background: '#2A2A2A', border: '1px solid #444', color: '#FFF' }} />
              <input type="password" placeholder="Password (min 8 chars)" required value={newUserPassword} onChange={e => setNewUserPassword(e.target.value)} style={{ padding: '10px', borderRadius: '6px', background: '#2A2A2A', border: '1px solid #444', color: '#FFF' }} />
              <select value={newUserRole} onChange={e => setNewUserRole(e.target.value)} style={{ padding: '10px', borderRadius: '6px', background: '#2A2A2A', border: '1px solid #444', color: '#FFF' }}>
                <option value="customer">Customer</option>
                <option value="kitchen">Kitchen Staff</option>
                <option value="admin">Admin</option>
              </select>
              <button type="submit" style={{ background: '#4CAF50', color: '#FFF', border: 'none', padding: '12px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Create Account</button>
            </form>
          </div>

          {/* Users List Panel */}
          <div style={{ background: '#1E1E1E', padding: '25px', borderRadius: '12px', border: '1px solid #333' }}>
            <h3 style={{ margin: '0 0 20px 0', color: '#4DB6AC' }}>👥 All System Users</h3>
            <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #333', color: '#888' }}>
                    <th style={{ padding: '12px' }}>Name</th>
                    <th style={{ padding: '12px' }}>Email</th>
                    <th style={{ padding: '12px' }}>Role</th>
                  </tr>
                </thead>
                <tbody>
                  {allUsers.map(u => (
                    <tr key={u.id} style={{ borderBottom: '1px solid #2A2A2A' }}>
                      <td style={{ padding: '12px', color: '#FFF' }}>{u.first_name} {u.last_name}</td>
                      <td style={{ padding: '12px', color: '#888' }}>{u.email}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', background: u.role === 'admin' ? '#B71C1C' : u.role === 'kitchen' ? '#FF9800' : '#2A2A2A', color: '#FFF' }}>
                          {u.role.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}