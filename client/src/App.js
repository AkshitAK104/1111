import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_BASE = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5000';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [leads, setLeads] = useState([]);
  const [orders, setOrders] = useState([]);
  const [dashboardData, setDashboardData] = useState({ leads: {}, orders: {} });
  const [loading, setLoading] = useState(false);

  // Lead form state
  const [leadForm, setLeadForm] = useState({
    name: '', contact: '', company: '', product_interest: '', 
    stage: 'New', follow_up_date: '', notes: ''
  });

  // Order form state
  const [orderForm, setOrderForm] = useState({
    lead_id: '', status: 'Order Received', dispatch_date: '', 
    courier: '', tracking_number: ''
  });

  const leadStages = ['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Won', 'Lost'];
  const orderStatuses = ['Order Received', 'In Development', 'Ready to Dispatch', 'Dispatched'];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [leadsRes, ordersRes, dashRes] = await Promise.all([
        axios.get(`${API_BASE}/api/leads`),
        axios.get(`${API_BASE}/api/orders`),
        axios.get(`${API_BASE}/api/dashboard`)
      ]);
      setLeads(leadsRes.data);
      setOrders(ordersRes.data);
      setDashboardData(dashRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setLoading(false);
  };

  const handleLeadSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/api/leads`, leadForm);
      setLeadForm({
        name: '', contact: '', company: '', product_interest: '', 
        stage: 'New', follow_up_date: '', notes: ''
      });
      fetchData();
      alert('Lead added successfully!');
    } catch (error) {
      console.error('Error adding lead:', error);
      alert('Error adding lead');
    }
  };

  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/api/orders`, orderForm);
      setOrderForm({
        lead_id: '', status: 'Order Received', dispatch_date: '', 
        courier: '', tracking_number: ''
      });
      fetchData();
      alert('Order created successfully!');
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Error creating order');
    }
  };

  const updateLeadStage = async (leadId, newStage) => {
    try {
      const lead = leads.find(l => l.id === leadId);
      await axios.put(`${API_BASE}/api/leads/${leadId}`, { ...lead, stage: newStage });
      fetchData();
    } catch (error) {
      console.error('Error updating lead:', error);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const order = orders.find(o => o.id === orderId);
      await axios.put(`${API_BASE}/api/orders/${orderId}`, { ...order, status: newStatus });
      fetchData();
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="app">
      <header className="header">
        <h1>TrackFlow CRM</h1>
        <nav className="nav">
          <button 
            className={activeTab === 'dashboard' ? 'active' : ''} 
            onClick={() => setActiveTab('dashboard')}
          >
            Dashboard
          </button>
          <button 
            className={activeTab === 'leads' ? 'active' : ''} 
            onClick={() => setActiveTab('leads')}
          >
            Leads
          </button>
          <button 
            className={activeTab === 'orders' ? 'active' : ''} 
            onClick={() => setActiveTab('orders')}
          >
            Orders
          </button>
        </nav>
      </header>

      <main className="main">
        {activeTab === 'dashboard' && (
          <div className="dashboard">
            <h2>Dashboard</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Leads</h3>
                <p>Total: {dashboardData.leads.total_leads || 0}</p>
                <p>New: {dashboardData.leads.new_leads || 0}</p>
                <p>Qualified: {dashboardData.leads.qualified_leads || 0}</p>
                <p>Won: {dashboardData.leads.won_leads || 0}</p>
                <p className="overdue">Overdue Follow-ups: {dashboardData.leads.overdue_followups || 0}</p>
              </div>
              <div className="stat-card">
                <h3>Orders</h3>
                <p>Total: {dashboardData.orders.total_orders || 0}</p>
                <p>Received: {dashboardData.orders.received_orders || 0}</p>
                <p>In Development: {dashboardData.orders.in_development || 0}</p>
                <p>Ready to Dispatch: {dashboardData.orders.ready_to_dispatch || 0}</p>
                <p>Dispatched: {dashboardData.orders.dispatched_orders || 0}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'leads' && (
          <div className="leads">
            <h2>Lead Management</h2>
            
            <div className="form-section">
              <h3>Add New Lead</h3>
              <form onSubmit={handleLeadSubmit} className="lead-form">
                <div className="form-row">
                  <input
                    type="text"
                    placeholder="Name"
                    value={leadForm.name}
                    onChange={(e) => setLeadForm({...leadForm, name: e.target.value})}
                    required
                  />
                  <input
                    type="text"
                    placeholder="Contact"
                    value={leadForm.contact}
                    onChange={(e) => setLeadForm({...leadForm, contact: e.target.value})}
                  />
                  <input
                    type="text"
                    placeholder="Company"
                    value={leadForm.company}
                    onChange={(e) => setLeadForm({...leadForm, company: e.target.value})}
                  />
                </div>
                <div className="form-row">
                  <input
                    type="text"
                    placeholder="Product Interest"
                    value={leadForm.product_interest}
                    onChange={(e) => setLeadForm({...leadForm, product_interest: e.target.value})}
                  />
                  <select
                    value={leadForm.stage}
                    onChange={(e) => setLeadForm({...leadForm, stage: e.target.value})}
                  >
                    {leadStages.map(stage => (
                      <option key={stage} value={stage}>{stage}</option>
                    ))}
                  </select>
                  <input
                    type="date"
                    value={leadForm.follow_up_date}
                    onChange={(e) => setLeadForm({...leadForm, follow_up_date: e.target.value})}
                  />
                </div>
                <textarea
                  placeholder="Notes"
                  value={leadForm.notes}
                  onChange={(e) => setLeadForm({...leadForm, notes: e.target.value})}
                />
                <button type="submit">Add Lead</button>
              </form>
            </div>

            <div className="leads-kanban">
              {leadStages.map(stage => (
                <div key={stage} className="kanban-column">
                  <h4>{stage}</h4>
                  {leads.filter(lead => lead.stage === stage).map(lead => (
                    <div key={lead.id} className="lead-card">
                      <h5>{lead.name}</h5>
                      <p>{lead.company}</p>
                      <p>{lead.contact}</p>
                      <p>{lead.product_interest}</p>
                      {lead.follow_up_date && (
                        <p className="follow-up">Follow-up: {new Date(lead.follow_up_date).toLocaleDateString()}</p>
                      )}
                      <select
                        value={lead.stage}
                        onChange={(e) => updateLeadStage(lead.id, e.target.value)}
                      >
                        {leadStages.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="orders">
            <h2>Order Management</h2>
            
            <div className="form-section">
              <h3>Create New Order</h3>
              <form onSubmit={handleOrderSubmit} className="order-form">
                <div className="form-row">
                  <select
                    value={orderForm.lead_id}
                    onChange={(e) => setOrderForm({...orderForm, lead_id: e.target.value})}
                    required
                  >
                    <option value="">Select Lead</option>
                    {leads.filter(lead => lead.stage === 'Won').map(lead => (
                      <option key={lead.id} value={lead.id}>
                        {lead.name} - {lead.company}
                      </option>
                    ))}
                  </select>
                  <select
                    value={orderForm.status}
                    onChange={(e) => setOrderForm({...orderForm, status: e.target.value})}
                  >
                    {orderStatuses.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
                <button type="submit">Create Order</button>
              </form>
            </div>

            <div className="orders-list">
              {orderStatuses.map(status => (
                <div key={status} className="status-section">
                  <h4>{status}</h4>
                  {orders.filter(order => order.status === status).map(order => (
                    <div key={order.id} className="order-card">
                      <h5>Order #{order.id}</h5>
                      <p>Lead: {order.lead_name} ({order.company})</p>
                      <p>Created: {new Date(order.created_at).toLocaleDateString()}</p>
                      {order.dispatch_date && <p>Dispatch Date: {new Date(order.dispatch_date).toLocaleDateString()}</p>}
                      {order.courier && <p>Courier: {order.courier}</p>}
                      {order.tracking_number && <p>Tracking: {order.tracking_number}</p>}
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                      >
                        {orderStatuses.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;