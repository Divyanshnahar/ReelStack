import React from "react";
import { Composition, staticFile, getInputProps } from "remotion";
import VideoComposition from "./composition";
import { Video } from "@/components/video/video-player";

export const RemotionRoot: React.FC = () => {
  const propsFromInput = getInputProps<{ video?: Video }>();
  const videoData = propsFromInput?.video;

  if (!videoData) {
    console.error("No video data passed via --props. Composition will not render.");
    return null;
  }

  const captions = videoData?.captions || [];
  const lastCaptionEnd = captions.length > 0 ? captions[captions.length - 1].end : 10;
  const durationInFrames = Number((lastCaptionEnd * 30).toFixed(0)) + 10;

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          @font-face {
            font-family: 'Geist';
            src: url(${staticFile('/fonts/Geist-Regular.woff2')}) format('woff2');
            font-weight: normal;
            font-style: normal;
          }
          @font-face {
            font-family: 'Geist';
            src: url(${staticFile('/fonts/Geist-Bold.woff2')}) format('woff2');
            font-weight: bold;
            font-style: normal;
          }
          @font-face {
            font-family: 'Geist';
            src: url(${staticFile('/fonts/Geist-Light.woff2')}) format('woff2');
            font-weight: 300;
            font-style: normal;
          }
        `
      }} />
      <Composition
        id="ReelsStackRenderedVideo"
        component={VideoComposition}
        durationInFrames={durationInFrames}
        fps={30}
        width={720}
        height={1280}
        defaultProps={{ 
          video: videoData
        }}
      />
    </>
  );
};
