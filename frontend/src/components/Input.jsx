export default function Input({ label, error, id, ...props }) {
  const inputId = id || props.name;

  return (
    <div className="form-group">
      {label && (
        <label className="form-label" htmlFor={inputId}>
          {label}
        </label>
      )}
      <input id={inputId} className="input" {...props} />
      {error && <span className="error-text">{error}</span>}
    </div>
  );
}
