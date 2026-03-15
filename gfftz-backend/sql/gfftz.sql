-- MySQL dump 10.13  Distrib 8.0.31, for macos12 (arm64)
--
-- Host: localhost    Database: gfftz
-- ------------------------------------------------------
-- Server version	8.0.31

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
-- Table structure for table `resource`
--

DROP TABLE IF EXISTS `resource`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `resource` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT 'Unique identifier',
  `code` varchar(50) NOT NULL COMMENT '权限码',
  `name` varchar(50) NOT NULL COMMENT '权限名',
  `type` varchar(1) NOT NULL COMMENT '权限类型 1目录/2资源',
  `parentCode` varchar(60) NOT NULL COMMENT '父级',
  `isDeleted` tinyint NOT NULL DEFAULT '0' COMMENT '是否删除',
  `isEnabled` tinyint NOT NULL DEFAULT '1' COMMENT '启用/禁用',
  `isSystemDefault` tinyint NOT NULL DEFAULT '0' COMMENT '系统默认',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_resource_name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `resource`
--

LOCK TABLES `resource` WRITE;
/*!40000 ALTER TABLE `resource` DISABLE KEYS */;
INSERT INTO `resource` VALUES (1,'home','首页','2','',0,1,1,'2025-05-03 13:37:24','2025-09-13 11:47:33'),(3,'component','组件','1','',0,1,1,'2025-05-05 07:14:29','2025-08-15 15:37:25'),(4,'clipboard','复制','2','component',0,1,1,'2025-05-05 07:14:29','2025-08-15 15:38:59'),(5,'qrcode','二维码','2','component',0,1,1,'2025-05-05 07:14:29','2025-09-13 08:00:31'),(6,'user','用户管理','2','',0,1,1,'2025-05-05 07:14:29','2025-09-13 11:26:01'),(7,'role','角色管理','2','',0,1,1,'2025-05-05 07:14:29','2025-06-29 05:29:43'),(8,'resource','权限管理','2','',0,1,1,'2025-05-05 07:14:29','2025-06-29 05:29:43'),(9,'guest_page','guest页','2','',1,1,1,'2025-05-05 07:14:29','2025-09-13 14:06:42'),(10,'test_page','test页','2','',1,1,1,'2025-05-05 07:14:29','2025-09-13 14:06:42'),(11,'operation_page','operation页','2','',1,1,1,'2025-05-05 07:14:29','2025-09-13 14:06:42'),(18,'chart','图表','1','',0,1,1,'2025-08-15 15:41:05','2025-09-13 08:21:33'),(19,'married','结婚率','2','chart',0,1,1,'2025-08-15 15:42:14','2025-09-13 08:28:50'),(20,'birth','出生率','2','chart',0,1,1,'2025-08-15 15:42:58','2025-09-13 08:28:42'),(22,'college_entrance_examination','高考','2','chart',0,1,1,'2025-09-13 08:26:49','2025-09-13 08:28:32'),(23,'university_graduate','大学毕业生','2','chart',0,1,1,'2025-09-13 08:27:28','2025-09-13 08:28:28'),(24,'postgraduate','研究生报考','2','chart',0,1,1,'2025-09-13 08:28:16','2025-09-13 08:29:13'),(28,'t1','test1','2','',0,1,0,'2025-09-14 13:55:07','2025-09-14 14:06:42');
/*!40000 ALTER TABLE `resource` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `role`
--

DROP TABLE IF EXISTS `role`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `role` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT 'Unique identifier',
  `code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT 'Role code',
  `name` varchar(50) NOT NULL COMMENT 'Role name',
  `description` varchar(255) DEFAULT NULL COMMENT 'Role description',
  `isDeleted` tinyint NOT NULL DEFAULT '0' COMMENT '是否删除',
  `isEnabled` tinyint NOT NULL DEFAULT '1' COMMENT '启用/禁用',
  `isSystemDefault` tinyint NOT NULL DEFAULT '0' COMMENT '系统默认',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_role_name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `role`
--

LOCK TABLES `role` WRITE;
/*!40000 ALTER TABLE `role` DISABLE KEYS */;
INSERT INTO `role` VALUES (1,'super_admin','超级管理员','超级管理员是系统中拥有最高权限的角色，能够完全访问和管理系统的所有数据、用户、角色以及配置，包括创建其他管理角色、执行系统级操作和管理用户账户等。',0,1,1,'2025-05-14 13:03:37','2025-09-13 09:01:20'),(2,'admin','管理员','管理员角色指在应用程序中，拥有管理权限的用户身份，能够执行包括配置、修改和管理系统设置在内的多种操作。',0,1,1,'2025-05-14 13:05:50','2025-09-13 09:05:03'),(3,'guest','游客','游客角色',0,1,1,'2025-08-16 15:23:56','2025-09-13 09:05:54'),(4,'department_manager','部门经理','',0,1,1,'2025-08-24 10:35:04','2025-09-13 09:20:30'),(5,'common_staff','普通员工','',0,1,1,'2025-09-13 09:20:51','2025-09-13 10:34:40'),(11,'test_role','更新后的测试角色','这是更新后的描述',1,1,0,'2025-09-14 14:14:52','2025-09-14 14:14:52'),(12,'test_role_1','测试角色1','批量删除测试1',1,1,0,'2025-09-14 14:19:54','2025-09-14 14:19:54'),(13,'test_role_2','测试角色2','批量删除测试2',1,1,0,'2025-09-14 14:19:54','2025-09-14 14:19:54'),(14,'test_admin','更新后的测试管理员','这是更新后的描述',1,1,0,'2025-09-14 15:54:07','2025-09-14 16:04:58');
/*!40000 ALTER TABLE `role` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `role_resource`
--

DROP TABLE IF EXISTS `role_resource`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `role_resource` (
  `roleId` int NOT NULL COMMENT 'Role ID',
  `resourceId` int NOT NULL COMMENT 'Resource ID',
  `isDeleted` tinyint NOT NULL DEFAULT '0' COMMENT '是否删除',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`roleId`,`resourceId`),
  KEY `idx_resource_id` (`resourceId`),
  CONSTRAINT `FK_8e41fa151bd158bc1ef96f7056c` FOREIGN KEY (`resourceId`) REFERENCES `resource` (`id`),
  CONSTRAINT `FK_eb3b0d193525d121cd3dc549acb` FOREIGN KEY (`roleId`) REFERENCES `role` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `role_resource`
--

LOCK TABLES `role_resource` WRITE;
/*!40000 ALTER TABLE `role_resource` DISABLE KEYS */;
INSERT INTO `role_resource` VALUES (1,1,0,'2025-09-13 09:01:20','2025-09-13 09:01:20'),(1,3,0,'2025-09-13 09:01:20','2025-09-13 09:01:20'),(1,4,0,'2025-09-13 09:01:20','2025-09-13 09:01:20'),(1,5,0,'2025-09-13 09:01:20','2025-09-13 09:01:20'),(1,6,0,'2025-09-13 09:01:20','2025-09-13 09:01:20'),(1,7,0,'2025-09-13 09:01:20','2025-09-13 09:01:20'),(1,8,0,'2025-09-13 09:01:20','2025-09-13 09:01:20'),(1,9,0,'2025-09-13 09:01:20','2025-09-13 09:01:20'),(1,10,0,'2025-09-13 09:01:20','2025-09-13 09:01:20'),(1,11,0,'2025-09-13 09:01:20','2025-09-13 09:01:20'),(1,18,0,'2025-09-13 09:01:20','2025-09-13 09:01:20'),(1,19,0,'2025-09-13 09:01:20','2025-09-13 09:01:20'),(1,20,0,'2025-09-13 09:01:20','2025-09-13 09:01:20'),(1,22,0,'2025-09-13 09:01:20','2025-09-13 09:01:20'),(1,23,0,'2025-09-13 09:01:20','2025-09-13 09:01:20'),(1,24,0,'2025-09-13 09:01:20','2025-09-13 09:01:20'),(2,1,0,'2025-09-13 11:10:38','2025-09-13 11:10:38'),(2,3,0,'2025-09-13 11:10:38','2025-09-13 11:10:38'),(2,4,0,'2025-09-13 11:10:38','2025-09-13 11:10:38'),(2,5,0,'2025-09-13 11:10:38','2025-09-13 11:10:38'),(2,6,0,'2025-09-13 11:10:38','2025-09-13 11:10:38'),(2,7,0,'2025-09-13 11:10:38','2025-09-13 11:10:38'),(2,8,0,'2025-09-13 11:10:38','2025-09-13 11:10:38'),(2,9,0,'2025-09-13 11:10:38','2025-09-13 11:10:38'),(2,10,0,'2025-09-13 11:10:38','2025-09-13 11:10:38'),(2,11,0,'2025-09-13 11:10:38','2025-09-13 11:10:38'),(2,18,0,'2025-09-13 11:10:38','2025-09-13 11:10:38'),(2,19,0,'2025-09-13 11:10:38','2025-09-13 11:10:38'),(2,20,0,'2025-09-13 11:10:38','2025-09-13 11:10:38'),(2,22,0,'2025-09-13 11:10:38','2025-09-13 11:10:38'),(2,23,0,'2025-09-13 11:10:38','2025-09-13 11:10:38'),(2,24,0,'2025-09-13 11:10:38','2025-09-13 11:10:38'),(3,1,0,'2025-09-13 11:13:06','2025-09-13 11:13:06'),(4,1,0,'2025-09-13 11:11:17','2025-09-13 11:11:17'),(4,3,0,'2025-09-13 05:58:31','2025-09-13 05:58:31'),(4,4,0,'2025-09-13 05:58:31','2025-09-13 05:58:31'),(4,5,0,'2025-09-13 05:58:31','2025-09-13 05:58:31'),(4,6,0,'2025-09-13 05:58:31','2025-09-13 05:58:31'),(4,7,0,'2025-09-13 05:58:31','2025-09-13 05:58:31'),(4,9,0,'2025-09-13 11:11:17','2025-09-13 11:11:17'),(4,10,0,'2025-09-13 11:11:17','2025-09-13 11:11:17'),(4,11,0,'2025-09-13 11:11:17','2025-09-13 11:11:17'),(4,18,0,'2025-09-13 11:11:17','2025-09-13 11:11:17'),(4,19,0,'2025-09-13 11:11:17','2025-09-13 11:11:17'),(4,20,0,'2025-09-13 11:11:17','2025-09-13 11:11:17'),(4,22,0,'2025-09-13 11:11:17','2025-09-13 11:11:17'),(4,23,0,'2025-09-13 11:11:17','2025-09-13 11:11:17'),(4,24,0,'2025-09-13 11:11:17','2025-09-13 11:11:17'),(5,1,0,'2025-09-13 11:11:32','2025-09-13 11:11:32'),(5,3,0,'2025-09-13 11:11:32','2025-09-13 11:11:32'),(5,4,0,'2025-09-13 11:11:32','2025-09-13 11:11:32'),(5,5,0,'2025-09-13 11:11:32','2025-09-13 11:11:32'),(5,9,0,'2025-09-13 11:11:32','2025-09-13 11:11:32'),(5,10,0,'2025-09-13 11:11:32','2025-09-13 11:11:32'),(5,11,0,'2025-09-13 11:11:32','2025-09-13 11:11:32'),(5,18,0,'2025-09-13 11:11:32','2025-09-13 11:11:32'),(5,19,0,'2025-09-13 11:11:32','2025-09-13 11:11:32'),(5,20,0,'2025-09-13 11:11:32','2025-09-13 11:11:32'),(5,22,0,'2025-09-13 11:11:32','2025-09-13 11:11:32'),(5,23,0,'2025-09-13 11:11:32','2025-09-13 11:11:32'),(5,24,0,'2025-09-13 11:11:32','2025-09-13 11:11:32'),(14,1,0,'2025-09-14 15:58:44','2025-09-14 15:58:44'),(14,6,0,'2025-09-14 15:58:44','2025-09-14 15:58:44'),(14,8,0,'2025-09-14 15:58:44','2025-09-14 15:58:44');
/*!40000 ALTER TABLE `role_resource` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT 'Unique identifier',
  `username` varchar(50) NOT NULL COMMENT 'Login username',
  `password` varchar(255) NOT NULL COMMENT 'Hashed password',
  `mobile` varchar(11) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '手机号',
  `avatar` varchar(255) NOT NULL COMMENT '头像URL',
  `isDeleted` tinyint NOT NULL DEFAULT '0' COMMENT '是否删除',
  `isEnabled` tinyint NOT NULL DEFAULT '1' COMMENT '启用/禁用',
  `isSystemDefault` tinyint NOT NULL DEFAULT '0' COMMENT '系统默认',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (5,'张三','$2b$10$lJII6PvndCwHO0FPyjXXXexG5uNha0gYIQdPOoFqHMbpGqJ37ONkW','15927700473','',0,1,1,'2025-05-14 14:54:45','2025-09-13 14:00:26'),(6,'李四','$2b$10$lJII6PvndCwHO0FPyjXXXexG5uNha0gYIQdPOoFqHMbpGqJ37ONkW','15927700474','',0,1,1,'2025-05-18 12:54:47','2025-09-13 14:00:26'),(7,'王五','$2b$10$lJII6PvndCwHO0FPyjXXXexG5uNha0gYIQdPOoFqHMbpGqJ37ONkW','15927700475','',0,1,1,'2025-05-18 12:54:58','2025-09-13 14:00:26'),(8,'赵六','$2b$10$lJII6PvndCwHO0FPyjXXXexG5uNha0gYIQdPOoFqHMbpGqJ37ONkW','15927700476','',0,1,1,'2025-05-18 12:55:00','2025-09-13 14:00:26'),(9,'丛楼','$2b$10$lJII6PvndCwHO0FPyjXXXexG5uNha0gYIQdPOoFqHMbpGqJ37ONkW','18688886666','http://abc.com',0,1,1,'2025-08-29 16:07:16','2025-09-13 10:36:53'),(12,'test','$2b$10$inM2maDVx84FO.5huBRdT.TqMzfEWYonMxQaQq67SoG67zFqJs4a.','15900000011','',1,1,0,'2025-09-13 11:30:34','2025-09-13 11:32:45'),(13,'test2','$2b$10$URA81nupHKtxCNUZBz/6d.dTfM7qoUXtEVABuMSo63oF8BCozoYA.','15900000012','',1,1,0,'2025-09-13 11:30:55','2025-09-13 11:33:23');
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_role`
--

DROP TABLE IF EXISTS `user_role`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_role` (
  `userId` int NOT NULL COMMENT 'User ID',
  `roleId` int NOT NULL COMMENT 'Role ID',
  `isDeleted` tinyint NOT NULL DEFAULT '0' COMMENT '是否删除',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`userId`,`roleId`),
  KEY `idx_role_id` (`roleId`),
  CONSTRAINT `FK_ab40a6f0cd7d3ebfcce082131fd` FOREIGN KEY (`userId`) REFERENCES `user` (`id`),
  CONSTRAINT `FK_dba55ed826ef26b5b22bd39409b` FOREIGN KEY (`roleId`) REFERENCES `role` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_role`
--

LOCK TABLES `user_role` WRITE;
/*!40000 ALTER TABLE `user_role` DISABLE KEYS */;
INSERT INTO `user_role` VALUES (5,3,0,'2025-09-13 11:27:11','2025-09-13 11:27:11'),(5,5,0,'2025-09-13 11:27:11','2025-09-13 11:27:11'),(6,5,0,'2025-09-13 11:25:05','2025-09-13 11:25:05'),(7,4,0,'2025-09-13 11:24:58','2025-09-13 11:24:58'),(8,3,0,'2025-09-13 11:24:49','2025-09-13 11:24:49'),(9,1,0,'2025-09-13 11:24:41','2025-09-13 11:24:41');
/*!40000 ALTER TABLE `user_role` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-09-17 23:54:59
