package com.example.ecommerce.config;

import com.example.ecommerce.model.Product;
import com.example.ecommerce.model.ShippingOption;
import com.example.ecommerce.model.User;
import com.example.ecommerce.repository.ProductRepository;
import com.example.ecommerce.repository.ShippingOptionRepository;
import com.example.ecommerce.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private ProductRepository productRepository;
    @Autowired
    private ShippingOptionRepository shippingOptionRepository;
    @Autowired
    private UserService userService;

    @Override
    public void run(String... args) throws Exception {
        // Only seed data if the tables are empty
        seedUsers();
        seedProducts();
        seedShippingOptions();
    }
    
    private void seedUsers() {
        // Create an admin user if they don't exist
        Optional<User> adminUserOptional = userService.findByUsername("admin2");
        if (adminUserOptional.isEmpty()) {
            User adminUser = new User();
            adminUser.setUsername("admin2");
            adminUser.setEmail("admin2@example.com");
            adminUser.setPassword("admin"); // This password will be encrypted by the UserService
            userService.createUser(adminUser, "ROLE_ADMIN");
            System.out.println("Admin user 'admin2' created with password 'admin'.");
        }
    }

    private void seedProducts() {
        if (productRepository.count() == 0) {
            List<Product> products = Arrays.asList(
                createProduct("Smart TV 4K 55 inch", "Ultra HD smart television with HDR and built-in streaming apps.", 499.99, 599.99, "Electronics", "https://placehold.co/600x400/333/FFF?text=Smart+TV", true, 5),
                createProduct("Wireless Bluetooth Headphones", "Noise-cancelling over-ear headphones with 30-hour battery life.", 149.99, 199.99, "Electronics", "https://placehold.co/600x400/555/FFF?text=Headphones", true, 12),
                createProduct("Pro Gaming Mouse", "Ergonomic gaming mouse with customizable RGB and 16,000 DPI sensor.", 79.99, 99.99, "Electronics", "https://placehold.co/600x400/444/FFF?text=Gaming+Mouse", true, 0),
                createProduct("Portable Power Bank 20000mAh", "High-capacity power bank to charge your devices on the go.", 39.99, 39.99, "Electronics", "https://placehold.co/600x400/666/FFF?text=Power+Bank", false, 50),
                createProduct("The Midnight Library", "A novel by Matt Haig about choices, regrets, and the infinite possibilities of life.", 15.99, 15.99, "Books", "https://placehold.co/600x400/007bff/FFF?text=Book+1", false, 100),
                createProduct("Atomic Habits", "An easy & proven way to build good habits & break bad ones by James Clear.", 18.50, 24.99, "Books", "https://placehold.co/600x400/28a745/FFF?text=Book+2", true, 20),
                createProduct("Sapiens: A Brief History of Humankind", "A critically acclaimed book by Yuval Noah Harari exploring human history.", 22.00, 29.99, "Books", "https://placehold.co/600x400/ffc107/333?text=Book+3", true, 8),
                createProduct("Espresso Coffee Machine", "Barista-grade espresso machine for a perfect cup of coffee at home.", 299.99, 349.99, "Home & Kitchen", "https://placehold.co/600x400/dc3545/FFF?text=Coffee+Machine", true, 3),
                createProduct("Air Fryer XL", "Large capacity air fryer for healthy, oil-free cooking.", 99.99, 99.99, "Home & Kitchen", "https://placehold.co/600x400/6f42c1/FFF?text=Air+Fryer", false, 45),
                createProduct("Robotic Vacuum Cleaner", "Smart vacuum that automatically cleans your floors.", 249.50, 299.99, "Home & Kitchen", "https://placehold.co/600x400/fd7e14/FFF?text=Robot+Vacuum", true, 5),
                createProduct("Classic Leather Jacket", "Timeless men's genuine leather jacket for a stylish look.", 199.99, 199.99, "Fashion", "https://placehold.co/600x400/343a40/FFF?text=Leather+Jacket", false, 30),
                createProduct("Running Shoes", "Lightweight and breathable athletic shoes for men and women.", 89.99, 99.99, "Fashion", "https://placehold.co/600x400/17a2b8/FFF?text=Running+Shoes", true, 7),
                createProduct("Designer Sunglasses", "UV protection sunglasses with a modern, stylish frame.", 120.00, 120.00, "Fashion", "https://placehold.co/600x400/e83e8c/FFF?text=Sunglasses", false, 25)
            );
            productRepository.saveAll(products);
            System.out.println(products.size() + " products have been seeded into the database.");
        }
    }
    
    private void seedShippingOptions() {
        if (shippingOptionRepository.count() == 0) {
            List<ShippingOption> shippingOptions = Arrays.asList(
                    createShippingOption("Standard Shipping", 5.99, "3-7 business days"),
                    createShippingOption("Express Shipping", 12.99, "1-2 business days"),
                    createShippingOption("Free Shipping", 0.00, "7-10 business days")
            );
            shippingOptionRepository.saveAll(shippingOptions);
            System.out.println(shippingOptions.size() + " shipping options have been seeded into the database.");
        }
    }

    private Product createProduct(String name, String description, double price, double originalPrice, String category, String imageUrl, boolean onSale, int stockQuantity) {
        Product product = new Product();
        product.setName(name);
        product.setDescription(description);
        product.setPrice(price);
        product.setOriginalPrice(originalPrice);
        product.setCategory(category);
        product.setImageUrl(imageUrl);
        product.setOnSale(onSale);
        product.setStockQuantity(stockQuantity);
        return product;
    }

    private ShippingOption createShippingOption(String name, double cost, String estimatedDeliveryTime) {
        ShippingOption option = new ShippingOption();
        option.setName(name);
        option.setCost(cost);
        option.setEstimatedDeliveryTime(estimatedDeliveryTime);
        return option;
    }
}
