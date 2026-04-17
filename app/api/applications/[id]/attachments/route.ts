import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { Attachment } from '@/types/application';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const formData = await req.formData();
    const fileEntry = formData.get('file');
    const type = formData.get('type') as 'cv' | 'cover_letter' | 'other' | null;

    if (!fileEntry || !(fileEntry instanceof File)) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    const file = fileEntry;

    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get current application to retrieve existing attachments
    const { data: app, error: fetchError } = await supabase
      .from('applications')
      .select('attachments')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (fetchError) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    // Upload file to Supabase Storage
    const fileExt = file.name.split('.').pop() || 'bin';
    const fileName = `${user.id}/${id}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `applications/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('application-attachments')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json(
        { error: 'Failed to upload file' },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('application-attachments')
      .getPublicUrl(filePath);

    // Create attachment object
    const newAttachment: Attachment = {
      id: crypto.randomUUID(),
      name: file.name,
      url: urlData.publicUrl,
      type: type || 'other',
      uploaded_at: new Date().toISOString(),
    };

    // Update application with new attachment
    const existingAttachments: Attachment[] = (app.attachments as Attachment[]) || [];
    const updatedAttachments = [...existingAttachments, newAttachment];

    const { error: updateError } = await supabase
      .from('applications')
      .update({ attachments: updatedAttachments })
      .eq('id', id)
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to save attachment' },
        { status: 500 }
      );
    }

    return NextResponse.json(newAttachment);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const attachmentId = searchParams.get('attachmentId');

    if (!attachmentId) {
      return NextResponse.json(
        { error: 'Attachment ID required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get current application
    const { data: app, error: fetchError } = await supabase
      .from('applications')
      .select('attachments')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (fetchError) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    const attachments: Attachment[] = (app.attachments as Attachment[]) || [];
    const attachment = attachments.find(a => a.id === attachmentId);

    if (!attachment) {
      return NextResponse.json(
        { error: 'Attachment not found' },
        { status: 404 }
      );
    }

    // Delete file from storage
    // Extract file path from URL (format: https://...supabase.co/storage/v1/object/public/application-attachments/path/to/file)
    const urlParts = attachment.url.split('/application-attachments/');
    const filePath = urlParts.length > 1 ? urlParts[1] : attachment.url.split('/').pop() || '';
    
    if (filePath) {
      await supabase.storage
        .from('application-attachments')
        .remove([filePath]);
    }

    // Remove attachment from array
    const updatedAttachments = attachments.filter(a => a.id !== attachmentId);

    const { error: updateError } = await supabase
      .from('applications')
      .update({ attachments: updatedAttachments })
      .eq('id', id)
      .eq('user_id', user.id);

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to remove attachment' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

