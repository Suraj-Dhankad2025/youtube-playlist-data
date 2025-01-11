import { google } from 'googleapis';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { channelId } = req.query;

  if (!channelId) {
    return res.status(400).json({ error: 'Channel ID is required' });
  }

  if (!process.env.YOUTUBE_API_KEY) {
    return res.status(500).json({ error: 'YouTube API key is not configured' });
  }

  const youtube = google.youtube('v3');
  
  try {
    const response = await youtube.playlists.list({
      key: process.env.YOUTUBE_API_KEY,
      part: ['snippet', 'contentDetails', 'status'],
      channelId: channelId as string,
      maxResults: 50
    });

    if (!response.data.items) {
      return res.status(200).json([]);
    }

    const playlists = response.data.items.map(item => ({
      id: item.id,
      title: item.snippet?.title,
      description: item.snippet?.description,
      thumbnails: item.snippet?.thumbnails,
      itemCount: item.contentDetails?.itemCount,
      privacyStatus: item.status?.privacyStatus,
      publishedAt: item.snippet?.publishedAt
    }));

    res.status(200).json(playlists);
  } catch (error) {
    console.error('Error fetching channel playlists:', error);
    res.status(500).json({ error: 'Failed to fetch channel playlists' });
  }
}