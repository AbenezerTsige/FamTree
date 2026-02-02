import React, { useState, useEffect } from 'react';
import { getAuthHeaders } from '../context/AuthContext';
import './FamilyMembers.css';

const FamilyMembers = ({ onMemberChange }) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [inlineEditingId, setInlineEditingId] = useState(null);
  const [inlineFormData, setInlineFormData] = useState({});
  const [formData, setFormData] = useState({
    first_name: '',
    birth_date: '',
    gender: 'male',
    parent_id: '',
    color: '#4a90e2',
    font_size: '12',
    font_family: 'Arial',
    font_color: '#ffffff',
    label_offset_x: '',
    label_offset_y: '',
    label_rotation: '',
    label_radius_offset: ''
  });

  const apiUrl = process.env.REACT_APP_API_URL || (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:8000');

  const getErrorMessage = (detail) => {
    if (typeof detail === 'string') return detail;
    if (Array.isArray(detail)) {
      return detail.map((d) => (d && d.msg) ? d.msg : JSON.stringify(d)).join('; ');
    }
    if (detail && typeof detail === 'object') return JSON.stringify(detail);
    return 'Request failed';
  };

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${apiUrl}/api/persons`, { headers: getAuthHeaders() });
      if (!response.ok) throw new Error('Failed to fetch members');
      const data = await response.json();
      setMembers(data);
      setError(null);
    } catch (err) {
      setError(typeof err?.message === 'string' ? err.message : (err && String(err)) || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = {
        ...formData,
        last_name: '',
        parent_id: formData.parent_id && formData.parent_id !== 'none' ? parseInt(formData.parent_id) : null,
        font_size: formData.font_size || null,
        font_family: formData.font_family || null,
        font_color: formData.font_color || null,
        label_offset_x: formData.label_offset_x !== '' && formData.label_offset_x !== undefined ? parseFloat(formData.label_offset_x) : null,
        label_offset_y: formData.label_offset_y !== '' && formData.label_offset_y !== undefined ? parseFloat(formData.label_offset_y) : null,
        label_rotation: formData.label_rotation !== '' && formData.label_rotation !== undefined ? parseFloat(formData.label_rotation) : null,
        label_radius_offset: formData.label_radius_offset !== '' && formData.label_radius_offset !== undefined ? parseFloat(formData.label_radius_offset) : null
      };

      if (editingId) {
        const response = await fetch(`${apiUrl}/api/persons/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
          body: JSON.stringify(submitData)
        });
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(getErrorMessage(errorData.detail) || 'Failed to update member');
        }
      } else {
        const response = await fetch(`${apiUrl}/api/persons`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
          body: JSON.stringify(submitData)
        });
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(getErrorMessage(errorData.detail) || 'Failed to create member');
        }
      }

      resetForm();
      await fetchMembers();
      if (onMemberChange) onMemberChange();
    } catch (err) {
      setError(typeof err?.message === 'string' ? err.message : (err && String(err)) || 'Something went wrong');
    }
  };

  const handleEdit = (member) => {
    setEditingId(member.id);
    setFormData({
      first_name: member.first_name,
      birth_date: member.birth_date,
      gender: member.gender,
      parent_id: member.parent_id || '',
      color: member.color || '#4a90e2',
      font_size: member.font_size || '12',
      font_family: member.font_family || 'Arial',
      font_color: member.font_color || '#ffffff',
      label_offset_x: member.label_offset_x != null ? String(member.label_offset_x) : '',
      label_offset_y: member.label_offset_y != null ? String(member.label_offset_y) : '',
      label_rotation: member.label_rotation != null ? String(member.label_rotation) : '',
      label_radius_offset: member.label_radius_offset != null ? String(member.label_radius_offset) : ''
    });
  };

  const startInlineEdit = (member) => {
    setInlineEditingId(member.id);
    setInlineFormData({
      first_name: member.first_name,
      birth_date: member.birth_date,
      gender: member.gender,
      parent_id: member.parent_id || '',
      color: member.color || '#4a90e2',
      font_size: member.font_size != null ? String(member.font_size) : '',
      font_family: member.font_family || 'Arial',
      font_color: member.font_color || '#ffffff',
      label_offset_x: member.label_offset_x != null ? String(member.label_offset_x) : '',
      label_offset_y: member.label_offset_y != null ? String(member.label_offset_y) : '',
      label_rotation: member.label_rotation != null ? String(member.label_rotation) : '',
      label_radius_offset: member.label_radius_offset != null ? String(member.label_radius_offset) : ''
    });
  };

  const cancelInlineEdit = () => {
    setInlineEditingId(null);
    setInlineFormData({});
  };

  const handleInlineSave = async (e) => {
    e.preventDefault();
    if (!inlineEditingId) return;
    try {
      const submitData = {
        first_name: inlineFormData.first_name,
        last_name: '',
        birth_date: inlineFormData.birth_date,
        gender: inlineFormData.gender,
        parent_id: inlineFormData.parent_id && inlineFormData.parent_id !== 'none' ? parseInt(inlineFormData.parent_id) : null,
        color: inlineFormData.color || null,
        font_size: inlineFormData.font_size !== '' && inlineFormData.font_size != null ? String(inlineFormData.font_size) : null,
        font_family: inlineFormData.font_family || null,
        font_color: inlineFormData.font_color || null,
        label_offset_x: inlineFormData.label_offset_x !== '' && inlineFormData.label_offset_x !== undefined ? parseFloat(inlineFormData.label_offset_x) : null,
        label_offset_y: inlineFormData.label_offset_y !== '' && inlineFormData.label_offset_y !== undefined ? parseFloat(inlineFormData.label_offset_y) : null,
        label_rotation: inlineFormData.label_rotation !== '' && inlineFormData.label_rotation !== undefined ? parseFloat(inlineFormData.label_rotation) : null,
        label_radius_offset: inlineFormData.label_radius_offset !== '' && inlineFormData.label_radius_offset !== undefined ? parseFloat(inlineFormData.label_radius_offset) : null
      };
      const response = await fetch(`${apiUrl}/api/persons/${inlineEditingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(submitData)
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(getErrorMessage(errorData.detail) || 'Failed to update member');
      }
      setError(null);
      cancelInlineEdit();
      await fetchMembers();
      if (onMemberChange) onMemberChange();
    } catch (err) {
      setError(typeof err?.message === 'string' ? err.message : (err && String(err)) || 'Something went wrong');
    }
  };

  const handleDelete = async (id) => {
    const member = members.find(m => m.id === id);
    const memberName = member ? (member.last_name ? `${member.first_name} ${member.last_name}` : member.first_name) : 'this member';
    
    if (!window.confirm(`Are you sure you want to delete ${memberName}? This will also delete all their descendants.`)) {
      return;
    }

    try {
      setError(null);
      const response = await fetch(`${apiUrl}/api/persons/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(getErrorMessage(errorData.detail) || 'Failed to delete member');
      }
      
      // Refresh the members list to reflect the deletion
      await fetchMembers();
      
      // Update the dashboard to reflect changes
      if (onMemberChange) {
        onMemberChange();
      }
    } catch (err) {
      setError(typeof err?.message === 'string' ? err.message : (err && String(err)) || 'Something went wrong');
      console.error('Delete error:', err);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      first_name: '',
      birth_date: '',
      gender: 'male',
      parent_id: '',
      color: '#4a90e2',
      font_size: '12',
      font_family: 'Arial',
      font_color: '#ffffff',
      label_offset_x: '',
      label_offset_y: '',
      label_rotation: '',
      label_radius_offset: ''
    });
  };

  const getMemberName = (id) => {
    const member = members.find(m => m.id === id);
    if (!member) return 'Unknown';
    return member.last_name ? `${member.first_name} ${member.last_name}` : member.first_name;
  };

  const rootMember = members.find(m => m.parent_id == null);
  const handleEditRoot = () => {
    if (rootMember) handleEdit(rootMember);
  };

  if (loading) {
    return <div className="loading">Loading family members...</div>;
  }

  return (
    <div className="family-members">
      <div className="members-header">
        <h2>{editingId ? 'Edit Family Member' : 'Add New Family Member'}</h2>
        <div className="header-actions">
          {editingId && (
            <button type="submit" form="member-form" className="btn-update-member">
              Update Member
            </button>
          )}
          {rootMember && !editingId && (
            <button type="button" className="btn-edit-root" onClick={handleEditRoot} title="Edit the root (center) member">
              Update root member
            </button>
          )}
          {rootMember && editingId && editingId === rootMember.id && (
            <span className="root-badge">Editing root</span>
          )}
          <button type="button" className="btn-update" onClick={onMemberChange} title="Update Dashboard">
            Update Dashboard
          </button>
          {editingId && (
            <button type="button" className="btn-cancel" onClick={resetForm}>Cancel</button>
          )}
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <form id="member-form" onSubmit={handleSubmit} className="member-form">
        <div className="form-row">
          <div className="form-group">
            <label>First Name *</label>
            <input
              type="text"
              value={formData.first_name}
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Parent *</label>
            <select
              value={formData.parent_id || 'none'}
              onChange={(e) => setFormData({ ...formData, parent_id: e.target.value === 'none' ? '' : e.target.value })}
              required
            >
              <option value="none">None (Root/Founder)</option>
              {members
                .filter(m => !editingId || m.id !== editingId)
                .map(member => (
                  <option key={member.id} value={member.id}>
                    {member.last_name ? `${member.first_name} ${member.last_name}` : member.first_name} ({new Date(member.birth_date).getFullYear()})
                  </option>
                ))}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Birth Date *</label>
            <input
              type="date"
              value={formData.birth_date}
              onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Gender *</label>
            <select
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              required
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <div className="form-row form-row-four">
          <div className="form-group">
            <label>Segment color</label>
            <div className="color-picker-container">
              <input
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="color-picker"
              />
              <input
                type="text"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                placeholder="#4a90e2"
                className="color-input"
              />
            </div>
          </div>
          <div className="form-group">
            <label>Font color</label>
            <div className="color-picker-container">
              <input
                type="color"
                value={formData.font_color}
                onChange={(e) => setFormData({ ...formData, font_color: e.target.value })}
                className="color-picker"
              />
              <input
                type="text"
                value={formData.font_color}
                onChange={(e) => setFormData({ ...formData, font_color: e.target.value })}
                placeholder="#ffffff"
                className="color-input"
              />
            </div>
          </div>
          <div className="form-group">
            <label>Font size (px)</label>
            <input
              type="number"
              min="8"
              max="32"
              value={formData.font_size}
              onChange={(e) => setFormData({ ...formData, font_size: e.target.value })}
              placeholder="12"
              className="font-size-input"
            />
          </div>
          <div className="form-group">
            <label>Font</label>
            <select
              value={formData.font_family}
              onChange={(e) => setFormData({ ...formData, font_family: e.target.value })}
              className="font-family-select"
            >
              <option value="Arial">Arial</option>
              <option value="Georgia">Georgia</option>
              <option value="Times New Roman">Times New Roman</option>
              <option value="Verdana">Verdana</option>
              <option value="Helvetica">Helvetica</option>
              <option value="serif">Serif</option>
              <option value="sans-serif">Sans-serif</option>
              <option value="cursive">Cursive</option>
              <option value="monospace">Monospace</option>
            </select>
          </div>
        </div>

        <div className="form-row form-row-label-offset">
          <div className="form-group">
            <label title="Negative = left, positive = right">Label offset X (px)</label>
            <input
              type="number"
              step="0.5"
              value={formData.label_offset_x}
              onChange={(e) => setFormData({ ...formData, label_offset_x: e.target.value })}
              placeholder="0"
              className="label-offset-input"
            />
            <span className="form-hint">− left, + right</span>
          </div>
          <div className="form-group">
            <label title="Negative = up, positive = down">Label offset Y (px)</label>
            <input
              type="number"
              step="0.5"
              value={formData.label_offset_y}
              onChange={(e) => setFormData({ ...formData, label_offset_y: e.target.value })}
              placeholder="0"
              className="label-offset-input"
            />
            <span className="form-hint">− up, + down</span>
          </div>
          <div className="form-group">
            <label title="Extra rotation in degrees">Label rotation (deg)</label>
            <input
              type="number"
              step="1"
              value={formData.label_rotation}
              onChange={(e) => setFormData({ ...formData, label_rotation: e.target.value })}
              placeholder="0"
              className="label-offset-input"
            />
            <span className="form-hint">Per-person rotation</span>
          </div>
          <div className="form-group">
            <label title="Move label inward or outward on the arc">Arc offset (px)</label>
            <input
              type="number"
              step="1"
              value={formData.label_radius_offset}
              onChange={(e) => setFormData({ ...formData, label_radius_offset: e.target.value })}
              placeholder="0"
              className="label-offset-input"
            />
            <span className="form-hint">− inward, + outward</span>
          </div>
        </div>

        <button type="submit" className="btn-submit" id="member-form-submit">
          {editingId ? 'Update Member' : 'Add Member'}
        </button>
      </form>

      <div className="members-list">
        <h2>All Family Members ({members.length})</h2>
        <div className="members-table-container">
          <table className="members-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Birth Date</th>
                <th>Gender</th>
                <th>Parent</th>
                <th>Segment</th>
                <th>Font color</th>
                <th>Font size</th>
                <th>Font</th>
                <th>Label X</th>
                <th>Label Y</th>
                <th>Rotation</th>
                <th>Arc offset</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.length === 0 ? (
              <tr>
                <td colSpan="14" className="no-data">No family members found</td>
              </tr>
              ) : (
                members.map(member => (
                  <React.Fragment key={member.id}>
                    <tr className={inlineEditingId === member.id ? 'row-editing' : ''}>
                      <td>{member.id}</td>
                      <td>{member.last_name ? `${member.first_name} ${member.last_name}` : member.first_name}</td>
                      <td>{new Date(member.birth_date).toLocaleDateString()}</td>
                      <td>
                        <span className={`gender-badge gender-${member.gender}`}>
                          {member.gender}
                        </span>
                      </td>
                      <td>
                        {member.parent_id ? getMemberName(member.parent_id) : '—'}
                      </td>
                      <td>
                        <div className="color-display">
                          <div 
                            className="color-swatch" 
                            style={{ backgroundColor: member.color || '#4a90e2' }}
                            title={member.color || '#4a90e2'}
                          ></div>
                          <span className="color-code">{member.color || '—'}</span>
                        </div>
                      </td>
                      <td>
                        <div className="color-display">
                          <div 
                            className="color-swatch" 
                            style={{ backgroundColor: member.font_color || '#ffffff' }}
                            title={member.font_color || '#ffffff'}
                          ></div>
                          <span className="color-code">{member.font_color || '—'}</span>
                        </div>
                      </td>
                      <td>{member.font_size ?? '—'}</td>
                      <td>{member.font_family || '—'}</td>
                      <td>{member.label_offset_x != null ? member.label_offset_x : '—'}</td>
                      <td>{member.label_offset_y != null ? member.label_offset_y : '—'}</td>
                      <td>{member.label_rotation != null ? member.label_rotation : '—'}</td>
                      <td>{member.label_radius_offset != null ? member.label_radius_offset : '—'}</td>
                      <td>
                        <button
                          type="button"
                          className="btn-edit"
                          onClick={() => startInlineEdit(member)}
                          title="Edit in place"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn-delete"
                          onClick={() => handleDelete(member.id)}
                          disabled={inlineEditingId === member.id}
                          title={inlineEditingId === member.id ? 'Save or cancel first' : 'Delete'}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                    {inlineEditingId === member.id && (
                      <tr className="inline-edit-row">
                        <td colSpan="14">
                          <form className="inline-edit-form" onSubmit={handleInlineSave}>
                            <div className="inline-edit-grid">
                              <div className="inline-edit-group">
                                <label>First name</label>
                                <input
                                  type="text"
                                  value={inlineFormData.first_name ?? ''}
                                  onChange={(e) => setInlineFormData({ ...inlineFormData, first_name: e.target.value })}
                                  required
                                />
                              </div>
                              <div className="inline-edit-group">
                                <label>Birth date</label>
                                <input
                                  type="date"
                                  value={inlineFormData.birth_date ?? ''}
                                  onChange={(e) => setInlineFormData({ ...inlineFormData, birth_date: e.target.value })}
                                  required
                                />
                              </div>
                              <div className="inline-edit-group">
                                <label>Gender</label>
                                <select
                                  value={inlineFormData.gender ?? 'male'}
                                  onChange={(e) => setInlineFormData({ ...inlineFormData, gender: e.target.value })}
                                >
                                  <option value="male">Male</option>
                                  <option value="female">Female</option>
                                  <option value="other">Other</option>
                                </select>
                              </div>
                              <div className="inline-edit-group">
                                <label>Parent</label>
                                <select
                                  value={inlineFormData.parent_id ?? 'none'}
                                  onChange={(e) => setInlineFormData({ ...inlineFormData, parent_id: e.target.value === 'none' ? '' : e.target.value })}
                                >
                                  <option value="none">None (Root)</option>
                                  {members
                                    .filter(m => m.id !== inlineEditingId)
                                    .map(m => (
                                      <option key={m.id} value={m.id}>
                                        {m.last_name ? `${m.first_name} ${m.last_name}` : m.first_name}
                                      </option>
                                    ))}
                                </select>
                              </div>
                              <div className="inline-edit-group">
                                <label>Segment color</label>
                                <div className="color-picker-container">
                                  <input
                                    type="color"
                                    value={inlineFormData.color ?? '#4a90e2'}
                                    onChange={(e) => setInlineFormData({ ...inlineFormData, color: e.target.value })}
                                    className="color-picker"
                                  />
                                  <input
                                    type="text"
                                    value={inlineFormData.color ?? ''}
                                    onChange={(e) => setInlineFormData({ ...inlineFormData, color: e.target.value })}
                                    className="color-input"
                                  />
                                </div>
                              </div>
                              <div className="inline-edit-group">
                                <label>Font color</label>
                                <div className="color-picker-container">
                                  <input
                                    type="color"
                                    value={inlineFormData.font_color ?? '#ffffff'}
                                    onChange={(e) => setInlineFormData({ ...inlineFormData, font_color: e.target.value })}
                                    className="color-picker"
                                  />
                                  <input
                                    type="text"
                                    value={inlineFormData.font_color ?? ''}
                                    onChange={(e) => setInlineFormData({ ...inlineFormData, font_color: e.target.value })}
                                    className="color-input"
                                  />
                                </div>
                              </div>
                              <div className="inline-edit-group">
                                <label>Font size</label>
                                <input
                                  type="number"
                                  min="8"
                                  max="32"
                                  value={inlineFormData.font_size ?? ''}
                                  onChange={(e) => setInlineFormData({ ...inlineFormData, font_size: e.target.value })}
                                  placeholder="12"
                                />
                              </div>
                              <div className="inline-edit-group">
                                <label>Font</label>
                                <select
                                  value={inlineFormData.font_family ?? 'Arial'}
                                  onChange={(e) => setInlineFormData({ ...inlineFormData, font_family: e.target.value })}
                                >
                                  <option value="Arial">Arial</option>
                                  <option value="Georgia">Georgia</option>
                                  <option value="Times New Roman">Times New Roman</option>
                                  <option value="Verdana">Verdana</option>
                                  <option value="Helvetica">Helvetica</option>
                                  <option value="serif">Serif</option>
                                  <option value="sans-serif">Sans-serif</option>
                                  <option value="cursive">Cursive</option>
                                  <option value="monospace">Monospace</option>
                                </select>
                              </div>
                              <div className="inline-edit-group">
                                <label>Label offset X (px)</label>
                                <input
                                  type="number"
                                  step="0.5"
                                  value={inlineFormData.label_offset_x ?? ''}
                                  onChange={(e) => setInlineFormData({ ...inlineFormData, label_offset_x: e.target.value })}
                                  placeholder="0"
                                />
                              </div>
                              <div className="inline-edit-group">
                                <label>Label offset Y (px)</label>
                                <input
                                  type="number"
                                  step="0.5"
                                  value={inlineFormData.label_offset_y ?? ''}
                                  onChange={(e) => setInlineFormData({ ...inlineFormData, label_offset_y: e.target.value })}
                                  placeholder="0"
                                />
                              </div>
                              <div className="inline-edit-group">
                                <label>Label rotation (deg)</label>
                                <input
                                  type="number"
                                  step="1"
                                  value={inlineFormData.label_rotation ?? ''}
                                  onChange={(e) => setInlineFormData({ ...inlineFormData, label_rotation: e.target.value })}
                                  placeholder="0"
                                />
                              </div>
                              <div className="inline-edit-group">
                                <label>Arc offset (px)</label>
                                <input
                                  type="number"
                                  step="1"
                                  value={inlineFormData.label_radius_offset ?? ''}
                                  onChange={(e) => setInlineFormData({ ...inlineFormData, label_radius_offset: e.target.value })}
                                  placeholder="0"
                                />
                              </div>
                            </div>
                            <div className="inline-edit-actions">
                              <button type="submit" className="btn-submit">Save</button>
                              <button type="button" className="btn-cancel" onClick={cancelInlineEdit}>Cancel</button>
                            </div>
                          </form>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FamilyMembers;
