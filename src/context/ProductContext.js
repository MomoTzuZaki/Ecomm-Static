import React, { createContext, useContext, useState, useEffect } from 'react';

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

  // Load products from localStorage on mount
  useEffect(() => {
    const savedProducts = localStorage.getItem('techCycleProducts');
    if (savedProducts) {
      const parsedProducts = JSON.parse(savedProducts);
      setProducts(parsedProducts);
    } else {
      // Initialize with mock data if no saved products
      const mockProducts = [
        {
          id: 1,
          title: 'iPhone 13 Pro',
          description: 'Excellent condition iPhone 13 Pro with 128GB storage. This device has been well-maintained and comes with original box and charger. No scratches or dents, battery health at 95%. Perfect for anyone looking for a premium smartphone experience.',
          price: 899,
          originalPrice: 999,
          category: 'Smartphones',
          condition: 'Excellent',
          brand: 'Apple',
          model: 'iPhone 13 Pro',
          storage: '128GB',
          color: 'Graphite',
          screenSize: '6.1 inches',
          operatingSystem: 'iOS 15',
          batteryHealth: '95%',
          network: '5G',
          camera: 'Triple 12MP',
          material: 'Ceramic Shield',
          dimensions: '146.7 x 71.5 x 7.65 mm',
          weight: '203g',
          warranty: 'No warranty (used)',
          accessories: 'Original box, charger, cable',
          location: 'New York, NY',
          contactInfo: 'john@example.com',
          images: [
            'https://via.placeholder.com/600x400?text=iPhone+13+Pro+Front',
            'https://via.placeholder.com/600x400?text=iPhone+13+Pro+Back',
            'https://via.placeholder.com/600x400?text=iPhone+13+Pro+Side',
            'https://via.placeholder.com/600x400?text=iPhone+13+Pro+Box',
          ],
          highlights: [
            'Excellent condition with minimal wear',
            'Battery health at 95%',
            'All original accessories included',
            'No scratches or dents',
            'Unlocked for all carriers',
            'Recent software update',
          ],
          specifications: {
            'Display': '6.1-inch Super Retina XDR display',
            'Chip': 'A15 Bionic chip',
            'Camera': 'Pro camera system with 12MP Ultra Wide, Wide, and Telephoto cameras',
            'Video': 'Cinematic mode, ProRes video recording',
            'Battery': 'Up to 22 hours video playback',
            'Storage': '128GB',
            'Connectivity': '5G, Wi-Fi 6, Bluetooth 5.0',
            'Security': 'Face ID',
            'Water Resistance': 'IP68 rating',
            'Operating System': 'iOS 15 (upgradeable)',
          },
              seller: {
                name: 'John Doe',
                email: 'john@example.com',
                rating: 4.8,
                totalSales: 23,
                joinDate: '2023-06-15',
                responseRate: '98%',
                responseTime: 'Within 1 hour',
                isVerified: true,
              },
          datePosted: '2024-01-15',
          views: 45,
          isFavorite: false,
        },
        {
          id: 2,
          title: 'MacBook Pro 14"',
          description: 'M1 Pro chip, 16GB RAM, 512GB SSD',
          price: 1899,
          originalPrice: 1999,
          category: 'Laptops',
          condition: 'Good',
          brand: 'Apple',
          model: 'MacBook Pro 14"',
          storage: '512GB',
          color: 'Space Gray',
          screenSize: '14 inches',
          operatingSystem: 'macOS Monterey',
          batteryHealth: '88%',
          network: 'Wi-Fi 6',
          camera: '1080p FaceTime HD',
          material: 'Aluminum',
          dimensions: '312.6 x 221.2 x 15.5 mm',
          weight: '1.6 kg',
          warranty: 'No warranty (used)',
          accessories: 'Original box, charger',
          location: 'California',
          contactInfo: 'jane@example.com',
          images: [
            'https://via.placeholder.com/600x400?text=MacBook+Pro+Front',
            'https://via.placeholder.com/600x400?text=MacBook+Pro+Back',
            'https://via.placeholder.com/600x400?text=MacBook+Pro+Side',
          ],
          highlights: [
            'M1 Pro chip for excellent performance',
            '16GB unified memory',
            '512GB SSD storage',
            'Excellent battery life',
            'Retina display',
          ],
          specifications: {
            'Processor': 'Apple M1 Pro chip',
            'Memory': '16GB unified memory',
            'Storage': '512GB SSD',
            'Display': '14-inch Liquid Retina XDR display',
            'Graphics': '16-core GPU',
            'Battery': 'Up to 17 hours video playback',
            'Connectivity': 'Wi-Fi 6, Bluetooth 5.0',
            'Ports': '3x Thunderbolt 4, HDMI, SD card slot',
            'Operating System': 'macOS Monterey',
          },
          seller: {
            name: 'Jane Smith',
            email: 'jane@example.com',
            rating: 4.9,
            totalSales: 45,
            joinDate: '2023-05-20',
            responseRate: '99%',
            responseTime: 'Within 30 minutes',
            isVerified: true,
          },
          datePosted: '2024-01-14',
          views: 78,
          isFavorite: false,
        },
        {
          id: 3,
          title: 'Sony WH-1000XM4',
          description: 'Noise-cancelling wireless headphones',
          price: 249,
          originalPrice: 349,
          category: 'Audio',
          condition: 'Excellent',
          brand: 'Sony',
          model: 'WH-1000XM4',
          storage: 'N/A',
          color: 'Black',
          screenSize: 'N/A',
          operatingSystem: 'N/A',
          batteryHealth: '92%',
          network: 'Bluetooth 5.0',
          camera: 'N/A',
          material: 'Plastic, Metal',
          dimensions: '185 x 203 x 83 mm',
          weight: '254g',
          warranty: 'No warranty (used)',
          accessories: 'Original box, charging cable, carrying case',
          location: 'Texas',
          contactInfo: 'mike@example.com',
          images: [
            'https://via.placeholder.com/600x400?text=Sony+Headphones+Front',
            'https://via.placeholder.com/600x400?text=Sony+Headphones+Side',
          ],
          highlights: [
            'Industry-leading noise cancellation',
            '30-hour battery life',
            'Quick charge: 10 min for 5 hours',
            'Touch sensor controls',
            'Comfortable for long listening',
          ],
          specifications: {
            'Driver': '40mm dynamic drivers',
            'Frequency Response': '4Hz-40kHz',
            'Battery Life': 'Up to 30 hours',
            'Charging': 'USB-C, Quick charge',
            'Connectivity': 'Bluetooth 5.0, NFC',
            'Noise Cancellation': 'Industry-leading ANC',
            'Controls': 'Touch sensor, physical buttons',
            'Weight': '254g',
            'Compatibility': 'iOS, Android, PC',
          },
          seller: {
            name: 'Mike Johnson',
            email: 'mike@example.com',
            rating: 4.7,
            totalSales: 12,
            joinDate: '2023-08-10',
            responseRate: '95%',
            responseTime: 'Within 2 hours',
            isVerified: false,
          },
          datePosted: '2024-01-13',
          views: 34,
          isFavorite: false,
        },
        {
          id: 4,
          title: 'Canon EOS R5',
          description: 'Professional mirrorless camera with 45MP sensor',
          price: 3299,
          originalPrice: 3899,
          category: 'Cameras',
          condition: 'Good',
          brand: 'Canon',
          model: 'EOS R5',
          storage: 'N/A',
          color: 'Black',
          screenSize: '3.2 inches',
          operatingSystem: 'Canon OS',
          batteryHealth: '85%',
          network: 'Wi-Fi, Bluetooth',
          camera: '45MP Full Frame',
          material: 'Magnesium Alloy',
          dimensions: '138 x 97.5 x 88 mm',
          weight: '650g',
          warranty: 'No warranty (used)',
          accessories: 'Original box, battery, charger, strap',
          location: 'Florida',
          contactInfo: 'sarah@example.com',
          images: [
            'https://via.placeholder.com/600x400?text=Canon+EOS+R5+Front',
            'https://via.placeholder.com/600x400?text=Canon+EOS+R5+Back',
            'https://via.placeholder.com/600x400?text=Canon+EOS+R5+Side',
          ],
          highlights: [
            '45MP full-frame CMOS sensor',
            '8K video recording',
            'In-body image stabilization',
            'Dual pixel autofocus',
            'Weather-sealed body',
          ],
          specifications: {
            'Sensor': '45MP Full-Frame CMOS',
            'Video': '8K RAW, 4K 120p',
            'Stabilization': '5-axis in-body IS',
            'Autofocus': 'Dual Pixel CMOS AF II',
            'Burst': 'Up to 20 fps',
            'ISO': '100-51,200 (expandable)',
            'Display': '3.2" vari-angle touchscreen',
            'Viewfinder': '5.76M-dot OLED EVF',
            'Connectivity': 'Wi-Fi, Bluetooth, USB-C',
          },
          seller: {
            name: 'Sarah Wilson',
            email: 'sarah@example.com',
            rating: 4.9,
            totalSales: 8,
            joinDate: '2023-09-15',
            responseRate: '100%',
            responseTime: 'Within 1 hour',
            isVerified: true,
          },
          datePosted: '2024-01-12',
          views: 67,
          isFavorite: false,
        },
      ];
      setProducts(mockProducts);
      localStorage.setItem('techCycleProducts', JSON.stringify(mockProducts));
    }
  }, []);

  // Save products to localStorage whenever they change
  useEffect(() => {
    if (products.length > 0) {
      localStorage.setItem('techCycleProducts', JSON.stringify(products));
    }
  }, [products]);

  const getProductById = (id) => {
    return products.find(product => product.id === parseInt(id));
  };

  const updateProduct = (updatedProduct) => {
    setProducts(prevProducts => 
      prevProducts.map(product => 
        product.id === updatedProduct.id ? updatedProduct : product
      )
    );
  };

  const addProduct = (newProduct) => {
    const productWithId = {
      ...newProduct,
      id: Date.now(), // Simple ID generation
      datePosted: new Date().toISOString().split('T')[0],
      views: 0,
      isFavorite: false,
    };
    setProducts(prevProducts => [...prevProducts, productWithId]);
    return productWithId;
  };

  const deleteProduct = (productId) => {
    setProducts(prevProducts => 
      prevProducts.filter(product => product.id !== productId)
    );
  };

  const getAllProducts = () => {
    return products;
  };

  const getProductsByCategory = (category) => {
    return products.filter(product => product.category === category);
  };

  const searchProducts = (query) => {
    const lowercaseQuery = query.toLowerCase();
    return products.filter(product => 
      product.title.toLowerCase().includes(lowercaseQuery) ||
      product.description.toLowerCase().includes(lowercaseQuery) ||
      product.brand.toLowerCase().includes(lowercaseQuery)
    );
  };

  const value = {
    products,
    getProductById,
    updateProduct,
    addProduct,
    deleteProduct,
    getAllProducts,
    getProductsByCategory,
    searchProducts,
  };

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
};
