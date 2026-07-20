import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Trash2, Image, Video, Cloud } from 'lucide-react';

interface MediaItem {
  id: string;
  filename: string;
  storage_path: string;
  file_type: string;
  media_type: string;
  file_size: number;
  created_at: string;
}

export function MediaPage() {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadMedia();
  }, []);

  const loadMedia = async () => {
    try {
      const { data } = await supabase
        .from('media_library')
        .select('*')
        .order('created_at', { ascending: false });
      setMediaItems(data || []);
    } catch (error) {
      console.error('Failed to load media:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setUploading(true);
    const { data: user } = await supabase.auth.getUser();

    for (const file of Array.from(files)) {
      try {
        const fileExt = file.name.split('.').pop();
        const filePath = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;

        await supabase.storage
          .from('media')
          .upload(filePath, file);

        const mediaType = file.type.startsWith('image/') ? 'image' : 'video';

        await supabase.from('media_library').insert({
          filename: file.name,
          storage_path: filePath,
          file_type: fileExt,
          media_type: mediaType,
          file_size: file.size,
          created_by: user.user?.id,
        });
      } catch (error) {
        console.error('Failed to upload file:', error);
      }
    }

    loadMedia();
    setUploading(false);
  };

  const handleDelete = async (id: string, path: string) => {
    if (confirm('Delete this file?')) {
      try {
        await supabase.storage.from('media').remove([path]);
        await supabase.from('media_library').delete().eq('id', id);
        loadMedia();
      } catch (error) {
        console.error('Failed to delete file:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-12 h-12 rounded-full border-4 border-cream-100 border-t-[#b98545] animate-spin-slow" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="animate-fade-in">
        <h1 className="text-4xl md:text-5xl font-bold text-navy-800 mb-2">
          Media Library
        </h1>
        <p className="text-[#6b7280]">Manage all your uploaded images and videos</p>
      </div>

      {/* Upload Section */}
      <div className="glass-dark card-base border-2 border-dashed border-charcoal-300 rounded-2xl p-12 hover:border-[#b98545]/50 transition-all duration-300 animate-slide-up">
        <label className="cursor-pointer flex flex-col items-center gap-4">
          <div className="p-4 bg-gradient-to-br from-[#b98545]/20 to-[#b98545]/10 rounded-2xl group-hover:scale-110 transition-transform">
            <Cloud size={48} className="text-[#b98545]" />
          </div>
          <div className="text-center">
            <p className="text-[#1f2937] font-semibold mb-1 text-lg">
              Drop files here or click to upload
            </p>
            <p className="text-[#6b7280] text-sm">Supports images and videos</p>
          </div>
          <input
            type="file"
            multiple
            accept="image/*,video/*"
            onChange={handleFileUpload}
            disabled={uploading}
            className="hidden"
          />
        </label>
      </div>

      {/* Media Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {mediaItems.map((item, index) => (
          <div
            key={item.id}
            style={{ animationDelay: `${index * 50}ms` }}
            className="glass-dark card-base border border-charcoal-200 overflow-hidden hover-lift group animate-slide-up"
          >
            {/* Placeholder Thumbnail */}
            <div className="w-full h-48 bg-gradient-to-br from-white/[0.08] to-white/[0.02] flex items-center justify-center relative overflow-hidden">
              {item.media_type === 'image' ? (
                <Image size={48} className="text-[#b98545]/50" />
              ) : (
                <Video size={48} className="text-[#b98545]/50" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            <div className="p-4">
              <p className="text-[#1f2937] font-semibold text-sm truncate mb-2 group-hover:text-[#b98545] transition-colors">
                {item.filename}
              </p>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[#6b7280] text-xs">
                  {(item.file_size / 1024 / 1024).toFixed(2)} MB
                </span>
                <span className="badge badge-primary text-xs">
                  {item.file_type?.toUpperCase()}
                </span>
              </div>
              <p className="text-[#9ca3af] text-xs mb-4">
                {new Date(item.created_at).toLocaleDateString()}
              </p>

              <button
                onClick={() => handleDelete(item.id, item.storage_path)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-300 rounded-lg transition-all font-semibold text-sm hover:scale-105 transform duration-300"
              >
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {mediaItems.length === 0 && (
        <div className="text-center py-16">
          <Image size={48} className="text-[#b98545]/30 mx-auto mb-4" />
          <p className="text-[#6b7280]">No media files uploaded yet</p>
        </div>
      )}
    </div>
  );
}
