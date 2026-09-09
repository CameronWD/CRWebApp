import { HashRouter, Route, Routes } from 'react-router-dom';
import HomeScreen from './screens/HomeScreen';
import WizardScreen from './screens/WizardScreen';
import RecordListScreen from './screens/RecordListScreen';
import RecordDetailScreen from './screens/RecordDetailScreen';

export default function App() {
  return (
    <HashRouter>
      <div className="mx-auto min-h-screen w-full max-w-md px-5 pb-16">
        <Routes>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/new" element={<WizardScreen mode="new" />} />
          <Route path="/complete/:id" element={<WizardScreen mode="complete" />} />
          <Route path="/edit/:id" element={<WizardScreen mode="edit" />} />
          <Route path="/records" element={<RecordListScreen />} />
          <Route path="/record/:id" element={<RecordDetailScreen />} />
        </Routes>
      </div>
    </HashRouter>
  );
}
