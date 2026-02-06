"use client";

import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import VideoGrid from "@/components/video/video-grid";
import { VideoData } from "@/components/video/video-card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

// Interface for raw video data from API
interface RawVideoData {
  id: string;
  title?: string;
  description?: string | null;
  imageUrls?: string[] | string | null;
  createdAt?: string;
  status?: string;
  [key: string]: unknown; // Allow for other properties with unknown type
}

export default function CommunityPage() {
  const router = useRouter();
  const [videoList, setVideoList] = useState<VideoData[]>([]);
  const [filteredVideos, setFilteredVideos] = useState<VideoData[]>([]);
  const [displayedVideos, setDisplayedVideos] = useState<VideoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const PAGE_SIZE = 8;

  // Process video data to ensure it has all required fields
  const processVideoData = useCallback((video: RawVideoData): VideoData => {
    return {
      id: video.id,
      imageUrls: Array.isArray(video.imageUrls) ? video.imageUrls : [],
      title: video.title || 'Untitled Video',
      description: video.description || null,
      status: video.status || 'completed',
      createdAt: video.createdAt || new Date().toISOString(),
    };
  }, []);

  const fetchVideos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get community videos from the dedicated API
      const response = await axios.get('/api/community', {
        params: {
          _t: new Date().getTime() // Add timestamp to prevent caching
        },
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      // Process the videos to ensure they have all required fields
      const processedVideos = response.data.map(processVideoData);
      
      setVideoList(processedVideos);
      setFilteredVideos(processedVideos);
      setCurrentPage(1); // Reset to first page when new data is loaded
    } catch (err) {
      console.error('Error fetching videos:', err);
      setError('Failed to load videos. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [processVideoData]);

  // Filter videos based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredVideos(videoList);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = videoList.filter(video => 
        video.title.toLowerCase().includes(query) || 
        (video.description && video.description.toLowerCase().includes(query))
      );
      setFilteredVideos(filtered);
    }
    setCurrentPage(1); // Reset to first page when search query changes
  }, [searchQuery, videoList]);

  // Update total pages whenever filtered videos change
  useEffect(() => {
    const newTotalPages = Math.max(1, Math.ceil(filteredVideos.length / PAGE_SIZE));
    setTotalPages(newTotalPages);
    console.log(`Debug: Videos: ${filteredVideos.length}, Page size: ${PAGE_SIZE}, Total pages: ${newTotalPages}`);
  }, [filteredVideos]);

  // Update displayed videos based on current page and filtered videos
  useEffect(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    const endIndex = startIndex + PAGE_SIZE;
    setDisplayedVideos(filteredVideos.slice(startIndex, endIndex));
  }, [filteredVideos, currentPage]);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  const handleBack = () => {
    router.back();
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Generate array of page numbers to display
  const getPageNumbers = () => {
  const maxVisible = 5;
  if (totalPages <= maxVisible) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages = [1];
  let start = Math.max(2, currentPage - 1);
  let end = Math.min(totalPages - 1, currentPage + 1);

  if (currentPage <= 2) end = 4;
  if (currentPage >= totalPages - 1) start = totalPages - 3;

  if (start > 2) pages.push("ellipsis-start");

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (end < totalPages - 1) pages.push("ellipsis-end");

  pages.push(totalPages);
  return pages;
};

return (
  <div className="container mx-auto min-h-screen p-6 border rounded-lg my-4 flex flex-col bg-background">
    <Button
      variant="ghost"
      onClick={handleBack}
      className="mb-6 flex items-center gap-2 w-fit hover:bg-secondary"
    >
      <ArrowLeft size={18} />
      <span>Back to Dashboard</span>
    </Button>

    <header className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
      <div className="space-y-1">
        <h1 className="text-4xl font-extrabold tracking-tight">Community Showcase</h1>
        <p className="text-muted-foreground text-lg">
          Discover and explore the latest creations from our global community.
        </p>
      </div>

      <div className="relative w-full md:max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by title or creator..."
          value={searchQuery}
          onChange={handleSearch}
          className="pl-10 h-11"
        />
        {searchQuery && (
          <span className="absolute -bottom-6 left-0 text-xs font-medium text-primary">
            Found {filteredVideos.length} {filteredVideos.length === 1 ? "video" : "videos"}
          </span>
        )}
      </div>
    </header>

    <div className="flex-1">
      <VideoGrid
        videos={displayedVideos}
        loading={loading}
        error={error}
        onRetry={fetchVideos}
      />
    </div>

    {!loading && filteredVideos.length > 0 && totalPages > 1 && (
      <footer className="mt-12 border-t pt-8">
        <Pagination>
          <PaginationContent>
            {currentPage > 1 && (
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handlePageChange(currentPage - 1);
                  }}
                />
              </PaginationItem>
            )}

            {getPageNumbers().map((page, idx) => (
              <PaginationItem key={`${page}-${idx}`}>
                {typeof page === "string" ? (
                  <PaginationEllipsis />
                ) : (
                  <PaginationLink
                    href="#"
                    isActive={page === currentPage}
                    onClick={(e) => {
                      e.preventDefault();
                      handlePageChange(page);
                    }}
                  >
                    {page}
                  </PaginationLink>
                )}
              </PaginationItem>
            ))}

            {currentPage < totalPages && (
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handlePageChange(currentPage + 1);
                  }}
                />
              </PaginationItem>
            )}
          </PaginationContent>
        </Pagination>
      </footer>
    )}
  </div>
);