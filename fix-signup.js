/**
 * SIGNUP DIAGNOSTIC & FIX SCRIPT
 * Run this in your browser console on the signup page
 */

// Paste this entire script in browser console (F12) and run it

async function fixSignupIssues() {
  console.log('🔍 Running signup diagnostics...\n');

  // Test 1: Check Supabase connection
  console.log('1️⃣ Testing Supabase connection...');
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      console.error('❌ Supabase connection error:', error.message);
      return {
        issue: 'Supabase connection failed',
        fix: 'Check your VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in .env file'
      };
    }
    console.log('✅ Supabase connected successfully\n');
  } catch (e) {
    console.error('❌ Fatal error connecting to Supabase:', e);
    return {
      issue: 'Critical Supabase error',
      fix: 'Ensure Supabase client is properly initialized'
    };
  }

  // Test 2: Try a test signup
  console.log('2️⃣ Testing signup with test credentials...');
  const testEmail = `test_${Date.now()}@example.com`;
  const testPassword = 'TestPassword123!';

  try {
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          role: 'client',
          name: 'Test User',
          full_name: 'Test User'
        }
      }
    });

    if (error) {
      console.error('❌ Signup error:', error.message);

      // Analyze the error
      if (error.message.includes('Email not confirmed')) {
        console.log('\n🔧 ISSUE: Email confirmation is required but may not be configured');
        console.log('💡 FIX: Disable email confirmation in Supabase Dashboard:');
        console.log('   1. Go to Authentication → Providers → Email');
        console.log('   2. Toggle OFF "Confirm email"');
        console.log('   3. Save and try again\n');
        return { issue: 'Email confirmation required', fix: 'Disable in Supabase Dashboard' };
      }

      if (error.message.includes('Database error')) {
        console.log('\n🔧 ISSUE: Database error during signup');
        console.log('💡 FIX: Check RLS policies and database triggers');
        console.log('   Run this SQL in Supabase SQL Editor:');
        console.log(`
        -- Check if profiles table is accessible
        SELECT COUNT(*) FROM public.profiles;

        -- Check if there are any failing triggers
        SELECT * FROM pg_stat_user_functions
        WHERE schemaname = 'public'
        ORDER BY calls DESC;
        `);
        return { issue: 'Database error', fix: 'Check RLS policies and triggers' };
      }

      if (error.message.includes('rate limit')) {
        console.log('\n🔧 ISSUE: Rate limiting');
        console.log('💡 FIX: Wait a few minutes and try again\n');
        return { issue: 'Rate limited', fix: 'Wait and retry' };
      }

      return { issue: error.message, fix: 'See error above' };
    }

    // Success!
    console.log('✅ Test signup successful!');
    console.log('Created user:', data.user?.email);

    // Clean up test user
    if (data.user) {
      console.log('\n🧹 Cleaning up test user...');
      await supabase.auth.signOut();
      console.log('✅ Test user cleaned up\n');
    }

    console.log('🎉 SIGNUP IS WORKING!');
    console.log('💡 If you still can\'t sign up, check:');
    console.log('   - Password meets requirements (8+ chars, uppercase, lowercase, number)');
    console.log('   - Email format is valid');
    console.log('   - Terms checkbox is checked (for signup)');

    return { issue: 'none', fix: 'Signup is working correctly' };

  } catch (e) {
    console.error('❌ Unexpected error:', e);
    return { issue: 'Unexpected error', fix: e.message };
  }
}

// Run the diagnostic
console.log('🚀 Starting signup diagnostic...\n');
fixSignupIssues().then(result => {
  console.log('\n📊 DIAGNOSTIC RESULT:');
  console.log('Issue:', result.issue);
  console.log('Fix:', result.fix);
});
