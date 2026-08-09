export default function LoadingIndicator({ label = "Loading" }) {
  return (
    <span className="loading-indicator" role="status" aria-label={label}>
      <span aria-hidden="true" />
    </span>
  );
}

