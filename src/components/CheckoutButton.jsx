import React, { useState } from 'react';

// Use the same API URL logic as your Dashboard
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const CheckoutButton = () => {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    const token = localStorage.getItem('authToken'); // Matches your Dashboard key

    try {
      const response = await fetch(`${API_URL}/api/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url; // Redirect to Stripe
      } else {
        alert('Could not connect to payment server.');
      }
    } catch (error) {
      console.error(error);
      alert('Payment Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleCheckout} 
      disabled={loading}
      style={{
        width: '100%',
        padding: '12px',
        background: '#FFD700',
        color: 'black',
        border: 'none',
        borderRadius: '8px',
        fontWeight: 'bold',
        cursor: 'pointer',
        marginTop: '15px',
        opacity: loading ? 0.7 : 1
      }}
    >
      {loading ? 'Processing...' : '💳 Subscribe Now'}
    </button>
  );
};

export default CheckoutButton;