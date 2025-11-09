import { supabase } from '@/integrations/supabase/client';

interface OAuthDiagnostics {
  googleEnabled: boolean;
  facebookEnabled: boolean;
  googleConfigured: boolean;
  facebookConfigured: boolean;
  redirectUrlConfigured: boolean;
  siteUrlConfigured: boolean;
  errors: string[];
  warnings: string[];
  recommendations: string[];
}

/**
 * Diagnostic tool to check OAuth configuration status
 * Run this to identify issues with Google/Facebook OAuth
 */
export async function diagnoseOAuthSetup(): Promise<OAuthDiagnostics> {
  const diagnostics: OAuthDiagnostics = {
    googleEnabled: false,
    facebookEnabled: false,
    googleConfigured: false,
    facebookConfigured: false,
    redirectUrlConfigured: false,
    siteUrlConfigured: false,
    errors: [],
    warnings: [],
    recommendations: [],
  };

  try {
    // Test Google OAuth
    try {
      const { error: googleError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
          skipBrowserRedirect: true, // Don't actually redirect
        },
      });

      if (!googleError) {
        diagnostics.googleEnabled = true;
        diagnostics.googleConfigured = true;
      } else {
        if (googleError.message?.includes('not enabled') || googleError.message?.includes('Provider not enabled')) {
          diagnostics.errors.push('Google OAuth provider is not enabled in Supabase dashboard');
          diagnostics.recommendations.push(
            'Enable Google OAuth in Supabase: https://supabase.com/dashboard/project/vplgtcguxujxwrgguxqq/auth/providers'
          );
        } else if (googleError.message?.includes('credentials')) {
          diagnostics.googleEnabled = true;
          diagnostics.errors.push('Google OAuth credentials are missing or invalid');
          diagnostics.recommendations.push(
            'Add Google Client ID and Secret in Supabase Auth Providers settings'
          );
        } else {
          diagnostics.warnings.push(`Google OAuth check returned: ${googleError.message}`);
        }
      }
    } catch (e: any) {
      diagnostics.warnings.push(`Google OAuth test failed: ${e.message}`);
    }

    // Test Facebook OAuth
    try {
      const { error: facebookError } = await supabase.auth.signInWithOAuth({
        provider: 'facebook',
        options: {
          redirectTo: window.location.origin,
          skipBrowserRedirect: true, // Don't actually redirect
        },
      });

      if (!facebookError) {
        diagnostics.facebookEnabled = true;
        diagnostics.facebookConfigured = true;
      } else {
        if (facebookError.message?.includes('not enabled') || facebookError.message?.includes('Provider not enabled')) {
          diagnostics.errors.push('Facebook OAuth provider is not enabled in Supabase dashboard');
          diagnostics.recommendations.push(
            'Enable Facebook OAuth in Supabase: https://supabase.com/dashboard/project/vplgtcguxujxwrgguxqq/auth/providers'
          );
        } else if (facebookError.message?.includes('credentials')) {
          diagnostics.facebookEnabled = true;
          diagnostics.errors.push('Facebook OAuth credentials are missing or invalid');
          diagnostics.recommendations.push(
            'Add Facebook App ID and Secret in Supabase Auth Providers settings'
          );
        } else {
          diagnostics.warnings.push(`Facebook OAuth check returned: ${facebookError.message}`);
        }
      }
    } catch (e: any) {
      diagnostics.warnings.push(`Facebook OAuth test failed: ${e.message}`);
    }

    // Check current URL configuration
    const currentUrl = window.location.origin;
    const expectedUrls = [
      'https://686673c3-e550-4efd-907e-ac52efe85ffc.lovableproject.com',
      'http://localhost:3000',
      currentUrl,
    ];

    diagnostics.warnings.push(
      `Current URL: ${currentUrl}. Ensure this is added to Supabase redirect URLs.`
    );

    // Add general recommendations
    if (!diagnostics.googleConfigured || !diagnostics.facebookConfigured) {
      diagnostics.recommendations.push(
        'Follow the complete setup guide in OAUTH_SETUP_GUIDE.md'
      );
    }

    if (diagnostics.errors.length === 0 && diagnostics.warnings.length === 0) {
      diagnostics.recommendations.push('OAuth configuration appears to be correct!');
    }

  } catch (error: any) {
    diagnostics.errors.push(`Diagnostic failed: ${error.message}`);
  }

  return diagnostics;
}

/**
 * Run OAuth diagnostics and display results in console
 */
export async function runOAuthDiagnostics() {
  console.log('🔍 Running OAuth Diagnostics...\n');

  const results = await diagnoseOAuthSetup();

  console.log('📊 OAUTH CONFIGURATION STATUS:');
  console.log('================================\n');

  console.log('✓ Google OAuth:');
  console.log(`  - Enabled: ${results.googleEnabled ? '✅' : '❌'}`);
  console.log(`  - Configured: ${results.googleConfigured ? '✅' : '❌'}\n`);

  console.log('✓ Facebook OAuth:');
  console.log(`  - Enabled: ${results.facebookEnabled ? '✅' : '❌'}`);
  console.log(`  - Configured: ${results.facebookConfigured ? '✅' : '❌'}\n`);

  if (results.errors.length > 0) {
    console.log('❌ ERRORS:');
    results.errors.forEach((error, idx) => {
      console.log(`  ${idx + 1}. ${error}`);
    });
    console.log('');
  }

  if (results.warnings.length > 0) {
    console.log('⚠️  WARNINGS:');
    results.warnings.forEach((warning, idx) => {
      console.log(`  ${idx + 1}. ${warning}`);
    });
    console.log('');
  }

  if (results.recommendations.length > 0) {
    console.log('💡 RECOMMENDATIONS:');
    results.recommendations.forEach((rec, idx) => {
      console.log(`  ${idx + 1}. ${rec}`);
    });
    console.log('');
  }

  console.log('================================');
  console.log('📖 For detailed setup instructions, see:');
  console.log('   - OAUTH_SETUP_GUIDE.md');
  console.log('   - OAUTH_IMPLEMENTATION_STATUS.md\n');

  return results;
}

// Make it available globally for easy testing
if (typeof window !== 'undefined') {
  (window as any).runOAuthDiagnostics = runOAuthDiagnostics;
  (window as any).diagnoseOAuthSetup = diagnoseOAuthSetup;
}
