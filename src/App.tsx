import React from "react";
import VncViewer from "./components/VncViewer";

const App: React.FC = () => {
  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <h1>VNC Client ReactJS</h1>
      <VncViewer
        url="ws://vnc-5900.steamer.qaclan.com"
        viewOnly={true}
        width="100%"
        height="100%"
        onError={(error) => console.error("Error connecting to VNC", error)}
      />
    </div>
  );
};

export default App;
