import { google } from 'googleapis';
import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { supabase } from '../../lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });
  if (!session?.accessToken) {
    console.error('Access Token missing');
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const youtube = google.youtube('v3');

  try {
    const response = await youtube.playlists.list({
      access_token: session.accessToken as string,
      key: process.env.YOUTUBE_API_KEY,
      part: ['snippet', 'contentDetails', 'status'],
      mine: true,
      maxResults: 50,
    });

    if (!response.data.items) {
      console.log('No playlists found');
      return res.status(200).json([]);
    }

    const playlists = response.data.items.map(item => ({
      id: item.id,
      title: item.snippet?.title,
      description: item.snippet?.description,
      thumbnails: item.snippet?.thumbnails,
      itemCount: item.contentDetails?.itemCount,
      privacyStatus: item.status?.privacyStatus,
      publishedAt: item.snippet?.publishedAt,
    }));

    // for (const playlist of playlists) {
    //   const { error } = await supabase
    //     .from('playlists')
    //     .upsert({
    //       id: playlist.id,
    //       user_id: (await supabase.auth.getUser()).data.user?.id,
    //       title: playlist.title,
    //       description: playlist.description,
    //       thumbnail_url: playlist.thumbnails?.default?.url,
    //       item_count: playlist.itemCount,
    //     }, { onConflict: 'id' });

    //   if (error) {
    //     console.error('Supabase upsert error:', error);
    //     throw new Error('Supabase upsert failed');
    //   }
    // }
    res.status(200).json(playlists);
  } catch (error) {
    console.error('Error fetching playlists:', error);
    res.status(500).json({ error: 'Failed to fetch playlists' });
  }
}