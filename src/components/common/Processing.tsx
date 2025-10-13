const Processing: React.FC<{ text?: string }> = ({ text = 'Procesando información...' }) => (
  <div className="alert alert-info d-flex align-items-center gap-2 py-2">
    <span className="spinner-border spinner-border-sm" role="status" />
    <span>{text}</span>
  </div>
);
export default Processing;
