package com.example.ecommerce.service;

import com.example.ecommerce.model.Product;
import com.example.ecommerce.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    /**
     * READ: Retrieves all products from the database.
     * @return a list of all products.
     */
    public List<Product> findAllProducts() {
        return productRepository.findAll();
    }

    /**
     * READ: Finds a single product by its unique ID.
     * @param id The ID of the product to find.
     * @return an Optional containing the product if found, or empty if not.
     */
    public Optional<Product> findProductById(Long id) {
        return productRepository.findById(id);
    }

    /**
     * READ: Retrieves all products that are currently on sale.
     * @return a list of products on sale.
     */
    public List<Product> findOnSaleProducts() {
        return productRepository.findByOnSale(true);
    }

    /**
     * CREATE: Saves a new product to the database.
     * @param product The product object to be saved.
     * @return the saved product, including its new ID.
     */
    public Product saveProduct(Product product) {
        return productRepository.save(product);
    }

    /**
     * UPDATE: Updates an existing product's details.
     * @param id The ID of the product to update.
     * @param productDetails An object containing the new details for the product.
     * @return the updated product.
     * @throws RuntimeException if no product is found with the given ID.
     */
    public Product updateProduct(Long id, Product productDetails) {
        Product existingProduct = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));

        existingProduct.setName(productDetails.getName());
        existingProduct.setDescription(productDetails.getDescription());
        existingProduct.setPrice(productDetails.getPrice());
        existingProduct.setImageUrl(productDetails.getImageUrl());
        existingProduct.setCategory(productDetails.getCategory());
        existingProduct.setStockQuantity(productDetails.getStockQuantity());

        return productRepository.save(existingProduct);
    }

    /**
     * UPDATE: Updates a product's stock quantity.
     * @param id The ID of the product to update.
     * @param stockQuantity The new stock quantity.
     * @return the updated product.
     * @throws RuntimeException if no product is found with the given ID.
     */
    public Product updateProductStock(Long id, int stockQuantity) {
        Product existingProduct = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));

        existingProduct.setStockQuantity(stockQuantity);
        return productRepository.save(existingProduct);
    }

    /**
     * DELETE: Deletes a product from the database by its ID.
     * @param id The ID of the product to delete.
     * @throws RuntimeException if no product is found with the given ID.
     */
    public void deleteProductById(Long id) {
        if (!productRepository.existsById(id)) {
            throw new RuntimeException("Product not found with id: " + id);
        }
        productRepository.deleteById(id);
    }
}