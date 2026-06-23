const LoadingSpinner = () => (
  <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '300px' }}>
    <div style={{
      width: 48, height: 48,
      border: '4px solid #f1f5f9',
      borderTop: '4px solid #6366f1',
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite',
    }}></div>
    <p className="mt-3 text-muted" style={{ fontSize: '0.85rem' }}>Loading...</p>
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);
export default LoadingSpinner;
