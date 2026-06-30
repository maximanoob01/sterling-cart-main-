import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { products as localProducts, categories, occasions, styles, stoneTypes, colors, designs, collections } from '../data/products';
import api from '../services/api';

const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState(localProducts);
  const [isLoaded, setIsLoaded] = useState(false);

  // Try to load products from API; fallback to local data
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get('/products?limit=500');
        if (res.success && res.products?.length > 0) {
          // Map _id to id for frontend compatibility
          const mapped = res.products.map(p => ({
            ...p,
            id: p._id || p.id,
            images: p.images?.length > 0 ? p.images : localProducts.find(lp => lp.category === p.category)?.images || [],
          }));
          setProducts(mapped);
        }
      } catch (err) {
        console.warn('Products API unavailable, using local data:', err.message);
        // Keep local products — already set as default
      } finally {
        setIsLoaded(true);
      }
    };

    fetchProducts();
  }, []);

  const addProduct = useCallback(async (newProduct) => {
    try {
      const res = await api.post('/products', newProduct);
      if (res.success) {
        const product = { ...res.product, id: res.product._id };
        setProducts(prev => [product, ...prev]);
        return product.id;
      }
    } catch (err) {
      console.warn('API add failed, adding locally:', err.message);
    }

    // Fallback: add locally
    const id = Date.now();
    const slug = newProduct.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    setProducts(prev => [{
      ...newProduct, id, slug,
      rating: 0, reviewCount: 0, inStock: (newProduct.stockQty || 0) > 0,
      isNew: true, badge: newProduct.badge || 'New', sizes: newProduct.sizes || [],
    }, ...prev]);
    return id;
  }, []);

  const updateProduct = useCallback(async (updatedProduct) => {
    try {
      const apiId = updatedProduct._id || updatedProduct.id;
      await api.put(`/products/${apiId}`, updatedProduct);
    } catch (err) {
      console.warn('API update failed, updating locally:', err.message);
    }
    setProducts(prev =>
      prev.map(p => (p.id === updatedProduct.id || p._id === updatedProduct._id) ? { ...p, ...updatedProduct } : p)
    );
  }, []);

  const deleteProduct = useCallback(async (productId) => {
    try {
      await api.delete(`/products/${productId}`);
    } catch (err) {
      console.warn('API delete failed, deleting locally:', err.message);
    }
    setProducts(prev => prev.filter(p => p.id !== productId && p._id !== productId));
  }, []);

  const addMultipleProducts = useCallback((newProductsArray) => {
    const timestamp = Date.now();
    const formattedProducts = newProductsArray.map((newProduct, index) => {
      const id = timestamp + index;
      const slug = (newProduct.name || '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') || `product-${id}`;
      return {
        ...newProduct, id, slug,
        rating: 0, reviewCount: 0, inStock: (newProduct.stockQty || 0) > 0,
        isNew: true, badge: newProduct.badge || 'New',
        sizes: newProduct.sizes || [], images: newProduct.images || [],
      };
    });
    setProducts(prev => [...formattedProducts, ...prev]);
    return formattedProducts.map(p => p.id);
  }, []);

  return (
    <ProductContext.Provider value={{ products, addProduct, updateProduct, deleteProduct, addMultipleProducts, isLoaded }}>
      {children}
    </ProductContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) throw new Error('useProducts must be used within ProductProvider');
  return context;
};
