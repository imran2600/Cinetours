# Admin Portal Documentation

## Overview
The Admin Portal is a protected section of the application that provides administrative functionality for managing orders, clients, videos, and system settings.

## Table of Contents
1. [Getting Started](#getting-started)
2. [Authentication](#authentication)
3. [Features](#features)
4. [Components](#components)
5. [API Integration](#api-integration)

## Getting Started
### Prerequisites
- Admin account credentials
- Access to the admin login page at `/admin-login`

### Installation
No additional installation is required beyond the main project setup.

## Authentication
The admin portal uses a dedicated authentication system:
- Login endpoint: `/admin-login`
- Register endpoint: `/admin-register`
- Protected routes are managed by `AdminPrivateRoute`
- Authentication state is managed by `AdminAuthProvider`

## Features
### 1. Order Management
- View all customer orders
- Update order status (processing/completed)
- Upload final videos
- Track order progress

### 2. Client Management
- View client information
- Manage client accounts
- Track client activity

### 3. Video Management
- Review generated videos
- Upload final versions
- Manage video assets

### 4. System Settings
- Pricing configuration
- System notifications
- Log monitoring

## Components
The admin portal consists of several key components:

### Main Components
1. **OrderManagement**
   - Location: `/pages/AdminPortal/components/OrderManagement`
   - Purpose: Manage customer orders and their statuses
   - Features: Status updates, video uploads, order tracking

2. **ClientManagement**
   - Location: `/pages/AdminPortal/components/ClientManagement`
   - Purpose: Manage client accounts and information

3. **FinalVideos**
   - Location: `/pages/AdminPortal/components/FinalVideos`
   - Purpose: Handle final video management and delivery

4. **PricingEditor**
   - Location: `/pages/AdminPortal/components/PricingEditor`
   - Purpose: Configure system pricing and packages

### Support Components
- `LogsStatus`: System monitoring and logs
- `Notifications`: System alerts and messages
- `PromptFeedback`: Manage user prompts and feedback

## API Integration
The admin portal integrates with several backend endpoints:

### Core Endpoints
- `/api/admin/orders` - Order management
- `/api/admin/clients` - Client management
- `/api/admin/videos` - Video management
- `/api/admin/settings` - System settings

### Authentication Endpoints
- `/api/admin/auth/login` - Admin login
- `/api/admin/auth/register` - Admin registration
- `/api/admin/auth/refresh` - Token refresh

## Usage Guide
1. **Accessing the Admin Portal**
   - Navigate to `/admin-login`
   - Enter admin credentials
   - Access granted to `/admin` route upon successful authentication

2. **Managing Orders**
   - View orders in the Order Management section
   - Update order status as needed
   - Upload final videos for completed orders

3. **Client Management**
   - Access client information
   - Manage account settings
   - Track client activity and orders

4. **Video Management**
   - Review generated videos
   - Upload and manage final versions
   - Track video processing status

## Security
The admin portal implements several security measures:
- Protected routes using `AdminPrivateRoute`
- JWT-based authentication
- Role-based access control
- Secure API endpoints

## Troubleshooting
Common issues and solutions:

1. **Authentication Issues**
   - Verify admin credentials
   - Check token expiration
   - Clear browser cache if needed

2. **Order Management Issues**
   - Verify API connectivity
   - Check order status updates
   - Confirm video upload permissions

3. **Video Upload Problems**
   - Check file size limits
   - Verify supported formats
   - Ensure proper network connectivity