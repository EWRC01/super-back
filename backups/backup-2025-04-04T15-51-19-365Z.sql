-- MySQL dump 10.13  Distrib 8.0.41, for Win64 (x86_64)
--
-- Host: localhost    Database: super_campos_prod
-- ------------------------------------------------------
-- Server version	8.0.41

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `applied_discounts`
--

DROP TABLE IF EXISTS `applied_discounts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `applied_discounts` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `amount` decimal(10,2) NOT NULL,
  `discountId` bigint unsigned NOT NULL,
  `soldProductId` int unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_91022262894d393e3623bc84a6f` (`discountId`),
  KEY `FK_0a3512dc063f16ce8759f6aea75` (`soldProductId`),
  CONSTRAINT `FK_0a3512dc063f16ce8759f6aea75` FOREIGN KEY (`soldProductId`) REFERENCES `sold_products` (`id`),
  CONSTRAINT `FK_91022262894d393e3623bc84a6f` FOREIGN KEY (`discountId`) REFERENCES `discounts` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `applied_discounts`
--

LOCK TABLES `applied_discounts` WRITE;
/*!40000 ALTER TABLE `applied_discounts` DISABLE KEYS */;
INSERT INTO `applied_discounts` VALUES (1,12.00,3,7),(2,20.00,6,8),(3,24.00,7,10),(4,8.00,8,11),(5,8.00,8,12),(6,8.00,8,13),(7,8.00,8,14),(8,8.00,8,15),(9,8.00,8,24),(10,8.00,8,26),(11,1.60,9,27),(12,4.00,10,28),(13,0.80,9,31),(14,8.00,8,33),(15,4.00,10,35);
/*!40000 ALTER TABLE `applied_discounts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `brands`
--

DROP TABLE IF EXISTS `brands`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `brands` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `brandName` varchar(50) NOT NULL,
  `isActive` tinyint NOT NULL DEFAULT '1',
  `providerId` int unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_4ab3c4a8a4b9de8e1f5b195ae5c` (`providerId`),
  CONSTRAINT `FK_4ab3c4a8a4b9de8e1f5b195ae5c` FOREIGN KEY (`providerId`) REFERENCES `providers` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `brands`
--

LOCK TABLES `brands` WRITE;
/*!40000 ALTER TABLE `brands` DISABLE KEYS */;
INSERT INTO `brands` VALUES (2,'Le Roche-Posay',1,2);
/*!40000 ALTER TABLE `brands` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cash_register`
--

DROP TABLE IF EXISTS `cash_register`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cash_register` (
  `id` int NOT NULL AUTO_INCREMENT,
  `date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `cashInHand` decimal(10,2) NOT NULL,
  `totalSales` decimal(10,2) NOT NULL,
  `expectedCash` decimal(10,2) NOT NULL,
  `discrepancy` decimal(10,2) NOT NULL,
  `previousCashRegisterId` int DEFAULT NULL,
  `state` enum('open','closed') DEFAULT NULL,
  `userId` int unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_4b7c17a914a9bd23787e878b217` (`userId`),
  CONSTRAINT `FK_4b7c17a914a9bd23787e878b217` FOREIGN KEY (`userId`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cash_register`
--

LOCK TABLES `cash_register` WRITE;
/*!40000 ALTER TABLE `cash_register` DISABLE KEYS */;
INSERT INTO `cash_register` VALUES (11,'2025-04-03 16:40:23',0.00,0.00,0.00,0.00,NULL,'open',6),(12,'2025-04-03 16:44:16',0.00,0.00,0.00,0.00,NULL,'open',7),(13,'2025-04-03 16:44:46',18.00,18.00,18.00,0.00,12,'closed',7),(14,'2025-04-03 16:45:10',18.00,18.00,18.00,0.00,11,'closed',6);
/*!40000 ALTER TABLE `cash_register` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `categoryName` varchar(50) NOT NULL,
  `isActive` tinyint NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (2,'Belleza - Cuidado Facial',1);
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `configuration`
--

DROP TABLE IF EXISTS `configuration`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `configuration` (
  `name` varchar(255) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `logo` varchar(255) NOT NULL,
  PRIMARY KEY (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `configuration`
--

LOCK TABLES `configuration` WRITE;
/*!40000 ALTER TABLE `configuration` DISABLE KEYS */;
/*!40000 ALTER TABLE `configuration` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customers`
--

DROP TABLE IF EXISTS `customers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customers` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `isActive` tinyint NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customers`
--

LOCK TABLES `customers` WRITE;
/*!40000 ALTER TABLE `customers` DISABLE KEYS */;
/*!40000 ALTER TABLE `customers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `damaged_products`
--

DROP TABLE IF EXISTS `damaged_products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `damaged_products` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `quantity` int NOT NULL,
  `dateReported` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `replaced` tinyint NOT NULL DEFAULT '0',
  `dateReplaced` datetime DEFAULT NULL,
  `replacedQuantity` int DEFAULT NULL,
  `notes` varchar(255) DEFAULT NULL,
  `replacementRequested` tinyint NOT NULL DEFAULT '0',
  `replacementApproved` tinyint NOT NULL DEFAULT '0',
  `productId` int unsigned DEFAULT NULL,
  `brandId` int unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_268b583abf90e304ec7a5ae5de0` (`productId`),
  KEY `FK_c05264e07f563ae7ad9be07a4d9` (`brandId`),
  CONSTRAINT `FK_268b583abf90e304ec7a5ae5de0` FOREIGN KEY (`productId`) REFERENCES `products` (`id`),
  CONSTRAINT `FK_c05264e07f563ae7ad9be07a4d9` FOREIGN KEY (`brandId`) REFERENCES `brands` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `damaged_products`
--

LOCK TABLES `damaged_products` WRITE;
/*!40000 ALTER TABLE `damaged_products` DISABLE KEYS */;
INSERT INTO `damaged_products` VALUES (2,2,'2025-04-04 00:19:23',1,'2025-04-04 00:24:24',2,'Caducidad',1,1,5,2);
/*!40000 ALTER TABLE `damaged_products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `discounts`
--

DROP TABLE IF EXISTS `discounts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `discounts` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `type` enum('PERCENTAGE','FIXED_AMOUNT','BUY_X_GET_Y','BUNDLE','SEASONAL') NOT NULL,
  `value` decimal(10,2) NOT NULL,
  `minQuantity` int unsigned DEFAULT NULL,
  `productId` bigint unsigned DEFAULT NULL,
  `categoryId` bigint unsigned DEFAULT NULL,
  `startDate` datetime NOT NULL,
  `endDate` datetime NOT NULL,
  `isActive` tinyint NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `discounts`
--

LOCK TABLES `discounts` WRITE;
/*!40000 ALTER TABLE `discounts` DISABLE KEYS */;
INSERT INTO `discounts` VALUES (3,'Promo 2x1 Real','BUY_X_GET_Y',1.00,1,3,NULL,'2025-03-01 00:00:00','2025-04-01 00:00:00',1),(5,'Promo 2x1','BUY_X_GET_Y',1.00,1,3,2,'2025-04-03 00:00:00','2025-04-06 00:00:00',1),(6,'Descuento 2 Fijo','FIXED_AMOUNT',5.00,2,3,2,'2025-04-03 00:00:00','2025-04-06 00:00:00',1),(7,'Descuento Porcentaje','PERCENTAGE',50.00,6,4,2,'2025-04-03 00:00:00','2025-04-05 00:00:00',1),(8,'Descuento New 2 x 1 - Exfoliante','BUY_X_GET_Y',1.00,2,4,2,'2025-04-03 00:00:00','2025-04-05 00:00:00',1),(9,'Porcentual Effaclar Exfoliante','PERCENTAGE',10.00,1,4,2,'2025-04-03 00:00:00','2025-04-05 00:00:00',1),(10,'Monto Fijo Effaclar Exfoliante','FIXED_AMOUNT',2.00,2,4,2,'2025-04-03 00:00:00','2025-04-05 00:00:00',1);
/*!40000 ALTER TABLE `discounts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employee_payments`
--

DROP TABLE IF EXISTS `employee_payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employee_payments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `amount` decimal(10,2) NOT NULL,
  `paymentDate` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `employeeId` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_9ae26a6107eb00c12bf87d70fac` (`employeeId`),
  CONSTRAINT `FK_9ae26a6107eb00c12bf87d70fac` FOREIGN KEY (`employeeId`) REFERENCES `employees` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employee_payments`
--

LOCK TABLES `employee_payments` WRITE;
/*!40000 ALTER TABLE `employee_payments` DISABLE KEYS */;
/*!40000 ALTER TABLE `employee_payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employees`
--

DROP TABLE IF EXISTS `employees`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employees` (
  `id` int NOT NULL AUTO_INCREMENT,
  `position` varchar(50) NOT NULL,
  `salary` decimal(10,2) NOT NULL,
  `user_id` int unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `REL_2d83c53c3e553a48dadb9722e3` (`user_id`),
  CONSTRAINT `FK_2d83c53c3e553a48dadb9722e38` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employees`
--

LOCK TABLES `employees` WRITE;
/*!40000 ALTER TABLE `employees` DISABLE KEYS */;
/*!40000 ALTER TABLE `employees` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_details`
--

DROP TABLE IF EXISTS `order_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_details` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `quantity` int NOT NULL,
  `purchasePriceUnit` decimal(10,2) NOT NULL,
  `calculatedTaxUnit` decimal(10,2) NOT NULL,
  `calculatedTotalPriceWithouthTax` decimal(10,2) NOT NULL,
  `calculatedTotalPriceWithTax` decimal(10,2) NOT NULL,
  `calculatedTotalTax` decimal(10,2) NOT NULL,
  `isActive` tinyint NOT NULL DEFAULT '1',
  `invoiceNumber` varchar(50) NOT NULL,
  `productId` int unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_6e7b4ed0e74b6a3979e600893f1` (`invoiceNumber`),
  KEY `FK_c67ebaba3e5085b6401911acc70` (`productId`),
  CONSTRAINT `FK_6e7b4ed0e74b6a3979e600893f1` FOREIGN KEY (`invoiceNumber`) REFERENCES `orders` (`invoiceNumber`),
  CONSTRAINT `FK_c67ebaba3e5085b6401911acc70` FOREIGN KEY (`productId`) REFERENCES `products` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_details`
--

LOCK TABLES `order_details` WRITE;
/*!40000 ALTER TABLE `order_details` DISABLE KEYS */;
/*!40000 ALTER TABLE `order_details` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `orderDate` date NOT NULL,
  `invoiceNumber` varchar(50) NOT NULL,
  `isActive` tinyint NOT NULL DEFAULT '1',
  `providerId` int unsigned NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_145cac6a7847b5c569e0416450` (`invoiceNumber`),
  KEY `FK_2fa156db4d5e9c2646fdbf60d8a` (`providerId`),
  CONSTRAINT `FK_2fa156db4d5e9c2646fdbf60d8a` FOREIGN KEY (`providerId`) REFERENCES `providers` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `code` varchar(50) NOT NULL,
  `name` varchar(255) NOT NULL,
  `purchasePrice` decimal(8,2) NOT NULL,
  `salePrice` decimal(8,2) NOT NULL,
  `touristPrice` decimal(8,2) NOT NULL,
  `stock` int NOT NULL,
  `wholesaleSale` tinyint DEFAULT NULL,
  `wholesalePrice` decimal(8,2) DEFAULT NULL,
  `wholesaleQuantity` decimal(8,2) DEFAULT NULL,
  `isDeleted` tinyint NOT NULL DEFAULT '0',
  `brandId` int unsigned DEFAULT NULL,
  `categoryId` int unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_7cfc24d6c24f0ec91294003d6b` (`code`),
  KEY `FK_ea86d0c514c4ecbb5694cbf57df` (`brandId`),
  KEY `FK_ff56834e735fa78a15d0cf21926` (`categoryId`),
  CONSTRAINT `FK_ea86d0c514c4ecbb5694cbf57df` FOREIGN KEY (`brandId`) REFERENCES `brands` (`id`),
  CONSTRAINT `FK_ff56834e735fa78a15d0cf21926` FOREIGN KEY (`categoryId`) REFERENCES `categories` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (3,'123456789','Effaclar Gel Moussant',0.50,6.00,9.00,2,NULL,NULL,NULL,0,2,2),(4,'20250403','Effaclar Exfoliante',5.00,8.00,12.00,1,1,6.00,10.00,0,2,2),(5,'DELETED_PRODUCT_12345678910','Gel Moussant con oro',1000.00,1500.00,3000.00,0,NULL,NULL,NULL,1,2,2);
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `providers`
--

DROP TABLE IF EXISTS `providers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `providers` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `taxId` varchar(100) NOT NULL,
  `address` varchar(100) DEFAULT NULL,
  `phone` varchar(10) NOT NULL,
  `isActive` tinyint NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `providers`
--

LOCK TABLES `providers` WRITE;
/*!40000 ALTER TABLE `providers` DISABLE KEYS */;
INSERT INTO `providers` VALUES (2,'Farmacia San Nicolas','7878-887878-787-8','San Miguel','7988-9008',1);
/*!40000 ALTER TABLE `providers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `quotation_product`
--

DROP TABLE IF EXISTS `quotation_product`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `quotation_product` (
  `id` int NOT NULL AUTO_INCREMENT,
  `priceType` enum('sale','wholesale','tourist') NOT NULL,
  `unitPrice` decimal(10,2) NOT NULL,
  `quantity` int NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `quotationId` int unsigned DEFAULT NULL,
  `productId` int unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_85d8be9d2f770610cef1c1c967b` (`quotationId`),
  KEY `FK_f10b45d97024b24c225c9afe699` (`productId`),
  CONSTRAINT `FK_85d8be9d2f770610cef1c1c967b` FOREIGN KEY (`quotationId`) REFERENCES `quotations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_f10b45d97024b24c225c9afe699` FOREIGN KEY (`productId`) REFERENCES `products` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `quotation_product`
--

LOCK TABLES `quotation_product` WRITE;
/*!40000 ALTER TABLE `quotation_product` DISABLE KEYS */;
/*!40000 ALTER TABLE `quotation_product` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `quotations`
--

DROP TABLE IF EXISTS `quotations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `quotations` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `date` datetime NOT NULL,
  `total` decimal(9,2) NOT NULL,
  `customerId` int unsigned DEFAULT NULL,
  `userId` int unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_116e4084cf9a95beea7e502ac0d` (`customerId`),
  KEY `FK_9acdd6f9d1e07a9e3b0fb1e6d65` (`userId`),
  CONSTRAINT `FK_116e4084cf9a95beea7e502ac0d` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`),
  CONSTRAINT `FK_9acdd6f9d1e07a9e3b0fb1e6d65` FOREIGN KEY (`userId`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `quotations`
--

LOCK TABLES `quotations` WRITE;
/*!40000 ALTER TABLE `quotations` DISABLE KEYS */;
/*!40000 ALTER TABLE `quotations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sales`
--

DROP TABLE IF EXISTS `sales`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sales` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `date` datetime NOT NULL,
  `totalWithIVA` decimal(9,2) NOT NULL,
  `totalWithoutIVA` decimal(9,2) NOT NULL,
  `totalIVA` decimal(9,2) NOT NULL,
  `paid` decimal(9,2) NOT NULL,
  `totalDiscount` decimal(9,2) NOT NULL,
  `customerId` int unsigned DEFAULT NULL,
  `userId` int unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_3a92cf6add00043cef9833db1cd` (`customerId`),
  KEY `FK_52ff6cd9431cc7687c76f935938` (`userId`),
  CONSTRAINT `FK_3a92cf6add00043cef9833db1cd` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`),
  CONSTRAINT `FK_52ff6cd9431cc7687c76f935938` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sales`
--

LOCK TABLES `sales` WRITE;
/*!40000 ALTER TABLE `sales` DISABLE KEYS */;
INSERT INTO `sales` VALUES (8,'2025-04-03 16:42:13',18.00,15.93,2.07,20.00,0.00,NULL,6),(9,'2025-04-03 16:44:29',18.00,15.93,2.07,20.00,0.00,NULL,7),(10,'2025-03-04 06:30:00',0.00,0.00,0.00,50.25,12.00,NULL,6),(11,'2025-04-03 22:15:39',12.00,10.62,1.38,15.00,20.00,NULL,6),(12,'2025-04-03 22:21:35',24.00,21.24,2.76,25.00,24.00,NULL,6),(13,'2025-04-03 22:28:22',8.00,7.08,0.92,8.00,8.00,NULL,6),(14,'2025-04-03 22:33:56',16.00,14.16,1.84,16.00,8.00,NULL,6),(15,'2025-04-03 23:00:31',16.00,14.16,1.84,20.00,8.00,NULL,6),(16,'2025-04-03 23:04:54',8.00,7.08,0.92,10.00,8.00,NULL,6),(17,'2025-04-03 23:19:08',8.00,7.08,0.92,8.00,8.00,NULL,6),(18,'2025-04-03 23:20:57',42.00,37.17,4.83,50.00,0.00,NULL,6),(19,'2025-04-03 23:33:23',6.00,5.31,0.69,10.00,0.00,NULL,6),(20,'2025-04-03 23:33:50',12.00,10.62,1.38,20.00,0.00,NULL,6),(21,'2025-04-03 23:34:14',14.00,12.39,1.61,20.00,0.00,NULL,6),(22,'2025-04-03 23:34:51',28.00,24.78,3.22,30.00,0.00,NULL,6),(23,'2025-04-03 23:35:28',8.00,7.08,0.92,10.00,8.00,NULL,6),(24,'2025-04-03 23:36:08',14.00,12.39,1.61,20.00,8.00,NULL,6),(25,'2025-04-03 23:38:08',14.40,12.74,1.66,20.00,1.60,NULL,6),(26,'2025-04-03 23:40:26',12.00,10.62,1.38,20.00,4.00,NULL,6),(27,'2025-04-03 23:41:31',14.00,12.39,1.61,20.00,0.00,NULL,6),(28,'2025-04-03 23:42:31',13.20,11.68,1.52,15.00,0.80,NULL,6),(29,'2025-04-03 23:44:12',22.00,19.47,2.53,25.00,8.00,NULL,6),(30,'2025-04-03 23:45:21',21.00,18.58,2.42,22.00,4.00,NULL,6),(31,'2025-04-04 08:57:19',6.00,5.31,0.69,8.00,0.00,NULL,6),(32,'2025-04-04 08:58:17',6.00,5.31,0.69,9.00,0.00,NULL,6),(33,'2025-04-04 08:59:56',6.00,5.31,0.69,6.00,0.00,NULL,6);
/*!40000 ALTER TABLE `sales` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sold_products`
--

DROP TABLE IF EXISTS `sold_products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sold_products` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `quantity` decimal(5,2) NOT NULL,
  `price` decimal(8,2) NOT NULL,
  `originalPrice` decimal(8,2) NOT NULL,
  `discountAmount` decimal(8,2) DEFAULT '0.00',
  `discountDescription` varchar(100) DEFAULT NULL,
  `priceWithouthIVA` decimal(8,2) NOT NULL,
  `iva` decimal(8,2) NOT NULL,
  `productId` int unsigned NOT NULL,
  `priceType` enum('sale','wholesale','tourist') NOT NULL,
  `saleId` int unsigned DEFAULT NULL,
  `type` enum('sale','quotation') NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_0c6f0f90d583bb1f6ee74d568f3` (`saleId`),
  KEY `FK_d417a98e7f992d5bab1d9fd783a` (`productId`),
  CONSTRAINT `FK_0c6f0f90d583bb1f6ee74d568f3` FOREIGN KEY (`saleId`) REFERENCES `sales` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_d417a98e7f992d5bab1d9fd783a` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=40 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sold_products`
--

LOCK TABLES `sold_products` WRITE;
/*!40000 ALTER TABLE `sold_products` DISABLE KEYS */;
INSERT INTO `sold_products` VALUES (5,2.00,18.00,18.00,0.00,NULL,15.93,2.07,3,'tourist',8,'sale'),(6,3.00,18.00,18.00,0.00,NULL,15.93,2.07,3,'sale',9,'sale'),(7,2.00,0.00,12.00,12.00,NULL,0.00,0.00,3,'sale',10,'sale'),(8,4.00,4.00,24.00,20.00,NULL,3.54,0.46,3,'sale',11,'sale'),(9,1.00,8.00,8.00,0.00,NULL,7.08,0.92,4,'sale',11,'sale'),(10,6.00,24.00,48.00,24.00,NULL,21.24,2.76,4,'sale',12,'sale'),(11,2.00,8.00,16.00,8.00,NULL,7.08,0.92,4,'sale',13,'sale'),(12,3.00,16.00,24.00,8.00,NULL,14.16,1.84,4,'sale',14,'sale'),(13,3.00,16.00,24.00,8.00,NULL,14.16,1.84,4,'sale',15,'sale'),(14,2.00,8.00,16.00,8.00,NULL,7.08,0.92,4,'sale',16,'sale'),(15,2.00,8.00,16.00,8.00,NULL,7.08,0.92,4,'sale',17,'sale'),(16,3.00,18.00,18.00,0.00,NULL,15.93,2.07,3,'sale',18,'sale'),(17,3.00,24.00,24.00,0.00,NULL,21.24,2.76,4,'sale',18,'sale'),(18,1.00,6.00,6.00,0.00,NULL,5.31,0.69,3,'sale',19,'sale'),(19,2.00,12.00,12.00,0.00,NULL,10.62,1.38,3,'sale',20,'sale'),(20,1.00,6.00,6.00,0.00,NULL,5.31,0.69,3,'sale',21,'sale'),(21,1.00,8.00,8.00,0.00,NULL,7.08,0.92,4,'sale',21,'sale'),(22,2.00,12.00,12.00,0.00,NULL,10.62,1.38,3,'sale',22,'sale'),(23,2.00,16.00,16.00,0.00,NULL,14.16,1.84,4,'sale',22,'sale'),(24,2.00,8.00,16.00,8.00,NULL,7.08,0.92,4,'sale',23,'sale'),(25,1.00,6.00,6.00,0.00,NULL,5.31,0.69,3,'sale',24,'sale'),(26,2.00,8.00,16.00,8.00,NULL,7.08,0.92,4,'sale',24,'sale'),(27,2.00,14.40,16.00,1.60,NULL,12.74,1.66,4,'sale',25,'sale'),(28,2.00,12.00,16.00,4.00,NULL,10.62,1.38,4,'sale',26,'sale'),(29,1.00,6.00,6.00,0.00,NULL,5.31,0.69,3,'sale',27,'sale'),(30,1.00,8.00,8.00,0.00,NULL,7.08,0.92,4,'sale',27,'sale'),(31,1.00,7.20,8.00,0.80,NULL,6.37,0.83,4,'sale',28,'sale'),(32,1.00,6.00,6.00,0.00,NULL,5.31,0.69,3,'sale',28,'sale'),(33,3.00,16.00,24.00,8.00,NULL,14.16,1.84,4,'sale',29,'sale'),(34,1.00,6.00,6.00,0.00,NULL,5.31,0.69,3,'sale',29,'sale'),(35,2.00,12.00,16.00,4.00,NULL,10.62,1.38,4,'sale',30,'sale'),(36,1.00,9.00,9.00,0.00,NULL,7.96,1.04,3,'tourist',30,'sale'),(37,1.00,6.00,6.00,0.00,NULL,5.31,0.69,3,'sale',31,'sale'),(38,1.00,6.00,6.00,0.00,NULL,5.31,0.69,3,'sale',32,'sale'),(39,1.00,6.00,6.00,0.00,NULL,5.31,0.69,3,'sale',33,'sale');
/*!40000 ALTER TABLE `sold_products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `name` varchar(100) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `password` varchar(255) NOT NULL,
  `isAdmin` tinyint NOT NULL DEFAULT '0',
  `isActive` tinyint NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (6,'admin','Admin','22577777','$2b$10$2xRg1DNlHnkX9mOIcRA4aeYjbXkhkpfeCvC5hJ3xF1Kw1fOVvb.Nu',1,1),(7,'cajero-1','Cajero Prueba','79889008','$2b$10$ORCmRDG6iu.FhTo2Gk4VAe.10fISOCD3GKn/dyNzTWSqAz0ZXeTuq',0,1);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-04-04  9:51:19
