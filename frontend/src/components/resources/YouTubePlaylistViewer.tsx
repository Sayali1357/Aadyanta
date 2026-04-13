import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle2, PlayCircle, ExternalLink, List } from 'lucide-react';

interface YouTubePlaylistViewerProps {
    playlistId: string;
    title: string;
    onMarkComplete?: (videoId: string) => void;
    completedVideos?: string[];
}

interface PlaylistItem {
    id: string;
    title: string;
    description: string;
    thumbnail: string;
    videoId: string;
    duration: string;
    position: number;
}

const YouTubePlaylistViewer = ({
    playlistId,
    title,
    onMarkComplete,
    completedVideos = [],
}: YouTubePlaylistViewerProps) => {
    const [videos, setVideos] = useState<PlaylistItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentVideo, setCurrentVideo] = useState<PlaylistItem | null>(null);
    const [showPlaylist, setShowPlaylist] = useState(false);

    useEffect(() => {
        fetchPlaylistItems();
    }, [playlistId]);

    const fetchPlaylistItems = async () => {
        const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;

        if (!apiKey) {
            setError('YouTube API key not configured');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(
                `https://www.googleapis.com/youtube/v3/playlistItems?` +
                `part=snippet,contentDetails&maxResults=50&playlistId=${playlistId}&key=${apiKey}`
            );

            if (!response.ok) {
                throw new Error('Failed to fetch playlist');
            }

            const data = await response.json();

            const items: PlaylistItem[] = data.items.map((item: any, index: number) => ({
                id: item.id,
                title: item.snippet.title,
                description: item.snippet.description,
                thumbnail: item.snippet.thumbnails.medium.url,
                videoId: item.contentDetails.videoId,
                duration: 'Duration not available',
                position: index,
            }));

            setVideos(items);
            if (items.length > 0) {
                setCurrentVideo(items[0]);
            }
            setLoading(false);
        } catch (err) {
            console.error('Error fetching playlist:', err);
            setError('Failed to load playlist. Please check the playlist ID and API key.');
            setLoading(false);
        }
    };

    const handleVideoSelect = (video: PlaylistItem) => {
        setCurrentVideo(video);
        setShowPlaylist(false);
    };

    const handleMarkComplete = () => {
        if (currentVideo && onMarkComplete) {
            onMarkComplete(currentVideo.videoId);
        }
    };

    const isVideoCompleted = (videoId: string) => {
        return completedVideos.includes(videoId);
    };

    const completedCount = videos.filter((v) => isVideoCompleted(v.videoId)).length;
    const progressPercentage = videos.length > 0 ? Math.round((completedCount / videos.length) * 100) : 0;

    if (loading) {
        return (
            <Card className="p-6">
                <Skeleton className="h-8 w-64 mb-4" />
                <Skeleton className="aspect-video w-full mb-4" />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                </div>
            </Card>
        );
    }

    if (error) {
        return (
            <Card className="p-6 border-destructive">
                <p className="text-destructive">{error}</p>
                <Button
                    variant="outline"
                    className="mt-4"
                    asChild
                >
                    <a
                        href={`https://www.youtube.com/playlist?list=${playlistId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        View on YouTube <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                </Button>
            </Card>
        );
    }

    return (
        <Card className="overflow-hidden">
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-1">{title}</h3>
                        <p className="text-sm opacity-90">
                            {videos.length} videos • {completedCount} completed
                        </p>
                    </div>
                    <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setShowPlaylist(!showPlaylist)}
                        className="ml-2"
                    >
                        <List className="h-4 w-4 mr-1" />
                        {showPlaylist ? 'Hide' : 'Show'} List
                    </Button>
                </div>

                {/* Progress Bar */}
                <div className="bg-white/20 rounded-full h-2 overflow-hidden">
                    <div
                        className="bg-white h-full transition-all duration-500"
                        style={{ width: `${progressPercentage}%` }}
                    />
                </div>
                <p className="text-xs mt-1 opacity-75">{progressPercentage}% Complete</p>
            </div>

            {/* Video Player */}
            {currentVideo && (
                <div className="relative">
                    <div className="aspect-video bg-black">
                        <iframe
                            width="100%"
                            height="100%"
                            src={`https://www.youtube.com/embed/${currentVideo.videoId}`}
                            title={currentVideo.title}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="w-full h-full"
                        />
                    </div>

                    {/* Video Info */}
                    <div className="p-4">
                        <div className="flex items-start justify-between gap-4 mb-3">
                            <div className="flex-1">
                                <h4 className="font-semibold text-base mb-1">{currentVideo.title}</h4>
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                    {currentVideo.description}
                                </p>
                            </div>
                            {isVideoCompleted(currentVideo.videoId) && (
                                <Badge className="bg-green-100 text-green-700 border-green-300">
                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                    Completed
                                </Badge>
                            )}
                        </div>

                        <div className="flex gap-2">
                            {!isVideoCompleted(currentVideo.videoId) && (
                                <Button onClick={handleMarkComplete} size="sm">
                                    <CheckCircle2 className="h-4 w-4 mr-2" />
                                    Mark as Complete
                                </Button>
                            )}
                            <Button variant="outline" size="sm" asChild>
                                <a
                                    href={`https://www.youtube.com/watch?v=${currentVideo.videoId}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    Open in YouTube <ExternalLink className="ml-2 h-3 w-3" />
                                </a>
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Playlist */}
            {showPlaylist && (
                <div className="border-t max-h-96 overflow-y-auto">
                    <div className="p-2 space-y-1">
                        {videos.map((video) => (
                            <button
                                key={video.id}
                                onClick={() => handleVideoSelect(video)}
                                className={`w-full p-3 rounded-lg text-left hover:bg-secondary/50 transition-colors ${currentVideo?.id === video.id ? 'bg-secondary' : ''
                                    }`}
                            >
                                <div className="flex gap-3">
                                    <div className="relative flex-shrink-0">
                                        <img
                                            src={video.thumbnail}
                                            alt={video.title}
                                            className="w-24 h-16 object-cover rounded"
                                        />
                                        {isVideoCompleted(video.videoId) && (
                                            <div className="absolute inset-0 bg-black/50 rounded flex items-center justify-center">
                                                <CheckCircle2 className="h-6 w-6 text-green-400" />
                                            </div>
                                        )}
                                        {currentVideo?.id === video.id && !isVideoCompleted(video.videoId) && (
                                            <div className="absolute inset-0 bg-black/50 rounded flex items-center justify-center">
                                                <PlayCircle className="h-6 w-6 text-white" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium line-clamp-2 mb-1">{video.title}</p>
                                        <p className="text-xs text-muted-foreground">
                                            Video {video.position + 1} of {videos.length}
                                        </p>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </Card>
    );
};

export default YouTubePlaylistViewer;
