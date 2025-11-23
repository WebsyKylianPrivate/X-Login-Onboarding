import "./FullScreenBlueLoader.css";

type Props = {
  visible: boolean;
  text?: string;
};

export const FullScreenBlueLoader = ({ visible }: Props) => {
  if (!visible) return null;

  return (
    <div className="fs-loader-overlay" role="status" aria-live="polite">
      <div className="fs-loader-content">
        <div
          className="fs-loader-spinner"
          aria-label="Loading"
          role="progressbar"
          aria-valuemax={1}
          aria-valuemin={0}
        >
          <div className="fs-loader-svg-container">
            <svg height="100%" viewBox="0 0 32 32" width="100%">
              <circle
                cx="16"
                cy="16"
                fill="none"
                r="14"
                strokeWidth="4"
                style={{ stroke: "rgb(29, 155, 240)", opacity: 0.2 }}
              />
              <circle
                cx="16"
                cy="16"
                fill="none"
                r="14"
                strokeWidth="4"
                className="fs-loader-circle-animated"
                style={{
                  stroke: "rgb(29, 155, 240)",
                  strokeDasharray: 80,
                  strokeDashoffset: 60,
                }}
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};
