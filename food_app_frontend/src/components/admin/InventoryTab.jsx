import { useState } from 'react';

export default function InventoryTab({ token, categories, menuItems, refreshData }) {
  // Item States
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [editingItem, setEditingItem] = useState(null);

  // Category Manager States
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  // --- ITEM LOGIC ---
  const handleAddItem = async (e) => {
    e.preventDefault();
    await fetch('http://127.0.0.1:8000/api/menu/manage/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ 
        name, description, price, image, 
        category: categoryId || (categories[0]?.id), 
        is_available: true 
      })
    });
    setName(''); setDescription(''); setPrice(''); setImage(''); 
    refreshData();
  };

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
      if (res.ok) { setEditingItem(null); refreshData(); } 
      else { alert('Failed to update item.'); }
    } catch (err) { console.error(err); }
  };

  const handleDeleteItem = async (id) => {
    await fetch(`http://127.0.0.1:8000/api/menu/manage/${id}/`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
    refreshData();
  };

  // --- CATEGORY LOGIC ---
  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    
    await fetch('http://127.0.0.1:8000/api/categories/manage/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ name: newCategoryName })
    });
    setNewCategoryName('');
    refreshData();
  };

  const handleDeleteCategory = async (id) => {
    if(!window.confirm('Warning: Deleting a category might delete or orphan its menu items. Continue?')) return;
    
    await fetch(`http://127.0.0.1:8000/api/categories/manage/${id}/`, { 
      method: 'DELETE', 
      headers: { 'Authorization': `Bearer ${token}` } 
    });
    refreshData();
  };

  return (
    <div>
      {/* Add New Item Panel */}
      <div style={{ background: '#1E1E1E', padding: '25px', borderRadius: '12px', border: '1px solid #333', marginBottom: '30px' }}>
        <h3 style={{ margin: '0 0 20px 0', color: '#FFB74D' }}>➕ Add New Menu Item</h3>
        <form onSubmit={handleAddItem} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', alignItems: 'center' }}>
          <input type="text" placeholder="Item Name" required value={name} onChange={e => setName(e.target.value)} style={{ padding: '10px', borderRadius: '6px', background: '#2A2A2A', border: '1px solid #444', color: '#FFF' }} />
          <input type="text" placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} style={{ padding: '10px', borderRadius: '6px', background: '#2A2A2A', border: '1px solid #444', color: '#FFF' }} />
          <input type="number" step="0.01" placeholder="Price (₹)" required value={price} onChange={e => setPrice(e.target.value)} style={{ padding: '10px', borderRadius: '6px', background: '#2A2A2A', border: '1px solid #444', color: '#FFF' }} />
          <input type="text" placeholder="Image URL (optional)" value={image} onChange={e => setImage(e.target.value)} style={{ padding: '10px', borderRadius: '6px', background: '#2A2A2A', border: '1px solid #444', color: '#FFF' }} />
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <select value={categoryId} onChange={e => setCategoryId(e.target.value)} style={{ flex: 1, padding: '10px', borderRadius: '6px', background: '#2A2A2A', border: '1px solid #444', color: '#FFF' }}>
              {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
            </select>
            <button type="button" onClick={() => setIsCategoryModalOpen(true)} style={{ background: '#555', color: '#FFF', border: 'none', padding: '10px', borderRadius: '6px', cursor: 'pointer' }} title="Manage Categories">
              ⚙️
            </button>
          </div>

          <button type="submit" style={{ background: '#4CAF50', color: '#FFF', border: 'none', padding: '10px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Add Item</button>
        </form>
      </div>

      {/* CATEGORY MANAGER MODAL */}
      {isCategoryModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ background: '#1E1E1E', padding: '30px', borderRadius: '12px', width: '400px', border: '1px solid #444' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, color: '#4DB6AC' }}>⚙️ Manage Categories</h3>
              <button onClick={() => setIsCategoryModalOpen(false)} style={{ background: 'transparent', color: '#FFF', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}>✖</button>
            </div>

            {/* Add New Category */}
            <form onSubmit={handleAddCategory} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              <input type="text" placeholder="New Category Name" required value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} style={{ flex: 1, padding: '10px', borderRadius: '6px', background: '#2A2A2A', border: '1px solid #444', color: '#FFF' }} />
              <button type="submit" style={{ background: '#4CAF50', color: '#FFF', border: 'none', padding: '10px 15px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Add</button>
            </form>

            {/* List Existing Categories */}
            <div style={{ maxHeight: '300px', overflowY: 'auto', borderTop: '1px solid #333', paddingTop: '15px' }}>
              {categories.map(cat => (
                <div key={cat.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#2A2A2A', padding: '10px', borderRadius: '6px', marginBottom: '10px' }}>
                  <span style={{ color: '#FFF', fontWeight: 'bold' }}>{cat.name}</span>
                  <button onClick={() => handleDeleteCategory(cat.id)} style={{ background: '#CF6679', color: '#121212', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}>Delete</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* EDIT MENU ITEM MODAL */}
      {editingItem && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
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

      {/* INVENTORY TABLE */}
      <div style={{ background: '#1E1E1E', padding: '25px', borderRadius: '12px', border: '1px solid #333' }}>
        <h3 style={{ margin: '0 0 20px 0', color: '#4DB6AC' }}>📋 Menu Inventory</h3>
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
                  <button onClick={() => handleDeleteItem(item.id)} style={{ background: '#CF6679', color: '#121212', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}