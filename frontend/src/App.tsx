import React, { useState, useEffect } from 'react';

interface Customer {
  id: number;
  companyName: string;
  taxId: string;
  email: string;
  country: string;
  plan: string;
}

interface Simulation {
  id?: number;
  customerId: number;
  activeUsers: number;
  baseCost: number;
  totalCost: number;
}

export default function App() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [search, setSearch] = useState('');
  
  // Divisas y tipos de cambio
  const [currency, setCurrency] = useState('EUR');
  const [rates, setRates] = useState<{ [key: string]: number }>({ EUR: 1, USD: 1.08, GBP: 0.85 });
  
  // Formulario nuevo cliente
  const [newCompany, setNewCompany] = useState('');
  const [newTaxId, setNewTaxId] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newCountry, setNewCountry] = useState('España');
  const [newPlan, setNewPlan] = useState('Pro');
  const [errorMsg, setErrorMsg] = useState('');

  // Simulación interactiva (Slider)
  const [users, setUsers] = useState(15);
  const [storage, setStorage] = useState(100);
  const [apiCalls, setApiCalls] = useState(50000);
  const [simHistory, setSimHistory] = useState<Simulation[]>([]);

  // 1. Obtener divisas en tiempo real desde la API externa
  useEffect(() => {
    fetch('https://open.er-api.com/v6/latest/EUR')
      .then(res => res.json())
      .then(data => {
        if (data && data.rates) setRates(data.rates);
      })
      .catch(err => console.error("Error cargando divisas", err));
  }, []);

  // Conversor de moneda
  const formatPrice = (amountInEur: number) => {
    const rate = rates[currency] || 1;
    return (amountInEur * rate).toFixed(2) + ' ' + currency;
  };

  // 2. Registrar Cliente (Conecta con POST /customers)
  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      const response = await fetch('http://localhost:3000/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: newCompany,
          taxId: newTaxId,
          email: newEmail,
          country: newCountry,
          plan: newPlan
        })
      });
      const data = await response.json();
      if (!response.ok) {
        setErrorMsg(data.error || 'Error al crear cliente');
      } else {
        setCustomers([...customers, data]);
        setSelectedCustomer(data);
        setNewCompany(''); setNewTaxId(''); setNewEmail('');
      }
    } catch (err) {
      setErrorMsg('No se pudo conectar con el servidor backend. ¿Está encendido?');
    }
  };

  // 3. Algoritmo de tarificación visual en tiempo real
  const calculateLiveCost = (numUsers: number, country: string) => {
    let base = 0;
    if (numUsers <= 10) base = numUsers * 10;
    else if (numUsers <= 50) base = (10 * 10) + ((numUsers - 10) * 8);
    else base = (10 * 10) + (40 * 8) + ((numUsers - 50) * 5);

    const taxRate = (country.toLowerCase() === 'españa' || country.toLowerCase() === 'spain') ? 0.21 : 0;
    return { base, total: base + (base * taxRate) };
  };

  const liveCalc = selectedCustomer 
    ? calculateLiveCost(users, selectedCustomer.country) 
    : { base: 0, total: 0 };

  // 4. Guardar simulación (Conecta con POST /simulations)
  const handleSaveSimulation = async () => {
    if (!selectedCustomer) return;
    try {
      const res = await fetch('http://localhost:3000/simulations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: selectedCustomer.id,
          activeUsers: users,
          storage,
          apiCalls,
          country: selectedCustomer.country
        })
      });
      const data = await res.json();
      if (res.ok) {
        setSimHistory([data, ...simHistory]);
      }
    } catch (err) {
      console.error('Error al guardar simulación', err);
    }
  };

  const filteredCustomers = customers.filter(c => 
    c.companyName.toLowerCase().includes(search.toLowerCase()) || 
    c.taxId.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>
        <h1>SaaS-O-Matic 🚀</h1>
        <div>
          <label style={{ marginRight: '10px', fontWeight: 'bold' }}>Divisa:</label>
          <select value={currency} onChange={e => setCurrency(e.target.value)} style={{ padding: '8px', fontSize: '16px' }}>
            <option value="EUR">EUR (€)</option>
            <option value="USD">USD ($)</option>
            <option value="GBP">GBP (£)</option>
          </select>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px', marginTop: '20px' }}>
        
        {/* COLUMNA IZQUIERDA: Registro y Buscador */}
        <div>
          <div style={{ background: '#f9f9f9', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
            <h3>Registrar Empresa</h3>
            {errorMsg && <p style={{ color: 'red', fontSize: '14px' }}>{errorMsg}</p>}
            <form onSubmit={handleCreateCustomer} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <input placeholder="Nombre de Empresa" required value={newCompany} onChange={e => setNewCompany(e.target.value)} style={{ padding: '8px' }} />
              <input placeholder="DNI/CIF/NIF (Ej: B12345678)" required value={newTaxId} onChange={e => setNewTaxId(e.target.value)} style={{ padding: '8px' }} />
              <input placeholder="Email" type="email" required value={newEmail} onChange={e => setNewEmail(e.target.value)} style={{ padding: '8px' }} />
              <select value={newCountry} onChange={e => setNewCountry(e.target.value)} style={{ padding: '8px' }}>
                <option value="España">España (+21% IVA)</option>
                <option value="México">México (0% IVA exterior)</option>
                <option value="USA">USA (0% IVA exterior)</option>
              </select>
              <button type="submit" style={{ padding: '10px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Crear Cliente</button>
            </form>
          </div>

          <div>
            <h3>Buscador de Clientes</h3>
            <input 
              placeholder="Buscar por nombre o CIF..." 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box', marginBottom: '10px' }}
            />
            {filteredCustomers.map(c => (
              <div 
                key={c.id} 
                onClick={() => setSelectedCustomer(c)}
                style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '4px', marginBottom: '5px', cursor: 'pointer', background: selectedCustomer?.id === c.id ? '#e6f2ff' : 'white' }}
              >
                <strong>{c.companyName}</strong> ({c.taxId})
                <br /><small>{c.country} - Plan {c.plan}</small>
              </div>
            ))}
          </div>
        </div>

        {/* COLUMNA DERECHA: Simulación y Tarjetas */}
        <div>
          {selectedCustomer ? (
            <div style={{ background: '#fff', border: '1px solid #ccc', padding: '20px', borderRadius: '8px' }}>
              <h2>Simulador para: {selectedCustomer.companyName}</h2>
              <p><strong>Identificador:</strong> {selectedCustomer.taxId} | <strong>País:</strong> {selectedCustomer.country}</p>
              
              <hr style={{ margin: '20px 0' }} />

              {/* SLIDER DE USUARIOS */}
              <div style={{ margin: '20px 0', background: '#f5f5f5', padding: '15px', borderRadius: '8px' }}>
                <label style={{ fontSize: '18px', fontWeight: 'bold' }}>
                  Usuarios Activos: {users}
                </label>
                <input 
                  type="range" min="1" max="150" value={users} 
                  onChange={e => setUsers(parseInt(e.target.value))} 
                  style={{ width: '100%', margin: '15px 0' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#666' }}>
                  <span>Tramo 1 (0-10): 10€</span>
                  <span>Tramo 2 (11-50): 8€</span>
                  <span>Tramo 3 (&gt;50): 5€</span>
                </div>

                <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ margin: 5 }}>Coste Base: <strong>{formatPrice(liveCalc.base)}</strong></p>
                    <h3 style={{ margin: 5, color: '#007bff', fontSize: '24px' }}>
                      Total (con impuestos): {formatPrice(liveCalc.total)}
                    </h3>
                  </div>
                  <button 
                    onClick={handleSaveSimulation}
                    style={{ padding: '12px 20px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}
                  >
                    Guardar Simulación
                  </button>
                </div>
              </div>

              {/* HISTORIAL */}
              <h3>Historial de Simulaciones Guardadas</h3>
              {simHistory.length === 0 ? <p style={{ color: '#888' }}>No hay simulaciones guardadas aún.</p> : null}
              <ul>
                {simHistory.map((sim, index) => (
                  <li key={index} style={{ marginBottom: '8px' }}>
                    <strong>{sim.activeUsers} usuarios</strong> -&gt; Total: {formatPrice(sim.totalCost)} (Base: {formatPrice(sim.baseCost)})
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '50px', background: '#f9f9f9', borderRadius: '8px', color: '#666' }}>
              <h3>👈 Selecciona o crea un cliente en el panel izquierdo para empezar a simular costes.</h3>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}