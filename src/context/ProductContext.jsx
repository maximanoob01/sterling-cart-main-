import { createContext, useContext, useState, useCallback } from 'react';
import { products as initialProducts } from '../data/products';

const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState(initialProducts);

  const addProduct = useCallback((newProduct) => {
    const id = Date.now();
    const slug = newProduct.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    setProducts((prev) => [
      {
        ...newProduct,
        id,
        slug,
        rating: 0,
        reviewCount: 0,
        inStock: (newProduct.stockQty || 0) > 0,
        isNew: true,
        badge: newProduct.badge || 'New',
        sizes: newProduct.sizes || [],
      },
      ...prev,
    ]);
    return id;
  }, []);

  const updateProduct = useCallback((updatedProduct) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === updatedProduct.id ? { ...p, ...updatedProduct } : p))
    );
  }, []);

  const deleteProduct = useCallback((productId) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
  }, []);

  const addMultipleProducts = useCallback((newProductsArray) => {
    const timestamp = Date.now();
    const formattedProducts = newProductsArray.map((newProduct, index) => {
      const id = timestamp + index; // Ensure unique ID per product
      const slug = (newProduct.name || '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') || `product-${id}`;
        
      return {
        ...newProduct,
        id,
        slug,
        rating: 0,
        reviewCount: 0,
        inStock: (newProduct.stockQty || 0) > 0,
        isNew: true,
        badge: newProduct.badge || 'New',
        sizes: newProduct.sizes || [],
        images: newProduct.images || [],
      };
    });

    setProducts((prev) => [...formattedProducts, ...prev]);
    return formattedProducts.map(p => p.id);
  }, []);

  return (
    <ProductContext.Provider value={{ products, addProduct, updateProduct, deleteProduct, addMultipleProducts }}>
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
