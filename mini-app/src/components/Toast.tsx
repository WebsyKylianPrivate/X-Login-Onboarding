import "./Toast.css";

type Props = {
  message: string;
  onClose: () => void;
};

export const Toast = ({ message, onClose }: Props) => {
  if (!message) return null;

  return (
    <div className="toast" role="alert">
      <span>{message}</span>
      <button onClick={onClose} aria-label="Close" type="button">
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          style={{ width: "18px", height: "18px", fill: "currentColor" }}
        >
          <g>
            <path d="M10.59 12L4.54 5.96l1.42-1.42L12 10.59l6.04-6.05 1.42 1.42L13.41 12l6.05 6.04-1.42 1.42L12 13.41l-6.04 6.05-1.42-1.42L10.59 12z"></path>
          </g>
        </svg>
      </button>
    </div>
  );
};
