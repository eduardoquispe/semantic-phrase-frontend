import { createBrowserRouter } from 'react-router-dom'
import { PhrasesPage } from '../features/phrases/pages/phrases'

export const appRouter = createBrowserRouter([
  { path: '/', Component: PhrasesPage },
])
