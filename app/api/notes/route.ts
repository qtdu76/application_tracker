import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch or create notes for this user
    const { data, error } = await supabase
      .from('user_notes')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) {
      // If no notes exist, create an empty one
      if (error.code === 'PGRST116') {
        const { data: newData, error: insertError } = await supabase
          .from('user_notes')
          .insert([{
            user_id: user.id,
            notes: '',
          }])
          .select()
          .single();

        if (insertError) {
          console.error('Error creating notes:', insertError);
          return NextResponse.json(
            { error: 'Failed to create notes' },
            { status: 500 }
          );
        }

        return NextResponse.json(newData);
      }

      console.error('Error fetching notes:', error);
      return NextResponse.json(
        { error: 'Failed to fetch notes' },
        { status: 500 }
      );
    }

    return NextResponse.json(data || { notes: '' });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const supabase = await createClient();
    const body = await req.json();

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Update or create notes for this user
    const { error: fetchError } = await supabase
      .from('user_notes')
      .select('*')
      .eq('user_id', user.id)
      .single();

    let result;
    if (fetchError && fetchError.code === 'PGRST116') {
      // No notes exist, create new
      const { data: newData, error: insertError } = await supabase
        .from('user_notes')
        .insert([{
          user_id: user.id,
          notes: body.notes || '',
        }])
        .select()
        .single();

      if (insertError) {
        console.error('Error creating notes:', insertError);
        return NextResponse.json(
          { error: 'Failed to create notes' },
          { status: 500 }
        );
      }

      result = newData;
    } else if (fetchError) {
      console.error('Error fetching notes:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch notes' },
        { status: 500 }
      );
    } else {
      // Update existing notes
      const { data: updatedData, error: updateError } = await supabase
        .from('user_notes')
        .update({
          notes: body.notes || '',
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating notes:', updateError);
        return NextResponse.json(
          { error: 'Failed to update notes' },
          { status: 500 }
        );
      }

      result = updatedData;
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

