import React, { useState } from 'react';
import { Truck, Car } from 'lucide-react';
import Deliverymen from './Deliverymen';
import Drivers from './Drivers';

const Fleet = () => {
  const [tab, setTab] = useState('deliverymen');

  return (
    <div>
      <div className="om-tabs">
        <button
          type="button"
          className={`om-tab ${tab === 'deliverymen' ? 'active' : ''}`}
          onClick={() => setTab('deliverymen')}
        >
          <Truck size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />
          Entregadores
        </button>
        <button
          type="button"
          className={`om-tab ${tab === 'drivers' ? 'active' : ''}`}
          onClick={() => setTab('drivers')}
        >
          <Car size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />
          Motoristas (Corridas)
        </button>
      </div>

      {tab === 'deliverymen' ? <Deliverymen /> : <Drivers />}
    </div>
  );
};

export default Fleet;