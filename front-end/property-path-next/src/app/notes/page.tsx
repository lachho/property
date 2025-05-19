import { api } from '@/utils/api';

export default async function Notes() {
  try {
    const notes = await api.get('/api/notes');
    return <pre>{JSON.stringify(notes, null, 2)}</pre>;
  } catch (error: any) {
    return <div>Error loading notes: {error.message}</div>;
  }
} 