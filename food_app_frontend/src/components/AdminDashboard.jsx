import { useState, useEffect } from 'react';
import InventoryTab from './admin/InventoryTab';
import ReportsTab from './admin/ReportsTab';
import UsersTab from './admin/UsersTab';

import LifecycleTab from './admin/LifecycleTab'; // ADD THIS LINE

export default function AdminDashboard({ onLogout, token }) {
  const [activeSubTab, setActiveSubTab] = useState('inventory'); 
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [allUsers, setAllUsers] = useState([]); 

  const fetchAdminData = () => {
    // 1. Fetch Menu
    fetch('http://127.0.0.1:8000/api/menu/', { headers: { 'Authorization': `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setCategories(data);
          const allItems = data.flatMap(cat => cat.items.map(item => ({ ...item, categoryName: cat.name })));
          setMenuItems(allItems);
        }
      });

    // 2. Fetch ALL Orders
    fetch('http://127.0.0.1:8000/api/admin/orders/', { headers: { 'Authorization': `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setAllOrders(data); });

    // 3. Fetch ALL Users
    fetch('http://127.0.0.1:8000/api/users/', { headers: { 'Authorization': `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setAllUsers(data); });
  };

  useEffect(() => {
    fetchAdminData();
    const adminInterval = setInterval(fetchAdminData, 10000); 
    return () => clearInterval(adminInterval);
  }, [token]);

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
      {/* Admin Navigation Tabs */}
<div style={{ display: 'flex', gap: '15px', marginBottom: '30px' }}>
  <button onClick={() => setActiveSubTab('inventory')} style={{ background: activeSubTab === 'inventory' ? '#FFB74D' : '#2A2A2A', color: activeSubTab === 'inventory' ? '#000' : '#FFF', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Menu Inventory</button>
  <button onClick={() => setActiveSubTab('reports')} style={{ background: activeSubTab === 'reports' ? '#FFB74D' : '#2A2A2A', color: activeSubTab === 'reports' ? '#000' : '#FFF', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Financial & Reports</button>
  <button onClick={() => setActiveSubTab('users')} style={{ background: activeSubTab === 'users' ? '#FFB74D' : '#2A2A2A', color: activeSubTab === 'users' ? '#000' : '#FFF', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>User Management</button>
  
  {/* ADD THIS NEW BUTTON */}
  <button onClick={() => setActiveSubTab('lifecycle')} style={{ background: activeSubTab === 'lifecycle' ? '#FFB74D' : '#2A2A2A', color: activeSubTab === 'lifecycle' ? '#000' : '#FFF', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Order Lifecycle</button>
</div>

     {/* Render the active tab and pass down required props */}
{activeSubTab === 'inventory' && <InventoryTab token={token} categories={categories} menuItems={menuItems} refreshData={fetchAdminData} />}
{activeSubTab === 'reports' && <ReportsTab allOrders={allOrders} />}
{activeSubTab === 'users' && <UsersTab allUsers={allUsers} refreshData={fetchAdminData} token={token} />}

{/* ADD THIS NEW LINE */}
{activeSubTab === 'lifecycle' && <LifecycleTab allOrders={allOrders} />}
    </div>
  );
}