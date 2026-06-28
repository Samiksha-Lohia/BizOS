import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Package, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Loader2,
  X,
  PlusSquare,
  MinusSquare,
  Warehouse
} from 'lucide-react';

const Inventory = () => {
  const { user, authFetch } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLowStock, setFilterLowStock] = useState(false);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);

  const [currentProduct, setCurrentProduct] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    category: 'Raw Materials',
    unit: 'Pcs',
    purchasePrice: '',
    sellingPrice: '',
    stockQuantity: '0',
    minStockLevel: '5',
    barcode: '',
    warehouse: 'Main Store'
  });

  const [stockAdjustment, setStockAdjustment] = useState({
    quantity: '1',
    type: 'in' // 'in' or 'out'
  });

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const url = `/products?search=${searchQuery}${filterLowStock ? '&lowStock=true' : ''}`;
      const res = await authFetch(url);
      const result = await res.json();
      if (result.success) {
        setProducts(result.data);
      } else {
        setError(result.message || 'Could not load products');
      }
    } catch (err) {
      setError('Connection to backend API failed.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [searchQuery, filterLowStock]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleStockAdjustChange = (e) => {
    setStockAdjustment({
      ...stockAdjustment,
      [e.target.name]: e.target.value
    });
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await authFetch('/products', {
        method: 'POST',
        body: JSON.stringify({
          ...formData,
          purchasePrice: Number(formData.purchasePrice),
          sellingPrice: Number(formData.sellingPrice),
          stockQuantity: Number(formData.stockQuantity),
          minStockLevel: Number(formData.minStockLevel)
        })
      });
      const result = await response.json();
      if (result.success) {
        setSuccess('Product created successfully!');
        setIsAddModalOpen(false);
        fetchProducts();
        setFormData({
          name: '',
          category: 'Raw Materials',
          unit: 'Pcs',
          purchasePrice: '',
          sellingPrice: '',
          stockQuantity: '0',
          minStockLevel: '5',
          barcode: '',
          warehouse: 'Main Store'
        });
      } else {
        setError(result.message || 'Validation failed');
      }
    } catch (err) {
      setError('Failed to create product.');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await authFetch(`/products/${currentProduct._id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: formData.name,
          category: formData.category,
          unit: formData.unit,
          purchasePrice: Number(formData.purchasePrice),
          sellingPrice: Number(formData.sellingPrice),
          minStockLevel: Number(formData.minStockLevel),
          barcode: formData.barcode,
          warehouse: formData.warehouse
        })
      });
      const result = await response.json();
      if (result.success) {
        setSuccess('Product updated successfully!');
        setIsEditModalOpen(false);
        fetchProducts();
      } else {
        setError(result.message || 'Update failed');
      }
    } catch (err) {
      setError('Failed to update product.');
    }
  };

  const handleStockAdjustSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await authFetch(`1/products/${currentProduct._id}/stock`, {
        method: 'POST',
        body: JSON.stringify({
          quantity: Number(stockAdjustment.quantity),
          type: stockAdjustment.type
        })
      });
      const result = await response.json();
      if (result.success) {
        setSuccess('Stock adjusted successfully!');
        setIsStockModalOpen(false);
        fetchProducts();
      } else {
        setError(result.message || 'Adjustment failed');
      }
    } catch (err) {
      setError('Failed to adjust stock.');
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    setError('');
    setSuccess('');

    try {
      const response = await authFetch(`/products/${productId}`, {
        method: 'DELETE'
      });
      const result = await response.json();
      if (result.success) {
        setSuccess('Product deleted successfully');
        fetchProducts();
      } else {
        setError(result.message || 'Delete failed');
      }
    } catch (err) {
      setError('Failed to delete product.');
    }
  };

  const openAddModal = () => {
    setFormData({
      name: '',
      category: 'Raw Materials',
      unit: 'Pcs',
      purchasePrice: '',
      sellingPrice: '',
      stockQuantity: '0',
      minStockLevel: '5',
      barcode: '',
      warehouse: 'Main Store'
    });
    setIsAddModalOpen(true);
  };

  const openEditModal = (product) => {
    setCurrentProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      unit: product.unit,
      purchasePrice: product.purchasePrice.toString(),
      sellingPrice: product.sellingPrice.toString(),
      stockQuantity: product.stockQuantity.toString(),
      minStockLevel: product.minStockLevel.toString(),
      barcode: product.barcode || '',
      warehouse: product.warehouse || 'Main Store'
    });
    setIsEditModalOpen(true);
  };

  const openStockModal = (product) => {
    setCurrentProduct(product);
    setStockAdjustment({ quantity: '1', type: 'in' });
    setIsStockModalOpen(true);
  };

  const isRoleAllowed = (roles) => {
    return user && roles.includes(user.role);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Alert overlays */}
      {error && <div className="error-message"><AlertTriangle size={16} /> {error}</div>}
      {success && <div className="success-message"><AlertTriangle size={16} /> {success}</div>}

      {/* Action Row */}
      <div className="page-actions-row">
        <div className="search-box">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Search inventory..."
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <label className="checkbox-label" style={{ marginRight: '12px' }}>
            <input
              type="checkbox"
              className="checkbox-input"
              checked={filterLowStock}
              onChange={(e) => setFilterLowStock(e.target.checked)}
            />
            Show Low Stock Alerts
          </label>
          
          {isRoleAllowed(['Admin', 'Manager', 'Staff']) && (
            <button className="btn btn-primary" onClick={openAddModal}>
              <Plus size={16} />
              <span>Add Product</span>
            </button>
          )}
        </div>
      </div>

      {/* Grid view / Inventory Table */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
          <Loader2 className="spinner-icon" size={32} />
        </div>
      ) : products.length === 0 ? (
        <div className="glass-panel" style={{ padding: '60px 24px', textAlign: 'center' }}>
          <Package size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px', opacity: 0.5 }} />
          <p style={{ color: 'var(--text-secondary)' }}>No items found in stock.</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="styled-table">
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Category</th>
                <th>Selling Price</th>
                <th>Purchase Cost</th>
                <th>Stock Level</th>
                <th>Location</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((prod) => {
                const isLow = prod.stockQuantity <= prod.minStockLevel;
                return (
                  <tr key={prod._id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{prod.name}</div>
                      {prod.barcode && <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Barcode: {prod.barcode}</span>}
                    </td>
                    <td>{prod.category}</td>
                    <td style={{ fontWeight: 700 }}>₹{prod.sellingPrice}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>₹{prod.purchasePrice}</td>
                    <td>
                      <span className={`status-pill ${isLow ? 'danger' : 'success'}`}>
                        {prod.stockQuantity} {prod.unit} {isLow && '(Low)'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px' }}>
                        <Warehouse size={12} className="sidebar-icon" />
                        {prod.warehouse || 'Main Store'}
                      </div>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button className="action-btn" title="Adjust Stock" onClick={() => openStockModal(prod)}>
                          <PlusSquare size={16} />
                        </button>
                        {isRoleAllowed(['Admin', 'Manager']) && (
                          <button className="action-btn" title="Edit Product" onClick={() => openEditModal(prod)}>
                            <Edit size={16} />
                          </button>
                        )}
                        {isRoleAllowed(['Admin']) && (
                          <button className="action-btn delete" title="Delete Product" onClick={() => handleDeleteProduct(prod._id)}>
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* --- ADD PRODUCT MODAL --- */}
      {isAddModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-container glass-panel">
            <div className="modal-header">
              <h3 className="modal-title">Create New Inventory Item</h3>
              <button className="modal-close-btn" onClick={() => setIsAddModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleAddSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label" htmlFor="add-name">Product Name *</label>
                  <input id="add-name" type="text" name="name" className="form-input" placeholder="e.g. Steel Pipe" style={{ paddingLeft: '16px' }} value={formData.name} onChange={handleInputChange} required />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label" htmlFor="add-category">Category *</label>
                    <select id="add-category" name="category" className="form-input" style={{ paddingLeft: '16px' }} value={formData.category} onChange={handleInputChange}>
                      <option value="Raw Materials">Raw Materials</option>
                      <option value="Salaries">Salaries</option>
                      <option value="Utilities">Utilities</option>
                      <option value="Rent">Rent</option>
                      <option value="Transport">Transport</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Electronics">Electronics</option>
                      <option value="Misc">Misc</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="add-unit">Unit *</label>
                    <input id="add-unit" type="text" name="unit" className="form-input" placeholder="Pcs, Kg, Box" style={{ paddingLeft: '16px' }} value={formData.unit} onChange={handleInputChange} required />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label" htmlFor="add-purchasePrice">Purchase Cost (₹) *</label>
                    <input id="add-purchasePrice" type="number" name="purchasePrice" min="0" className="form-input" style={{ paddingLeft: '16px' }} value={formData.purchasePrice} onChange={handleInputChange} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="add-sellingPrice">Selling Price (₹) *</label>
                    <input id="add-sellingPrice" type="number" name="sellingPrice" min="0" className="form-input" style={{ paddingLeft: '16px' }} value={formData.sellingPrice} onChange={handleInputChange} required />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label" htmlFor="add-stockQuantity">Initial Stock *</label>
                    <input id="add-stockQuantity" type="number" name="stockQuantity" min="0" className="form-input" style={{ paddingLeft: '16px' }} value={formData.stockQuantity} onChange={handleInputChange} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="add-minStockLevel">Min Threshold (Low Stock Alert) *</label>
                    <input id="add-minStockLevel" type="number" name="minStockLevel" min="0" className="form-input" style={{ paddingLeft: '16px' }} value={formData.minStockLevel} onChange={handleInputChange} required />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label" htmlFor="add-barcode">Barcode / SKU</label>
                    <input id="add-barcode" type="text" name="barcode" className="form-input" placeholder="Optional" style={{ paddingLeft: '16px' }} value={formData.barcode} onChange={handleInputChange} />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="add-warehouse">Warehouse Location</label>
                    <input id="add-warehouse" type="text" name="warehouse" className="form-input" style={{ paddingLeft: '16px' }} value={formData.warehouse} onChange={handleInputChange} />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setIsAddModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Item</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- EDIT PRODUCT MODAL --- */}
      {isEditModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-container glass-panel">
            <div className="modal-header">
              <h3 className="modal-title">Edit Inventory Item</h3>
              <button className="modal-close-btn" onClick={() => setIsEditModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleEditSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label" htmlFor="edit-name">Product Name *</label>
                  <input id="edit-name" type="text" name="name" className="form-input" style={{ paddingLeft: '16px' }} value={formData.name} onChange={handleInputChange} required />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label" htmlFor="edit-category">Category *</label>
                    <select id="edit-category" name="category" className="form-input" style={{ paddingLeft: '16px' }} value={formData.category} onChange={handleInputChange}>
                      <option value="Raw Materials">Raw Materials</option>
                      <option value="Salaries">Salaries</option>
                      <option value="Utilities">Utilities</option>
                      <option value="Rent">Rent</option>
                      <option value="Transport">Transport</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Electronics">Electronics</option>
                      <option value="Misc">Misc</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="edit-unit">Unit *</label>
                    <input id="edit-unit" type="text" name="unit" className="form-input" style={{ paddingLeft: '16px' }} value={formData.unit} onChange={handleInputChange} required />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label" htmlFor="edit-purchasePrice">Purchase Cost (₹) *</label>
                    <input id="edit-purchasePrice" type="number" name="purchasePrice" min="0" className="form-input" style={{ paddingLeft: '16px' }} value={formData.purchasePrice} onChange={handleInputChange} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="edit-sellingPrice">Selling Price (₹) *</label>
                    <input id="edit-sellingPrice" type="number" name="sellingPrice" min="0" className="form-input" style={{ paddingLeft: '16px' }} value={formData.sellingPrice} onChange={handleInputChange} required />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label" htmlFor="edit-minStockLevel">Min Threshold *</label>
                    <input id="edit-minStockLevel" type="number" name="minStockLevel" min="0" className="form-input" style={{ paddingLeft: '16px' }} value={formData.minStockLevel} onChange={handleInputChange} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="edit-warehouse">Warehouse Location</label>
                    <input id="edit-warehouse" type="text" name="warehouse" className="form-input" style={{ paddingLeft: '16px' }} value={formData.warehouse} onChange={handleInputChange} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="edit-barcode">Barcode / SKU</label>
                  <input id="edit-barcode" type="text" name="barcode" className="form-input" style={{ paddingLeft: '16px' }} value={formData.barcode} onChange={handleInputChange} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setIsEditModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Update Item</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- STOCK ADJUSTMENT MODAL --- */}
      {isStockModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-container glass-panel" style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Adjust Stock Level</h3>
              <button className="modal-close-btn" onClick={() => setIsStockModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleStockAdjustSubmit}>
              <div className="modal-body">
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', padding: '12px', background: 'var(--primary-light)', borderRadius: 'var(--radius-sm)' }}>
                  <Package size={20} color="var(--primary)" />
                  <div>
                    <strong style={{ fontSize: '14px', display: 'block' }}>{currentProduct?.name}</strong>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Current stock quantity: <strong>{currentProduct?.stockQuantity} {currentProduct?.unit}</strong></span>
                  </div>
                </div>

                <div className="form-group" style={{ marginTop: '8px' }}>
                  <label className="form-label">Adjustment Type</label>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <label className="checkbox-label">
                      <input
                        type="radio"
                        name="type"
                        value="in"
                        checked={stockAdjustment.type === 'in'}
                        onChange={handleStockAdjustChange}
                        style={{ accentColor: 'var(--primary)' }}
                      />
                      Add Stock (+)
                    </label>
                    <label className="checkbox-label">
                      <input
                        type="radio"
                        name="type"
                        value="out"
                        checked={stockAdjustment.type === 'out'}
                        onChange={handleStockAdjustChange}
                        style={{ accentColor: 'var(--accent-red)' }}
                      />
                      Remove Stock (-)
                    </label>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="stock-quantity">Adjustment Quantity ({currentProduct?.unit}) *</label>
                  <input
                    id="stock-quantity"
                    type="number"
                    name="quantity"
                    min="1"
                    className="form-input"
                    style={{ paddingLeft: '16px' }}
                    value={stockAdjustment.quantity}
                    onChange={handleStockAdjustChange}
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setIsStockModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ backgroundColor: stockAdjustment.type === 'out' ? 'var(--accent-red)' : 'var(--primary)' }}>
                  Confirm Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
