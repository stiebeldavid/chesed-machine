import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const SHEET_ID = '1ZcEzDod0hW3gBvrNgctQozCc-Je_dfr0WtHXcGC_crw';
    const RANGE = 'A2:C1000'; // Start from row 2 to skip headers, up to 1000 rows
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${RANGE}?key=${Deno.env.get('GOOGLE_SHEETS_API_KEY')}`;

    console.log('Fetching Google Sheet data...');
    const response = await fetch(url);
    const data = await response.json();

    if (!data.values) {
      throw new Error('No data found in sheet');
    }

    // Process the data into separate arrays
    const what: string[] = [];
    const whom: string[] = [];
    const when: string[] = [];

    data.values.forEach((row: string[]) => {
      if (row[0]) what.push(row[0]);
      if (row[1]) whom.push(row[1]);
      if (row[2]) when.push(row[2]);
    });

    // Update the database with new values
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { error: updateError } = await supabase
      .from('idea_components')
      .update({
        what,
        whom,
        when_to: when,
        last_updated: new Date().toISOString()
      })
      .eq('id', 1);

    if (updateError) {
      throw updateError;
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Ideas updated successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});