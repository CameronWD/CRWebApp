import { HashRouter, Route, Routes } from 'react-router-dom';
import HomeScreen from './screens/HomeScreen';

export default function App() {
  return (
    <HashRouter>
      <div className="mx-auto min-h-screen w-full max-w-md px-5 pb-16">
        <Routes>
          <Route path="/" element={<HomeScreen />} />
        </Routes>
      </div>
    </HashRouter>
  );
}
