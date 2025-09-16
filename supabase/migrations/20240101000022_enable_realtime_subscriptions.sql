-- Migration: Enable Real-time Subscriptions on Critical Tables
-- File: 20240101000022_enable_realtime_subscriptions.sql
-- Description: Enables real-time functionality on all critical tables for live updates

BEGIN;

-- Enable real-time on critical tables (Build Guide Line 5009-5015)
ALTER PUBLICATION supabase_realtime ADD TABLE matches;
ALTER PUBLICATION supabase_realtime ADD TABLE match_statistics;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE training_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE user_roles;
ALTER PUBLICATION supabase_realtime ADD TABLE team_announcements;

-- Add performance indexes optimized for real-time queries (Build Guide Line 5020-5022)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_matches_realtime 
    ON matches (home_team_id, away_team_id, status, match_date);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_realtime 
    ON notifications (user_id, is_read, created_at);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_realtime 
    ON messages (team_id, created_at);

-- Additional performance indexes for real-time efficiency
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_match_statistics_realtime 
    ON match_statistics (match_id, player_id, stat_type, created_at);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_roles_realtime 
    ON user_roles (user_id, team_id, is_active);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_team_announcements_realtime 
    ON team_announcements (team_id, created_at);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_training_sessions_realtime 
    ON training_sessions (team_id, session_date, status);

-- Create helper function to verify real-time setup
CREATE OR REPLACE FUNCTION get_realtime_tables()
RETURNS TABLE (table_name TEXT, schema_name TEXT) AS $$
BEGIN
    RETURN QUERY
    SELECT pt.tablename::TEXT, pt.schemaname::TEXT
    FROM pg_publication_tables pt
    WHERE pt.pubname = 'supabase_realtime';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant access to the helper function
GRANT EXECUTE ON FUNCTION get_realtime_tables() TO authenticated;

COMMIT;
