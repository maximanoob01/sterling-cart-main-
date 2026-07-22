import { useCallback, useState } from 'react';
import api from '../../../services/api';

/**
 * useOrderTracking
 * ─────────────────────────────────────────────────────────────
 * Looks up an order by Order ID (no email/phone required).
 * If the order was pushed to ShipRocket, awbCode and trackingUrl
 * are surfaced so the customer can follow the live courier tracker.
 */
export function useOrderTracking() {
  const [order, setOrder]    = useState(null);
  const [error, setError]    = useState('');
  const [isLoading, setLoad] = useState(false);

  const reset = useCallback(() => {
    setOrder(null);
    setError('');
  }, []);

  const track = useCallback(async (rawOrderId) => {
    const cleanOrderId = String(rawOrderId || '').trim().replace(/^#/, '');

    if (!cleanOrderId) {
      setError('Please enter a valid Order ID.');
      setOrder(null);
      return;
    }

    setLoad(true);
    setError('');

    try {
      const res = await api.get(`/orders/track/${cleanOrderId}`);
      if (res?.success && res.order) {
        setOrder({
          ...res.order,
          id:    res.order.orderId     ?? res.order.id,
          date:  res.order.createdAt   ?? res.order.date,
          total: res.order.totalAmount ?? res.order.total,
        });
        return;
      }
      throw new Error('Order not found');
    } catch (_err) {
      // Fall back to mock data so the demo never feels dead.
      try {
        const { mockOrders } = await import('../../../data/orders');
        const found = mockOrders.find(
          (o) => String(o.id).toLowerCase() === cleanOrderId.toLowerCase()
        );
        if (found) {
          setOrder(found);
          return;
        }
      } catch {
        /* mock data not available — fall through to error */
      }
      setOrder(null);
      setError(
        "We couldn't find that order. Please double-check your Order ID."
      );
    } finally {
      setLoad(false);
    }
  }, []);

  return { order, error, isLoading, track, reset };
}

