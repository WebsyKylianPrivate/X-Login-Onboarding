import "./FullScreenLoader.css";

type Props = {
  visible: boolean;
  text?: string;
};

export const FullScreenLoader = ({ visible, text = "Loading..." }: Props) => {
  if (!visible) return null;

  return (
    <div className="fs-loader-overlay" role="status" aria-live="polite">
      <div className="fs-loader-content">
        <div className="fs-loader-spinner" />
        <div className="fs-loader-text">{text}</div>
      </div>
    </div>
  );
};
