export default function ReportsTab({ allOrders }) {
  const todayString = new Date().toISOString().split('T')[0]; 
  
  const todaysCompletedOrders = allOrders.filter(o => 
    (o.status === 'Delivered' || o.status === 'Completed') && 
    o.created_at && o.created_at.startsWith(todayString)
  );
  
  const todaysRevenue = todaysCompletedOrders.reduce((sum, order) => sum + parseFloat(order.total_amount || 0), 0);
  const pendingOrdersCount = allOrders.filter(o => o.status === 'Pending' || o.status === 'Preparing').length;

  return (
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

              <div style={{ fontSize: '0.9rem', color: '#DDD', marginBottom: '5px' }}>
                <strong>Items Ordered:</strong>
                <ul style={{ margin: '5px 0 0 20px', padding: 0 }}>
                  {order.items && order.items.map((item, idx) => (
                    <li key={idx}>{item.quantity}x {item.item_name} (₹{item.price})</li>
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
  );
}