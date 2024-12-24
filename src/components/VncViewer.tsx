import React, { useEffect, useRef } from "react";
import RFB from "novnc-core";

interface VncViewerProps {
  url: string; // WebSocket URL for the VNC server
  width?: string; // Width of the viewer
  height?: string; // Height of the viewer
  viewOnly?: boolean; // Whether the viewer is read-only
  onError?: (error: any) => void; // Error callback
}

const VncViewer: React.FC<VncViewerProps> = ({
  url,
  width = "100%",
  height = "100%",
  viewOnly = false,
  onError,
}) => {
  const vncContainerRef = useRef<HTMLDivElement | null>(null);
  const rfbRef = useRef<RFB | null>(null);

  useEffect(() => {
    if (!vncContainerRef.current) return;

    try {
      // Initialize RFB (Remote Frame Buffer) connection
      rfbRef.current = new RFB(vncContainerRef.current, url, {
        credentials: { password: "your-vnc-password" },
      });
      rfbRef.current.viewOnly = viewOnly;
      rfbRef.current.scaleViewport = true;
      rfbRef.current.resizeSession = true;

      // Handle error
      rfbRef.current.addEventListener("disconnect", (e) => {
        console.error("VNC Disconnected", e);
      });
    } catch (error) {
      console.error("Failed to initialize VNC connection", error);
      if (onError) onError(error);
    }

    // Cleanup
    return () => {
      if (rfbRef.current) {
        rfbRef.current.disconnect();
        rfbRef.current = null;
      }
    };
  }, [url, viewOnly, onError]);

  return (
    <div
      ref={vncContainerRef}
      style={{
        width,
        height,
        background: "#000",
      }}
    />
  );
};

export default VncViewer;
