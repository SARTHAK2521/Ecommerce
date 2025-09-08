package com.example.ecommerce.config;

import com.example.ecommerce.model.Product;
import com.example.ecommerce.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private ProductRepository productRepository;

    @Override
    public void run(String... args) throws Exception {
        // Check if the database is empty before seeding
        if (productRepository.count() == 0) {
            seedDatabase();
        }
    }

    private void seedDatabase() {
        List<Product> products = Arrays.asList(
            // Electronics
            createProduct("Smart TV 4K 55 inch", "Ultra HD smart television with HDR and built-in streaming apps.", 499.99, "Electronics", "https://placehold.co/600x400/333/FFF?text=Smart+TV"),
            createProduct("Wireless Bluetooth Headphones", "Noise-cancelling over-ear headphones with 30-hour battery life.", 149.99, "Electronics", "https://placehold.co/600x400/555/FFF?text=Headphones"),
            createProduct("Pro Gaming Mouse", "Ergonomic gaming mouse with customizable RGB and 16,000 DPI sensor.", 79.99, "Electronics", "https://placehold.co/600x400/444/FFF?text=Gaming+Mouse"),
            createProduct("Portable Power Bank 20000mAh", "High-capacity power bank to charge your devices on the go.", 39.99, "Electronics", "https://placehold.co/600x400/666/FFF?text=Power+Bank"),

            // Books
            createProduct("The Midnight Library", "A novel by Matt Haig about choices, regrets, and the infinite possibilities of life.", 15.99, "Books", "https://placehold.co/600x400/007bff/FFF?text=Book+1"),
            createProduct("Atomic Habits", "An easy & proven way to build good habits & break bad ones by James Clear.", 18.50, "Books", "https://placehold.co/600x400/28a745/FFF?text=Book+2"),
            createProduct("Sapiens: A Brief History of Humankind", "A critically acclaimed book by Yuval Noah Harari exploring human history.", 22.00, "Books", "https://placehold.co/600x400/ffc107/333?text=Book+3"),

            // Home & Kitchen
            createProduct("Espresso Coffee Machine", "Barista-grade espresso machine for a perfect cup of coffee at home.", 299.99, "Home & Kitchen", "https://placehold.co/600x400/dc3545/FFF?text=Coffee+Machine"),
            createProduct("Air Fryer XL", "Large capacity air fryer for healthy, oil-free cooking.", 99.99, "Home & Kitchen", "https://placehold.co/600x400/6f42c1/FFF?text=Air+Fryer"),
            createProduct("Robotic Vacuum Cleaner", "Smart vacuum that automatically cleans your floors.", 249.50, "Home & Kitchen", "https://placehold.co/600x400/fd7e14/FFF?text=Robot+Vacuum"),

            // Fashion
            createProduct("Classic Leather Jacket", "Timeless men's genuine leather jacket for a stylish look.", 199.99, "Fashion", "https://placehold.co/600x400/343a40/FFF?text=Leather+Jacket"),
            createProduct("Running Shoes", "Lightweight and breathable athletic shoes for men and women.", 89.99, "Fashion", "https://placehold.co/600x400/17a2b8/FFF?text=Running+Shoes"),
            createProduct("Designer Sunglasses", "UV protection sunglasses with a modern, stylish frame.", 120.00, "Fashion", "https://placehold.co/600x400/e83e8c/FFF?text=Sunglasses")
        );

        productRepository.saveAll(products);
        System.out.println(products.size() + " products have been seeded into the database.");
    }

    private Product createProduct(String name, String description, double price, String category, String imageUrl) {
        Product product = new Product();
        product.setName(name);
        product.setDescription(description);
        product.setPrice(price);
        product.setCategory(category);
        product.setImageUrl(imageUrl);
        return product;
    }
}
