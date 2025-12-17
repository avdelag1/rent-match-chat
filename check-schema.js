const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://vplgtcguxujxwrgguxqq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwbGd0Y2d1eHVqeHdyZ2d1eHFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwMDI5MDIsImV4cCI6MjA2MzU3ODkwMn0.-TzSQ-nDho4J6TftVF4RNjbhr5cKbknQxxUT-AaSIJU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  try {
    // Check conversations table
    const { data: convData, error: convError } = await supabase.rpc('get_column_names', {
      table_name: 'conversations'
    }).catch(() => ({ data: null, error: 'RPC not available' }));

    // Alternative: try to select one row to see the schema
    const { data: conversations, error: convErr } = await supabase
      .from('conversations')
      .select('*')
      .limit(1);

    if (convErr) {
      // Error querying conversations
    } else if (conversations && conversations.length > 0) {
      const columns = Object.keys(conversations[0]);

      const hasClientId = columns.includes('client_id');
      const hasOwnerId = columns.includes('owner_id');
      const hasParticipant1 = columns.includes('participant_1_id');
      const hasParticipant2 = columns.includes('participant_2_id');

      // Check for required columns
      if (!hasClientId || !hasOwnerId) {
        // Missing client_id/owner_id columns
      } else {
        // Migration applied: client_id/owner_id columns exist
      }
    } else {
      // No conversations found to check schema
      // Try getting schema info from information_schema
      const { data: schemaInfo, error: schemaErr } = await supabase
        .rpc('get_table_columns', {
          p_table_name: 'conversations',
          p_schema: 'public'
        })
        .catch(() => null);

      // Schema info available
    }

    // Check conversation_messages table
    const { data: messages, error: msgErr } = await supabase
      .from('conversation_messages')
      .select('*')
      .limit(1);

    if (msgErr) {
      // Error querying conversation_messages
    } else if (messages && messages.length > 0) {
      const columns = Object.keys(messages[0]);

      const hasMessageText = columns.includes('message_text');
      const hasContent = columns.includes('content');
      const hasMessageType = columns.includes('message_type');

      // Check for required columns
      if (!hasMessageText) {
        // Missing message_text column
      } else {
        // Migration applied: message_text column exists
      }
    } else {
      // No messages found to check schema
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

checkSchema();
