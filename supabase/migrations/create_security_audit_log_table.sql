-- Create security audit log table for Step 4.4 security features
CREATE TABLE IF NOT EXISTS security_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL CHECK (type IN ('unauthorized_access', 'role_violation', 'csrf_violation', 'rate_limit_exceeded', 'auth_failure', 'permission_denied')),
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    session_id TEXT,
    ip_address TEXT NOT NULL,
    user_agent TEXT NOT NULL,
    path TEXT NOT NULL,
    method TEXT NOT NULL,
    details JSONB DEFAULT '{}',
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_security_audit_log_type ON security_audit_log(type);
CREATE INDEX idx_security_audit_log_severity ON security_audit_log(severity);
CREATE INDEX idx_security_audit_log_user_id ON security_audit_log(user_id);
CREATE INDEX idx_security_audit_log_timestamp ON security_audit_log(timestamp);
CREATE INDEX idx_security_audit_log_ip_address ON security_audit_log(ip_address);
CREATE INDEX idx_security_audit_log_resolved ON security_audit_log(resolved);

-- Create composite indexes for common queries
CREATE INDEX idx_security_audit_log_type_severity ON security_audit_log(type, severity);
CREATE INDEX idx_security_audit_log_timestamp_resolved ON security_audit_log(timestamp, resolved);

-- Enable RLS
ALTER TABLE security_audit_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for security audit log
-- Only admin users can view security audit logs
CREATE POLICY "Admin users can view security audit logs"
ON security_audit_log FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_id = auth.uid() 
        AND role IN ('admin', 'super_admin') 
        AND is_active = true
    )
);

-- Only admin users can insert security audit logs (system inserts)
CREATE POLICY "Admin users can insert security audit logs"
ON security_audit_log FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_id = auth.uid() 
        AND role IN ('admin', 'super_admin') 
        AND is_active = true
    )
);

-- Only admin users can update security audit logs (for resolving events)
CREATE POLICY "Admin users can update security audit logs"
ON security_audit_log FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_id = auth.uid() 
        AND role IN ('admin', 'super_admin') 
        AND is_active = true
    )
);

-- Function to automatically clean up old audit logs (older than 1 year)
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    DELETE FROM security_audit_log 
    WHERE timestamp < NOW() - INTERVAL '1 year'
    AND resolved = true;
END;
$$;

-- Create a scheduled job to run cleanup (if pg_cron is available)
-- This would typically be set up by an admin
-- SELECT cron.schedule('cleanup-audit-logs', '0 2 * * 0', 'SELECT cleanup_old_audit_logs();');

COMMENT ON TABLE security_audit_log IS 'Security audit log for tracking unauthorized access attempts and security events';
COMMENT ON COLUMN security_audit_log.type IS 'Type of security event';
COMMENT ON COLUMN security_audit_log.severity IS 'Severity level of the security event';
COMMENT ON COLUMN security_audit_log.details IS 'Additional details about the security event in JSON format';
COMMENT ON COLUMN security_audit_log.resolved IS 'Whether the security event has been reviewed and resolved';
COMMENT ON FUNCTION cleanup_old_audit_logs() IS 'Automatically clean up resolved audit logs older than 1 year';
