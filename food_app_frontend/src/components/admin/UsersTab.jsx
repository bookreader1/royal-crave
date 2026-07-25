import { useState } from 'react';

export default function UsersTab({ allUsers, refreshData, token }) {
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  // Unified Form State for both Create and Edit
  const [formData, setFormData] = useState({
    first_name: '',
    email: '',
    password: '',
    role: 'customer'
  });

  // Open modal for a NEW user
  const handleOpenCreate = () => {
    setEditingUser(null);
    setFormData({ first_name: '', email: '', password: '', role: 'customer' });
    setIsModalOpen(true);
  };

  // Open modal to EDIT an existing user
  const handleOpenEdit = (user) => {
    setEditingUser(user);
    setFormData({
      first_name: user.first_name || '',
      email: user.email || '',
      password: '', // Leave blank so we don't accidentally overwrite it unless typed
      role: user.role || 'customer'
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  // Handle both Create and Edit Submissions
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (editingUser) {
      // --- EDIT EXISTING USER ---
      try {
        // Only send the password if the admin typed a new one
        const payload = { ...formData };
        if (!payload.password) delete payload.password;

        const res = await fetch(`http://127.0.0.1:8000/api/users/${editingUser.id}/`, {
          method: 'PUT', // Assuming your Django backend uses PUT or PATCH for user updates
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
          },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          handleCloseModal();
          refreshData();
        } else {
          alert('Failed to update user.');
        }
      } catch (err) { alert('Network error.'); }

    } else {
      // --- CREATE NEW USER ---
      try {
        const res = await fetch('http://127.0.0.1:8000/api/users/register/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });

        if (res.ok) {
          handleCloseModal();
          refreshData(); 
        } else {
          alert('Failed to create user. Check password length (min 8).');
        }
      } catch (err) { alert('Network error.'); }
    }
  };

  return (
    <div>
      {/* Top Header & Add Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ margin: 0, color: '#4DB6AC' }}>👥 All System Users</h3>
        <button onClick={handleOpenCreate} style={{ background: '#4CAF50', color: '#FFF', border: 'none', padding: '10px 16px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
          ➕ Add New User
        </button>
      </div>

      {/* Users Table */}
      <div style={{ background: '#1E1E1E', padding: '25px', borderRadius: '12px', border: '1px solid #333' }}>
        <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #333', color: '#888' }}>
                <th style={{ padding: '12px' }}>Name</th>
                <th style={{ padding: '12px' }}>Email</th>
                <th style={{ padding: '12px' }}>Role</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {allUsers.map(u => (
                <tr key={u.id} style={{ borderBottom: '1px solid #2A2A2A' }}>
                  <td style={{ padding: '12px', color: '#FFF', fontWeight: 'bold' }}>{u.first_name} {u.last_name}</td>
                  <td style={{ padding: '12px', color: '#888' }}>{u.email}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', background: u.role === 'admin' ? '#B71C1C' : u.role === 'kitchen' ? '#FF9800' : '#2A2A2A', color: '#FFF' }}>
                      {u.role.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>
                    <button onClick={() => handleOpenEdit(u)} style={{ background: '#2196F3', color: '#FFF', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pop-up Modal for Create / Edit */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ background: '#1E1E1E', padding: '30px', borderRadius: '12px', width: '400px', border: '1px solid #444' }}>
            <h3 style={{ color: '#FFB74D', marginTop: 0 }}>{editingUser ? '✏️ Edit User' : '➕ Create Account'}</h3>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <input 
                type="text" 
                placeholder="First Name" 
                required 
                value={formData.first_name} 
                onChange={e => setFormData({...formData, first_name: e.target.value})} 
                style={{ padding: '10px', borderRadius: '6px', background: '#2A2A2A', border: '1px solid #444', color: '#FFF' }} 
              />
              <input 
                type="email" 
                placeholder="Email Address" 
                required 
                value={formData.email} 
                onChange={e => setFormData({...formData, email: e.target.value})} 
                style={{ padding: '10px', borderRadius: '6px', background: '#2A2A2A', border: '1px solid #444', color: '#FFF' }} 
              />
              <input 
                type="password" 
                placeholder={editingUser ? "New Password (leave blank to keep current)" : "Password (min 8 chars)"} 
                required={!editingUser} // Only required when creating a new user
                value={formData.password} 
                onChange={e => setFormData({...formData, password: e.target.value})} 
                style={{ padding: '10px', borderRadius: '6px', background: '#2A2A2A', border: '1px solid #444', color: '#FFF' }} 
              />
              <select 
                value={formData.role} 
                onChange={e => setFormData({...formData, role: e.target.value})} 
                style={{ padding: '10px', borderRadius: '6px', background: '#2A2A2A', border: '1px solid #444', color: '#FFF' }}
              >
                <option value="customer">Customer</option>
                <option value="kitchen">Kitchen Staff</option>
                <option value="admin">Admin</option>
              </select>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="submit" style={{ flex: 1, background: '#4CAF50', color: '#FFF', border: 'none', padding: '12px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                  {editingUser ? 'Save Changes' : 'Create User'}
                </button>
                <button type="button" onClick={handleCloseModal} style={{ flex: 1, background: '#555', color: '#FFF', border: 'none', padding: '12px', borderRadius: '6px', cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  );
}