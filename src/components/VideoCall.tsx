import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Video, VideoOff, Mic, MicOff, PhoneOff, Maximize2, Minimize2 } from "lucide-react";

interface VideoCallProps {
  roomUrl: string;
  onLeave: () => void;
}

export const VideoCall = ({ roomUrl, onLeave }: VideoCallProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      iframeRef.current?.parentElement?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return (
    <Card className="w-full h-full min-h-[500px] relative">
      <CardContent className="p-0 h-full">
        <div className="relative w-full h-full min-h-[500px]">
          <iframe
            ref={iframeRef}
            src={roomUrl}
            allow="camera; microphone; fullscreen; display-capture"
            className="w-full h-full min-h-[500px] rounded-lg"
            style={{ border: 'none' }}
          />
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={toggleFullscreen}
              className="bg-background/80 backdrop-blur-sm"
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
            <Button
              variant="destructive"
              size="icon"
              onClick={onLeave}
              className="bg-destructive/80 backdrop-blur-sm"
            >
              <PhoneOff className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
