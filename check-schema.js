const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://vplgtcguxujxwrgguxqq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwbGd0Y2d1eHVqeHdyZ2d1eHFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwMDI5MDIsImV4cCI6MjA2MzU3ODkwMn0.-TzSQ-nDho4J6TftVF4RNjbhr5cKbknQxxUT-AaSIJU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  try {
    console.log('Checking Supabase schema...\n');

    // Check conversations table
    console.log('=== CONVERSATIONS TABLE ===');
    const { data: convData, error: convError } = await supabase.rpc('get_column_names', {
      table_name: 'conversations'
    }).catch(() => ({ data: null, error: 'RPC not available' }));

    // Alternative: try to select one row to see the schema
    const { data: conversations, error: convErr } = await supabase
      .from('conversations')
      .select('*')
      .limit(1);

    if (convErr) {
      console.log('Error querying conversations:', convErr.message);
    } else if (conversations && conversations.length > 0) {
      const columns = Object.keys(conversations[0]);
      console.log('Columns found:', columns);

      const hasClientId = columns.includes('client_id');
      const hasOwnerId = columns.includes('owner_id');
      const hasParticipant1 = columns.includes('participant_1_id');
      const hasParticipant2 = columns.includes('participant_2_id');

      console.log('✓ Has client_id:', hasClientId);
      console.log('✓ Has owner_id:', hasOwnerId);
      console.log('✓ Has participant_1_id:', hasParticipant1);
      console.log('✓ Has participant_2_id:', hasParticipant2);

      if (!hasClientId || !hasOwnerId) {
        console.log('❌ MIGRATION NOT APPLIED: Missing client_id/owner_id columns');
      } else {
        console.log('✅ Migration applied: client_id/owner_id columns exist');
      }
    } else {
      console.log('No conversations found to check schema');
      // Try getting schema info from information_schema
      const { data: schemaInfo, error: schemaErr } = await supabase
        .rpc('get_table_columns', {
          p_table_name: 'conversations',
          p_schema: 'public'
        })
        .catch(() => null);

      if (schemaInfo) {
        console.log('Schema info:', schemaInfo);
      }
    }

    // Check conversation_messages table
    console.log('\n=== CONVERSATION_MESSAGES TABLE ===');
    const { data: messages, error: msgErr } = await supabase
      .from('conversation_messages')
      .select('*')
      .limit(1);

    if (msgErr) {
      console.log('Error querying conversation_messages:', msgErr.message);
    } else if (messages && messages.length > 0) {
      const columns = Object.keys(messages[0]);
      console.log('Columns found:', columns);

      const hasMessageText = columns.includes('message_text');
      const hasContent = columns.includes('content');
      const hasMessageType = columns.includes('message_type');

      console.log('✓ Has message_text:', hasMessageText);
      console.log('✓ Has content:', hasContent);
      console.log('✓ Has message_type:', hasMessageType);

      if (!hasMessageText) {
        console.log('❌ MIGRATION NOT APPLIED: Missing message_text column');
      } else {
        console.log('✅ Migration applied: message_text column exists');
      }
    } else {
      console.log('No messages found to check schema');
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

checkSchema();
