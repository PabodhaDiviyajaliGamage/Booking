export default function Home() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Easy Booking Backend API</h1>
      <p>API is running on Next.js 🚀</p>
      <h2>Available Endpoints:</h2>
      <ul>
        <li>POST /api/admin/login - Admin login</li>
        <li>GET /api/trending/trenddata - Get all trending items</li>
        <li>POST /api/trending/add - Add new trending item (requires auth)</li>
        <li>DELETE /api/trending/delete/[name] - Delete trending item by name (requires auth)</li>
      </ul>
    </div>
  );
}
