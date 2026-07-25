import { useState } from 'react';

export default function LifecycleTab({ allOrders }) {
  const [selectedOrder, setSelectedOrder] = useState(null);

  return (
    <div>
      {/* Interactive Audit Table */}
      <div style={{ background: '#1E1E1E', padding: '25px', borderRadius: '12px', border: '1px solid #333' }}>
        <h3 style={{ margin: '0 0 20px 0', color: '#4DB6AC' }}>🔄 Order Lifecycle & Audit</h3>
        <p style={{ color: '#888', marginBottom: '15px', fontSize: '0.9rem' }}>Click on any order to view its full lifecycle and exact timestamps.</p>
        
        <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #333', color: '#888' }}>
                <th style={{ padding: '12px' }}>Order ID</th>
                <th style={{ padding: '12px' }}>Customer</th>
                <th style={{ padding: '12px' }}>Amount</th>
                <th style={{ padding: '12px' }}>Current Status</th>
                <th style={{ padding: '12px' }}>Placed On</th>
              </tr>
            </thead>
            <tbody>
              {allOrders.map(order => (
                <tr 
                  key={order.id} 
                  onClick={() => setSelectedOrder(order)}
                  style={{ borderBottom: '1px solid #2A2A2A', cursor: 'pointer', transition: 'background 0.2s' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#2A2A2A'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '12px', color: '#FFB74D', fontWeight: 'bold' }}>#{order.id}</td>
                  <td style={{ padding: '12px', color: '#FFF' }}>{order.customer_name || 'Guest'}</td>
                  <td style={{ padding: '12px', color: '#81C784', fontWeight: 'bold' }}>₹{order.total_amount}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', background: order.status === 'Delivered' || order.status === 'Completed' ? '#1B5E20' : order.status === 'Preparing' ? '#F57C00' : '#E65100', color: '#FFF' }}>
                      {order.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px', color: '#888', fontSize: '0.9rem' }}>{order.created_at_formatted || new Date(order.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* LIFECYCLE MODAL */}
      {selectedOrder && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ background: '#1E1E1E', padding: '30px', borderRadius: '12px', width: '500px', border: '1px solid #444', maxHeight: '80vh', overflowY: 'auto' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #333', paddingBottom: '15px', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, color: '#FFB74D' }}>Order #{selectedOrder.id} Lifecycle</h2>
              <button onClick={() => setSelectedOrder(null)} style={{ background: 'transparent', color: '#FFF', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}>✖</button>
            </div>

            <div style={{ marginBottom: '20px', color: '#DDD' }}>
              <p><strong>👤 Customer:</strong> {selectedOrder.customer_name || 'Guest'}</p>
              <p><strong>💰 Total:</strong> <span style={{ color: '#81C784', fontWeight: 'bold' }}>₹{selectedOrder.total_amount}</span></p>
              {selectedOrder.special_instructions && (
                <div style={{ background: '#3E2723', padding: '10px', borderRadius: '6px', borderLeft: '4px solid #FF5252', marginTop: '10px' }}>
                  <strong>Note:</strong> <i>{selectedOrder.special_instructions}</i>
                </div>
              )}
            </div>

            {/* Visual Timeline */}
            <h3 style={{ color: '#4DB6AC', borderBottom: '1px solid #333', paddingBottom: '10px' }}>⏱️ Timeline</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginLeft: '10px', borderLeft: '2px solid #555', paddingLeft: '20px', position: 'relative' }}>
              
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '-29px', top: '2px', background: '#4CAF50', width: '12px', height: '12px', borderRadius: '50%' }}></span>
                <strong style={{ color: '#FFF' }}>Order Placed</strong>
                <p style={{ margin: '2px 0 0 0', color: '#888', fontSize: '0.85rem' }}>{selectedOrder.created_at_formatted || new Date(selectedOrder.created_at).toLocaleString()}</p>
              </div>

              <div style={{ position: 'relative', opacity: selectedOrder.status === 'Pending' ? 0.4 : 1 }}>
                <span style={{ position: 'absolute', left: '-29px', top: '2px', background: selectedOrder.status !== 'Pending' ? '#FF9800' : '#555', width: '12px', height: '12px', borderRadius: '50%' }}></span>
                <strong style={{ color: '#FFF' }}>Kitchen Started Preparing</strong>
                <p style={{ margin: '2px 0 0 0', color: '#888', fontSize: '0.85rem' }}>
                  {selectedOrder.preparing_at ? new Date(selectedOrder.preparing_at).toLocaleString() : (selectedOrder.status !== 'Pending' ? 'Timestamp missing' : 'Waiting...')}
                </p>
              </div>

              <div style={{ position: 'relative', opacity: (selectedOrder.status === 'Delivered' || selectedOrder.status === 'Completed') ? 1 : 0.4 }}>
                <span style={{ position: 'absolute', left: '-29px', top: '2px', background: (selectedOrder.status === 'Delivered' || selectedOrder.status === 'Completed') ? '#2196F3' : '#555', width: '12px', height: '12px', borderRadius: '50%' }}></span>
                <strong style={{ color: '#FFF' }}>Order Delivered</strong>
                <p style={{ margin: '2px 0 0 0', color: '#888', fontSize: '0.85rem' }}>
                  {selectedOrder.delivered_at ? new Date(selectedOrder.delivered_at).toLocaleString() : (selectedOrder.status === 'Delivered' ? 'Timestamp missing' : 'Pending...')}
                </p>
              </div>

            </div>

            {/* Items List */}
            <h3 style={{ color: '#4DB6AC', borderBottom: '1px solid #333', paddingBottom: '10px', marginTop: '30px' }}>🍔 Items Ordered</h3>
            <ul style={{ color: '#FFF', paddingLeft: '20px' }}>
              {selectedOrder.items && selectedOrder.items.map((item, idx) => (
                <li key={idx} style={{ marginBottom: '8px' }}>
                  <strong>{item.quantity}x</strong> {item.item_name} <span style={{ color: '#888' }}>(₹{item.price})</span>
                </li>
              ))}
            </ul>

          </div>
        </div>
      )}
    </div>
  );
}