# Finorion - Setup Guide

## Supabase Configuration

To connect your Finorion application to Supabase:

1. Open the `.env` file in the project root
2. Replace the placeholder values with your actual Supabase credentials:
   - `VITE_SUPABASE_URL`: Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key

You can find these values in your Supabase project dashboard under Settings > API.

## Database Setup

The database schema has already been created with the following features:
- Sanction watchlist with 10 sample entities
- Screening results storage
- Proper indexes for performance
- Row Level Security (RLS) policies

## Running the Application

The application is automatically running in development mode. Simply interact with the interface to:

1. Enter a customer name to screen
2. Select their country
3. Click "Run Screening" to perform AI-powered analysis
4. View comprehensive risk assessment results
5. Download detailed PDF reports

## Features Included

- Context-aware sanction screening
- Explainable AI system with detailed reasoning
- Adaptive learning capabilities
- Graph and network-based detection
- AML + sanction screening
- Real-time micro decision engine
- Name similarity scoring
- Country risk assessment
- Device IP tracking
- Risk level visualization
- PDF report generation
- Custom logo upload

Enjoy using Finorion!
