
# Database Setup Guide

## Setup Supabase Database

1. **Go to your Supabase project**: https://pwxltfhjrftruithnhtn.supabase.co

2. **Create Tables**: 
   - Navigate to SQL Editor in your Supabase dashboard
   - Copy and paste the content from `database/schema.sql`
   - Run the query to create all tables and triggers

3. **Import Mock Data**:
   - In SQL Editor, copy and paste the content from `database/seed.sql`
   - Run the query to populate tables with sample data

4. **Verify Setup**:
   - Go to Table Editor in Supabase dashboard
   - Check that all tables are created with data

## Database Structure

The application uses the following tables:
- `profiles` - User profile information
- `clients` - Client management
- `leads` - Lead tracking
- `packages` - Service packages
- `addons` - Additional services
- `team_members` - Freelancer/team management
- `projects` - Project management
- `financial_pockets` - Financial budget management
- `transactions` - Income/expense tracking
- `team_project_payments` - Team member payments per project
- `team_payment_records` - Payment history records
- `reward_ledger_entries` - Team member reward tracking

## Notes

- All tables use UUID primary keys
- Foreign key relationships are established where appropriate
- Timestamps (`created_at`, `updated_at`) are automatically managed
- JSONB fields are used for complex data structures (arrays, objects)
- Indexes are created for performance optimization

## Security

The current setup uses the anonymous key for simplicity. For production:
1. Set up Row Level Security (RLS) policies
2. Implement proper authentication
3. Use service role key only for admin operations
