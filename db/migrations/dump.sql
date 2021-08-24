
SET NAMES utf8mb4;





CREATE TABLE `jobs` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `type` varchar(200) DEFAULT NULL,
  `userId` int(11) DEFAULT NULL,
  `input` json DEFAULT NULL,
  `cursor` varchar(255) DEFAULT NULL,
  `lastError` text,
  `reqNum` int(11) DEFAULT '0',
  `ep2_reqNum` int(11) DEFAULT NULL,
  `ep3_reqNum` int(11) DEFAULT NULL,
  `status` varchar(100) DEFAULT 'created',
  `ep2_status` varchar(100) DEFAULT NULL,
  `ep3_status` varchar(100) DEFAULT NULL,
  `lastErrorAt` timestamp NULL DEFAULT NULL,
  `finishedAt` timestamp NULL DEFAULT NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `pausedAt` timestamp NULL DEFAULT NULL,
  `updatedAt` timestamp NULL DEFAULT NULL,
  `ep2_pausedAt` timestamp NULL DEFAULT NULL,
  `ep2_updatedAt` timestamp NULL DEFAULT NULL,
  `ep3_pausedAt` timestamp NULL DEFAULT NULL,
  `ep3_updatedAt` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


CREATE TABLE `ig_profiles` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `pk` varchar(200) DEFAULT NULL,
  `jobId` int(10) unsigned DEFAULT NULL,
  `username` varchar(300) DEFAULT NULL,
  `isPrivate` tinyint(1) DEFAULT NULL,
  `isBusiness` tinyint(1) DEFAULT NULL,
  `ep2_isDone` tinyint(1) NOT NULL DEFAULT '0',
  `ep3_isDone` tinyint(1) NOT NULL DEFAULT '0',
  `isVerified` tinyint(1) DEFAULT NULL,
  `followerCount` bigint(20) DEFAULT NULL,
  `followingCount` bigint(20) DEFAULT NULL,
  `fullName` varchar(300) DEFAULT NULL,
  `email` varchar(200) DEFAULT NULL,
  `anonEmail` varchar(200) DEFAULT NULL,
  `phone` varchar(200) DEFAULT NULL,
  `category` varchar(200) DEFAULT NULL,
  `data` json DEFAULT NULL,
  `anonData` json DEFAULT NULL,
  `ep2_doneAt` timestamp NULL DEFAULT NULL,
  `ep3_doneAt` timestamp NULL DEFAULT NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `jobId_4` (`jobId`,`username`),
  KEY `jobId` (`jobId`),
  KEY `ep3_isDone` (`ep3_isDone`),
  KEY `jobId_2` (`jobId`,`ep2_isDone`),
  KEY `jobId_3` (`jobId`,`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;




