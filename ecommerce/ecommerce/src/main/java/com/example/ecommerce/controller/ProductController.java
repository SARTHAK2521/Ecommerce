package com.example.ecommerce.controller;

import com.example.ecommerce.model.Product;
import com.example.ecommerce.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    @Autowired
    private ProductService productService;

    /**
     * READ: Handles GET requests to /api/products to fetch all products.
     * @return A list of all products.
     */
    @GetMapping
    public List<Product> getAllProducts() {
        return productService.findAllProducts();
    }

    /**
     * READ: Handles GET requests to /api/products/deals to fetch products on sale.
     * @return A list of products that are on sale.
     */
    @GetMapping("/deals")
    public List<Product> getProductsOnSale() {
        return productService.findOnSaleProducts();
    }

    /**
     * READ: Handles GET requests to /api/products/{id} to fetch a single product.
     * @param id The ID of the product to retrieve.
     * @return A ResponseEntity containing the product if found (200 OK), or 404 Not Found.
     */
    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable Long id) {
        return productService.findProductById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * CREATE: Handles POST requests to /api/products to add a new product.
     * @param product The product data from the request body.
     * @return A ResponseEntity containing the newly created product with a 201 Created status.
     */
    @PostMapping
    public ResponseEntity<Product> createProduct(@RequestBody Product product) {
        Product savedProduct = productService.saveProduct(product);
        return new ResponseEntity<>(savedProduct, HttpStatus.CREATED);
    }

    /**
     * UPDATE: Handles PUT requests to /api/products/{id} to update an existing product.
     * @param id The ID of the product to update.
     * @param productDetails The new product data from the request body.
     * @return A ResponseEntity containing the updated product if successful (200 OK), or 404 Not Found.
     */
    @PutMapping("/{id}")
    public ResponseEntity<Product> updateProduct(@PathVariable Long id, @RequestBody Product productDetails) {
        try {
            Product updatedProduct = productService.updateProduct(id, productDetails);
            return ResponseEntity.ok(updatedProduct);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * UPDATE: Handles PATCH requests to /api/products/{id}/stock to update product stock quantity.
     * @param id The ID of the product to update.
     * @param stockRequest The stock update request containing the new stock quantity.
     * @return A ResponseEntity containing the updated product if successful (200 OK), or 404 Not Found.
     */
    @PatchMapping("/{id}/stock")
    public ResponseEntity<Product> updateProductStock(@PathVariable Long id, @RequestBody StockUpdateRequest stockRequest) {
        try {
            Product updatedProduct = productService.updateProductStock(id, stockRequest.getStockQuantity());
            return ResponseEntity.ok(updatedProduct);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * DELETE: Handles DELETE requests to /api/products/{id} to remove a product.
     * @param id The ID of the product to delete.
     * @return A ResponseEntity with 204 No Content if successful, or 404 Not Found.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        try {
            productService.deleteProductById(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Inner class for stock update requests
     */
    public static class StockUpdateRequest {
        private int stockQuantity;

        public int getStockQuantity() {
            return stockQuantity;
        }

        public void setStockQuantity(int stockQuantity) {
            this.stockQuantity = stockQuantity;
        }
    }
}