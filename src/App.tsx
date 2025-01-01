import React, { useState, useRef } from "react";
import RFB from "novnc-core";
import { motion } from "framer-motion";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaSpinner } from "react-icons/fa";

const App = () => {
  const [url, setUrl] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [inputError, setInputError] = useState(""); // Track input error message
  const vncContainerRef = useRef<HTMLDivElement | null>(null);
  const rfbRef = useRef<RFB | null>(null);

  // Validate WebSocket URL
  const validateUrl = (url: string) => {
    const regex = /^(wss?:\/\/)[\w.-]+(:\d+)?$/;
    return regex.test(url);
  };

  // Connect to VNC Server
  const connectVNC = () => {
    if (url.trim() === "") {
      setInputError("Please enter a WebSocket URL.");
      return;
    }

    if (!validateUrl(url)) {
      setInputError("Invalid URL format. Use ws://example.com:5900.");
      return;
    }

    setInputError(""); // Clear error message if input is valid

    if (!vncContainerRef.current) {
      toast.error("VNC container is not available.");
      return;
    }

    setIsConnecting(true); // Set connecting state

    try {
      // Initialize the RFB instance
      const rfb = new RFB(vncContainerRef.current, url, {
        credentials: {
          password: "your-vnc-password", // Replace with actual password or dynamically manage credentials
        },
      });

      // Configure RFB instance properties
      rfb.viewOnly = false;
      rfb.scaleViewport = true;
      rfb.resizeSession = true;
      rfbRef.current = rfb;

      // Handle RFB events
      rfb.addEventListener("connect", () => {
        toast.success("Connected to the VNC server.");
        setIsConnected(true);
        setIsConnecting(false);
      });

      rfb.addEventListener("disconnect", (event) => {
        const isClean = event.detail?.clean ?? false;
        toast.warning(
          `Disconnected from VNC server. ${
            isClean ? "Clean disconnection." : "Unexpected disconnection."
          }`
        );
        setIsConnected(false);
        setIsConnecting(false);
      });

      rfb.addEventListener("securityfailure", (event) => {
        const reason = event.detail?.reason || "Unknown error";
        toast.error(`Security failure: ${reason}`);
        setIsConnecting(false);
      });

      rfb.addEventListener("credentialsrequired", () => {
        toast.warning(
          "Credentials required. Please provide valid credentials."
        );
      });
    } catch (error) {
      toast.error("Failed to connect to the VNC server.");
      console.error("Connection error:", error);
      setIsConnecting(false);
    }
  };

  // Disconnect from VNC Server
  const disconnectVNC = () => {
    if (rfbRef.current) {
      rfbRef.current.disconnect();
      rfbRef.current = null;
      setIsConnected(false);
      toast.info("Disconnected from the VNC server.");
    }
  };

  // Clear URL input
  const clearInput = () => {
    setUrl("");
    setInputError("");
  };

  return (
    <div className="min-h-screen p-4 flex flex-col lg:flex-row gap-4 items-center justify-center bg-gray-900 text-white">
      {/* Card Container */}
      <motion.div
        id="card-container"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg p-6 bg-gray-800 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-6 text-center">VNC Viewer</h1>

        {/* URL Input */}
        <div>
          <label
            htmlFor="url"
            className="block text-sm font-medium mb-2 text-gray-400">
            Enter WebSocket URL
          </label>
          <div className="flex items-center space-x-4">
            <input
              type="text"
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="ws://example.com:5900"
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={clearInput}
              className="px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">
              Clear
            </button>
          </div>

          {/* Display input error message */}
          {inputError && (
            <div className="text-red-500 text-sm mt-2">{inputError}</div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-between space-x-4 mt-4">
          <button
            onClick={connectVNC}
            disabled={isConnected || isConnecting}
            className={`w-1/2 px-4 py-2 rounded font-medium transition ${
              isConnecting || isConnected
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600"
            }`}>
            {isConnecting ? (
              <span className="flex items-center justify-center gap-2">
                <FaSpinner className="animate-spin" />
                Connecting...
              </span>
            ) : isConnected ? (
              "Connected"
            ) : (
              "Connect"
            )}
          </button>
          <button
            onClick={disconnectVNC}
            disabled={!isConnected}
            className={`w-1/2 px-4 py-2 rounded font-medium transition ${
              !isConnected
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-red-500 hover:bg-red-600"
            }`}>
            Disconnect
          </button>
        </div>
      </motion.div>

      {/* VNC Viewer Container */}
      <div
        ref={vncContainerRef}
        className="w-full max-w-6xl h-72 sm:h-80 md:h-[600px] mt-6 bg-black rounded-lg border border-gray-700"></div>

      {/* Toastify Container */}
      <ToastContainer />
    </div>
  );
};

export default App;
