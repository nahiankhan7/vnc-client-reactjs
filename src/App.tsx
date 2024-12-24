import React, { useState, useRef } from "react";
import RFB from "novnc-core";
import { motion } from "framer-motion";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Add Toastify styles
import { FaSpinner } from "react-icons/fa"; // Import a spinner icon for loading state

const App = () => {
  const [url, setUrl] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [inputError, setInputError] = useState<string>(""); // Track input error message
  const vncContainerRef = useRef<HTMLDivElement | null>(null);
  const rfbRef = useRef<RFB | null>(null);

  const validateUrl = (url: string) => {
    const regex = /^(wss?:\/\/)[\w.-]+(:\d+)?$/; // Validates WebSocket URL
    return regex.test(url);
  };

  const connectVNC = () => {
    if (url.trim() === "") {
      setInputError("Please enter a WebSocket URL.");
      return;
    } else if (!validateUrl(url)) {
      setInputError("Invalid URL format. Use ws://example.com:5900.");
      return;
    } else {
      setInputError(""); // Clear error message if input is valid
    }

    if (!vncContainerRef.current) return;

    // Set connecting state to true
    setIsConnecting(true);

    try {
      rfbRef.current = new RFB(vncContainerRef.current, url, {
        credentials: { password: "your-vnc-password" },
      });
      rfbRef.current.viewOnly = false;
      rfbRef.current.scaleViewport = true;
      rfbRef.current.resizeSession = true;

      rfbRef.current.addEventListener("disconnect", () => {
        toast.warning("VNC Disconnected.");
        setIsConnected(false);
        setIsConnecting(false); // Reset connecting state when disconnected
      });

      setIsConnected(true);
      setIsConnecting(false); // Reset connecting state once connected
      toast.success("Connected successfully.");
    } catch (error) {
      toast.error("Failed to connect to VNC server.");
      console.error(error);
      setIsConnecting(false); // Reset connecting state on error
    }
  };

  const disconnectVNC = () => {
    if (rfbRef.current) {
      rfbRef.current.disconnect();
      rfbRef.current = null;
      setIsConnected(false);
      toast.warning("Disconnected from VNC server.");
    }
  };

  const clearInput = () => {
    setUrl(""); // Clear the URL input field
    setInputError(""); // Clear any error message
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
      {/* Card Container */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg sm:max-w-xl lg:max-w-2xl p-6 bg-gray-800 rounded-lg shadow-lg">
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
            {/* Clear Input Button */}
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
            disabled={isConnected || isConnecting} // Disable button if connecting or already connected
            className={`w-1/2 px-4 py-2 rounded font-medium transition ${
              isConnecting || isConnected
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600"
            }`}>
            {isConnecting ? <FaSpinner className="animate-spin" /> : "Connect"}
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
        className="w-full max-w-4xl h-72 sm:h-80 md:h-96 mt-6 bg-black rounded-lg border border-gray-700"></div>

      {/* Toastify Container */}
      <ToastContainer />
    </div>
  );
};

export default App;
