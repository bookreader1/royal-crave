import { useState, useEffect } from 'react';

const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? "http://127.0.0.1:8000"
  : "https://king-crave-backend.onrender.com";

export default function KitchenDashboard({ onLogout, token }) {
  const [kitchenOrders, setKitchenOrders] = useState([]);
  const [loadingQueue, setLoadingQueue] = useState(true);

  const fetchQueue = () => {
    fetch(`${API_BASE_URL}/api/kitchen/orders/`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
      if (Array.isArray(data)) setKitchenOrders(data);
      setLoadingQueue(false);
    })
    .catch(err => console.error("Error fetching queue:", err));
  };

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 10000);
    return () => clearInterval(interval);
  }, [token]);

  const updateStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/orders/${orderId}/status/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) fetchQueue();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ padding: '30px', background: '#121212', minHeight: '100vh', color: '#E0E0E0', fontFamily: 'sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '2px solid #333', paddingBottom: '20px' }}>
        <h1 style={{ margin: 0, color: '#FFF' }}>👨‍🍳 Royal Kitchen Queue</h1>
        <button onClick={onLogout} style={{ background: '#CF6679', color: '#121212', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Sign Out</button>
      </header>

      {loadingQueue ? <p style={{ color: '#888' }}>Loading tickets...</p> : kitchenOrders.length === 0 ? (
        <h2 style={{ color: '#4CAF50', textAlign: 'center', marginTop: '50px' }}>🎉 All tickets cleared!</h2>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {kitchenOrders.map(order => (
            <div key={order.id} style={{ background: '#1E1E1E', border: '1px solid #333', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                  <h3 style={{ margin: 0, color: '#FFB74D' }}>Order #{order.id}</h3>
                  <span style={{ background: '#FF9800', color: '#000', padding: '4px 10px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 'bold' }}>{order.status}</span>
                </div>
                <p style={{ fontSize: '0.85rem', color: '#888', marginBottom: '15px' }}>🕒 {order.created_at_formatted}</p>
                
                <div style={{ background: '#2A2A2A', borderRadius: '8px', padding: '12px', marginBottom: '15px' }}>
                  {order.items && order.items.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: '#FFF', fontSize: '1rem' }}>
                      <span style={{ color: '#4DB6AC', fontWeight: 'bold' }}>{item.quantity}x</span>
                      <span style={{ flex: 1, marginLeft: '12px', color: '#FFF' }}>{item.item_name}</span>
                    </div>
                  ))}
                </div>

                {order.special_instructions && (
                  <div style={{ background: '#5C1D24', borderLeft: '5px solid #FF5252', padding: '10px', borderRadius: '6px', marginBottom: '15px' }}>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#FF8A80', fontWeight: 'bold' }}>⚠️ Instructions:</p>
                    <p style={{ margin: '4px 0 0 0', color: '#FFEBEE' }}>{order.special_instructions}</p>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                {order.status === 'Pending' && (
                  <button onClick={() => updateStatus(order.id, 'Preparing')} style={{ flex: 1, background: '#2196F3', color: '#FFF', border: 'none', padding: '10px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Start Preparing</button>
                )}
                <button onClick={() => updateStatus(order.id, 'Delivered')} style={{ flex: 1, background: '#4CAF50', color: '#FFF', border: 'none', padding: '10px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Mark Completed</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}