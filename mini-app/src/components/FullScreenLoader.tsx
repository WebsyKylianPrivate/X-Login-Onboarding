import "./FullScreenLoader.css";

type Props = {
  visible: boolean;
  text?: string;
};

export const FullScreenLoader = ({ visible }: Props) => {
  if (!visible) return null;

  return (
    <div
      className="fs-loader-overlay"
      role="status"
      aria-live="polite"
      aria-label="Loading…"
      style={{
        position: "fixed",
        inset: 0,
        background: "#000",
        zIndex: 99999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        className="fs-loader-content"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          className="fs-loader-logo"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="fs-loader-svg"
            style={{
              width: "64px",
              height: "64px",
              fill: "#fff",
              color: "#fff",
            }}
          >
            <g>
              <path d="M21.742 21.75l-7.563-11.179 7.056-8.321h-2.456l-5.691 6.714-4.54-6.714H2.359l7.29 10.776L2.25 21.75h2.456l6.035-7.118 4.818 7.118h6.191-.008zM7.739 3.818L18.81 20.182h-2.447L5.29 3.818h2.447z"></path>
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
};
