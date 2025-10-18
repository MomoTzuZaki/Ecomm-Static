import React, { createContext, useContext, useState, useEffect } from 'react';
import { productsAPI } from '../services/api';

const ProductContext = createContext();

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load products from database on mount
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const productsData = await productsAPI.getAllProducts();
        setProducts(productsData);
      } catch (error) {
        console.error('Failed to load products:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  const addProduct = async (productData) => {
    try {
      const newProduct = await productsAPI.createProduct(productData);
      setProducts(prev => [...prev, newProduct]);
      return { success: true, product: newProduct };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const updateProduct = async (id, productData) => {
    try {
      const updatedProduct = await productsAPI.updateProduct(id, productData);
      setProducts(prev => prev.map(p => p.id === id ? updatedProduct : p));
      return { success: true, product: updatedProduct };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const deleteProduct = async (id) => {
    try {
      await productsAPI.deleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const getProductById = async (id) => {
    try {
      return await productsAPI.getProductById(id);
    } catch (error) {
      throw error;
    }
  };

  const getMyProducts = async () => {
    try {
      return await productsAPI.getMyProducts();
    } catch (error) {
      throw error;
    }
  };

  const refreshProducts = async () => {
    setLoading(true);
    try {
      const productsData = await productsAPI.getAllProducts();
      setProducts(productsData);
    } catch (error) {
      console.error('Failed to refresh products:', error);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    products,
    loading,
    addProduct,
    updateProduct,
    deleteProduct,
    getProductById,
    getMyProducts,
    refreshProducts,
  };

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
};