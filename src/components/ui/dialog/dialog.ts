export const openModal = (title: string, description: string) => {
  // Pastikan kode ini hanya jalan di browser
  if (typeof window !== 'undefined') {
    const event = new CustomEvent('open-modal', {
      detail: { title, description }
    });
    window.dispatchEvent(event);
  }
};