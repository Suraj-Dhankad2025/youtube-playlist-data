import { google } from 'googleapis';
import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
// import { supabase } from '../../../lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });
  const { id } = req.query;

  if (!session?.accessToken) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const youtube = google.youtube('v3');
  
  try {
    const response = await youtube.playlistItems.list({
      access_token: session.accessToken as string,
      part: ['snippet', 'contentDetails', 'status'],
      playlistId: id as string,
      maxResults: 50
    });

    if (!response.data.items) {
      return res.status(200).json([]);
    }

    const items = response.data.items.map(item => ({
      id: item.id,
      title: item.snippet?.title,
      description: item.snippet?.description,
      thumbnails: item.snippet?.thumbnails,
      videoId: item.snippet?.resourceId?.videoId,
      position: item.snippet?.position,
      publishedAt: item.snippet?.publishedAt
    }));

    // Store playlist items in Supabase
    
    
    // for (const item of items) {
    //   await supabase
    //     .from('playlist_items')
    //     .upsert({
    //       id: item.id,
    //       playlist_id: id,
    //       video_id: item.videoId,
    //       title: item.title,
    //       description: item.description,
    //       thumbnail_url: item.thumbnails?.default?.url,
    //       position: item.position
    //     }, {
    //       onConflict: 'id'
    //     });
    // }

    res.status(200).json(items);
  } catch (error) {
    console.error('Error fetching playlist items:', error);
    res.status(500).json({ error: 'Failed to fetch playlist items' });
  }
}