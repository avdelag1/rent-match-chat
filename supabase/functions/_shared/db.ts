import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Authenticate user using email and password
 */
export const authenticateUser = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { user: data?.user, error };
};

/**
 * Fetch user profile
 */
export const fetchUserProfile = async (userId: string) => {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
    return { data, error };
};

/**
 * Check if user is an admin
 */
export const isAdmin = async (userId: string) => {
    const { data, error } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', userId)
        .single();
    return { isAdmin: data?.is_admin, error };
};

/**
 * Log audit event
 */
export const logAuditEvent = async (eventDetails: string) => {
    const { error } = await supabase
        .from('audit_logs')
        .insert([{ details: eventDetails }]);
    return { error };
};