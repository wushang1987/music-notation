import { useEffect, useRef } from "react";
import { renderJianpu } from "../utils/abc2svg";

const JianpuRenderer = ({ abcNotation, title }) => {
    const containerId = useRef(`jianpu-container-${Math.random().toString(36).substr(2, 9)}`);

    useEffect(() => {
        if (abcNotation) {
            renderJianpu(containerId.current, abcNotation);
        }
    }, [abcNotation]);

    return (
        <div className="w-full overflow-x-auto min-h-100 md:rounded-md md:shadow-sm md:border md:border-gray-100 bg-white p-4">
            {/* Title usually rendered by abc2svg if included in ABC, but we can also have a header if needed */}
            <div id={containerId.current} className="jianpu-output"></div>

            <style jsx global>{`
        /* Add some basic styling for SVG if needed */
        .jianpu-output svg {
          width: 100%;
          height: auto;
        }
      `}</style>
        </div>
    );
};

export default JianpuRenderer;
