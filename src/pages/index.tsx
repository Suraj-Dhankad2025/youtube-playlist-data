'use client'
import { useSession, signIn, signOut } from 'next-auth/react';
import { useState, useEffect } from 'react';
import type { Playlist, PlaylistItem } from '../types/youtube';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Loader } from '../components/loader';

export default function Home() {
  const { data: session } = useSession();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState<string | null>(null);
  const [playlistItems, setPlaylistItems] = useState<PlaylistItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [channelId, setChannelId] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);

  useEffect(() => {
    if (session && !isSearching) {
      fetchUserPlaylists();
    }
  }, [session, isSearching]);

  useEffect(() => {
    if (selectedPlaylist) {
      fetchPlaylistItems(selectedPlaylist);
    }
  }, [selectedPlaylist]);

  const fetchUserPlaylists = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/playlists');
      if (!response.ok) throw new Error('Failed to fetch playlists');
      const data = await response.json();
      setPlaylists(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchChannelPlaylists = async (channelId: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/channel-playlists?channelId=${channelId}`);
      if (!response.ok) throw new Error('Failed to fetch channel playlists');
      const data = await response.json();
      setPlaylists(data);
      setIsSearching(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchPlaylistItems = async (playlistId: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/playlist/${playlistId}`);
      if (!response.ok) throw new Error('Failed to fetch playlist items');
      const data = await response.json();
      setPlaylistItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (channelId.trim()) {
      fetchChannelPlaylists(channelId.trim());
    }
  };

  const handleReset = () => {
    setIsSearching(false);
    setChannelId('');
    setSelectedPlaylist(null);
    setPlaylistItems([]);
  };

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Button
          onClick={() => signIn('google')}
          className="text-lg"
          size="lg"
        >
          Sign in with Google
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold text-foreground">YouTube Playlists</h1>
          <Button
            onClick={() => signOut()}
            variant="destructive"
          >
            Sign Out
          </Button>
        </div>

        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSearch} className="flex gap-4">
              <Input
                type="text"
                value={channelId}
                onChange={(e) => setChannelId(e.target.value)}
                placeholder="Enter YouTube Channel ID"
                className="flex-1"
              />
              <Button type="submit">
                Search
              </Button>
              {isSearching && (
                <Button
                  type="button"
                  onClick={handleReset}
                  variant="secondary"
                >
                  Show My Playlists
                </Button>
              )}
            </form>
          </CardContent>
        </Card>

        {error && (
          <div className="bg-destructive/15 border border-destructive text-destructive px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {loading ? (
          <Loader />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>
                  {isSearching ? 'Channel Playlists' : 'Your Playlists'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {playlists.map((playlist) => (
                    <div
                      key={playlist.id}
                      onClick={() => setSelectedPlaylist(playlist.id)}
                      className={`cursor-pointer p-4 rounded-lg border transition-all hover:shadow-md ${
                        selectedPlaylist === playlist.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <h3 className="font-medium text-foreground">{playlist.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {playlist.itemCount} videos
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Playlist Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {playlistItems.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 border rounded-lg hover:border-primary/50 transition-all hover:shadow-md"
                    >
                      <h3 className="font-medium text-foreground">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                      {item.thumbnails?.default && (
                        <img
                          src={item.thumbnails.default.url}
                          alt={item.title}
                          className="mt-2 rounded-md"
                          width={item.thumbnails.default.width}
                          height={item.thumbnails.default.height}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}