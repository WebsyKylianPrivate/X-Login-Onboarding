import "./Toast.css";

type Props = {
  message: string;
  onClose: () => void;
};

export const Toast = ({ message, onClose }: Props) => {
  if (!message) return null;

  return (
    <div className="toast">
      <span>{message}</span>
      <button onClick={onClose} aria-label="Close">
        ✕
      </button>
    </div>
  );
};
